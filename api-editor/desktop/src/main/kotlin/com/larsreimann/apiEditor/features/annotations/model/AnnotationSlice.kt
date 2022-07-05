package com.larsreimann.apiEditor.features.annotations.model

import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.remember
import com.larsreimann.apiEditor.features.api.ApiElementId

// Since we need to mutate this data, there is no additional AnnotationStore class

class AnnotationSlice {
    val targetToAnnotations = remember { mutableStateMapOf<ApiElementId, List<Annotation>>() }
}
