package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.Boundary
import com.larsreimann.apiEditor.model.BoundaryAnnotation
import com.larsreimann.apiEditor.mutableModel.PythonPackage
import com.larsreimann.apiEditor.mutableModel.PythonParameter
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@boundary` annotations.
 */
fun PythonPackage.processBoundaryAnnotations() {
    this.descendants()
        .filterIsInstance<PythonParameter>()
        .forEach { it.processBoundaryAnnotations() }
}

private fun PythonParameter.processBoundaryAnnotations() {
    this.annotations
        .filterIsInstance<BoundaryAnnotation>()
        .forEach {
            this.boundary = Boundary(
                it.isDiscrete,
                it.lowerIntervalLimit,
                it.lowerLimitType,
                it.upperIntervalLimit,
                it.upperLimitType,
            )
            this.annotations.remove(it)
        }
}
