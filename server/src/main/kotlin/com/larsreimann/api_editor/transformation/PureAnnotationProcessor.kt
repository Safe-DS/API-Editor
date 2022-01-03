package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PureAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.descendants

/**
 * Processes and removes `@pure` annotations.
 */
fun MutablePythonPackage.processPureAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonFunction>()
        .forEach { it.processPureAnnotations() }
}

private fun MutablePythonFunction.processPureAnnotations() {
    this.annotations
        .filterIsInstance<PureAnnotation>()
        .forEach {
            this.isPure = true
            this.annotations.remove(it)
        }
}
