package com.larsreimann.apiEditor.features.annotations.serialization

import com.larsreimann.apiEditor.features.annotations.model.AnnotationSlice
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
sealed class SerializableAnnotationStore {
    abstract fun toAnnotationStore(): AnnotationSlice
}

@Serializable
@SerialName("v3")
class SerializableAnnotationStoreV3 : SerializableAnnotationStore() {
    override fun toAnnotationStore(): AnnotationSlice {
        // TODO
        return AnnotationSlice()
    }
}
