package com.larsreimann.apiEditor.features.settings.model

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

class SettingsSlice {
    var heatmapMode by mutableStateOf(HeatmapMode.None)
    var darkMode by mutableStateOf(false)
}

enum class HeatmapMode {
    None,
    Usages,
    Annotations
}
