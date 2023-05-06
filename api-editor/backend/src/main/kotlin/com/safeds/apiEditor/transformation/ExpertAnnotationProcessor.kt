package com.safeds.apiEditor.transformation

import com.larsreimann.modeling.descendants
import com.safeds.apiEditor.model.ExpertAnnotation
import com.safeds.apiEditor.mutableModel.PythonClass
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter

/**
 * Processes and removes `@expert` annotations.
 */
fun PythonPackage.processExpertAnnotations() {
    this.descendants()
        .forEach {
            when (it) {
                is PythonClass -> it.processExpertAnnotations()
                is PythonFunction -> it.processExpertAnnotations()
                is PythonParameter -> it.processExpertAnnotations()
            }
        }
}

private fun PythonClass.processExpertAnnotations() {
    this.annotations
        .filterIsInstance<ExpertAnnotation>()
        .forEach {
            this.isExpert = true
            this.annotations.remove(it)
        }
}

private fun PythonFunction.processExpertAnnotations() {
    this.annotations
        .filterIsInstance<ExpertAnnotation>()
        .forEach {
            this.isExpert = true
            this.annotations.remove(it)
        }
}

private fun PythonParameter.processExpertAnnotations() {
    this.annotations
        .filterIsInstance<ExpertAnnotation>()
        .forEach {
            this.isExpert = true
            this.annotations.remove(it)
        }
}
