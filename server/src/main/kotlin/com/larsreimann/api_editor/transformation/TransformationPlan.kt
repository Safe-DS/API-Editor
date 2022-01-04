package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.mutable_model.convertPackage

fun processPackage(originalPythonPackage: SerializablePythonPackage): SerializablePythonPackage {
    var modifiedPythonPackage = originalPythonPackage

    // Create original declarations
    modifiedPythonPackage = modifiedPythonPackage.accept(Preprocessor())!!

    // Apply annotations (don't change the order)
    val mutablePackage = convertPackage(modifiedPythonPackage)
    mutablePackage.processUnusedAnnotations()
    mutablePackage.processRenameAnnotations()
    mutablePackage.processMoveAnnotations()
    mutablePackage.processParameterAnnotations()
    mutablePackage.processBoundaryAnnotations()
    mutablePackage.processPureAnnotations()
    modifiedPythonPackage = convertPackage(mutablePackage)

    // Cleanup
    modifiedPythonPackage = modifiedPythonPackage.accept(Postprocessor)!!

    return modifiedPythonPackage
}
