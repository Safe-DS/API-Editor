package com.safeds.apiEditor.transformation

import com.larsreimann.modeling.closest
import com.larsreimann.modeling.descendants
import com.safeds.apiEditor.model.ConstantAnnotation
import com.safeds.apiEditor.model.DefaultBoolean
import com.safeds.apiEditor.model.DefaultNone
import com.safeds.apiEditor.model.DefaultNumber
import com.safeds.apiEditor.model.DefaultString
import com.safeds.apiEditor.model.DefaultValue
import com.safeds.apiEditor.model.OmittedAnnotation
import com.safeds.apiEditor.model.OptionalAnnotation
import com.safeds.apiEditor.model.PythonParameterAssignment
import com.safeds.apiEditor.model.RequiredAnnotation
import com.safeds.apiEditor.mutableModel.PythonArgument
import com.safeds.apiEditor.mutableModel.PythonBoolean
import com.safeds.apiEditor.mutableModel.PythonFloat
import com.safeds.apiEditor.mutableModel.PythonInt
import com.safeds.apiEditor.mutableModel.PythonLiteral
import com.safeds.apiEditor.mutableModel.PythonNone
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter
import com.safeds.apiEditor.mutableModel.PythonReference
import com.safeds.apiEditor.mutableModel.PythonString
import com.safeds.apiEditor.mutableModel.PythonStringifiedExpression

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
                is OmittedAnnotation -> processOmittedAnnotation(it)
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

    // Remove annotation
    this.annotations.remove(annotation)
}

private fun PythonParameter.processOmittedAnnotation(annotation: OmittedAnnotation) {
    // Update argument that references this parameter
    val arguments = crossReferencesToThis()
        .mapNotNull { (it.parent as? PythonReference)?.closest<PythonArgument>() }
        .toList()

    require(arguments.size == 1) {
        "Expected parameter to be referenced in exactly one argument but was used in $arguments."
    }

    // Remove argument
    val argument = arguments[0]
    argument.release()

    // Remove parameter
    this.release()

    // Remove annotation
    this.annotations.remove(annotation)
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
