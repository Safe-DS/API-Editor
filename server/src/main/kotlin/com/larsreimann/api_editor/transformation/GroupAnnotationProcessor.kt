package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonConstructor
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonMemberAccess
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonNamedType
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonReference
import com.larsreimann.api_editor.transformation.processing_exceptions.ConflictingGroupException
import com.larsreimann.modeling.descendants

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
                    assignedBy = PythonParameterAssignment.IMPLICIT
                )
            )
            constructorParameters += this.parameters.filter { it.name in annotation.parameters }
            val groupedParameterClass = PythonClass(
                name = annotation.groupName.replaceFirstChar { it.uppercase() },
                constructor = PythonConstructor(
                    parameters = constructorParameters
                )
            )

            // Update parameters
            val groupedParameter = PythonParameter(
                name = annotation.groupName.replaceFirstChar { it.lowercase() },
                type = PythonNamedType(groupedParameterClass)
            )
            this.parameters.removeIf { it.name in annotation.parameters }
            this.parameters.add(firstOccurrence, groupedParameter)

            if (hasConflictingGroups(module.classes, groupedParameterClass)) {
                throw ConflictingGroupException(
                    groupedParameterClass.name,
                    module.name,
                    this.qualifiedName()
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
                        member = PythonReference(PythonAttribute(name = value.declaration!!.name))
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
                                    member = receiver
                                ),
                                member = member
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
    groupToCheck: PythonClass
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
    groupToCheck: PythonClass
): Boolean {
    return moduleClasses.any { groupToCheck.name == it.name }
}
