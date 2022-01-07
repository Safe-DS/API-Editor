package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.RenameAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonDeclaration
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.descendants

/**
 * Processes and removes `@rename` annotations.
 */
fun MutablePythonPackage.processRenameAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonDeclaration>()
        .forEach { it.processRenameAnnotations() }
}

private fun MutablePythonDeclaration.processRenameAnnotations() {
    this.annotations
        .filterIsInstance<RenameAnnotation>()
        .forEach {
            this.name = it.newName
            this.annotations.remove(it)
        }
}
