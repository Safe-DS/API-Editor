package com.safeds.apiEditor.transformation

import com.safeds.apiEditor.model.MoveAnnotation
import com.safeds.apiEditor.mutableModel.PythonClass
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonModule
import com.safeds.apiEditor.mutableModel.PythonPackage

/**
 * Processes and removes `@move` annotations.
 */
fun PythonPackage.processMoveAnnotations() {
    this.modules
        .flatMap { it.classes }
        .forEach { it.processMoveAnnotations(this) }

    this.modules
        .flatMap { it.functions }
        .forEach { it.processMoveAnnotations(this) }
}

private fun PythonClass.processMoveAnnotations(`package`: PythonPackage) {
    this.annotations
        .filterIsInstance<MoveAnnotation>()
        .forEach {
            when (val moduleOrNull = `package`.moduleByNameOrNull(it.destination)) {
                null -> `package`.modules += PythonModule(name = it.destination, classes = listOf(this))
                else -> moduleOrNull.classes += this
            }
            this.annotations.remove(it)
        }
}

private fun PythonFunction.processMoveAnnotations(`package`: PythonPackage) {
    this.annotations
        .filterIsInstance<MoveAnnotation>()
        .forEach {
            when (val moduleOrNull = `package`.moduleByNameOrNull(it.destination)) {
                null -> `package`.modules += PythonModule(name = it.destination, functions = listOf(this))
                else -> moduleOrNull.functions += this
            }
            this.annotations.remove(it)
        }
}

private fun PythonPackage.moduleByNameOrNull(name: String): PythonModule? {
    return this.modules.firstOrNull { it.name == name }
}
