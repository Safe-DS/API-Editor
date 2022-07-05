package com.larsreimann.apiEditor.features.api.model

import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue

class ApiSlice {
    var apiStore by remember { mutableStateOf(ApiStore()) }
}
