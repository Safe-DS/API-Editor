package com.larsreimann.apiEditor.app.model

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import com.larsreimann.apiEditor.features.project.model.ProjectSlice
import com.larsreimann.apiEditor.features.settings.model.SettingsSlice

class AppSlice {
    val projectSlice by remember { mutableStateOf(ProjectSlice()) }
    val settingsSlice by remember { mutableStateOf(SettingsSlice()) }
}
