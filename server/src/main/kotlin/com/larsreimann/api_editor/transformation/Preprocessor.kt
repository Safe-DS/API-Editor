package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.descendants

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
    return currentFunction.parent is MutablePythonClass
        && "staticmethod" !in currentFunction.decorators
        && currentFunction.parameters.firstOrNull() == this
}
