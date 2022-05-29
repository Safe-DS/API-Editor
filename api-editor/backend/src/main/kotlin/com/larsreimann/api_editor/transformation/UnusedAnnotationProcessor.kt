package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.RemoveAnnotation
import com.larsreimann.api_editor.mutable_model.PythonDeclaration
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@remove` annotations.
 */
fun PythonPackage.processRemoveAnnotations() {
    this.descendants()
        .filterIsInstance<PythonDeclaration>()
        .toList()
        .forEach { it.processRemoveAnnotations() }
}

private fun PythonDeclaration.processRemoveAnnotations() {
    if (RemoveAnnotation in this.annotations) {
        this.release()
    }
}
