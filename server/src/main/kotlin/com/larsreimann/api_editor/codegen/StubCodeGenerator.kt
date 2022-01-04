package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.PythonParameterAssignment
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
import de.unibonn.simpleml.emf.createSmlPackage
import de.unibonn.simpleml.emf.createSmlParameter
import de.unibonn.simpleml.emf.createSmlResult
import de.unibonn.simpleml.emf.createSmlString
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.simpleML.SmlAbstractExpression
import de.unibonn.simpleml.simpleML.SmlAbstractType
import de.unibonn.simpleml.simpleML.SmlAnnotationUse
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlPackage
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlResult

/**
 * Builds a string containing the formatted module content
 *
 * @return The string containing the formatted module content
 */
// TODO: only for testing, remove
fun buildCompilationUnitToString(pythonModule: MutablePythonModule): String {
    val compilationUnit = buildCompilationUnit(pythonModule)

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

fun buildCompilationUnit(pythonModule: MutablePythonModule): SmlCompilationUnit {
    return createSmlCompilationUnit(listOf(buildPackage(pythonModule)))
}

fun buildPackage(pythonModule: MutablePythonModule): SmlPackage {
    val publicClasses = pythonModule.classes
        .filter { it.isPublic }
        .map { buildClass(it) }

    val publicFunctions = pythonModule.functions
        .filter { it.isPublic }
        .map { buildFunction(it) }

    return createSmlPackage(
        name = "simpleml.${pythonModule.name}",
        members = publicClasses + publicFunctions
    )
}

/**
 * Builds a string containing the formatted class content
 *
 * @return The string containing the formatted class content
 */
// TODO: only for testing, remove
fun buildClassToString(pythonClass: MutablePythonClass): String {
    val `class` = buildClass(pythonClass)

    // Required to serialize the class
    createSmlDummyResource(
        "classStub",
        SmlFileExtension.Stub,
        createSmlCompilationUnit(listOf(`class`))
    )

    return when (val result = `class`.serializeToFormattedString()) {
        is SerializationResult.Success -> result.code
        is SerializationResult.Failure -> throw IllegalStateException(result.message)
    }
}

fun buildClass(pythonClass: MutablePythonClass): SmlClass {
    val stubName = pythonClass.name.snakeCaseToUpperCamelCase()

    return createSmlClass(
        name = stubName,
        annotations = buildList {
            if (pythonClass.description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(pythonClass.description))
            }
            if (pythonClass.name != stubName) {
                add(createSmlPythonNameAnnotationUse(pythonClass.name))
            }
        },
        parameters = buildConstructor(pythonClass),
        members = buildAttributes(pythonClass) + buildFunctions(pythonClass)
    )
}

private fun buildConstructor(pythonClass: MutablePythonClass): List<SmlParameter> {
    return pythonClass.constructorOrNull()
        ?.parameters
        ?.mapNotNull { buildParameter(it) }
        .orEmpty()
}

private fun buildAttributes(pythonClass: MutablePythonClass): List<SmlAttribute> {
    return pythonClass.attributes.map { buildAttribute(it) }
}

fun buildAttribute(pythonAttribute: MutablePythonAttribute): SmlAttribute {
    val stubName = pythonAttribute.name.snakeCaseToLowerCamelCase()

    return createSmlAttribute(
        name = stubName,
        annotations = buildList {
            if (pythonAttribute.description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(pythonAttribute.description))
            }
            if (pythonAttribute.name != stubName) {
                add(createSmlPythonNameAnnotationUse(pythonAttribute.name))
            }
        },
        type = buildType(pythonAttribute.typeInDocs)
    )
}

private fun buildFunctions(pythonClass: MutablePythonClass): List<SmlFunction> {
    return pythonClass.methodsExceptConstructor()
        .filter { it.isPublic }
        .map { buildFunction(it) }
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

/**
 * Builds a string containing the formatted function content
 *
 * @return The string containing the formatted function content
 */
// TODO: only for testing, remove
fun buildFunctionToString(pythonFunction: MutablePythonFunction): String {
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

fun buildFunction(pythonFunction: MutablePythonFunction): SmlFunction {
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

fun buildParameter(pythonParameter: MutablePythonParameter): SmlParameter? {
    if (pythonParameter.assignedBy !in setOf(
            PythonParameterAssignment.POSITION_ONLY,
            PythonParameterAssignment.POSITION_OR_NAME,
            PythonParameterAssignment.NAME_ONLY
        )) {
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

fun buildResult(pythonResult: MutablePythonResult): SmlResult {
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
