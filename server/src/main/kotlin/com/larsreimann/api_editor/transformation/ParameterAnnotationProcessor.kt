package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.ConstantAnnotation
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RequiredAnnotation
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@attribute`, `@constant`, `@optional`, and `@required` annotations.
 */
fun PythonPackage.processParameterAnnotations() {
    this.descendants()
        .filterIsInstance<PythonParameter>()
        .forEach { it.processParameterAnnotations() }
}

private fun PythonParameter.processParameterAnnotations() {
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
