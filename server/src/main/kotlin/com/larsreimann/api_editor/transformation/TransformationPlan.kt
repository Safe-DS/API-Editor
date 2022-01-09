package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.mutable_model.PythonPackage

/**
 * Processes all annotations and updates the AST to create adapters.
 */
fun PythonPackage.transform() {
    preprocess()
    processAnnotations()
    postprocess()
}

/**
 * Transformation steps that have to be run before annotations can be processed.
 */
private fun PythonPackage.preprocess() {
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
private fun PythonPackage.processAnnotations() {
    processUnusedAnnotations()
    processRenameAnnotations()
    processMoveAnnotations()
    processBoundaryAnnotations()
    processParameterAnnotations()
    processPureAnnotations()
    processEnumAnnotations()
    processGroupAnnotations()
}

/**
 * Transformation steps that have to be run after annotations were processed.
 */
private fun PythonPackage.postprocess() {
    removeEmptyModules()
    reorderParameters()
    createConstructors()
    createAttributesForParametersOfConstructor()
}
