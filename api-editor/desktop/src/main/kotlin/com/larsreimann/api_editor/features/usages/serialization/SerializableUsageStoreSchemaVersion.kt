package com.larsreimann.api_editor.features.usages.serialization

import com.larsreimann.api_editor.utils.JsonIgnoreUnknownKeys
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.decodeFromStream
import java.nio.file.Path
import kotlin.io.path.inputStream

@Serializable
private class SerializableUsageStoreSchemaVersion(val schemaVersion: Int = 1)

@OptIn(ExperimentalSerializationApi::class)
internal fun decodeSchemaVersion(path: Path): Int {
    return JsonIgnoreUnknownKeys
        .decodeFromStream<SerializableUsageStoreSchemaVersion>(path.inputStream())
        .schemaVersion
}
