package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.OriginalPythonClass
import com.larsreimann.api_editor.mutable_model.PythonArgument
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonCall
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonReference
import com.larsreimann.modeling.descendants

/**
 * Removes private declarations.
 */
fun PythonPackage.removePrivateDeclarations() {
    this.descendants()
        .toList()
        .forEach {
            when (it) {
                is PythonAttribute -> it.removePrivateDeclarations()
                is PythonClass -> it.removePrivateDeclarations()
                is PythonFunction -> it.removePrivateDeclarations()
            }
        }
}

fun PythonAttribute.removePrivateDeclarations() {
    if (!this.isPublic) {
        this.release()
    }
}

fun PythonClass.removePrivateDeclarations() {
    if (!this.isPublic) {
        this.release()
    }
}

fun PythonFunction.removePrivateDeclarations() {
    if (!this.isPublic) {
        this.release()
    }
}

/**
 * Stores the original declaration that corresponds to classes, functions, and parameters.
 */
fun PythonPackage.addOriginalDeclarations() {
    this.descendants()
        .forEach {
            when (it) {
                is PythonClass -> it.addOriginalDeclarations()
                is PythonFunction -> it.addOriginalDeclarations()
            }
        }
}

private fun PythonClass.addOriginalDeclarations() {
    this.originalClass = OriginalPythonClass(this.qualifiedName())
}

private fun PythonFunction.addOriginalDeclarations() {
    this.callToOriginalAPI = PythonCall(
        receiver = when {
            isMethod() -> "self.instance.$name"
            else -> qualifiedName()
        },
        arguments = this.parameters.map {
            PythonArgument(
                name = when (it.assignedBy) {
                    PythonParameterAssignment.NAME_ONLY -> it.name
                    else -> null
                },
                value = PythonReference(it)
            )
        }
    )
}

/**
 * Changes the first segment of the name of the module to the [newPrefix].
 */
fun PythonPackage.changeModulePrefix(newPrefix: String) {
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
fun PythonPackage.replaceClassMethodsWithStaticMethods() {
    this.descendants { it.parent is PythonClass }
        .filterIsInstance<PythonClass>()
        .flatMap { it.methods }
        .filter { "classmethod" in it.decorators }
        .forEach { it.replaceClassMethodsWithStaticMethods() }
}

private fun PythonFunction.replaceClassMethodsWithStaticMethods() {
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
fun PythonPackage.updateParameterAssignment() {
    this.descendants()
        .filterIsInstance<PythonParameter>()
        .forEach { it.updateParameterAssignment() }
}

private fun PythonParameter.updateParameterAssignment() {
    this.assignedBy = when {
        this.isImplicit() -> PythonParameterAssignment.IMPLICIT
        this.isRequired() -> PythonParameterAssignment.POSITION_OR_NAME
        else -> PythonParameterAssignment.NAME_ONLY
    }
}

private fun PythonParameter.isImplicit(): Boolean {
    val currentFunction = this.parent as? PythonFunction ?: return false
    return currentFunction.parent is PythonClass &&
        !currentFunction.isStaticMethod() &&
        currentFunction.parameters.firstOrNull() == this
}

/**
 * Changes the name of implicit parameters to "self".
 */
fun PythonPackage.normalizeNamesOfImplicitParameters() {
    this.descendants()
        .filterIsInstance<PythonParameter>()
        .filter { it.assignedBy == PythonParameterAssignment.IMPLICIT }
        .forEach {
            it.name = "self"
        }
}
