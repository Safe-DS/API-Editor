package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.UnusedAnnotation
import com.larsreimann.api_editor.mutable_model.PythonDeclaration
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@unused` annotations.
 */
fun PythonPackage.processUnusedAnnotations() {
    this.descendants()
        .filterIsInstance<PythonDeclaration>()
        .toList()
        .forEach { it.processUnusedAnnotations() }
}

private fun PythonDeclaration.processUnusedAnnotations() {
    if (UnusedAnnotation in this.annotations) {
        this.release()
    }
}
