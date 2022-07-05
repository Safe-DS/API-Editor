package com.larsreimann.apiEditor.features.api.serialization

import com.larsreimann.apiEditor.features.api.model.ApiStore
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
sealed class SerializableApiStore {
    abstract fun toApiStore(): ApiStore
}

@Serializable
@SerialName("v2")
class SerializableApiStoreV2 : SerializableApiStore() {
    override fun toApiStore(): ApiStore {
        // TODO
        return ApiStore()
    }
}
