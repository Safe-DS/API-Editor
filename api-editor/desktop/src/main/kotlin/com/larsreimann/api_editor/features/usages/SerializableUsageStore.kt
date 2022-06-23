
package com.larsreimann.api_editor.features.usages

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
class SerializableUsageStore(
    @SerialName("class_counts") val classCounts: Map<String, Int>,
    @SerialName("function_counts") val functionCounts: Map<String, Int>,
    @SerialName("parameter_counts") val parameterCounts: Map<String, Int>,
    @SerialName("value_counts") val valueCounts: Map<String, Map<String, Int>>,
)
