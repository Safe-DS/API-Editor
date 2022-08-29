package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.mutableModel.PythonPackage

/**
 * Processes all annotations and updates the AST to create adapters.
 */
fun PythonPackage.transform(newPackageName: String = "new_package") {
    preprocess()
    processAnnotations()
    postprocess(newPackageName)
}

/**
 * Transformation steps that have to be run before annotations can be processed.
 */
private fun PythonPackage.preprocess() {
    removePrivateDeclarations()
    addOriginalDeclarations()
    replaceClassMethodsWithStaticMethods()
    updateParameterAssignment()
    normalizeNamesOfImplicitParameters()
}

/**
 * Processes all annotations.
 */
private fun PythonPackage.processAnnotations() {
    processRemoveAnnotations()
    processDescriptionAnnotations()
    processTodoAnnotations()
    processRenameAnnotations()
    processMoveAnnotations()
    processBoundaryAnnotations()
    processValueAnnotations()
    processExpertAnnotations()
    processPureAnnotations()
    processEnumAnnotations()
    processGroupAnnotations()
}

/**
 * Transformation steps that have to be run after annotations were processed.
 */
private fun PythonPackage.postprocess(newPackageName: String) {
    removeEmptyModules()
    changeModulePrefix(newPackageName)
    reorderParameters()
    extractConstructors()
    createAttributesForParametersOfConstructor()
}
