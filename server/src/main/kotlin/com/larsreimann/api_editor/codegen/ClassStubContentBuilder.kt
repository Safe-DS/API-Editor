package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.mutable_model.MutablePythonAttribute
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.emf.createSmlAttribute
import de.unibonn.simpleml.emf.createSmlClass
import de.unibonn.simpleml.emf.createSmlCompilationUnit
import de.unibonn.simpleml.emf.createSmlDummyResource
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlParameter

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
