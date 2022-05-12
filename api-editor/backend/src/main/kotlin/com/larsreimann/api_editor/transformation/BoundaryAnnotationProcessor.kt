package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
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
                it.upperLimitType
            )
            this.annotations.remove(it)
        }
}
