package com.larsreimann.apiEditor.features.usages.model

import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue

class UsageSlice {
    var usageStore by remember { mutableStateOf(UsageStore()) }
}
