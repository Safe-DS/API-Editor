package com.safeds.apiEditor.transformation

import com.safeds.apiEditor.model.TodoAnnotation
import com.safeds.apiEditor.mutableModel.PythonClass
import com.safeds.apiEditor.mutableModel.PythonDeclaration
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@todo` annotations.
 */
fun PythonPackage.processTodoAnnotations() {
    this.descendants()
        .filterIsInstance<PythonDeclaration>()
        .forEach { it.processTodoAnnotations() }
}

private fun PythonDeclaration.processTodoAnnotations() {
    this.annotations
        .filterIsInstance<TodoAnnotation>()
        .forEach {
            when (this) {
                is PythonClass -> this.todo = it.message
                is PythonFunction -> this.todo = it.message
                is PythonParameter -> this.todo = it.message
                else -> {
                    // Do nothing
                }
            }
            this.annotations.remove(it)
        }
}
