package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter

/**
 * Builds a string containing the formatted module content
 * @receiver The module whose adapter content should be built
 * @return The string containing the formatted module content
 */
fun MutablePythonModule.toPythonCode(): String {
    var formattedImport = buildNamespace(this)
    var formattedClasses = buildAllClasses(this)
    var formattedFunctions = buildAllFunctions(this)
    val separators = buildSeparators(
        formattedImport, formattedClasses, formattedFunctions
    )
    formattedImport += separators[0]
    formattedClasses += separators[1]
    formattedFunctions += separators[2]
    return (
        formattedImport +
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
    val imports: MutableList<String> = ArrayList()
    importedModules.forEach { moduleName: String -> imports.add("import $moduleName") }
    return imports.joinToString("\n".repeat(1))
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
    if (constructorSuffix.isBlank()) {
        constructorSuffix = "pass"
    }
    return """
      |def __init__(${buildParameters(this.constructor?.parameters.orEmpty())}):
      |${(constructorSuffix).prependIndent("    ")}
      """.trimMargin()
}

/**
 * Builds a string containing the formatted function content
 * @receiver The function whose adapter content should be built
 * @return The string containing the formatted function content
 */
fun MutablePythonFunction.toPythonCode(): String {
    return """
      |def $name(${buildParameters(this.parameters)}):
      |${(buildFunctionBody(this)).prependIndent("    ")}
      """.trimMargin()
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
            PythonParameterAssignment.IMPLICIT -> implicitParameters.add(pythonParameter.toPythonCode())
            PythonParameterAssignment.POSITION_ONLY -> positionOnlyParameters.add(pythonParameter.toPythonCode())
            PythonParameterAssignment.POSITION_OR_NAME -> positionOrNameParameters.add(pythonParameter.toPythonCode())
            PythonParameterAssignment.NAME_ONLY -> nameOnlyParameters.add(pythonParameter.toPythonCode())
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
    return (
        formattedBoundaries +
            pythonFunction.originalFunction!!.qualifiedName +
            "(" +
            buildParameterCall(pythonFunction) +
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

private fun buildParameterCall(pythonFunction: MutablePythonFunction): String {
    val formattedParameters: MutableList<String?> = ArrayList()
    val originalNameToValueMap: MutableMap<String, String?> = HashMap()
    pythonFunction.parameters.forEach {
        val value: String? =
            if (it.assignedBy == PythonParameterAssignment.CONSTANT || it.assignedBy == PythonParameterAssignment.ATTRIBUTE) {
                it.defaultValue
            } else {
                it.name
            }
        originalNameToValueMap[it.originalParameter!!.name] = value
    }
    pythonFunction.originalFunction!!.parameters
        .filter { it.assignedBy != PythonParameterAssignment.IMPLICIT }
        .forEach {
            if (it.assignedBy === PythonParameterAssignment.NAME_ONLY) {
                formattedParameters.add(it.name + "=" + originalNameToValueMap[it.name])
            } else {
                formattedParameters.add(originalNameToValueMap[it.name])
            }
        }
    return formattedParameters.joinToString()
}
