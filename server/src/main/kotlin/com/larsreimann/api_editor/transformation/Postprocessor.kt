package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonAttribute
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.descendants

/**
 * Removes modules that don't contain declarations.
 */
fun MutablePythonPackage.removeEmptyModules() {
    this.modules
        .toList()
        .forEach {
            if (it.classes.isEmpty() && it.enums.isEmpty() && it.functions.isEmpty()) {
                it.release()
            }
        }
}

/**
 * Reorders parameters by the means they have to be assigned.
 */
fun MutablePythonPackage.reorderParameters() {
    this.descendants()
        .filterIsInstance<MutablePythonFunction>()
        .forEach { it.reorderParameters() }
}

private fun MutablePythonFunction.reorderParameters() {
    val groups = this.parameters.groupBy { it.assignedBy }
    this.parameters.addAll(groups[PythonParameterAssignment.IMPLICIT].orEmpty())
    this.parameters.addAll(groups[PythonParameterAssignment.POSITION_ONLY].orEmpty())
    this.parameters.addAll(groups[PythonParameterAssignment.POSITION_OR_NAME].orEmpty())
    this.parameters.addAll(groups[PythonParameterAssignment.NAME_ONLY].orEmpty())
    this.parameters.addAll(groups[PythonParameterAssignment.ATTRIBUTE].orEmpty())
    this.parameters.addAll(groups[PythonParameterAssignment.CONSTANT].orEmpty())
}

/**
 * Creates attributes for each class based on its constructor.
 */
fun MutablePythonPackage.createAttributesForParametersOfConstructor() {
    this.descendants()
        .filterIsInstance<MutablePythonClass>()
        .forEach { it.createAttributesForParametersOfConstructor() }
}

private fun MutablePythonClass.createAttributesForParametersOfConstructor() {
    this.methods
        .firstOrNull { it.isConstructor() }
        ?.parameters
        ?.filter { it.assignedBy !in setOf(PythonParameterAssignment.IMPLICIT, PythonParameterAssignment.CONSTANT) }
        ?.forEach {
            this.attributes += MutablePythonAttribute(
                name = it.name,
                defaultValue = it.defaultValue,
                isPublic = true,
                typeInDocs = it.typeInDocs,
                description = it.description,
                boundary = it.boundary
            )
        }
}
