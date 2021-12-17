package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AnnotatedPythonModule
import de.unibonn.simpleml.constant.FileExtension
import de.unibonn.simpleml.emf.createSmlCompilationUnit
import de.unibonn.simpleml.emf.createSmlDummyResource
import de.unibonn.simpleml.emf.createSmlPackage
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlPackage

/**
 * Builds a string containing the formatted module content
 *
 * @return The string containing the formatted module content
 */
// TODO: only for testing, remove
fun buildCompilationUnitToString(pythonModule: AnnotatedPythonModule): String {
    val compilationUnit = buildCompilationUnit(pythonModule)

    // Required to serialize the compilation unit
    createSmlDummyResource(
        "compilationUnitStub",
        FileExtension.STUB,
        compilationUnit
    )

    return when (val result = compilationUnit.serializeToFormattedString()) {
        is SerializationResult.Success -> result.code + "\n"
        is SerializationResult.Failure -> throw IllegalStateException(result.message)
    }
}

fun buildCompilationUnit(pythonModule: AnnotatedPythonModule): SmlCompilationUnit {
    return createSmlCompilationUnit(listOf(buildPackage(pythonModule)))
}

fun buildPackage(pythonModule: AnnotatedPythonModule): SmlPackage {
    return createSmlPackage(
        name = "simpleml.${pythonModule.name}",
        members = pythonModule.classes.map { buildClass(it) } + pythonModule.functions.map { buildFunction(it) }
    )
}
