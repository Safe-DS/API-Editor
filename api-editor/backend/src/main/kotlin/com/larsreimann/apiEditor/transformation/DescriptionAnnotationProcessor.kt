package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.DescriptionAnnotation
import com.larsreimann.apiEditor.mutableModel.PythonClass
import com.larsreimann.apiEditor.mutableModel.PythonDeclaration
import com.larsreimann.apiEditor.mutableModel.PythonFunction
import com.larsreimann.apiEditor.mutableModel.PythonPackage
import com.larsreimann.apiEditor.mutableModel.PythonParameter
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
