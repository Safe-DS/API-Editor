package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.RenameAnnotation
import com.larsreimann.api_editor.mutable_model.PythonDeclaration
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@rename` annotations.
 */
fun PythonPackage.processRenameAnnotations() {
    this.descendants()
        .filterIsInstance<PythonDeclaration>()
        .forEach { it.processRenameAnnotations() }
}

private fun PythonDeclaration.processRenameAnnotations() {
    this.annotations
        .filterIsInstance<RenameAnnotation>()
        .forEach {
            this.name = it.newName
            this.annotations.remove(it)
        }
}
