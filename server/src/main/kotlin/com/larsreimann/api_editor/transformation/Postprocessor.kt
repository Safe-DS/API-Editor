package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonCall
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonConstructor
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonStringifiedExpression
import com.larsreimann.modeling.ModelNode
import com.larsreimann.modeling.descendants
import java.lang.IllegalStateException

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
        .forEach {
            when (it) {
                is PythonConstructor -> it.parameters.reorderParameters()
                is PythonFunction -> it.parameters.reorderParameters()
            }
        }
}

private fun ModelNode.MutableContainmentList<PythonParameter>.reorderParameters() {
    val groups = this.groupBy { it.assignedBy }
    this.addAll(groups[PythonParameterAssignment.IMPLICIT].orEmpty())
    this.addAll(groups[PythonParameterAssignment.POSITION_ONLY].orEmpty())
    this.addAll(groups[PythonParameterAssignment.POSITION_OR_NAME].orEmpty())
    this.addAll(groups[PythonParameterAssignment.NAME_ONLY].orEmpty())
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
            if (this.originalClass != null) {
                this.constructor = PythonConstructor(
                    parameters = emptyList(),
                    callToOriginalAPI = PythonCall(
                        receiver = PythonStringifiedExpression(this.originalClass!!.qualifiedName)
                    )
                )
            }
        }
        else -> {
            constructorMethod.callToOriginalAPI?.let { callToOriginalAPI ->
                val newReceiver = when (val receiver = callToOriginalAPI.receiver) {
                    is PythonStringifiedExpression -> PythonStringifiedExpression(
                        receiver.string.removeSuffix(".__init__")
                    )
                    null -> throw IllegalStateException("Receiver of call is null: $callToOriginalAPI")
                    else -> receiver
                }

                this.constructor = PythonConstructor(
                    parameters = constructorMethod.parameters.toList(),
                    callToOriginalAPI = PythonCall(
                        receiver = newReceiver,
                        arguments = callToOriginalAPI.arguments.toList()
                    )
                )
            }


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
                type = it.type,
                value = PythonStringifiedExpression(it.name),
                isPublic = true,
                description = it.description,
                boundary = it.boundary
            )
        }
}
