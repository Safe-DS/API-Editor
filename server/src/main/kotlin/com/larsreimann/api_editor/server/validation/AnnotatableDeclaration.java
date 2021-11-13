package com.larsreimann.api_editor.server.validation;

public enum AnnotatableDeclaration {

    CLASS("class"),
    CLASS_FUNCTION("class function"),
    CONSTRUCTOR_PARAMETER("constructor paramater"),
    GLOBAL_FUNCTION("global function"),
    FUNCTION_PARAMETER("function parameter");

    private final String declarationName;

    private AnnotatableDeclaration(String declaration) {
        declarationName = declaration;
    }

    public String toString(){
        return declarationName;
    }
}
