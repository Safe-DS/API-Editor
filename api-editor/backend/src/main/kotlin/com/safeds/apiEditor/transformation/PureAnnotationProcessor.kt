package com.safeds.apiEditor.transformation

import com.larsreimann.modeling.descendants
import com.safeds.apiEditor.model.PureAnnotation
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonPackage

/**
 * Processes and removes `@pure` annotations.
 */
fun PythonPackage.processPureAnnotations() {
    this.descendants()
        .filterIsInstance<PythonFunction>()
        .forEach { it.processPureAnnotations() }
}

private fun PythonFunction.processPureAnnotations() {
    this.annotations
        .filterIsInstance<PureAnnotation>()
        .forEach {
            this.isPure = true
            this.annotations.remove(it)
        }
}
