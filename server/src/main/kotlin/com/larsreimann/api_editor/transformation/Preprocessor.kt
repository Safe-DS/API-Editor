package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonAttribute
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.OriginalPythonClass
import com.larsreimann.api_editor.mutable_model.OriginalPythonFunction
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter
import com.larsreimann.api_editor.mutable_model.descendants

/**
 * Removes private declarations.
 */
fun MutablePythonPackage.removePrivateDeclarations() {
    this.descendants()
        .toList()
        .forEach {
            when (it) {
                is MutablePythonAttribute -> it.removePrivateDeclarations()
                is MutablePythonClass -> it.removePrivateDeclarations()
                is MutablePythonFunction -> it.removePrivateDeclarations()
            }
        }
}

fun MutablePythonAttribute.removePrivateDeclarations() {
    if (!this.isPublic) {
        this.release()
    }
}

fun MutablePythonClass.removePrivateDeclarations() {
    if (!this.isPublic) {
        this.release()
    }
}

fun MutablePythonFunction.removePrivateDeclarations() {
    if (!this.isPublic) {
        this.release()
    }
}

/**
 * Stores the original declaration that corresponds to classes, functions, and parameters.
 */
fun MutablePythonPackage.addOriginalDeclarations() {
    this.descendants()
        .forEach {
            when (it) {
                is MutablePythonClass -> it.addOriginalDeclarations()
                is MutablePythonFunction -> it.addOriginalDeclarations()
                is MutablePythonParameter -> it.addOriginalDeclarations()
            }
        }
}

private fun MutablePythonClass.addOriginalDeclarations() {
    this.originalClass = OriginalPythonClass(this.qualifiedName())
}

private fun MutablePythonFunction.addOriginalDeclarations() {
    this.originalFunction = OriginalPythonFunction(
        this.qualifiedName(),
        this.parameters.map {
            OriginalPythonParameter(
                name = it.name,
                assignedBy = it.assignedBy
            )
        }
    )
}

private fun MutablePythonParameter.addOriginalDeclarations() {
    this.originalParameter = OriginalPythonParameter(
        name = this.name,
        assignedBy = this.assignedBy
    )
}

/**
 * Changes the first segment of the name of the module to the [newPrefix].
 */
fun MutablePythonPackage.changeModulePrefix(newPrefix: String) {
    this.modules
        .forEach {
            val segments = it.name.split(".").toMutableList()
            segments[0] = newPrefix
            it.name = segments.joinToString(".")
        }
}

/**
 * Replaces methods decorated with `@classmethod` with methods decorated with `@staticmethod`.
 */
fun MutablePythonPackage.replaceClassMethodsWithStaticMethods() {
    this.descendants { it.parent is MutablePythonClass }
        .filterIsInstance<MutablePythonClass>()
        .flatMap { it.methods }
        .filter { "classmethod" in it.decorators }
        .forEach { it.replaceClassMethodsWithStaticMethods() }
}

private fun MutablePythonFunction.replaceClassMethodsWithStaticMethods() {
    decorators.replaceAll {
        when (it) {
            "classmethod" -> "staticmethod"
            else -> it
        }
    }

    if (parameters.isNotEmpty()) {
        parameters.removeAt(0)
    }
}

/**
 * Set the parameter assignment of implicit parameters to implicit, of required parameter to position or name, and of
 * optional parameters to name only.
 */
fun MutablePythonPackage.updateParameterAssignment() {
    this.descendants()
        .filterIsInstance<MutablePythonParameter>()
        .forEach { it.updateParameterAssignment() }
}

private fun MutablePythonParameter.updateParameterAssignment() {
    this.assignedBy = when {
        this.isImplicit() -> PythonParameterAssignment.IMPLICIT
        this.isRequired() -> PythonParameterAssignment.POSITION_OR_NAME
        else -> PythonParameterAssignment.NAME_ONLY
    }
}

private fun MutablePythonParameter.isImplicit(): Boolean {
    val currentFunction = this.parent as? MutablePythonFunction ?: return false
    return currentFunction.parent is MutablePythonClass &&
        !currentFunction.isStatic() &&
        currentFunction.parameters.firstOrNull() == this
}
