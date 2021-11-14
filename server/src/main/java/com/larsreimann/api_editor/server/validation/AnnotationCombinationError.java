package com.larsreimann.api_editor.server.validation;

public class AnnotationCombinationError implements AnnotationError{
    private final String qualifiedName;
    private final String firstAnnotationName;
    private final String secondAnnotationName;

    public AnnotationCombinationError(String qualifiedName, String firstAnnotationName, String secondAnnotationName) {
        this.qualifiedName = qualifiedName;
        this.firstAnnotationName = firstAnnotationName;
        this.secondAnnotationName = secondAnnotationName;
    }

    @Override
    public String message() {
        return "(" + firstAnnotationName + ", " + secondAnnotationName + ") "
            + "cannot both be set for element: " + qualifiedName;
    }
}
