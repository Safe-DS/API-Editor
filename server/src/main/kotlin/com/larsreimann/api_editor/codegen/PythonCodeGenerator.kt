package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.PythonParameterAssignment.ATTRIBUTE
import com.larsreimann.api_editor.model.PythonParameterAssignment.CONSTANT
import com.larsreimann.api_editor.model.PythonParameterAssignment.ENUM
import com.larsreimann.api_editor.model.PythonParameterAssignment.IMPLICIT
import com.larsreimann.api_editor.model.PythonParameterAssignment.NAME_ONLY
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonConstructor
import com.larsreimann.api_editor.mutable_model.MutablePythonEnum
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter

/**
 * Builds a string containing the formatted module content
 * @receiver The module whose adapter content should be built
 * @return The string containing the formatted module content
 */
fun MutablePythonModule.toPythonCode(): String {
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

private fun buildNamespace(pythonModule: MutablePythonModule): String {
    val importedModules = HashSet<String>()
    pythonModule.functions.forEach { pythonFunction: MutablePythonFunction ->
        importedModules.add(
            buildParentDeclarationName(pythonFunction.originalFunction!!.qualifiedName)
        )
    }
    pythonModule.classes.forEach { pythonClass: MutablePythonClass ->
        importedModules.add(
            buildParentDeclarationName(pythonClass.originalClass!!.qualifiedName)
        )
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

private fun buildAllClasses(pythonModule: MutablePythonModule): String {
    return pythonModule.classes.joinToString("\n".repeat(2)) { it.toPythonCode() }
}

private fun buildAllFunctions(pythonModule: MutablePythonModule): String {
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
fun MutablePythonClass.toPythonCode(): String {
    var formattedClass = "class $name:\n"
    if (constructor != null) {
        formattedClass += buildConstructor().prependIndent("    ")
    }
    if (!methods.isEmpty()) {
        if (constructor != null) {
            formattedClass += "\n\n"
        }
        formattedClass += buildAllFunctions(this).joinToString("\n".repeat(2))
    }
    return formattedClass
}

private fun buildAllFunctions(pythonClass: MutablePythonClass): List<String> {
    return pythonClass.methods.map { it.toPythonCode().prependIndent("    ") }
}

private fun MutablePythonClass.buildConstructor(): String {
    var constructorSeparator = ""
    val assignments = buildAttributeAssignments(this).joinToString("\n".repeat(1))
    if (assignments.isNotBlank()) {
        constructorSeparator = "\n"
    }
    var constructorSuffix = constructorSeparator + assignments
    constructorSuffix += this.constructor?.buildConstructorCall() ?: ""
    if (constructorSuffix.isBlank()) {
        constructorSuffix = "pass"
    }
    return """
      |def __init__(${buildParameters(this.constructor?.parameters.orEmpty())}):
      |${(constructorSuffix).prependIndent("    ")}
      """.trimMargin()
}

private fun MutablePythonConstructor.buildConstructorCall(): String {
    return "self.instance = ${callToOriginalAPI!!.qualifiedName}(${this.buildParameterCall()})"
}

/**
 * Builds a string containing the formatted function content
 * @receiver The function whose adapter content should be built
 * @return The string containing the formatted function content
 */
fun MutablePythonFunction.toPythonCode(): String {
    val function = """
      |def $name(${buildParameters(this.parameters)}):
      |${(buildFunctionBody(this)).prependIndent("    ")}
      """.trimMargin()

    return when {
        isStaticMethod() -> "@staticmethod\n$function"
        else -> function
    }
}

private fun buildAttributeAssignments(pythonClass: MutablePythonClass): List<String> {
    return pythonClass.attributes.map {
        "self.${it.name} = ${it.defaultValue}"
    }
}

private fun buildParameters(parameters: List<MutablePythonParameter>): String {
    var formattedFunctionParameters = ""
    val implicitParameters: MutableList<String> = ArrayList()
    val positionOnlyParameters: MutableList<String> = ArrayList()
    val positionOrNameParameters: MutableList<String> = ArrayList()
    val nameOnlyParameters: MutableList<String> = ArrayList()
    parameters.forEach { pythonParameter: MutablePythonParameter ->
        when (pythonParameter.assignedBy) {
            IMPLICIT -> implicitParameters.add(pythonParameter.toPythonCode())
            PythonParameterAssignment.POSITION_ONLY -> positionOnlyParameters.add(pythonParameter.toPythonCode())
            PythonParameterAssignment.POSITION_OR_NAME -> positionOrNameParameters.add(pythonParameter.toPythonCode())
            ENUM -> positionOrNameParameters.add(pythonParameter.toPythonCode())
            NAME_ONLY -> nameOnlyParameters.add(pythonParameter.toPythonCode())
            else -> {}
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

private fun MutablePythonParameter.toPythonCode() = buildString {
    append(name)
    if (defaultValue != null) {
        append("=$defaultValue")
    }
}

private fun buildFunctionBody(pythonFunction: MutablePythonFunction): String {
    var formattedBoundaries = buildBoundaryChecks(pythonFunction).joinToString("\n".repeat(1))
    if (formattedBoundaries.isNotBlank()) {
        formattedBoundaries = "$formattedBoundaries\n"
    }

    if (!pythonFunction.isMethod() || pythonFunction.isStaticMethod()) {
        return (
            formattedBoundaries +
                pythonFunction.originalFunction!!.qualifiedName +
                "(" +
                pythonFunction.buildParameterCall() +
                ")"
            )
    }

    return (
        formattedBoundaries +
            "self.instance." +
            pythonFunction.originalFunction!!.qualifiedName.split(".").last() +
            "(" +
            pythonFunction.buildParameterCall() +
            ")"
        )
}

private fun buildBoundaryChecks(pythonFunction: MutablePythonFunction): List<String> {
    val formattedBoundaries: MutableList<String> = ArrayList()
    pythonFunction
        .parameters
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

private fun MutablePythonFunction.buildParameterCall(): String {
    return buildParameterCall(
        parameters,
        originalFunction!!.parameters
    )
}

private fun MutablePythonConstructor.buildParameterCall(): String {
    return buildParameterCall(
        parameters,
        callToOriginalAPI!!.parameters
    )
}

private fun buildParameterCall(
    parameters: List<MutablePythonParameter>,
    originalParameters: List<OriginalPythonParameter>
): String {

    val formattedParameters: MutableList<String?> = ArrayList()
    val originalNameToValueMap: MutableMap<String, String?> = HashMap()
    parameters.forEach {
        val value: String? =
            when (it.assignedBy) {
                CONSTANT, ATTRIBUTE -> it.defaultValue
                ENUM -> "${it.name}.value"
                else -> it.name
            }
        originalNameToValueMap[it.originalParameter!!.name] = value
    }
    originalParameters
        .filter { it.assignedBy != IMPLICIT }
        .forEach {
            when (it.assignedBy) {
                NAME_ONLY -> formattedParameters.add(it.name + "=" + originalNameToValueMap[it.name])
                else -> formattedParameters.add(originalNameToValueMap[it.name])
            }
        }
    return formattedParameters.joinToString()
}

internal fun MutablePythonEnum.toPythonCode() = buildString {
    appendLine("class ${name}(Enum):")
    appendIndented(4) {
        if (instances.isEmpty()) {
            append("pass")
        } else {
            instances.forEach {
                append("${it.name} = \"${it.value}\"")
                if (it != instances.last()) {
                    appendLine(",")
                }
            }
        }
    }
}

private fun StringBuilder.appendIndented(numberOfSpaces: Int, init: StringBuilder.() -> Unit): StringBuilder {
    val stringToIndent = StringBuilder().apply(init).toString()
    val indent = " ".repeat(numberOfSpaces)
    append(stringToIndent.prependIndent(indent))
    return this
}
