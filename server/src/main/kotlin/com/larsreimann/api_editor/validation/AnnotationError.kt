package com.larsreimann.api_editor.validation

import com.larsreimann.api_editor.model.AnnotationTarget
import java.util.Locale

sealed interface AnnotationError {

    /**
     * Returns an error message specifying the annotation error.
     *
     * @return The constructed error message
     */
    fun message(): String
}

data class AnnotationCombinationError(
    val qualifiedName: String,
    val firstAnnotationName: String,
    val secondAnnotationName: String,
) : AnnotationError {

    /**
     * Returns an error message specifying the annotation error.
     *
     * @return The constructed error message
     */
    override fun message(): String {
        return ("(" + firstAnnotationName.lowercase(Locale.getDefault()) + ", " + secondAnnotationName.lowercase(Locale.getDefault()) + ") "
            + "cannot both be set for element: " + qualifiedName)
    }
}

data class AnnotationTargetError(
    val qualifiedName: String,
    val annotationName: String,
    val target: AnnotationTarget,
) : AnnotationError {

    /**
     * Returns an error message specifying the annotation error.
     *
     * @return The constructed error message
     */
    override fun message(): String {
        return ("The annotation " + annotationName.lowercase(Locale.getDefault()) + " cannot be set for the following element of type "
            + target.toString() + ": " + qualifiedName)
    }
}

data class GroupAnnotationCombinationError(
    val qualifiedName: String,
    val annotationName: String,
) : AnnotationError {

    /**
     * Returns an error message specifying the annotation error.
     *
     * @return The constructed error message
     */
    override fun message(): String {
        return ("The parameter " + qualifiedName
            + " is part of a group. Grouped parameters must not have the following annotation: " +
            annotationName.lowercase(Locale.getDefault()) + " annotation")
    }
}
