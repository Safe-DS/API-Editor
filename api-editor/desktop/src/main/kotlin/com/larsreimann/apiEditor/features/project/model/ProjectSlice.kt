package com.larsreimann.apiEditor.features.project.model

import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import com.larsreimann.apiEditor.features.annotations.model.AnnotationSlice
import com.larsreimann.apiEditor.features.api.model.ApiSlice
import com.larsreimann.apiEditor.features.usages.model.UsageSlice

class ProjectSlice {
    val annotationSlice by remember { mutableStateOf(AnnotationSlice()) }
    val apiSlice by remember { mutableStateOf(ApiSlice()) }
    val usageSlice by remember { mutableStateOf(UsageSlice()) }
}
