package com.larsreimann.api_editor.features.usages.serialization

import kotlinx.serialization.Serializable

@Serializable
internal class SerializableUsageStoreV2(
    val moduleCounts: Map<String, Int> = emptyMap(),
    val classCounts: Map<String, Int> = emptyMap(),
    val functionCounts: Map<String, Int> = emptyMap(),
    val parameterCounts: Map<String, Int> = emptyMap(),
    val valueCounts: Map<String, Map<String, Int>> = emptyMap(),
) {
    val schemaVersion = 2
}
