package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.PythonParameterAssignment
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
fun buildClassToString(pythonClass: SerializablePythonClass): String {
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

fun buildClass(pythonClass: SerializablePythonClass): SmlClass {
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

private fun buildConstructor(pythonClass: SerializablePythonClass): List<SmlParameter> {
    return pythonClass.constructorOrNull()
        ?.parameters
        ?.mapNotNull { buildParameter(it) }
        .orEmpty()
}

private fun buildAttributes(pythonClass: SerializablePythonClass): List<SmlAttribute> {
    return pythonClass.constructorOrNull()
        ?.parameters
        ?.filter { it.assignedBy != PythonParameterAssignment.CONSTANT }
        ?.map { buildAttribute(it) }
        .orEmpty()
}

fun buildAttribute(pythonParameter: SerializablePythonParameter): SmlAttribute {
    val stubName = pythonParameter.name.snakeCaseToLowerCamelCase()

    return createSmlAttribute(
        name = stubName,
        annotations = buildList {
            if (pythonParameter.description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(pythonParameter.description))
            }
            if (pythonParameter.name != stubName) {
                add(createSmlPythonNameAnnotationUse(pythonParameter.name))
            }
        },
        type = buildType(pythonParameter.typeInDocs)
    )
}

private fun buildFunctions(pythonClass: SerializablePythonClass): List<SmlFunction> {
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
