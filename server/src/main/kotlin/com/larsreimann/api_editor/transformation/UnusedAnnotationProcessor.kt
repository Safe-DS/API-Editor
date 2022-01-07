package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.UnusedAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonDeclaration
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.descendants

/**
 * Processes and removes `@unused` annotations.
 */
fun MutablePythonPackage.processUnusedAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonDeclaration>()
        .toList()
        .forEach { it.processUnusedAnnotations() }
}

private fun MutablePythonDeclaration.processUnusedAnnotations() {
    if (UnusedAnnotation in this.annotations) {
        this.release()
    }
}
