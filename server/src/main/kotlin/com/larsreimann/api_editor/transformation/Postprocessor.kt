package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonCall
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonConstructor
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.modeling.descendants

/**
 * Removes modules that don't contain declarations.
 */
fun PythonPackage.removeEmptyModules() {
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
fun PythonPackage.reorderParameters() {
    this.descendants()
        .filterIsInstance<PythonFunction>()
        .forEach { it.reorderParameters() }
}

private fun PythonFunction.reorderParameters() {
    val groups = this.parameters.groupBy { it.assignedBy }
    this.parameters.addAll(groups[PythonParameterAssignment.IMPLICIT].orEmpty())
    this.parameters.addAll(groups[PythonParameterAssignment.POSITION_ONLY].orEmpty())
    this.parameters.addAll(groups[PythonParameterAssignment.POSITION_OR_NAME].orEmpty())
    this.parameters.addAll(groups[PythonParameterAssignment.NAME_ONLY].orEmpty())
}

/**
 * Converts `__init__` methods to constructors or adds a constructor without parameters if none exists.
 */
fun PythonPackage.extractConstructors() {
    this.descendants { it is PythonFunction }
        .toList()
        .filterIsInstance<PythonClass>()
        .forEach { it.createConstructor() }
}

private fun PythonClass.createConstructor() {
    when (val constructorMethod = this.methods.firstOrNull { it.name == "__init__" }) {
        null -> {
            this.constructor = PythonConstructor(
                parameters = emptyList(),
                callToOriginalAPI = PythonCall(receiver = this.originalClass!!.qualifiedName)
            )
        }
        else -> {
            this.constructor = PythonConstructor(
                parameters = constructorMethod.parameters.toList(),
                callToOriginalAPI = PythonCall(
                    receiver = constructorMethod.callToOriginalAPI!!.receiver.removeSuffix(".__init__"),
                    arguments = constructorMethod.callToOriginalAPI!!.arguments.toList()
                )
            )

            constructorMethod.release()
        }
    }
}

/**
 * Creates attributes for each class based on its constructor.
 */
fun PythonPackage.createAttributesForParametersOfConstructor() {
    this.descendants()
        .filterIsInstance<PythonClass>()
        .forEach { it.createAttributesForParametersOfConstructor() }
}

private fun PythonClass.createAttributesForParametersOfConstructor() {
    this.constructor
        ?.parameters
        ?.filter { it.assignedBy != PythonParameterAssignment.IMPLICIT }
        ?.forEach {
            this.attributes += PythonAttribute(
                name = it.name,
                value = it.defaultValue,
                isPublic = true,
                typeInDocs = it.typeInDocs,
                description = it.description,
                boundary = it.boundary
            )
        }
}
