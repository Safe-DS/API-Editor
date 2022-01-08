package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonConstructor
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
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

private fun MutablePythonFunction.processGroupAnnotations(
    module: MutablePythonModule
) {
    this.annotations.filterIsInstance<GroupAnnotation>().forEach {
        val firstOccurrence = this.parameters.indexOfFirst { parameter ->
            parameter.name in it.parameters
        }
        val groupedParameterNames = mutableListOf<String>()
        groupedParameterNames.addAll(it.parameters)
        val groupedParameter = MutablePythonParameter(
            name = it.groupName.replaceFirstChar { firstChar -> firstChar.lowercase() },
            typeInDocs = it.groupName.replaceFirstChar { firstChar -> firstChar.uppercase() },
            assignedBy = PythonParameterAssignment.GROUP,
            groupedParameterNames = groupedParameterNames
        )
        val constructorParameters = mutableListOf(
            MutablePythonParameter(
                name = "self",
                assignedBy = PythonParameterAssignment.IMPLICIT
            )
        )
        constructorParameters.addAll(
            this.parameters.filter { parameter ->
                parameter.name in it.parameters
            }
        )
        this.parameters.removeIf { parameter -> parameter.name in it.parameters }
        this.parameters.add(firstOccurrence, groupedParameter)
        val groupedParameterClass = MutablePythonClass(
            name = it.groupName.replaceFirstChar { firstChar -> firstChar.uppercase() },
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

        this.annotations.remove(it)
    }
}

private fun hasConflictingGroups(
    moduleClasses: List<MutablePythonClass>,
    groupToCheck: MutablePythonClass
): Boolean {
    return moduleClasses.any {
        (groupToCheck.name == it.name) &&
            (
                groupToCheck.constructor?.parameters?.toList().toString()
                    != it.constructor?.parameters?.toList().toString()
                )
    }
}

private fun isAlreadyDefinedInModule(
    moduleClasses: List<MutablePythonClass>,
    groupToCheck: MutablePythonClass
): Boolean {
    return moduleClasses.any { groupToCheck.name == it.name }
}
