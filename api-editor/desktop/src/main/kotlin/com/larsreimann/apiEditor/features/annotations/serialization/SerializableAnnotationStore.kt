package com.larsreimann.apiEditor.features.annotations.serialization

import com.larsreimann.apiEditor.features.annotations.model.AnnotationSlice
import kotlinx.serialization.Serializable

@Serializable
sealed class SerializableAnnotationStore {
    abstract fun toAnnotationStore(): AnnotationSlice
}
