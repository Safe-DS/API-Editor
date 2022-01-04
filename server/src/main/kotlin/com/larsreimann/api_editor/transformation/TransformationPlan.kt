package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.convertPackage

fun SerializablePythonPackage.transform(): MutablePythonPackage {
    val mutablePackage = convertPackage(this)
    mutablePackage.preprocess()
    mutablePackage.processAnnotations()
    mutablePackage.postprocess()
    return mutablePackage
}

private fun MutablePythonPackage.preprocess() {
    addOriginalDeclarations()
    updateParameterAssignment()
    changeModulePrefix(newPrefix = "simpleml")
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
