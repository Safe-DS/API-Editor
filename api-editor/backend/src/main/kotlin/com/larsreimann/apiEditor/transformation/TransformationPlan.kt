package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.mutable_model.PythonPackage

/**
 * Processes all annotations and updates the AST to create adapters.
 */
fun PythonPackage.transform(newPackageName: String = "new_package") {
    preprocess(newPackageName)
    processAnnotations()
    postprocess()
}

/**
 * Transformation steps that have to be run before annotations can be processed.
 */
private fun PythonPackage.preprocess(newPackageName: String) {
    removePrivateDeclarations()
    addOriginalDeclarations()
    changeModulePrefix(newPackageName)
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
    extractConstructors()
    createAttributesForParametersOfConstructor()
}
