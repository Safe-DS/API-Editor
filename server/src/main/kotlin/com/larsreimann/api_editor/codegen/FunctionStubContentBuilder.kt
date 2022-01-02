package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import com.larsreimann.api_editor.model.PythonParameterAssignment.NAME_ONLY
import com.larsreimann.api_editor.model.PythonParameterAssignment.POSITION_ONLY
import com.larsreimann.api_editor.model.PythonParameterAssignment.POSITION_OR_NAME
import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.emf.createSmlAnnotationUse
import de.unibonn.simpleml.emf.createSmlArgument
import de.unibonn.simpleml.emf.createSmlBoolean
import de.unibonn.simpleml.emf.createSmlClass
import de.unibonn.simpleml.emf.createSmlCompilationUnit
import de.unibonn.simpleml.emf.createSmlDummyResource
import de.unibonn.simpleml.emf.createSmlFloat
import de.unibonn.simpleml.emf.createSmlFunction
import de.unibonn.simpleml.emf.createSmlInt
import de.unibonn.simpleml.emf.createSmlNamedType
import de.unibonn.simpleml.emf.createSmlNull
import de.unibonn.simpleml.emf.createSmlParameter
import de.unibonn.simpleml.emf.createSmlResult
import de.unibonn.simpleml.emf.createSmlString
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.simpleML.SmlAbstractExpression
import de.unibonn.simpleml.simpleML.SmlAbstractType
import de.unibonn.simpleml.simpleML.SmlAnnotationUse
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlResult

/**
 * Builds a string containing the formatted function content
 *
 * @return The string containing the formatted function content
 */
// TODO: only for testing, remove
fun buildFunctionToString(pythonFunction: AnnotatedPythonFunction): String {
    val function = buildFunction(pythonFunction)

    // Required to serialize the function
    createSmlDummyResource(
        "functionStub",
        SmlFileExtension.Stub,
        createSmlCompilationUnit(listOf(function))
    )

    return when (val result = function.serializeToFormattedString()) {
        is SerializationResult.Success -> result.code
        is SerializationResult.Failure -> throw IllegalStateException(result.message)
    }
}

fun buildFunction(pythonFunction: AnnotatedPythonFunction): SmlFunction {
    val stubName = pythonFunction.name.snakeCaseToLowerCamelCase()

    return createSmlFunction(
        name = stubName,
        annotations = buildList {
            if (pythonFunction.description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(pythonFunction.description))
            }
            if (pythonFunction.isPure) {
                add(createSmlAnnotationUse("Pure"))
            }
            if (pythonFunction.name != stubName) {
                add(createSmlPythonNameAnnotationUse(pythonFunction.name))
            }
        },
        parameters = pythonFunction.parameters.mapNotNull { buildParameter(it) },
        results = pythonFunction.results.map { buildResult(it) }
    )
}

fun createSmlDescriptionAnnotationUse(description: String): SmlAnnotationUse {
    return createSmlAnnotationUse(
        "Description",
        listOf(createSmlArgument(createSmlString(description)))
    )
}

fun createSmlPythonNameAnnotationUse(name: String): SmlAnnotationUse {
    return createSmlAnnotationUse(
        "PythonName",
        listOf(createSmlArgument(createSmlString(name)))
    )
}

fun buildParameter(pythonParameter: AnnotatedPythonParameter): SmlParameter? {
    if (pythonParameter.assignedBy !in setOf(POSITION_ONLY, POSITION_OR_NAME, NAME_ONLY)) {
        return null
    }

    val stubName = pythonParameter.name.snakeCaseToLowerCamelCase()

    return createSmlParameter(
        name = stubName,
        annotations = buildList {
            if (pythonParameter.description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(pythonParameter.description))
            }
            if (pythonParameter.name != stubName) {
                add(createSmlPythonNameAnnotationUse(pythonParameter.name))
            }
        },
        type = buildType(pythonParameter.typeInDocs),
        defaultValue = pythonParameter.defaultValue?.let { buildDefaultValue(it) }
    )
}

fun buildResult(pythonResult: AnnotatedPythonResult): SmlResult {
    return createSmlResult(
        name = pythonResult.name,
        annotations = buildList {
            if (pythonResult.description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(pythonResult.description))
            }
        },
        type = buildType(pythonResult.type)
    )
}

fun buildType(pythonType: String): SmlAbstractType {
    // TODO: create the correct type
    return when (pythonType) {
        "bool" -> createSmlNamedType(
            declaration = createSmlClass("Boolean")
        )
        "float" -> createSmlNamedType(
            declaration = createSmlClass("Float")
        )
        "int" -> createSmlNamedType(
            declaration = createSmlClass("Int")
        )
        "str" -> createSmlNamedType(
            declaration = createSmlClass("String")
        )
        else -> createSmlNamedType(
            declaration = createSmlClass("Any"),
            isNullable = true
        )
    }
}

/**
 * Converts the given default value string to a formatted version that
 * matches stub file convention
 *
 * @param defaultValue The default value to format
 * @return The formatted default value
 */
fun buildDefaultValue(defaultValue: String): SmlAbstractExpression? {
    if (defaultValue.isBlank()) {
        return null
    }

    val invalid = "###invalid###" + defaultValue.replace("\"", "\\\"") + "###"
    if (defaultValue.length >= 2 && (
            defaultValue[defaultValue.length - 1]
                == defaultValue[0]
            ) && defaultValue[0] == '\'' && defaultValue.count { it == '\'' } == 2
    ) {
        return createSmlString(defaultValue.replace("'".toRegex(), "\"").trim('\'', '"'))
    }
    if (defaultValue == "False" || defaultValue == "True") {
        return createSmlBoolean(defaultValue == "True")
    }
    if (defaultValue == "None") {
        return createSmlNull()
    }
    try {
        val numericValue = defaultValue.toDouble()
        if (numericValue.toInt().toDouble() == numericValue) {
            return createSmlInt(numericValue.toInt())
        }
        return createSmlFloat(numericValue)
    } catch (e: NumberFormatException) {
        // do nothing if defaultValue is not numeric
    }
    return createSmlString(invalid)
}
