package com.larsreimann.api_editor.server.validation;

import com.larsreimann.api_editor.server.data.AnnotationTarget;

public record AnnotationTargetError(
    String qualifiedName,
    String annotationName,
    AnnotationTarget target
) implements AnnotationError {

    @Override
    public String message() {
        return "The annotation " + annotationName + " cannot be set for the following element of type "
            + target.toString() + ": " + qualifiedName;
    }
}
