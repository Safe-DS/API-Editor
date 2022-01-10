package com.larsreimann.api_editor.codegen

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
        formattedClass += buildConstructor(this).prependIndent("    ")
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

private fun buildConstructor(`class`: PythonClass) = buildString {
    val constructor = `class`.constructor ?: return ""

    appendLine("def __init__(${buildParameters(constructor.parameters)}):")
    appendIndented(4) {
        val boundaries = buildBoundaryChecks(constructor.parameters).joinToString("\n")
        if (boundaries.isNotBlank()) {
            append("$boundaries\n\n")
        }

        val attributes = buildAttributeAssignments(`class`).joinToString("\n")
        if (attributes.isNotBlank()) {
            append("$attributes\n\n")
        }

        val constructorCall = constructor.buildConstructorCall()
        if (constructorCall.isNotBlank()) {
            append(constructorCall)
        }

        if (attributes.isBlank() && constructorCall.isBlank()) {
            append("pass")
        }
    }
}

private fun PythonConstructor.buildConstructorCall(): String {
    return when (callToOriginalAPI) {
        null -> ""
        else -> "self.instance = ${callToOriginalAPI.toPythonCode()}"
    }
}

/**
 * Builds a string containing the formatted function content
 * @receiver The function whose adapter content should be built
 * @return The string containing the formatted function content
 */
fun PythonFunction.toPythonCode(): String {
    val function = """
      |def $name(${buildParameters(this.parameters)}):
      |${(buildFunctionBody(this)).prependIndent("    ")}
      """.trimMargin()

    return when {
        isStaticMethod() -> "@staticmethod\n$function"
        else -> function
    }
}

private fun buildAttributeAssignments(pythonClass: PythonClass): List<String> {
    return pythonClass.attributes.map { it.toPythonCode() }
}

private fun buildParameters(parameters: List<PythonParameter>): String {
    var formattedFunctionParameters = ""
    val implicitParameters: MutableList<String> = ArrayList()
    val positionOnlyParameters: MutableList<String> = ArrayList()
    val positionOrNameParameters: MutableList<String> = ArrayList()
    val nameOnlyParameters: MutableList<String> = ArrayList()
    parameters.forEach { pythonParameter: PythonParameter ->
        when (pythonParameter.assignedBy) {
            IMPLICIT -> implicitParameters.add(pythonParameter.toPythonCode())
            POSITION_ONLY -> positionOnlyParameters.add(pythonParameter.toPythonCode())
            POSITION_OR_NAME -> positionOrNameParameters.add(pythonParameter.toPythonCode())
            NAME_ONLY -> nameOnlyParameters.add(pythonParameter.toPythonCode())
        }
    }
    assert(implicitParameters.size < 2)
    val hasImplicitParameter = implicitParameters.isNotEmpty()
    val hasPositionOnlyParameters = positionOnlyParameters.isNotEmpty()
    val hasPositionOrNameParameters = positionOrNameParameters.isNotEmpty()
    val hasNameOnlyParameters = nameOnlyParameters.isNotEmpty()

    if (hasImplicitParameter) {
        formattedFunctionParameters += implicitParameters[0]
        if (hasPositionOnlyParameters || hasPositionOrNameParameters || hasNameOnlyParameters) {
            formattedFunctionParameters += ", "
        }
    }
    if (hasPositionOnlyParameters) {
        formattedFunctionParameters += positionOnlyParameters.joinToString()
        formattedFunctionParameters += when {
            hasPositionOrNameParameters -> ", /, "
            hasNameOnlyParameters -> ", /"
            else -> ", /"
        }
    }
    if (hasPositionOrNameParameters) {
        formattedFunctionParameters += positionOrNameParameters.joinToString()
    }
    if (hasNameOnlyParameters) {
        formattedFunctionParameters += when {
            hasPositionOnlyParameters || hasPositionOrNameParameters -> ", *, "
            else -> "*, "
        }
        formattedFunctionParameters += nameOnlyParameters.joinToString()
    }
    return formattedFunctionParameters
}

