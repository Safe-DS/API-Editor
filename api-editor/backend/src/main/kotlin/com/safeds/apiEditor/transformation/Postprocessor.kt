package com.safeds.apiEditor.transformation

import com.larsreimann.modeling.ModelNode
import com.larsreimann.modeling.descendants
import com.safeds.apiEditor.model.PythonParameterAssignment
import com.safeds.apiEditor.model.PythonParameterAssignment.IMPLICIT
import com.safeds.apiEditor.mutableModel.PythonAttribute
import com.safeds.apiEditor.mutableModel.PythonCall
import com.safeds.apiEditor.mutableModel.PythonClass
import com.safeds.apiEditor.mutableModel.PythonConstructor
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter
import com.safeds.apiEditor.mutableModel.PythonStringifiedExpression
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
    this.addAll(groups[IMPLICIT].orEmpty())
    this.addAll(groups[PythonParameterAssignment.POSITION_ONLY].orEmpty())
    this.addAll(groups[PythonParameterAssignment.POSITION_OR_NAME].orEmpty())
    this.addAll(groups[PythonParameterAssignment.POSITIONAL_VARARG].orEmpty())
    this.addAll(groups[PythonParameterAssignment.NAME_ONLY].orEmpty())
    this.addAll(groups[PythonParameterAssignment.NAMED_VARARG].orEmpty())
}

/**
 * Converts `__init__` methods to constructors or adds a constructor without explicit parameters if none exists.
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
                    parameters = listOf(
                        PythonParameter(
                            name = "self",
                            assignedBy = IMPLICIT,
                        ),
                    ),
                    callToOriginalAPI = PythonCall(
                        receiver = PythonStringifiedExpression(this.originalClass!!.qualifiedName),
                    ),
                )
            }
        }

        else -> {
            constructorMethod.callToOriginalAPI?.let { callToOriginalAPI ->
                val newReceiver = when (val receiver = callToOriginalAPI.receiver) {
                    is PythonStringifiedExpression -> PythonStringifiedExpression(
                        receiver.string.removeSuffix(".__init__"),
                    )

                    null -> throw IllegalStateException("Receiver of call is null: $callToOriginalAPI")
                    else -> receiver
                }

                this.constructor = PythonConstructor(
                    parameters = constructorMethod.parameters.toList(),
                    callToOriginalAPI = PythonCall(
                        receiver = newReceiver,
                        arguments = callToOriginalAPI.arguments.toList(),
                    ),
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
        ?.filter { it.assignedBy != IMPLICIT && !it.isVariadic() }
        ?.forEach {
            this.attributes += PythonAttribute(
                name = it.name,
                type = it.type?.copy(),
                value = PythonStringifiedExpression(it.name),
                isPublic = true,
                description = it.description,
                boundary = it.boundary,
            )
        }
}
