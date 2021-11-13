package com.larsreimann.api_editor.server.validation;

import com.larsreimann.api_editor.server.data.*;

import java.util.*;

public class AnnotationValidator {
    private final AnnotatedPythonPackage annotatedPythonPackage;

    private final List<AnnotationError> validationErrors;

    private static final String ANNOTATION_PREFIX = "com.larsreimann.api_editor.server.data.";
    private static final String ANNOTATION_CLASS_SUFFIX = "Annotation";

    private static final Map<String, Set<String>> possibleCombinations;
    private static final Set<String> possibleClassAnnotations = Set.of(
        "Move", "Rename", "Unused"
    );
    private static final Set<String> possibleClassFunctionAnnotations = Set.of(
        "CalledAfter", "Group", "Rename", "Unused"
    );
    private static final Set<String> possibleGlobalFunctionAnnotations = Set.of(
        "CalledAfter", "Group", "Move", "Rename", "Unused"
    );
    private static final Set<String> possibleFunctionParameterAnnotations = Set.of(
        "Boundary", "Constant", "Enum", "Optional", "Rename", "Required"
    );
    private static final Set<String> possibleConstructorParameterAnnotations = Set.of(
        "Attribute", "Boundary", "Constant", "Enum", "Optional", "Rename", "Required"
    );

    static {
        possibleCombinations = new HashMap<>();
        possibleCombinations.put("Attribute", Set.of(
            "Boundary", "Enum", "Rename"
        ));
        possibleCombinations.put("Boundary", Set.of(
            "Attribute", "Group", "Optional", "Rename", "Required"
        ));
        possibleCombinations.put("CalledAfter", Set.of(
            "CalledAfter", "Group", "Move", "Rename"
        ));
        possibleCombinations.put("Constant", Set.of());
        possibleCombinations.put("Enum", Set.of(
            "Attribute", "Group", "Optional", "Rename", "Required"
        ));
        possibleCombinations.put("Group", Set.of(
            "Boundary", "CalledAfter", "Enum", "Group", "Move", "Optional", "Rename", "Required"
        ));
        possibleCombinations.put("Move", Set.of(
            "CalledAfter", "Group", "Rename"
        ));
        possibleCombinations.put("Optional", Set.of(
            "Boundary", "Enum", "Group", "Rename"
        ));
        possibleCombinations.put("Rename", Set.of(
            "Attribute", "Boundary", "CalledAfter", "Enum", "Group", "Move", "Optional", "Required"
        ));
        possibleCombinations.put("Required", Set.of(
            "Boundary", "Enum", "Group", "Rename"
        ));
        possibleCombinations.put("Unused", Set.of());
    }

    public AnnotationValidator(AnnotatedPythonPackage inputPackage) {
        annotatedPythonPackage = inputPackage;
        validationErrors = new ArrayList<>();
    }

    public List<AnnotationError> returnValidationErrors() {
        validatePackage();
        return validationErrors;
    }

    private void validateClassFunction(AnnotatedPythonFunction annotatedPythonFunction) {
        boolean isConstructor = isConstructor(annotatedPythonFunction.getName());
        if (isConstructor) {
            annotatedPythonFunction.getParameters().forEach(
                (parameter) -> validateConstructorParameter(parameter, annotatedPythonFunction.getQualifiedName())
            );
        } else {
            annotatedPythonFunction.getParameters().forEach(
                (parameter) -> validateFunctionParameter(parameter, annotatedPythonFunction.getQualifiedName())
            );
        }
        EditorAnnotation[] functionAnnotations = annotatedPythonFunction.getAnnotations().toArray(new EditorAnnotation[0]);
        validateAnnotationsValidOnTarget(functionAnnotations, AnnotatableDeclaration.CLASS_FUNCTION, annotatedPythonFunction.getQualifiedName());
        validateAnnotationCombinations(functionAnnotations, annotatedPythonFunction.getQualifiedName());
    }

    private void validateGlobalFunction(AnnotatedPythonFunction annotatedPythonFunction) {
        annotatedPythonFunction.getParameters().forEach(
            (parameter) -> validateFunctionParameter(parameter, annotatedPythonFunction.getQualifiedName())
        );
        EditorAnnotation[] functionAnnotations = annotatedPythonFunction.getAnnotations().toArray(new EditorAnnotation[0]);
        validateAnnotationsValidOnTarget(functionAnnotations, AnnotatableDeclaration.GLOBAL_FUNCTION, annotatedPythonFunction.getQualifiedName());
        validateAnnotationCombinations(functionAnnotations, annotatedPythonFunction.getQualifiedName());
    }

