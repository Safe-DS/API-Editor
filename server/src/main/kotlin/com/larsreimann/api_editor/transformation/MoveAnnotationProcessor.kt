package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.MoveAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage

/**
 * Processes and removes `@move` annotations.
 */
fun MutablePythonPackage.processMoveAnnotations() {
    this.modules
        .flatMap { it.classes }
        .forEach { it.processMoveAnnotations(this) }

    this.modules
        .flatMap { it.functions }
        .forEach { it.processMoveAnnotations(this) }
}

private fun MutablePythonClass.processMoveAnnotations(`package`: MutablePythonPackage) {
    this.annotations
        .filterIsInstance<MoveAnnotation>()
        .forEach {
            when (val moduleOrNull = `package`.moduleByNameOrNull(it.destination)) {
                null -> `package`.modules += MutablePythonModule(name = it.destination, classes = listOf(this))
                else -> moduleOrNull.classes += this
            }
            this.annotations.remove(it)
        }
}

private fun MutablePythonFunction.processMoveAnnotations(`package`: MutablePythonPackage) {
    this.annotations
        .filterIsInstance<MoveAnnotation>()
        .forEach {
            when (val moduleOrNull = `package`.moduleByNameOrNull(it.destination)) {
                null -> `package`.modules += MutablePythonModule(name = it.destination, functions = listOf(this))
                else -> moduleOrNull.functions += this
            }
            this.annotations.remove(it)
        }
}

private fun MutablePythonPackage.moduleByNameOrNull(name: String): MutablePythonModule? {
    return this.modules.firstOrNull { it.name == name }
}
