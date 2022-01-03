package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonAttribute
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.descendants

/**
 * Processes and removes `@boundary` annotations.
 */
fun MutablePythonPackage.processBoundaryAnnotations() {
    this.descendants().forEach {
        when (it) {
            is MutablePythonAttribute -> it.processBoundaryAnnotations()
            is MutablePythonParameter -> it.processBoundaryAnnotations()
        }
    }
}

private fun MutablePythonAttribute.processBoundaryAnnotations() {
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
