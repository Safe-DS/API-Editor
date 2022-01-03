package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.mutable_model.convertPackage

fun processPackage(originalPythonPackage: SerializablePythonPackage): SerializablePythonPackage {
    var modifiedPythonPackage = originalPythonPackage

    // Add attributes to classes
    modifiedPythonPackage = modifiedPythonPackage.accept(AttributesInitializer())!!

    // Create original declarations
    modifiedPythonPackage.accept(OriginalDeclarationProcessor)

    // Apply annotations (don't change the order)
    modifiedPythonPackage = modifiedPythonPackage.accept(UnusedAnnotationProcessor())!!

    modifiedPythonPackage = modifiedPythonPackage.accept(RenameAnnotationProcessor())!!

    val moveAnnotationProcessor = MoveAnnotationProcessor()
    modifiedPythonPackage.accept(moveAnnotationProcessor)
    modifiedPythonPackage = moveAnnotationProcessor.modifiedPackage!!

    modifiedPythonPackage = modifiedPythonPackage.accept(ParameterAnnotationProcessor())!!

    val mutablePackage = convertPackage(modifiedPythonPackage)
    mutablePackage.processBoundaryAnnotations()

    mutablePackage.processPureAnnotations()
    modifiedPythonPackage = convertPackage(mutablePackage)

    // Cleanup
    val cleanupModulesProcessor = CleanupModulesProcessor()
    modifiedPythonPackage.accept(cleanupModulesProcessor)
    modifiedPythonPackage = cleanupModulesProcessor.modifiedPackage

    return modifiedPythonPackage
}
