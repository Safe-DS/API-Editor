package com.larsreimann.api_editor.server.validation;

import com.larsreimann.api_editor.server.data.AnnotationTarget;

public class AnnotationTargetError implements AnnotationError {
    private final String qualifiedName;
    private final String annotationName;
    private final AnnotationTarget type;

    public AnnotationTargetError(String qualifiedName, String annotationName, AnnotationTarget type) {
        this.qualifiedName = qualifiedName;
        this.annotationName = annotationName;
        this.type = type;
    }

    @Override
    public String message() {
        return "The annotation " + annotationName + " cannot be set for the following element of type "
            + type.toString() + ": " + qualifiedName;
    }
}
