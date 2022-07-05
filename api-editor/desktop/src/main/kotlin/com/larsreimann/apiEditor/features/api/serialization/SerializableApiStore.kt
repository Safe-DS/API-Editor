package com.larsreimann.apiEditor.features.api.serialization

import com.larsreimann.apiEditor.features.api.model.ApiStore
import kotlinx.serialization.Serializable

@Serializable
sealed class SerializableApiStore {
    abstract fun toApiStore(): ApiStore
}
