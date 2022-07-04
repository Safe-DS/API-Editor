package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.TodoAnnotation
import com.larsreimann.apiEditor.mutableModel.PythonClass
import com.larsreimann.apiEditor.mutableModel.PythonDeclaration
import com.larsreimann.apiEditor.mutableModel.PythonFunction
import com.larsreimann.apiEditor.mutableModel.PythonPackage
import com.larsreimann.apiEditor.mutableModel.PythonParameter
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
