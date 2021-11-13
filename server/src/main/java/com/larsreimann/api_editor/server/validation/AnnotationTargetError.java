package com.larsreimann.api_editor.server.validation;

public class AnnotationTargetError implements AnnotationError {
    private final String qualifiedName;
    private final String annotationName;
    private final AnnotatableDeclaration type;

    public AnnotationTargetError(String qualifiedName, String annotationName, AnnotatableDeclaration type) {
        this.qualifiedName = qualifiedName;
        this.annotationName = annotationName;
        this.type = type;
    }

    public String message() {
        return "The annotation " + annotationName + " cannot be set for the following element of type "
            + type.toString() + ": " + qualifiedName;
    }
}
