package com.larsreimann.apiEditor.features.annotations.model

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember

class AnnotationList {
    private val annotations = remember { mutableStateListOf<Annotation>() }

    fun addAnnotation(annotation: Annotation) {
        annotations.add(annotation)
    }

    fun replaceAnnotation(oldAnnotation: Annotation, newAnnotation: Annotation) {
        annotations.remove(oldAnnotation)
        annotations.add(newAnnotation)
    }

    fun removeAnnotation(annotation: Annotation) {
        annotations.remove(annotation)
    }
}
