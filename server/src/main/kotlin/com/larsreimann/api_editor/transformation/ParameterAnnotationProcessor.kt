package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.ConstantAnnotation
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RequiredAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.descendants

/**
 * Processes and removes `@attribute`, `@constant`, `@optional`, and `@required` annotations.
 */
fun MutablePythonPackage.processParameterAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonParameter>()
        .forEach { it.processParameterAnnotations() }
}

private fun MutablePythonParameter.processParameterAnnotations() {
    annotations
        .toList()
        .forEach {
            when (it) {
                is AttributeAnnotation -> {
                    this.assignedBy = PythonParameterAssignment.ATTRIBUTE
                    this.defaultValue = it.defaultValue.toString()
                    this.annotations.remove(it)
                }
                is ConstantAnnotation -> {
                    this.assignedBy = PythonParameterAssignment.CONSTANT
                    this.defaultValue = it.defaultValue.toString()
                    this.annotations.remove(it)
                }
                is OptionalAnnotation -> {
                    this.assignedBy = PythonParameterAssignment.NAME_ONLY
                    this.defaultValue = it.defaultValue.toString()
                    this.annotations.remove(it)
                }
                is RequiredAnnotation -> {
                    this.assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                    this.defaultValue = null
                    this.annotations.remove(it)
                }
                else -> {}
            }
        }
}
