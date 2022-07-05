package com.larsreimann.apiEditor.features.usages.model

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

class UsageSlice {
    var usageStore by mutableStateOf(UsageStore())
}
