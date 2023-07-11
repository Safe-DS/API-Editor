package com.safeds.apiEditor.transformation

import com.larsreimann.modeling.descendants
import com.safeds.apiEditor.model.GroupAnnotation
import com.safeds.apiEditor.model.PythonParameterAssignment
import com.safeds.apiEditor.mutableModel.PythonAttribute
import com.safeds.apiEditor.mutableModel.PythonClass
import com.safeds.apiEditor.mutableModel.PythonConstructor
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonMemberAccess
import com.safeds.apiEditor.mutableModel.PythonModule
import com.safeds.apiEditor.mutableModel.PythonNamedType
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter
import com.safeds.apiEditor.mutableModel.PythonReference
import com.safeds.apiEditor.transformation.processingExceptions.ConflictingGroupException

/**
 * Processes and removes `@group` annotations.
 */
fun PythonPackage.processGroupAnnotations() {
    this.descendants()
        .filterIsInstance<PythonModule>()
        .forEach { it.processGroupAnnotations() }
}

private fun PythonModule.processGroupAnnotations() {
    this.descendants()
        .filterIsInstance<PythonFunction>()
        .toList()
        .forEach { it.processGroupAnnotations(this) }
}

private fun PythonFunction.processGroupAnnotations(module: PythonModule) {
    this.annotations
        .filterIsInstance<GroupAnnotation>()
        .forEach { annotation ->
            val firstOccurrence = this.parameters.indexOfFirst { it.name in annotation.parameters }

            // Create class
            val constructorParameters = mutableListOf(
                PythonParameter(
                    name = "self",
                    assignedBy = PythonParameterAssignment.IMPLICIT,
                ),
            )
            constructorParameters += this.parameters.filter { it.name in annotation.parameters }
            val groupedParameterClass = PythonClass(
                name = annotation.groupName.replaceFirstChar { it.uppercase() },
                constructor = PythonConstructor(
                    parameters = constructorParameters,
                ),
            )

            // Update parameters
            val groupedParameter = PythonParameter(
                name = annotation.groupName.replaceFirstChar { it.lowercase() },
                type = PythonNamedType(groupedParameterClass),
            )
            this.parameters.removeIf { it.name in annotation.parameters }
            this.parameters.add(firstOccurrence, groupedParameter)

            if (hasConflictingGroups(module.classes, groupedParameterClass)) {
                throw ConflictingGroupException(
                    groupedParameterClass.name,
                    module.name,
                    this.qualifiedName(),
                )
            }
            if (!isAlreadyDefinedInModule(module.classes, groupedParameterClass)) {
                module.classes.add(groupedParameterClass)
            }

            // Update argument that references this parameter
            this.callToOriginalAPI!!.arguments.forEach {
                val value = it.value
                if (value is PythonReference && value.declaration?.name in annotation.parameters) {
                    it.value = PythonMemberAccess(
                        receiver = PythonReference(declaration = groupedParameter),
                        member = PythonReference(PythonAttribute(name = value.declaration!!.name)),
                    )
                } else if (value is PythonMemberAccess) {
                    val receiver = value.receiver
                    val member = value.member
                    if (receiver is PythonReference && member is PythonReference) {
                        val receiverMatches = receiver.declaration?.name in annotation.parameters
                        val memberMatches = member.declaration is PythonAttribute && member.declaration?.name == "value"

                        if (receiverMatches && memberMatches) {
                            it.value = PythonMemberAccess(
                                receiver = PythonMemberAccess(
                                    receiver = PythonReference(declaration = groupedParameter),
                                    member = receiver,
                                ),
                                member = member,
                            )
                        }
                    }
                }

                this.annotations.remove(annotation)
            }
        }
}

private fun hasConflictingGroups(
    moduleClasses: List<PythonClass>,
    groupToCheck: PythonClass,
): Boolean {
    return moduleClasses.any { `class` ->
        (groupToCheck.name == `class`.name) &&
            (
                groupToCheck.constructor?.parameters?.map { it.name }?.toList()
                    != `class`.constructor?.parameters?.map { it.name }?.toList()
                )
    }
}

private fun isAlreadyDefinedInModule(
    moduleClasses: List<PythonClass>,
    groupToCheck: PythonClass,
): Boolean {
    return moduleClasses.any { groupToCheck.name == it.name }
}
