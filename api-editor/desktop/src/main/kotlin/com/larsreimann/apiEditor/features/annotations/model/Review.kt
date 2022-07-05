package com.larsreimann.apiEditor.features.annotations.model

import com.larsreimann.apiEditor.features.users.model.Username

data class Review(
    val reviewer: Username?,
    val result: ReviewResult
)

enum class ReviewResult {
    Approved,
    Unsure,
    Rejected
}
