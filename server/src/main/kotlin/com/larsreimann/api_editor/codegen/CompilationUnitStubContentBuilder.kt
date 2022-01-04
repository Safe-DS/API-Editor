package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import de.unibonn.simpleml.constant.SmlFileExtension
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
