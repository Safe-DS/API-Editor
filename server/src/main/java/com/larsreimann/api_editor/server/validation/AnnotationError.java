package com.larsreimann.api_editor.server.validation;

public interface AnnotationError {
    /**
     * Returns an error message specifying the annotation error
     *
     * @return The constructed error message
     */
    String message();
}
