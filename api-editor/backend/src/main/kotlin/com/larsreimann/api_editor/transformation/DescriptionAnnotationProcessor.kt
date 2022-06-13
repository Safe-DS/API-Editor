package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.DescriptionAnnotation
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonDeclaration
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@description` annotations.
 */
fun PythonPackage.processDescriptionAnnotations() {
    this.descendants()
        .filterIsInstance<PythonDeclaration>()
        .forEach { it.processDescriptionAnnotations() }
}

private fun PythonDeclaration.processDescriptionAnnotations() {
    this.annotations
        .filterIsInstance<DescriptionAnnotation>()
        .forEach {
            when (this) {
                is PythonClass -> this.description = it.newDescription
                is PythonFunction -> this.description = it.newDescription
                is PythonParameter -> this.description = it.newDescription
                else -> {
                    // Do nothing
                }
            }
            this.annotations.remove(it)
        }
}
