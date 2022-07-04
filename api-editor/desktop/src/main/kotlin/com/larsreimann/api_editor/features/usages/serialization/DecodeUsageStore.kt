package com.larsreimann.api_editor.features.usages.serialization

import com.larsreimann.api_editor.features.usages.UsageStore
import com.larsreimann.api_editor.utils.JsonIgnoreUnknownKeys
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.json.decodeFromStream
import java.nio.file.Path
import kotlin.io.path.inputStream


@OptIn(ExperimentalSerializationApi::class)
fun decodeUsageStore(path: Path): UsageStore {
    val schemaVersion = decodeSchemaVersion(path)

    when (schemaVersion) {
        1 -> JsonIgnoreUnknownKeys.decodeFromStream<SerializableUsageStoreV1>(path.inputStream())
        2 -> JsonIgnoreUnknownKeys.decodeFromStream<SerializableUsageStoreV2>(path.inputStream())
        else -> throw IllegalArgumentException("Unknown schema version $schemaVersion")
    }

    println(schemaVersion)

    return UsageStore() // TODO
}
