package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.ConstantAnnotation
import com.larsreimann.apiEditor.model.DefaultBoolean
import com.larsreimann.apiEditor.model.DefaultNone
import com.larsreimann.apiEditor.model.DefaultNumber
import com.larsreimann.apiEditor.model.DefaultString
import com.larsreimann.apiEditor.model.DefaultValue
import com.larsreimann.apiEditor.model.OptionalAnnotation
import com.larsreimann.apiEditor.model.PythonParameterAssignment
import com.larsreimann.apiEditor.model.RequiredAnnotation
import com.larsreimann.apiEditor.mutable_model.PythonArgument
import com.larsreimann.apiEditor.mutable_model.PythonBoolean
import com.larsreimann.apiEditor.mutable_model.PythonFloat
import com.larsreimann.apiEditor.mutable_model.PythonInt
import com.larsreimann.apiEditor.mutable_model.PythonLiteral
import com.larsreimann.apiEditor.mutable_model.PythonNone
import com.larsreimann.apiEditor.mutable_model.PythonPackage
import com.larsreimann.apiEditor.mutable_model.PythonParameter
import com.larsreimann.apiEditor.mutable_model.PythonReference
import com.larsreimann.apiEditor.mutable_model.PythonString
import com.larsreimann.apiEditor.mutable_model.PythonStringifiedExpression
import com.larsreimann.modeling.closest
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@constant`, `@optional`, and `@required` annotations.
 */
fun PythonPackage.processValueAnnotations() {
    this.descendants()
        .filterIsInstance<PythonParameter>()
        .toList()
        .forEach { it.processValueAnnotations() }
}

private fun PythonParameter.processValueAnnotations() {
    this.annotations
        .toList()
        .forEach {
            when (it) {
                is ConstantAnnotation -> processConstantAnnotation(it)
                is OptionalAnnotation -> processOptionalAnnotation(it)
                is RequiredAnnotation -> processRequiredAnnotation(it)
                else -> {}
            }
        }
}

private fun PythonParameter.processConstantAnnotation(annotation: ConstantAnnotation) {

    // Update argument that references this parameter
    val arguments = crossReferencesToThis()
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
