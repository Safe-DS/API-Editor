package com.larsreimann.apiEditor.features.annotations.model

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue

class AnnotationSlice {
    var annotationStore by remember { mutableStateOf(AnnotationStore()) }
}
