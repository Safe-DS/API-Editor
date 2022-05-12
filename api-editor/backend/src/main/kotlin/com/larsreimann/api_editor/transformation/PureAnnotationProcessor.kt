package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PureAnnotation
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.modeling.descendants

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
