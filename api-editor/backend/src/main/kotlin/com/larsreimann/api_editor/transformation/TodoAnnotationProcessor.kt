package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.TodoAnnotation
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonDeclaration
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
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
                is PythonClass -> this.todo = it.todo
                is PythonFunction -> this.todo = it.todo
                is PythonParameter -> this.todo = it.todo
                else -> {
                    // Do nothing
                }
            }
            this.annotations.remove(it)
        }
}
