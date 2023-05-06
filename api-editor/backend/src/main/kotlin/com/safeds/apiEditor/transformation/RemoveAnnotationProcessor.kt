package com.safeds.apiEditor.transformation

import com.safeds.apiEditor.model.RemoveAnnotation
import com.safeds.apiEditor.mutableModel.PythonDeclaration
import com.safeds.apiEditor.mutableModel.PythonPackage
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
