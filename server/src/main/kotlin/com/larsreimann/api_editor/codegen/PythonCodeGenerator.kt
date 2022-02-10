package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.ComparisonOperator.LESS_THAN
import com.larsreimann.api_editor.model.ComparisonOperator.LESS_THAN_OR_EQUALS
import com.larsreimann.api_editor.model.ComparisonOperator.UNRESTRICTED
import com.larsreimann.api_editor.model.PythonParameterAssignment.IMPLICIT
import com.larsreimann.api_editor.model.PythonParameterAssignment.NAME_ONLY
import com.larsreimann.api_editor.model.PythonParameterAssignment.POSITION_ONLY
import com.larsreimann.api_editor.model.PythonParameterAssignment.POSITION_OR_NAME
import com.larsreimann.api_editor.mutable_model.PythonArgument
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonBoolean
import com.larsreimann.api_editor.mutable_model.PythonCall
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonConstructor
import com.larsreimann.api_editor.mutable_model.PythonDeclaration
import com.larsreimann.api_editor.mutable_model.PythonEnum
import com.larsreimann.api_editor.mutable_model.PythonEnumInstance
import com.larsreimann.api_editor.mutable_model.PythonExpression
import com.larsreimann.api_editor.mutable_model.PythonFloat
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonInt
import com.larsreimann.api_editor.mutable_model.PythonMemberAccess
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonNamedType
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonReference
import com.larsreimann.api_editor.mutable_model.PythonString
import com.larsreimann.api_editor.mutable_model.PythonStringifiedExpression
import com.larsreimann.api_editor.mutable_model.PythonStringifiedType
import com.larsreimann.api_editor.mutable_model.PythonType
import com.larsreimann.modeling.closest
import com.larsreimann.modeling.descendants

/* ********************************************************************************************************************
 * Declarations
 * ********************************************************************************************************************/

fun PythonModule.toPythonCode(): String {
    val strings = listOf(
        importsToPythonCode(),
        classes.joinToString("\n\n") { it.toPythonCode() },
        functions.joinToString("\n\n") { it.toPythonCode() },
        enums.joinToString("\n\n") { it.toPythonCode() }
    )

    val joinedStrings = strings
        .filter { it.isNotBlank() }
        .joinToString("\n\n")

    return "$joinedStrings\n"
}

private fun PythonModule.importsToPythonCode() = buildString {
    val imports = buildSet<String> {

        // Functions
        this += descendants { it !is PythonDeclaration }
            .filterIsInstance<PythonFunction>()
            .filter { !it.isMethod() || it.isStaticMethod() }
            .mapNotNull {
                when (val receiver = it.callToOriginalAPI?.receiver) {
                    is PythonStringifiedExpression -> receiver.string.parentQualifiedName()
                    else -> null
                }
            }

        // Constructors
        this += descendants()
            .filterIsInstance<PythonConstructor>()
            .mapNotNull {
                when (val receiver = it.callToOriginalAPI?.receiver) {
                    is PythonStringifiedExpression -> receiver.string.parentQualifiedName()
                    else -> null
                }
            }
    }

    val importsString = imports.joinToString("\n") { "import $it" }
    var fromImportsString = "from __future__ import annotations"
    if (enums.isNotEmpty()) {
        fromImportsString += "\nfrom enum import Enum"
    }

    if (importsString.isNotBlank()) {
        append(importsString)

        if (fromImportsString.isNotBlank()) {
            append("\n\n")
        }
    }
    if (fromImportsString.isNotBlank()) {
        append(fromImportsString)
    }
}

private fun String.parentQualifiedName(): String {
    val pathSeparator = "."
    val separationPosition = lastIndexOf(pathSeparator)
    return substring(0, separationPosition)
}

internal fun PythonAttribute.toPythonCode() = buildString {
    append("self.$name")
    type?.toPythonCodeOrNull()?.let {
        append(": $it")
    }
    value?.toPythonCode()?.let {
        append(" = $it")
    }
}

