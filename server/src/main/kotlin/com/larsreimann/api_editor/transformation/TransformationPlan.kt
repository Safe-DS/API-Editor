package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.convertPackage

fun processPackage(originalPythonPackage: SerializablePythonPackage): SerializablePythonPackage {
    var modifiedPythonPackage = originalPythonPackage

    // Preprocess
    modifiedPythonPackage = modifiedPythonPackage.preprocess()

    // Process annotations
    val mutablePackage = convertPackage(modifiedPythonPackage)
    mutablePackage.processAnnotations()
    modifiedPythonPackage = convertPackage(mutablePackage)

    // Postprocess
    modifiedPythonPackage = modifiedPythonPackage.postprocess()

    return modifiedPythonPackage
}

private fun SerializablePythonPackage.preprocess(): SerializablePythonPackage {
    return this.accept(Preprocessor())!!
}

private fun MutablePythonPackage.processAnnotations() {
    this.processUnusedAnnotations()
    this.processRenameAnnotations()
    this.processMoveAnnotations()
    this.processParameterAnnotations()
    this.processBoundaryAnnotations()
    this.processPureAnnotations()
}

private fun SerializablePythonPackage.postprocess(): SerializablePythonPackage {
    return this.accept(Postprocessor)!!
}
