package com.larsreimann.api_editor.utils

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import java.nio.file.Path
import kotlin.io.path.inputStream

/**
 * A JSON decoder that allows additional properties.
 */
val JsonAllowAdditionalProperties = Json { ignoreUnknownKeys = true }

/**
 * @return The value of the `schemaVersion` property of the JSON file at the given [path].
 */
@OptIn(ExperimentalSerializationApi::class)
fun decodeSchemaVersion(path: Path): Int {

    @Serializable
    class SerializableSchemaVersion(val schemaVersion: Int = 1)

    return JsonAllowAdditionalProperties
        .decodeFromStream<SerializableSchemaVersion>(path.inputStream())
        .schemaVersion
}
