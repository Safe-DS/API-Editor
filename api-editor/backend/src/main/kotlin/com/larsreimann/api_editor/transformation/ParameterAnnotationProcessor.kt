package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.ConstantAnnotation
import com.larsreimann.api_editor.model.DefaultBoolean
import com.larsreimann.api_editor.model.DefaultNone
import com.larsreimann.api_editor.model.DefaultNumber
import com.larsreimann.api_editor.model.DefaultString
import com.larsreimann.api_editor.model.DefaultValue
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RequiredAnnotation
import com.larsreimann.api_editor.mutable_model.PythonArgument
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonBoolean
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonFloat
import com.larsreimann.api_editor.mutable_model.PythonInt
import com.larsreimann.api_editor.mutable_model.PythonLiteral
import com.larsreimann.api_editor.mutable_model.PythonNone
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonReference
import com.larsreimann.api_editor.mutable_model.PythonString
import com.larsreimann.api_editor.mutable_model.PythonStringifiedExpression
import com.larsreimann.modeling.closest
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@attribute`, `@constant`, `@optional`, and `@required` annotations.
 */
fun PythonPackage.processParameterAnnotations() {
    this.descendants()
        .filterIsInstance<PythonParameter>()
        .toList()
        .forEach { it.processParameterAnnotations() }
}

private fun PythonParameter.processParameterAnnotations() {
    this.annotations
        .toList()
        .forEach {
            when (it) {
                is AttributeAnnotation -> processAttributeAnnotation(it)
                is ConstantAnnotation -> processConstantAnnotation(it)
                is OptionalAnnotation -> processOptionalAnnotation(it)
                is RequiredAnnotation -> processRequiredAnnotation(it)
                else -> {}
            }
        }
}

private fun PythonParameter.processAttributeAnnotation(annotation: AttributeAnnotation) {

    // Add attribute to class
    val containingClass = this.closest<PythonClass>()!!
    containingClass.attributes += PythonAttribute(
        name = name,
        type = type,
        value = PythonStringifiedExpression(annotation.defaultValue.toString()),
        isPublic = true,
        description = description,
        boundary = boundary
    )

    // Update argument that references this parameter
    val arguments = this.crossReferences()
        .mapNotNull { (it.parent as? PythonReference)?.closest<PythonArgument>() }
        .toList()

    require(arguments.size == 1) {
        "Expected parameter to be referenced in exactly one argument but was used in $arguments."
    }

    val argument = arguments[0]
    argument.value = annotation.defaultValue.toPythonLiteral()

    // Remove parameter
    this.release()
}

private fun PythonParameter.processConstantAnnotation(annotation: ConstantAnnotation) {

    // Update argument that references this parameter
    val arguments = this.crossReferences()
        .mapNotNull { (it.parent as? PythonReference)?.closest<PythonArgument>() }
        .toList()

    require(arguments.size == 1) {
        "Expected parameter to be referenced in exactly one argument but was used in $arguments."
    }

    val argument = arguments[0]
    argument.value = annotation.defaultValue.toPythonLiteral()

    // Remove parameter
    this.release()
}

private fun PythonParameter.processOptionalAnnotation(annotation: OptionalAnnotation) {
    this.assignedBy = PythonParameterAssignment.NAME_ONLY
    this.defaultValue = PythonStringifiedExpression(annotation.defaultValue.toString())
    this.annotations.remove(annotation)
}

private fun PythonParameter.processRequiredAnnotation(annotation: RequiredAnnotation) {
    this.assignedBy = PythonParameterAssignment.POSITION_OR_NAME
    this.defaultValue = null
    this.annotations.remove(annotation)
}

private fun DefaultValue.toPythonLiteral(): PythonLiteral {
    return when (this) {
        is DefaultBoolean -> PythonBoolean(this.value)
        is DefaultNumber -> {
            if (this.value == this.value.toInt().toDouble()) {
                PythonInt(this.value.toInt())
            } else {
                PythonFloat(this.value)
            }
        }
        is DefaultString -> PythonString(this.value)
        is DefaultNone -> PythonNone()
    }
}
