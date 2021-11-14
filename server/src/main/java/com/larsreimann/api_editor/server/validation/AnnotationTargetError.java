package com.larsreimann.api_editor.server.validation;

import com.larsreimann.api_editor.server.data.AnnotationTarget;

public class AnnotationTargetError implements AnnotationError {
    private final String qualifiedName;
    private final String annotationName;
    private final AnnotationTarget target;

    public AnnotationTargetError(String qualifiedName, String annotationName, AnnotationTarget target) {
        this.qualifiedName = qualifiedName;
        this.annotationName = annotationName;
        this.target = target;
    }

    @Override
    public String message() {
        return "The annotation " + annotationName + " cannot be set for the following element of type "
            + target.toString() + ": " + qualifiedName;
    }
}
