package com.larsreimann.apiEditor.app.model

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import com.larsreimann.apiEditor.features.project.model.ProjectSlice
import com.larsreimann.apiEditor.features.settings.model.SettingsSlice

class AppSlice {
    val projectSlice by mutableStateOf(ProjectSlice())
    val settingsSlice by mutableStateOf(SettingsSlice())
}
