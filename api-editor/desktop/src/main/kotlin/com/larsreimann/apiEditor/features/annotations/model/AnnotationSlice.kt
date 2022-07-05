package com.larsreimann.apiEditor.features.annotations.model

import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.remember
import com.larsreimann.apiEditor.features.api.ApiElementId

// Since we need to mutate this data, there is no additional AnnotationStore class
// TODO: Maybe it's still worth to have an annotation store? this way we minimize the logic that is tied
//       to compose, particularly the generation of annotations

class AnnotationSlice {
    private val targetToAnnotations = remember { mutableStateMapOf<ApiElementId, List<Annotation>>() }
}
