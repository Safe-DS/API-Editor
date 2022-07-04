package com.larsreimann.api_editor.features.usages.serialization

import com.larsreimann.api_editor.features.usages.UsageStore
import com.larsreimann.api_editor.utils.JsonAllowAdditionalProperties
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.decodeFromStream
import java.nio.file.Path
import kotlin.io.path.inputStream



@OptIn(ExperimentalSerializationApi::class)
fun decodeUsageStoreV2(path: Path): UsageStore {
    return JsonAllowAdditionalProperties.decodeFromStream<SerializableUsageStoreV2>(path.inputStream()).
}
