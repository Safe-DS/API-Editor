package com.larsreimann.python_api_editor.data

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

class Settings {
    var heatmapMode by mutableStateOf(HeatmapMode.None)
}

enum class HeatmapMode {
    None,
    Usages,
    Annotations
}
