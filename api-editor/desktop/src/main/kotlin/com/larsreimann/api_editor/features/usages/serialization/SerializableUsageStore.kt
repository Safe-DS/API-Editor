package com.larsreimann.api_editor.features.usages.serialization

import com.larsreimann.api_editor.features.usages.UsageStore
import kotlinx.serialization.Serializable

sealed interface SerializableUsageStore {
    val schemaVersion: Int

    fun toUsageStore(): UsageStore
}

@Serializable
class SerializableUsageStoreV2(
    override val schemaVersion: Int = 2,
    private val moduleCounts: Map<String, Int> = emptyMap(),
    private val classCounts: Map<String, Int> = emptyMap(),
    private val functionCounts: Map<String, Int> = emptyMap(),
    private val parameterCounts: Map<String, Int> = emptyMap(),
    private val valueCounts: Map<String, Map<String, Int>> = emptyMap(),
) : SerializableUsageStore {
    override fun toUsageStore(): UsageStore {
        return UsageStore(
            moduleCounts,
            classCounts,
            functionCounts,
            parameterCounts,
            valueCounts,
        )
    }
}
