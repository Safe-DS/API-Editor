package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.ComparisonOperator
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

/**
 * Builds a string containing the formatted module content
 * @receiver The module whose adapter content should be built
 * @return The string containing the formatted module content
 */
fun PythonModule.toPythonCode(): String {
    var formattedImport = buildNamespace(this)
    var formattedEnums = enums.joinToString("\n") { it.toPythonCode() }
    var formattedClasses = buildAllClasses(this)
    var formattedFunctions = buildAllFunctions(this)
    val separators = buildSeparators(
        formattedImport, formattedClasses, formattedFunctions
    )
    formattedImport += separators[0]
    if (formattedEnums.isNotBlank()) {
        formattedEnums += "\n"
    }
    formattedClasses += separators[1]
    formattedFunctions += separators[2]
    return (
        formattedImport +
            formattedEnums +
            formattedClasses +
            formattedFunctions
        )
}

private fun buildNamespace(pythonModule: PythonModule): String {
    val importedModules = HashSet<String>()
    pythonModule.functions.forEach { pythonFunction: PythonFunction ->
        val receiver = pythonFunction.callToOriginalAPI?.receiver
        if (receiver is PythonStringifiedExpression) {
            importedModules.add(buildParentDeclarationName(receiver.string))
        }
    }
    pythonModule.classes.forEach { pythonClass: PythonClass ->
        if (pythonClass.originalClass != null) {
            importedModules.add(
                buildParentDeclarationName(pythonClass.originalClass!!.qualifiedName)
            )
        }

    }
    var result = importedModules.joinToString("\n") { "import $it" }
    if (pythonModule.enums.isNotEmpty()) {
        result = "from enum import Enum\n$result"
    }
    return result
}

private fun buildParentDeclarationName(qualifiedName: String): String {
    val pathSeparator = "."
    val separationPosition = qualifiedName.lastIndexOf(pathSeparator)
    return qualifiedName.substring(0, separationPosition)
}

private fun buildAllClasses(pythonModule: PythonModule): String {
    return pythonModule.classes.joinToString("\n".repeat(2)) { it.toPythonCode() }
}

private fun buildAllFunctions(pythonModule: PythonModule): String {
    return pythonModule.functions.joinToString("\n".repeat(2)) { it.toPythonCode() }
}

private fun buildSeparators(
    formattedImports: String,
    formattedClasses: String,
    formattedFunctions: String
): Array<String> {
    val importSeparator: String = if (formattedImports.isBlank()) {
        ""
    } else if (formattedClasses.isBlank() && formattedFunctions.isBlank()) {
        "\n"
    } else {
        "\n\n"
    }
    val classesSeparator: String = if (formattedClasses.isBlank()) {
        ""
    } else if (formattedFunctions.isBlank()) {
        "\n"
    } else {
        "\n\n"
    }
    val functionSeparator: String = if (formattedFunctions.isBlank()) {
        ""
    } else {
        "\n"
    }
    return arrayOf(importSeparator, classesSeparator, functionSeparator)
}

/**
 * Builds a string containing the formatted class content
 * @receiver The module whose adapter content should be built
 * @return The string containing the formatted class content
 */
fun PythonClass.toPythonCode(): String {
    var formattedClass = "class $name:\n"
    if (constructor != null) {
        formattedClass += constructor!!.toPythonCode().prependIndent("    ")
    }
    if (!methods.isEmpty()) {
        if (constructor != null) {
            formattedClass += "\n\n"
        }
        formattedClass += buildAllFunctions(this).joinToString("\n".repeat(2))
    }
    if (constructor == null && methods.isEmpty()) {
        formattedClass += "    pass"
    }
    return formattedClass
}

private fun buildAllFunctions(pythonClass: PythonClass): List<String> {
    return pythonClass.methods.map { it.toPythonCode().prependIndent("    ") }
}


/* ********************************************************************************************************************
 * Declarations
 * ********************************************************************************************************************/

internal fun PythonAttribute.toPythonCode() = buildString {
    append("self.$name")
    type?.toPythonCodeOrNull()?.let {
        append(": $it")
    }
    value?.toPythonCode()?.let {
        append(" = $it")
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
        appendIndented("raise ValueError('$parameterName' needs to be an integer, but {} was assigned.'.format($parameterName))")
        appendLine()
    }

    if (lowerLimitType != ComparisonOperator.UNRESTRICTED && upperLimitType != ComparisonOperator.UNRESTRICTED) {
        appendLine("if not $lowerIntervalLimit ${lowerLimitType.operator} $parameterName ${upperLimitType.operator} ${upperIntervalLimit}:")
        appendIndented("raise ValueError('Valid values of $parameterName must be in ${asInterval()}, but {} was assigned.'.format($parameterName))")
    } else if (lowerLimitType == ComparisonOperator.LESS_THAN) {
        appendLine("if not $lowerIntervalLimit < ${parameterName}:")
        appendIndented("raise ValueError('Valid values of $parameterName must be greater than $lowerIntervalLimit, but {} was assigned.'.format($parameterName))")
    } else if (lowerLimitType == ComparisonOperator.LESS_THAN_OR_EQUALS) {
        appendLine("if not $lowerIntervalLimit <= ${parameterName}:")
        appendIndented("raise ValueError('Valid values of $parameterName must be greater than or equal to $lowerIntervalLimit, but {} was assigned.'.format($parameterName))")
    } else if (upperLimitType == ComparisonOperator.LESS_THAN) {
        appendLine("if not $parameterName < ${upperIntervalLimit}:")
        appendIndented("raise ValueError('Valid values of $parameterName must be less than $upperIntervalLimit, but {} was assigned.'.format($parameterName))")
    } else if (upperLimitType == ComparisonOperator.LESS_THAN_OR_EQUALS) {
        appendLine("if not $parameterName <= ${upperIntervalLimit}:")
        appendIndented("raise ValueError('Valid values of $parameterName must be less than or equal to $upperIntervalLimit, but {} was assigned.'.format($parameterName))")
    }
}


/* ********************************************************************************************************************
 * Util
 * ********************************************************************************************************************/

private fun StringBuilder.appendIndented(init: StringBuilder.() -> Unit): StringBuilder {
    val stringToIndent = StringBuilder().apply(init).toString()
    val indent = " ".repeat(4)
    append(stringToIndent.prependIndent(indent))
    return this
}

private fun StringBuilder.appendIndented(value: String): StringBuilder {
    val indent = " ".repeat(4)
    append(value.prependIndent(indent))
    return this
}
