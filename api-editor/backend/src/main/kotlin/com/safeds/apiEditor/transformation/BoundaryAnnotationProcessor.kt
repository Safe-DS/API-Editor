package com.safeds.apiEditor.transformation

import com.larsreimann.modeling.descendants
import com.safeds.apiEditor.model.Boundary
import com.safeds.apiEditor.model.BoundaryAnnotation
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter

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
