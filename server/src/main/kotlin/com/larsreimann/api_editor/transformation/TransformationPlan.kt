package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.convertPackage

fun processPackage(originalPythonPackage: SerializablePythonPackage): SerializablePythonPackage {
    var modifiedPythonPackage = originalPythonPackage

    modifiedPythonPackage = modifiedPythonPackage.preprocess()

    val mutablePackage = convertPackage(modifiedPythonPackage)
    mutablePackage.processAnnotations()
    mutablePackage.postprocess()

    modifiedPythonPackage = convertPackage(mutablePackage)
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

private fun MutablePythonPackage.postprocess() {
    this.removeEmptyModules()
    this.reorderParameters()
    this.createAttributesForParametersOfConstructor()
}