private fun buildFunctionBody(pythonFunction: PythonFunction): String {
    var formattedBoundaries = buildBoundaryChecks(pythonFunction.parameters).joinToString("\n")
    if (formattedBoundaries.isNotBlank()) {
        formattedBoundaries = "$formattedBoundaries\n"
    }

    return (
        formattedBoundaries +
            "return " + pythonFunction.callToOriginalAPI!!.toPythonCode()
        )
}

private fun buildBoundaryChecks(parameters: List<PythonParameter>): List<String> {
    val formattedBoundaries: MutableList<String> = ArrayList()
    parameters
        .filter { it.boundary != null }
        .forEach {
            assert(it.boundary != null)
            if (it.boundary!!.isDiscrete) {
                formattedBoundaries.add(
                    "if not (isinstance(${it.name}, int) or (isinstance(${it.name}, float) and ${it.name}.is_integer())):\n" +
                        "    raise ValueError('" +
                        it.name +
                        " needs to be an integer, but {} was assigned." +
                        "'.format(" +
                        it.name +
                        "))"
                )
            }
            if (it.boundary!!.lowerLimitType !== ComparisonOperator.UNRESTRICTED && it.boundary!!.upperLimitType !== ComparisonOperator.UNRESTRICTED) {
                formattedBoundaries.add(
                    "if not ${it.boundary!!.lowerIntervalLimit} ${it.boundary!!.lowerLimitType.operator} ${it.name} ${it.boundary!!.upperLimitType.operator} ${it.boundary!!.upperIntervalLimit}:\n" +
                        "    raise ValueError('Valid values of " +
                        it.name +
                        " must be in " +
                        it.boundary!!.asInterval() +
                        ", but {} was assigned." +
                        "'.format(" +
                        it.name +
                        "))"
                )
            } else if (it.boundary!!.lowerLimitType === ComparisonOperator.LESS_THAN) {
                formattedBoundaries.add(
                    "if not ${it.boundary!!.lowerIntervalLimit} < ${it.name}:\n" +
                        "    raise ValueError('Valid values of " +
                        it.name +
                        " must be greater than " +
                        it.boundary!!.lowerIntervalLimit +
                        ", but {} was assigned." +
                        "'.format(" +
                        it.name +
                        "))"
                )
            } else if (it.boundary!!.lowerLimitType === ComparisonOperator.LESS_THAN_OR_EQUALS) {
                formattedBoundaries.add(
                    "if not ${it.boundary!!.lowerIntervalLimit} <= ${it.name}:\n" +
                        "    raise ValueError('Valid values of " +
                        it.name +
                        " must be greater than or equal to " +
                        it.boundary!!.lowerIntervalLimit +
                        ", but {} was assigned." +
                        "'.format(" +
                        it.name +
                        "))"
                )
            }
            if (it.boundary!!.upperLimitType === ComparisonOperator.LESS_THAN) {
                formattedBoundaries.add(
                    "if not ${it.name} < ${it.boundary!!.upperIntervalLimit}:\n" +
                        "    raise ValueError('Valid values of " +
                        it.name +
                        " must be less than " +
                        it.boundary!!.upperIntervalLimit +
                        ", but {} was assigned." +
                        "'.format(" +
                        it.name +
                        "))"
                )
            } else if (it.boundary!!.upperLimitType === ComparisonOperator.LESS_THAN) {
                formattedBoundaries.add(
                    "if not ${it.name} <= ${it.boundary!!.upperIntervalLimit}:\n" +
                        "    raise ValueError('Valid values of " +
                        it.name +
                        " must be less than or equal to " +
                        it.boundary!!.upperIntervalLimit +
                        ", but {} was assigned." +
                        "'.format(" +
                        it.name +
                        "))"
                )
            }
        }
    return formattedBoundaries
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

internal fun PythonEnum.toPythonCode() = buildString {
    appendLine("class $name(Enum):")
    appendIndented(4) {
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


/* ********************************************************************************************************************
 * Util
 * ********************************************************************************************************************/

private fun StringBuilder.appendIndented(numberOfSpaces: Int, init: StringBuilder.() -> Unit): StringBuilder {
    val stringToIndent = StringBuilder().apply(init).toString()
    val indent = " ".repeat(numberOfSpaces)
    append(stringToIndent.prependIndent(indent))
    return this
}
