package com.larsreimann.api_editor.server.validation;

import com.larsreimann.api_editor.server.data.*;

import java.util.*;

public class AnnotationValidator {
    private final AnnotatedPythonPackage annotatedPythonPackage;

    private final List<AnnotationError> validationErrors;

    private static final Map<String, Set<String>> possibleCombinations;

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

    /**
     * Constructor for class AnnotationValidator
     *
     * @param inputPackage The package to be validated
     */
    public AnnotationValidator(AnnotatedPythonPackage inputPackage) {
        annotatedPythonPackage = inputPackage;
        validationErrors = new ArrayList<>();
    }

    /**
     * Validates the classes annotated python package
     * and returns validation errors
     *
     * @return the validation errors found
     */
    public List<AnnotationError> returnValidationErrors() {
        validatePackage();
        return validationErrors;
    }

    private void validatePackage() {
        annotatedPythonPackage.getModules().forEach(this::validateModule);
    }

    private void validateModule(AnnotatedPythonModule annotatedPythonModule) {
        annotatedPythonModule.getClasses().forEach(this::validateClass);
        annotatedPythonModule.getFunctions().forEach(this::validateGlobalFunction);
    }

    private void validateClass(AnnotatedPythonClass annotatedPythonClass) {
        annotatedPythonClass.getMethods().forEach(this::validateMethod);
        List<EditorAnnotation> classAnnotations = annotatedPythonClass.getAnnotations();
        validateAnnotationsValidOnTarget(classAnnotations, AnnotationTarget.CLASS, annotatedPythonClass.getQualifiedName());
        validateAnnotationCombinations(classAnnotations, annotatedPythonClass.getQualifiedName());
    }

    private void validateMethod(AnnotatedPythonFunction annotatedPythonFunction) {
        if (annotatedPythonFunction.isConstructor()) {
            annotatedPythonFunction.getParameters().forEach(this::validateConstructorParameter);
        } else {
            annotatedPythonFunction.getParameters().forEach(this::validateFunctionParameter);
        }
        List<EditorAnnotation> functionAnnotations = annotatedPythonFunction.getAnnotations();
        validateAnnotationsValidOnTarget(functionAnnotations, AnnotationTarget.METHOD, annotatedPythonFunction.getQualifiedName());
        validateAnnotationCombinations(functionAnnotations, annotatedPythonFunction.getQualifiedName());
    }

    private void validateGlobalFunction(AnnotatedPythonFunction annotatedPythonFunction) {
        annotatedPythonFunction.getParameters().forEach(this::validateFunctionParameter);
        List<EditorAnnotation> functionAnnotations = annotatedPythonFunction.getAnnotations();
        validateAnnotationsValidOnTarget(functionAnnotations, AnnotationTarget.GLOBAL_FUNCTION, annotatedPythonFunction.getQualifiedName());
        validateAnnotationCombinations(functionAnnotations, annotatedPythonFunction.getQualifiedName());
    }

    private void validateFunctionParameter(AnnotatedPythonParameter annotatedPythonParameter) {
        List<EditorAnnotation> parameterAnnotations = annotatedPythonParameter.getAnnotations();
        validateAnnotationsValidOnTarget(parameterAnnotations, AnnotationTarget.FUNCTION_PARAMETER, annotatedPythonParameter.getQualifiedName());
        validateAnnotationCombinations(parameterAnnotations, annotatedPythonParameter.getQualifiedName());
    }

    private void validateConstructorParameter(AnnotatedPythonParameter annotatedPythonParameter) {
        List<EditorAnnotation> parameterAnnotations = annotatedPythonParameter.getAnnotations();
        validateAnnotationsValidOnTarget(parameterAnnotations, AnnotationTarget.CONSTRUCTOR_PARAMETER, annotatedPythonParameter.getQualifiedName());
        validateAnnotationCombinations(parameterAnnotations, annotatedPythonParameter.getQualifiedName());
    }

    private void validateAnnotationsValidOnTarget(
        Iterable<EditorAnnotation> editorAnnotations, AnnotationTarget target, String qualifiedName
    ) {
        for (EditorAnnotation editorAnnotation : editorAnnotations) {
            if (!editorAnnotation.isApplicableTo(target)) {
                validationErrors.add(new AnnotationTargetError(qualifiedName, editorAnnotation.getType(), target));
            }
        }
    }

    private void validateAnnotationCombinations(List<EditorAnnotation> editorAnnotations, String qualifiedName) {
        for (int i = 0; i < editorAnnotations.size(); i++) {
            for (int j = i + 1; j < editorAnnotations.size(); j++) {
                validateAnnotationCombination(qualifiedName, editorAnnotations.get(i), editorAnnotations.get(j));
            }
        }
    }

    private void validateAnnotationCombination(String qualifiedName, EditorAnnotation firstAnnotation, EditorAnnotation secondAnnotation) {
        String firstAnnotationName = firstAnnotation.getType();
        String secondAnnotationName = secondAnnotation.getType();
        if (possibleCombinations.get(firstAnnotationName).isEmpty()
            || !possibleCombinations.get(firstAnnotationName).contains(secondAnnotationName)) {
            validationErrors.add(
                new AnnotationCombinationError(qualifiedName,
                    firstAnnotationName,
                    secondAnnotationName)
            );
        }
    }
}
