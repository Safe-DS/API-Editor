package com.larsreimann.api_editor.features.usages.serialization

import com.larsreimann.api_editor.utils.JsonIgnoreUnknownKeys
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.decodeFromStream
import java.nio.file.Path
import kotlin.io.path.inputStream

@Serializable
internal class SerializableUsageStoreV1(
    @SerialName("class_counts") val classCounts: Map<String, Int> = emptyMap(),
    @SerialName("function_counts") val functionCounts: Map<String, Int> = emptyMap(),
    @SerialName("parameter_counts") val parameterCounts: Map<String, Int> = emptyMap(),
    @SerialName("value_counts") val valueCounts: Map<String, Map<String, Int>> = emptyMap(),
) {
    val schemaVersion = 1
}

@OptIn(ExperimentalSerializationApi::class)
internal fun decodeUsageStoreV1(path: Path): SerializableUsageStoreV1 {
    return JsonIgnoreUnknownKeys
        .decodeFromStream<SerializableUsageStoreV1>(path.inputStream())
}
