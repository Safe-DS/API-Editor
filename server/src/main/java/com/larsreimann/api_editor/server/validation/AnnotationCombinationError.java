package com.larsreimann.api_editor.server.validation;

public record AnnotationCombinationError(
    String qualifiedName,
    String firstAnnotationName,
    String secondAnnotationName
) implements AnnotationError {

    @Override
    public String message() {
        return "(" + firstAnnotationName + ", " + secondAnnotationName + ") "
            + "cannot both be set for element: " + qualifiedName;
    }
}