    private void validateFunctionParameter(AnnotatedPythonParameter annotatedPythonParameter, String functionPath) {
        String qualifiedParameterName = functionPath + "/" + annotatedPythonParameter.getName();
        EditorAnnotation[] parameterAnnotations = annotatedPythonParameter.getAnnotations().toArray(new EditorAnnotation[0]);
        validateAnnotationsValidOnTarget(parameterAnnotations, AnnotatableDeclaration.FUNCTION_PARAMETER, qualifiedParameterName);
        validateAnnotationCombinations(parameterAnnotations, qualifiedParameterName);
    }

    private void validateConstructorParameter(AnnotatedPythonParameter annotatedPythonParameter, String functionPath) {
        String qualifiedParameterName = functionPath + "/" + annotatedPythonParameter.getName();
        EditorAnnotation[] parameterAnnotations = annotatedPythonParameter.getAnnotations().toArray(new EditorAnnotation[0]);
        validateAnnotationsValidOnTarget(parameterAnnotations, AnnotatableDeclaration.CONSTRUCTOR_PARAMETER, qualifiedParameterName);
        validateAnnotationCombinations(parameterAnnotations, qualifiedParameterName);
    }

    private void validateClass(AnnotatedPythonClass annotatedPythonClass) {
        annotatedPythonClass.getMethods().forEach(this::validateClassFunction);
        EditorAnnotation[] classAnnotations = annotatedPythonClass.getAnnotations().toArray(new EditorAnnotation[0]);
        validateAnnotationsValidOnTarget(classAnnotations, AnnotatableDeclaration.CLASS, annotatedPythonClass.getQualifiedName());
        validateAnnotationCombinations(classAnnotations, annotatedPythonClass.getQualifiedName());
    }

    private void validateModule(AnnotatedPythonModule annotatedPythonModule) {
        annotatedPythonModule.getClasses().forEach(this::validateClass);
        annotatedPythonModule.getFunctions().forEach(this::validateGlobalFunction);
    }

    private void validatePackage() {
        annotatedPythonPackage.getModules().forEach(this::validateModule);
    }

    private void validateAnnotationsValidOnTarget(
        EditorAnnotation[] editorAnnotations, AnnotatableDeclaration declaration, String qualifiedName
    ) {
        Set<String> validAnnotations = Set.of();
        switch (declaration) {
            case CLASS:
                validAnnotations = possibleClassAnnotations;
                break;
            case CLASS_FUNCTION:
                validAnnotations = possibleClassFunctionAnnotations;
                break;
            case CONSTRUCTOR_PARAMETER:
                validAnnotations = possibleConstructorParameterAnnotations;
                break;
            case GLOBAL_FUNCTION:
                validAnnotations = possibleGlobalFunctionAnnotations;
                break;
            case FUNCTION_PARAMETER:
                validAnnotations = possibleFunctionParameterAnnotations;
                break;
        }
        for (EditorAnnotation editorAnnotation : editorAnnotations) {
            String annotationName = getAnnotationName(editorAnnotation);

            if (validAnnotations.isEmpty() || !validAnnotations.contains(annotationName)) {
                validationErrors.add(new AnnotationTargetError(qualifiedName, annotationName, declaration));
            }
        }
    }

    private void validateAnnotationCombinations(EditorAnnotation[] editorAnnotations, String qualifiedName) {
        for (int i = 0; i < editorAnnotations.length; i++) {
            for (int j = i + 1; j < editorAnnotations.length; j++) {
                validateAnnotationCombination(qualifiedName, editorAnnotations[i], editorAnnotations[j]);
            }
        }
    }

    private void validateAnnotationCombination(String qualifiedName, EditorAnnotation firstAnnotation, EditorAnnotation secondAnnotation) {
        String firstAnnotationName = getAnnotationName(firstAnnotation);
        String secondAnnotationName = getAnnotationName(secondAnnotation);
        if (possibleCombinations.get(firstAnnotationName).isEmpty()
            || !possibleCombinations.get(firstAnnotationName).contains(secondAnnotationName)) {
            validationErrors.add(
                new AnnotationCombinationError(qualifiedName,
                    firstAnnotationName,
                    secondAnnotationName)
            );
        }
    }

    private String getAnnotationName(EditorAnnotation editorAnnotation) {
        String name = editorAnnotation.getClass().getCanonicalName();
        if (name != null && name.startsWith(ANNOTATION_PREFIX)) {
            name = name.substring(ANNOTATION_PREFIX.length());
        }
        if (name != null && name.endsWith(ANNOTATION_CLASS_SUFFIX)) {
            name = name.substring(0, name.length() - ANNOTATION_CLASS_SUFFIX.length());
        }
        return name;
    }

    private boolean isConstructor(String name) {
        return name.equals("__init__");
    }
}
