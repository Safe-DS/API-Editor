package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.PythonParameterAssignment
import com.larsreimann.apiEditor.mutableModel.OriginalPythonClass
import com.larsreimann.apiEditor.mutableModel.PythonArgument
import com.larsreimann.apiEditor.mutableModel.PythonAttribute
import com.larsreimann.apiEditor.mutableModel.PythonCall
import com.larsreimann.apiEditor.mutableModel.PythonClass
import com.larsreimann.apiEditor.mutableModel.PythonFunction
import com.larsreimann.apiEditor.mutableModel.PythonNamedSpread
import com.larsreimann.apiEditor.mutableModel.PythonPackage
import com.larsreimann.apiEditor.mutableModel.PythonParameter
import com.larsreimann.apiEditor.mutableModel.PythonPositionalSpread
import com.larsreimann.apiEditor.mutableModel.PythonReference
import com.larsreimann.apiEditor.mutableModel.PythonStringifiedExpression
import com.larsreimann.modeling.closest
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
                is PythonClass -> it.addOriginalDeclaration()
                is PythonFunction -> it.addOriginalDeclaration()
            }
        }
}

private fun PythonClass.addOriginalDeclaration() {
    this.originalClass = OriginalPythonClass(this.qualifiedName())
}

private fun PythonFunction.addOriginalDeclaration() {
    val containingClass = closest<PythonClass>()
    this.callToOriginalAPI = PythonCall(
        receiver = PythonStringifiedExpression(
            when {
                name == "__init__" && containingClass != null -> containingClass.originalClass!!.qualifiedName
                isMethod() -> "self.instance.$name"
                else -> qualifiedName()
            }
        ),
        arguments = this.parameters
            .filter { !it.isImplicit() }
            .map {
                PythonArgument(
                    name = when (it.assignedBy) {
                        PythonParameterAssignment.NAME_ONLY -> it.name
                        else -> null
                    },
                    value = when (it.assignedBy) {
                        PythonParameterAssignment.POSITIONAL_VARARG -> PythonPositionalSpread(PythonReference(it))
                        PythonParameterAssignment.NAMED_VARARG -> PythonNamedSpread(PythonReference(it))
                        else -> PythonReference(it)
                    }
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
    if (isVariadic()) {
        return
    }

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
