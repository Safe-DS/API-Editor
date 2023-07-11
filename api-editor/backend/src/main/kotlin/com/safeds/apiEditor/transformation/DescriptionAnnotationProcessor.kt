package com.safeds.apiEditor.transformation

import com.larsreimann.modeling.descendants
import com.safeds.apiEditor.model.DescriptionAnnotation
import com.safeds.apiEditor.mutableModel.PythonClass
import com.safeds.apiEditor.mutableModel.PythonDeclaration
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter

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
