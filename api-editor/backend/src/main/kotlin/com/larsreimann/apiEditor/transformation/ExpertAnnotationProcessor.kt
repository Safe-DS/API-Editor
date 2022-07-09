package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.ExpertAnnotation
import com.larsreimann.apiEditor.mutableModel.PythonClass
import com.larsreimann.apiEditor.mutableModel.PythonFunction
import com.larsreimann.apiEditor.mutableModel.PythonPackage
import com.larsreimann.apiEditor.mutableModel.PythonParameter
import com.larsreimann.modeling.descendants

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
