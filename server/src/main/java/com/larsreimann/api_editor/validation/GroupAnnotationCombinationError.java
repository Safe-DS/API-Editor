package com.larsreimann.api_editor.validation;

public record GroupAnnotationCombinationError(
    String qualifiedName,
    String annotationName
) implements AnnotationError {

    /**
     * Returns an error message specifying the annotation error.
     *
     * @return The constructed error message
     */
    @Override
    public String message() {
        return "The parameter " + qualifiedName
            + " is part of a group. Grouped parameters must not have the following annotation: " +
            annotationName.toLowerCase() + " annotation";
    }
}
