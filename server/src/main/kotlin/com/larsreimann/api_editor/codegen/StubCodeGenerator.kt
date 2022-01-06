package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.PythonParameterAssignment.NAME_ONLY
import com.larsreimann.api_editor.model.PythonParameterAssignment.POSITION_ONLY
import com.larsreimann.api_editor.model.PythonParameterAssignment.POSITION_OR_NAME
import com.larsreimann.api_editor.mutable_model.MutablePythonAttribute
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.MutablePythonResult
import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.emf.createSmlAnnotationUse
import de.unibonn.simpleml.emf.createSmlArgument
import de.unibonn.simpleml.emf.createSmlAttribute
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
import de.unibonn.simpleml.emf.smlPackage
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.simpleML.SmlAbstractExpression
import de.unibonn.simpleml.simpleML.SmlAbstractType
import de.unibonn.simpleml.simpleML.SmlAnnotationUse
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlResult

// TODO: only for testing, remove
fun buildCompilationUnitToString(pythonModule: MutablePythonModule): String {
    val compilationUnit = pythonModule.toSmlCompilationUnit()

    // Required to serialize the compilation unit
    createSmlDummyResource(
        "compilationUnitStub",
        SmlFileExtension.Stub,
        compilationUnit
    )

    return when (val result = compilationUnit.serializeToFormattedString()) {
        is SerializationResult.Success -> result.code + "\n"
        is SerializationResult.Failure -> throw IllegalStateException(result.message)
    }
}

/**
 * Creates a Simple-ML compilation unit that corresponds to the Python module.
 */
fun MutablePythonModule.toSmlCompilationUnit(): SmlCompilationUnit {
    val classes = classes.map { it.toSmlClass() }
    val functions = functions.map { it.toSmlFunction() }

    return createSmlCompilationUnit {
        smlPackage(
            name = name,
            members = classes + functions
        )
    }
}

/**
 * Creates a Simple-ML class that corresponds to the Python class.
 */
fun MutablePythonClass.toSmlClass(): SmlClass {
    val stubName = name.snakeCaseToUpperCamelCase()

    return createSmlClass(
        name = stubName,
        annotations = buildList {
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        },
        parameters = buildConstructor(),
        members = buildAttributes() + buildMethods()
    )
}

private fun MutablePythonClass.buildConstructor(): List<SmlParameter> {
    return constructorOrNull()
        ?.parameters
        ?.mapNotNull { it.toSmlParameterOrNull() }
        .orEmpty()
}

private fun MutablePythonClass.buildAttributes(): List<SmlAttribute> {
    return attributes.map { it.toSmlAttribute() }
}

/**
 * Creates a Simple-ML attribute that corresponds to the Python attribute.
 */
fun MutablePythonAttribute.toSmlAttribute(): SmlAttribute {
    val stubName = name.snakeCaseToLowerCamelCase()

    return createSmlAttribute(
        name = stubName,
        annotations = buildList {
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        },
        type = buildType(typeInDocs)
    )
}

private fun MutablePythonClass.buildMethods(): List<SmlFunction> {
    return methodsExceptConstructor().map { it.toSmlFunction() }
}

// TODO: only for testing, remove
fun buildFunctionToString(pythonFunction: MutablePythonFunction): String {
    val function = pythonFunction.toSmlFunction()

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

fun MutablePythonFunction.toSmlFunction(): SmlFunction {
    val stubName = name.snakeCaseToLowerCamelCase()

    return createSmlFunction(
        name = stubName,
        annotations = buildList {
            if (isPure) {
                add(createSmlAnnotationUse("Pure"))
            }
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        },
        parameters = parameters.mapNotNull { it.toSmlParameterOrNull() },
        results = results.map { it.toSmlResult() }
    )
}

private fun createSmlDescriptionAnnotationUse(description: String): SmlAnnotationUse {
    return createSmlAnnotationUse(
        "Description",
        listOf(createSmlArgument(createSmlString(description)))
    )
}

private fun createSmlPythonNameAnnotationUse(name: String): SmlAnnotationUse {
    return createSmlAnnotationUse(
        "PythonName",
        listOf(createSmlArgument(createSmlString(name)))
    )
}

fun MutablePythonParameter.toSmlParameterOrNull(): SmlParameter? {
    if (assignedBy !in setOf(POSITION_ONLY, POSITION_OR_NAME, NAME_ONLY)) {
        return null
    }

    val stubName = name.snakeCaseToLowerCamelCase()

    return createSmlParameter(
        name = stubName,
        annotations = buildList {
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
        },
        type = buildType(typeInDocs),
        defaultValue = defaultValue?.let { buildDefaultValue(it) }
    )
}

fun MutablePythonResult.toSmlResult(): SmlResult {
    return createSmlResult(
        name = name,
        annotations = buildList {
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        },
        type = buildType(type)
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

fun String.snakeCaseToLowerCamelCase(): String {
    return this.snakeCaseToCamelCase().replaceFirstChar { it.lowercase() }
}

fun String.snakeCaseToUpperCamelCase(): String {
    return this.snakeCaseToCamelCase().replaceFirstChar { it.uppercase() }
}

private fun String.snakeCaseToCamelCase(): String {
    return this.replace(Regex("_(.)")) { it.groupValues[1].uppercase() }
}
