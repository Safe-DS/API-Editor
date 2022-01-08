package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.mutable_model.MutablePythonPackage

/**
 * Processes all annotations and updates the AST to create adapters.
 */
fun MutablePythonPackage.transform() {
    preprocess()
    processAnnotations()
    postprocess()
}

/**
 * Transformation steps that have to be run before annotations can be processed.
 */
private fun MutablePythonPackage.preprocess() {
    removePrivateDeclarations()
    addOriginalDeclarations()
    changeModulePrefix(newPrefix = "simpleml")
    replaceClassMethodsWithStaticMethods()
    updateParameterAssignment()
    normalizeNamesOfImplicitParameters()
}

/**
 * Processes all annotations.
 */
private fun MutablePythonPackage.processAnnotations() {
    processUnusedAnnotations()
    processRenameAnnotations()
    processMoveAnnotations()
    processParameterAnnotations()
    processBoundaryAnnotations()
    processPureAnnotations()
    processEnumAnnotations()
}

/**
 * Transformation steps that have to be run after annotations were processed.
 */
private fun MutablePythonPackage.postprocess() {
    removeEmptyModules()
    reorderParameters()
    createConstructors()
    createAttributesForParametersOfConstructor()
}