internal fun PythonClass.toPythonCode() = buildString {
    val constructorString = constructor?.toPythonCode() ?: ""
    val methodsString = methods.joinToString("\n\n") { it.toPythonCode() }

    appendLine("class $name:")
    if (constructorString.isNotBlank()) {
        appendIndented(constructorString)
        if (methodsString.isNotBlank()) {
            append("\n\n")
        }
    }
    if (methodsString.isNotBlank()) {
        appendIndented(methodsString)
    }
    if (constructorString.isBlank() && methodsString.isBlank()) {
        appendIndented("pass")
    }
}

internal fun PythonConstructor.toPythonCode() = buildString {
    val parametersString = parameters.toPythonCode()
    val boundariesString = parameters
        .mapNotNull { it.boundary?.toPythonCode(it.name) }
        .joinToString("\n")
    val attributesString = closest<PythonClass>()
        ?.attributes
        ?.joinToString("\n") { it.toPythonCode() }
        ?: ""
    val callString = callToOriginalAPI
        ?.let { "self.instance = ${it.toPythonCode()}" }
        ?: ""

    appendLine("def __init__($parametersString):")
    if (boundariesString.isNotBlank()) {
        appendIndented(boundariesString)
        if (attributesString.isNotBlank() || callString.isNotBlank()) {
            append("\n\n")
        }
    }
    if (attributesString.isNotBlank()) {
        appendIndented(attributesString)
        if (callString.isNotBlank()) {
            append("\n\n")
        }
    }
    if (callString.isNotBlank()) {
        appendIndented(callString)
    }
    if (boundariesString.isBlank() && attributesString.isBlank() && callString.isBlank()) {
        appendIndented("pass")
    }
}

internal fun PythonEnum.toPythonCode() = buildString {
    appendLine("class $name(Enum):")
    appendIndented {
        if (instances.isEmpty()) {
            append("pass")
        } else {
            instances.forEach {
                append(it.toPythonCode())
                if (it != instances.last()) {
                    appendLine(",")
                }
            }
        }
    }
}

internal fun PythonEnumInstance.toPythonCode(): String {
    return "$name = ${value!!.toPythonCode()}"
}

internal fun PythonFunction.toPythonCode() = buildString {
    val parametersString = parameters.toPythonCode()
    val boundariesString = parameters
        .mapNotNull { it.boundary?.toPythonCode(it.name) }
        .joinToString("\n")
    val callString = callToOriginalAPI
        ?.let { "return ${it.toPythonCode()}" }
        ?: ""

    if (isStaticMethod()) {
        appendLine("@staticmethod")
    }
    appendLine("def $name($parametersString):")
    if (boundariesString.isNotBlank()) {
        appendIndented(boundariesString)
        if (callString.isNotBlank()) {
            append("\n\n")
        }
    }
    if (callString.isNotBlank()) {
        appendIndented(callString)
    }
    if (boundariesString.isBlank() && callString.isBlank()) {
        appendIndented("pass")
    }
}

internal fun List<PythonParameter>.toPythonCode(): String {
    val assignedByToParameter = this@toPythonCode.groupBy { it.assignedBy }
    val implicitParametersString = assignedByToParameter[IMPLICIT]
        ?.joinToString { it.toPythonCode() }
        ?: ""
    var positionOnlyParametersString = assignedByToParameter[POSITION_ONLY]
        ?.joinToString { it.toPythonCode() }
        ?: ""
    val positionOrNameParametersString = assignedByToParameter[POSITION_OR_NAME]
        ?.joinToString { it.toPythonCode() }
        ?: ""
    var nameOnlyParametersString = assignedByToParameter[NAME_ONLY]
        ?.joinToString { it.toPythonCode() }
        ?: ""

    if (positionOnlyParametersString.isNotBlank()) {
        positionOnlyParametersString = "$positionOnlyParametersString, /"
    }

    if (nameOnlyParametersString.isNotBlank()) {
        nameOnlyParametersString = "*, $nameOnlyParametersString"
    }

    val parameterStrings = listOf(
        implicitParametersString,
        positionOnlyParametersString,
        positionOrNameParametersString,
        nameOnlyParametersString
    )

    return parameterStrings
        .filter { it.isNotBlank() }
        .joinToString()
}

internal fun PythonParameter.toPythonCode() = buildString {
    val typeStringOrNull = type.toPythonCodeOrNull()

    append(name)
    if (typeStringOrNull != null) {
        append(": $typeStringOrNull")
        defaultValue?.toPythonCode()?.let { append(" = $it") }
    } else {
        defaultValue?.toPythonCode()?.let { append("=$it") }
    }
}

