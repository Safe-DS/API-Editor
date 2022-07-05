package com.larsreimann.apiEditor.features.project.model

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import com.larsreimann.apiEditor.features.annotations.model.AnnotationSlice
import com.larsreimann.apiEditor.features.api.model.ApiSlice
import com.larsreimann.apiEditor.features.usages.model.UsageSlice

class ProjectSlice {
    val annotationSlice by mutableStateOf(AnnotationSlice())
    val apiSlice by mutableStateOf(ApiSlice())
    val usageSlice by mutableStateOf(UsageSlice())
}
