package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.mutable_model.convertPackage

fun processPackage(originalPythonPackage: SerializablePythonPackage): SerializablePythonPackage {
    var modifiedPythonPackage = originalPythonPackage

    // Add attributes to classes
    modifiedPythonPackage = modifiedPythonPackage.accept(AttributesInitializer())!!

    // Create original declarations
    modifiedPythonPackage.accept(Preprocessor())

    // Apply annotations (don't change the order)
    modifiedPythonPackage = modifiedPythonPackage.accept(UnusedAnnotationProcessor())!!

    val mutablePackage = convertPackage(modifiedPythonPackage)
    mutablePackage.processRenameAnnotations()
    mutablePackage.processMoveAnnotations()
    mutablePackage.processParameterAnnotations()
    mutablePackage.processBoundaryAnnotations()
    mutablePackage.processPureAnnotations()
    modifiedPythonPackage = convertPackage(mutablePackage)

    // Cleanup
    val cleanupModulesProcessor = CleanupModulesProcessor()
    modifiedPythonPackage.accept(cleanupModulesProcessor)
    modifiedPythonPackage = cleanupModulesProcessor.modifiedPackage

    modifiedPythonPackage = modifiedPythonPackage.accept(Postprocessor)!!

    return modifiedPythonPackage
}
