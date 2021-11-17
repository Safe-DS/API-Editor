package com.larsreimann.api_editor.server.validation;

import com.larsreimann.api_editor.server.data.AnnotationTarget;

public record AnnotationTargetError(
    String qualifiedName,
    String annotationName,
    AnnotationTarget target
) implements AnnotationError {

    /**
     * Returns an error message specifying the annotation error.
     *
     * @return The constructed error message
     */
    @Override
    public String message() {
        return "The annotation " + annotationName.toLowerCase() + " cannot be set for the following element of type "
            + target.toString() + ": " + qualifiedName;
    }
}
