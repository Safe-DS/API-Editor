package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonConstructor
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter
import com.larsreimann.api_editor.transformation.processing_exceptions.ConflictingGroupException
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@group` annotations.
 */
fun MutablePythonPackage.processGroupAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonModule>()
        .forEach { it.processGroupAnnotations() }
}

private fun MutablePythonModule.processGroupAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonFunction>()
        .forEach { it.processGroupAnnotations(this) }
}

private fun MutablePythonFunction.processGroupAnnotations(module: MutablePythonModule) {
    this.annotations
        .filterIsInstance<GroupAnnotation>()
        .forEach { annotation ->
            val firstOccurrence = this.parameters.indexOfFirst { it.name in annotation.parameters }
            val groupedParameter = MutablePythonParameter(
                name = annotation.groupName.replaceFirstChar { it.lowercase() },
                typeInDocs = annotation.groupName.replaceFirstChar { it.uppercase() },
                assignedBy = PythonParameterAssignment.GROUP,
                groupedParametersOldToNewName = buildMap {
                    parameters
                        .filter { it.originalParameter!!.name in annotation.parameters }
                        .forEach { this[it.originalParameter!!.name] = it.name }
                }.toMutableMap(),
                originalParameter = OriginalPythonParameter(
                    name = annotation.groupName.replaceFirstChar { it.lowercase() },
                    assignedBy = PythonParameterAssignment.GROUP
                )
            )
            val constructorParameters = mutableListOf(
                MutablePythonParameter(
                    name = "self",
                    assignedBy = PythonParameterAssignment.IMPLICIT,
                )
            )
            constructorParameters += this.parameters.filter { it.name in annotation.parameters }
            this.parameters.removeIf { it.name in annotation.parameters }
            this.parameters.add(firstOccurrence, groupedParameter)
            val groupedParameterClass = MutablePythonClass(
                name = annotation.groupName.replaceFirstChar { it.uppercase() },
                constructor = MutablePythonConstructor(
                    parameters = constructorParameters
                )
            )
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

            this.annotations.remove(annotation)
        }
}

private fun hasConflictingGroups(
    moduleClasses: List<MutablePythonClass>,
    groupToCheck: MutablePythonClass
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
    moduleClasses: List<MutablePythonClass>,
    groupToCheck: MutablePythonClass
): Boolean {
    return moduleClasses.any { groupToCheck.name == it.name }
}
