package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.convertPackage

fun processPackage(originalPythonPackage: SerializablePythonPackage): SerializablePythonPackage {
    val mutablePackage = originalPythonPackage.preprocess()
    mutablePackage.processAnnotations()
    mutablePackage.postprocess()
    return convertPackage(mutablePackage)
}

private fun SerializablePythonPackage.preprocess(): MutablePythonPackage {
    val mutablePackage = convertPackage(this)
    mutablePackage.updateParameterAssignment()
    return mutablePackage
}

private fun MutablePythonPackage.processAnnotations() {
    processUnusedAnnotations()
    processRenameAnnotations()
    processMoveAnnotations()
    processParameterAnnotations()
    processBoundaryAnnotations()
    processPureAnnotations()
}

private fun MutablePythonPackage.postprocess() {
    removeEmptyModules()
    reorderParameters()
    createAttributesForParametersOfConstructor()
}
