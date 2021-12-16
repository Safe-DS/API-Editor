package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import de.unibonn.simpleml.constant.FileExtension
import de.unibonn.simpleml.emf.createSmlAnnotationUse
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
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlResult

/**
 * Builds a string containing the formatted function content
 *
 * @return The string containing the formatted function content
 */
fun buildFunction(pythonFunction: AnnotatedPythonFunction): String {
    val function = createSmlFunction(
        name = pythonFunction.name,
        annotations = buildList {
            if (pythonFunction.isPure) {
                add(createSmlAnnotationUse("Pure"))
            }
        },
        parameters = pythonFunction.parameters.map { buildParameter(it) },
        results = if (pythonFunction.results.isEmpty()) {
            null
        } else {
            pythonFunction.results.map { buildResult(it) }
        }
    )

    // Required to serialize the function
    createSmlDummyResource(
        "functionStub",
        FileExtension.STUB,
        createSmlCompilationUnit {
            this.members += function
        }
    )

    return when (val result = function.serializeToFormattedString()) {
        is SerializationResult.Success -> result.code
        is SerializationResult.Failure -> throw IllegalStateException(result.message)
    }
}

fun buildParameter(pythonParameter: AnnotatedPythonParameter): SmlParameter {
    return createSmlParameter(
        name = pythonParameter.name,
        type = buildSmlType(pythonParameter.typeInDocs),
        defaultValue = pythonParameter.defaultValue?.let { buildDefaultValue(it) }
    )
}

fun buildResult(pythonResult: AnnotatedPythonResult): SmlResult {
    return createSmlResult(
        name = pythonResult.name,
        type = buildSmlType(pythonResult.type)
    )
}

fun buildSmlType(pythonType: String): SmlAbstractType {
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
fun buildDefaultValue(defaultValue: String): SmlAbstractExpression {
    val invalid = "###invalid###" + defaultValue.replace("\"", "\\\"") + "###"
    if (defaultValue.length >= 2 && (defaultValue[defaultValue.length - 1]
            == defaultValue[0]) && defaultValue[0] == '\'' && defaultValue.count { it == '\'' } == 2
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