/* ********************************************************************************************************************
 * Expressions
 * ********************************************************************************************************************/

internal fun PythonExpression.toPythonCode(): String {
    return when (this) {
        is PythonBoolean -> value.toString().replaceFirstChar { it.uppercase() }
        is PythonCall -> "${receiver!!.toPythonCode()}(${arguments.joinToString { it.toPythonCode() }})"
        is PythonFloat -> value.toString()
        is PythonInt -> value.toString()
        is PythonMemberAccess -> "${receiver!!.toPythonCode()}.${member!!.toPythonCode()}"
        is PythonReference -> declaration!!.name
        is PythonString -> "'$value'"
        is PythonStringifiedExpression -> string
    }
}

/* ********************************************************************************************************************
 * Types
 * ********************************************************************************************************************/

internal fun PythonType?.toPythonCodeOrNull(): String? {
    return when (this) {
        is PythonNamedType -> this.declaration?.name
        is PythonStringifiedType -> {
            when (this.string) {
                "bool" -> "bool"
                "float" -> "float"
                "int" -> "int"
                "str" -> "str"
                else -> null
            }
        }
        null -> null
    }
}

/* ********************************************************************************************************************
 * Other
 * ********************************************************************************************************************/

internal fun PythonArgument.toPythonCode() = buildString {
    if (name != null) {
        append("$name=")
    }
    append(value!!.toPythonCode())
}

internal fun Boundary.toPythonCode(parameterName: String) = buildString {
    if (isDiscrete) {
        appendLine("if not (isinstance($parameterName, int) or (isinstance($parameterName, float) and $parameterName.is_integer())):")
        appendIndented("raise ValueError(f'$parameterName needs to be an integer, but {$parameterName} was assigned.')")
        if (lowerLimitType != UNRESTRICTED || upperLimitType != UNRESTRICTED) {
            appendLine()
        }
    }

    if (lowerLimitType != UNRESTRICTED && upperLimitType != UNRESTRICTED) {
        appendLine("if not $lowerIntervalLimit ${lowerLimitType.operator} $parameterName ${upperLimitType.operator} $upperIntervalLimit:")
        appendIndented("raise ValueError(f'Valid values of $parameterName must be in ${asInterval()}, but {$parameterName} was assigned.')")
    } else if (lowerLimitType == LESS_THAN) {
        appendLine("if not $lowerIntervalLimit < $parameterName:")
        appendIndented("raise ValueError(f'Valid values of $parameterName must be greater than $lowerIntervalLimit, but {$parameterName} was assigned.')")
    } else if (lowerLimitType == LESS_THAN_OR_EQUALS) {
        appendLine("if not $lowerIntervalLimit <= $parameterName:")
        appendIndented("raise ValueError(f'Valid values of $parameterName must be greater than or equal to $lowerIntervalLimit, but {$parameterName} was assigned.')")
    } else if (upperLimitType == LESS_THAN) {
        appendLine("if not $parameterName < $upperIntervalLimit:")
        appendIndented("raise ValueError(f'Valid values of $parameterName must be less than $upperIntervalLimit, but {$parameterName} was assigned.')")
    } else if (upperLimitType == LESS_THAN_OR_EQUALS) {
        appendLine("if not $parameterName <= $upperIntervalLimit:")
        appendIndented("raise ValueError(f'Valid values of $parameterName must be less than or equal to $upperIntervalLimit, but {$parameterName} was assigned.')")
    }
}

/* ********************************************************************************************************************
 * Util
 * ********************************************************************************************************************/

private fun String.prependIndentUnlessBlank(indent: String = "    "): String {
    return lineSequence()
        .map {
            when {
                it.isBlank() -> it.trim()
                else -> it.prependIndent(indent)
            }
        }
        .joinToString("\n")
}

private fun StringBuilder.appendIndented(init: StringBuilder.() -> Unit): StringBuilder {
    val stringToIndent = StringBuilder().apply(init).toString()
    append(stringToIndent.prependIndentUnlessBlank())
    return this
}

private fun StringBuilder.appendIndented(value: String): StringBuilder {
    append(value.prependIndentUnlessBlank())
    return this
}
