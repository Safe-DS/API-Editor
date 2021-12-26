package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
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
fun buildClassToString(pythonClass: AnnotatedPythonClass): String {
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

fun buildClass(pythonClass: AnnotatedPythonClass): SmlClass {
    return createSmlClass(
        name = pythonClass.name,
        annotations = buildList {
            if (pythonClass.description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(pythonClass.description))
            }
        },
        parameters = buildConstructor(pythonClass),
        members = buildAttributes(pythonClass) + buildFunctions(pythonClass)
    )
}

private fun buildConstructor(pythonClass: AnnotatedPythonClass): List<SmlParameter> {
    return constructorOrNull(pythonClass)
        ?.parameters
        ?.mapNotNull { buildParameter(it) }
        .orEmpty()
}

private fun methods(pythonClass: AnnotatedPythonClass): List<AnnotatedPythonFunction> {
    return pythonClass.methods.filter { it.name != "__init__" }
}

private fun constructorOrNull(pythonClass: AnnotatedPythonClass): AnnotatedPythonFunction? {
    return pythonClass.methods.firstOrNull { it.name == "__init__" }
}

private fun buildAttributes(pythonClass: AnnotatedPythonClass): List<SmlAttribute> {
    return constructorOrNull(pythonClass)
        ?.parameters
        ?.filter { it.assignedBy != PythonParameterAssignment.CONSTANT }
        ?.map { buildAttribute(it) }
        .orEmpty()
}

fun buildAttribute(pythonParameter: AnnotatedPythonParameter): SmlAttribute {
    return createSmlAttribute(
        name = pythonParameter.name,
        annotations = buildList {
            if (pythonParameter.description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(pythonParameter.description))
            }
        },
        type = buildType(pythonParameter.typeInDocs)
    )
}

private fun buildFunctions(pythonClass: AnnotatedPythonClass): List<SmlFunction> {
    return methods(pythonClass)
        .filter { it.isPublic }
        .map { buildFunction(it) }
}
