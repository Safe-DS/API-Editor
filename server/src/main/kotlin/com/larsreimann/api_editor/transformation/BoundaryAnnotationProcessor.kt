package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@boundary` annotations.
 */
fun MutablePythonPackage.processBoundaryAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonParameter>()
        .forEach { it.processBoundaryAnnotations() }
}

private fun MutablePythonParameter.processBoundaryAnnotations() {
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
