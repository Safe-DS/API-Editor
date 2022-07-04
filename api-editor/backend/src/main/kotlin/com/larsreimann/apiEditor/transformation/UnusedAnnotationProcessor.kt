package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.RemoveAnnotation
import com.larsreimann.apiEditor.mutableModel.PythonDeclaration
import com.larsreimann.apiEditor.mutableModel.PythonPackage
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
