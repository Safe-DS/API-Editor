package com.larsreimann.api_editor.validation;

import com.larsreimann.api_editor.model.AnnotatedPythonClass;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonModule;
import com.larsreimann.api_editor.model.AnnotatedPythonPackage;
import com.larsreimann.api_editor.model.AnnotatedPythonParameter;
import com.larsreimann.api_editor.model.AnnotationTarget;
import com.larsreimann.api_editor.model.EditorAnnotation;
import com.larsreimann.api_editor.model.GroupAnnotation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
            "CalledAfter", "Group", "Move", "Rename"
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

    private final String GROUP_ANNOTATION_NAME = "Group";

    /**
     * Constructor for class AnnotationValidator.
     *
     * @param inputPackage The package to be validated
     */
    public AnnotationValidator(AnnotatedPythonPackage inputPackage) {
        annotatedPythonPackage = inputPackage;
        validationErrors = new ArrayList<>();
    }

    /**
     * Validates the classes annotated python package and returns validation errors.
     *
     * @return the validation errors found
     */
    public List<AnnotationError> validate() {
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
        validateAnnotationsValidOnTarget(
            classAnnotations,
            AnnotationTarget.CLASS, annotatedPythonClass.getQualifiedName()
        );
        validateAnnotationCombinations(
            classAnnotations,
            annotatedPythonClass.getQualifiedName()
        );
    }

    private void validateMethod(AnnotatedPythonFunction annotatedPythonFunction) {
        Set<String> groupedParameterNames = getParameterNamesInGroups(
            annotatedPythonFunction.getAnnotations()
        );
        if (annotatedPythonFunction.isConstructor()) {
            annotatedPythonFunction.getParameters().forEach(parameter ->
                validateConstructorParameter(
                    parameter,
                    groupedParameterNames.contains(parameter.getName())
                )
            );
        } else {
            annotatedPythonFunction.getParameters().forEach(
                parameter -> validateFunctionParameter(
                    parameter,
                    groupedParameterNames.contains(parameter.getName())
                )
            );
        }
        List<EditorAnnotation> functionAnnotations = annotatedPythonFunction.getAnnotations();
        validateAnnotationsValidOnTarget(functionAnnotations,
            AnnotationTarget.METHOD,
            annotatedPythonFunction.getQualifiedName()
        );
        validateAnnotationCombinations(
            functionAnnotations,
            annotatedPythonFunction.getQualifiedName()
        );
    }

    private void validateGlobalFunction(
        AnnotatedPythonFunction annotatedPythonFunction
    ) {
        Set<String> groupedParameterNames = getParameterNamesInGroups(
            annotatedPythonFunction.getAnnotations()
        );
        annotatedPythonFunction.getParameters().forEach(
            parameter -> validateFunctionParameter(
                parameter,
                groupedParameterNames.contains(parameter.getName())
            )
        );
        List<EditorAnnotation> functionAnnotations = annotatedPythonFunction.getAnnotations();
        validateAnnotationsValidOnTarget(functionAnnotations,
            AnnotationTarget.GLOBAL_FUNCTION,
            annotatedPythonFunction.getQualifiedName()
        );
        validateAnnotationCombinations(
            functionAnnotations,
            annotatedPythonFunction.getQualifiedName()
        );
    }

    private void validateFunctionParameter(
        AnnotatedPythonParameter annotatedPythonParameter,
        boolean parameterInGroup
    ) {
        List<EditorAnnotation> parameterAnnotations = annotatedPythonParameter.getAnnotations();
        String qualifiedName = annotatedPythonParameter.getQualifiedName();
        validateAnnotationsValidOnTarget(parameterAnnotations,
            AnnotationTarget.FUNCTION_PARAMETER,
            qualifiedName
        );
        validateAnnotationCombinations(
            parameterAnnotations,
            qualifiedName
        );
        if (parameterInGroup) {
            validateGroupCombinations(qualifiedName, parameterAnnotations);
        }
    }

    private void validateConstructorParameter(
        AnnotatedPythonParameter annotatedPythonParameter,
        boolean parameterInGroup
    ) {
        List<EditorAnnotation> parameterAnnotations = annotatedPythonParameter.getAnnotations();
        String qualifiedName = annotatedPythonParameter.getQualifiedName();
        validateAnnotationsValidOnTarget(
            parameterAnnotations,
            AnnotationTarget.CONSTRUCTOR_PARAMETER,
            qualifiedName
        );
        validateAnnotationCombinations(
            parameterAnnotations,
            qualifiedName
        );
        if (parameterInGroup) {
            validateGroupCombinations(qualifiedName, parameterAnnotations);
        }
    }

    private void validateAnnotationsValidOnTarget(
        Iterable<EditorAnnotation> editorAnnotations,
        AnnotationTarget target,
        String qualifiedName
    ) {
        for (EditorAnnotation editorAnnotation : editorAnnotations) {
            if (!editorAnnotation.isApplicableTo(target)) {
                validationErrors.add(
                    new AnnotationTargetError(
                        qualifiedName,
                        editorAnnotation.getType(),
                        target)
                );
            }
        }
    }

    private Set<String> getParameterNamesInGroups(
        List<EditorAnnotation> editorAnnotations
    ) {
        List<GroupAnnotation> groupAnnotations = getGroupAnnotations(
            editorAnnotations
        );
        if (groupAnnotations.isEmpty()) {
            return Collections.emptySet();
        }
        Set<String> groupedParameterNames = new HashSet<>();
        groupAnnotations.forEach(groupAnnotation ->
            groupedParameterNames.addAll(groupAnnotation.getParameters())
        );
        return groupedParameterNames;
    }

    private List<GroupAnnotation> getGroupAnnotations(
        List<EditorAnnotation> editorAnnotations
    ) {
        List<GroupAnnotation> groupAnnotations = new ArrayList<>();
        editorAnnotations.forEach(annotation -> {
            if (annotation.getType().equals("Group")) {
                groupAnnotations.add((GroupAnnotation) annotation);
            }
        });
        return groupAnnotations;
    }

    private void validateAnnotationCombinations(
        List<EditorAnnotation> editorAnnotations,
        String qualifiedName
    ) {
        for (int i = 0; i < editorAnnotations.size(); i++) {
            for (int j = i + 1; j < editorAnnotations.size(); j++) {
                validateAnnotationCombination(
                    qualifiedName,
                    editorAnnotations.get(i),
                    editorAnnotations.get(j));
            }
        }
    }

    private void validateAnnotationCombination(
        String qualifiedName,
        EditorAnnotation firstAnnotation,
        EditorAnnotation secondAnnotation
    ) {
        String firstAnnotationName = firstAnnotation.getType();
        String secondAnnotationName = secondAnnotation.getType();
        if (possibleCombinations.get(firstAnnotationName).isEmpty()
            || !possibleCombinations.get(firstAnnotationName)
            .contains(secondAnnotationName)) {
            validationErrors.add(
                new AnnotationCombinationError(qualifiedName,
                    firstAnnotationName,
                    secondAnnotationName)
            );
        }
    }

    private void validateGroupCombinations(
        String qualifiedName,
        List<EditorAnnotation> editorAnnotations
    ) {
        editorAnnotations.forEach(editorAnnotation -> {
            String annotationName = editorAnnotation.getType();
            if (!possibleCombinations.get(GROUP_ANNOTATION_NAME)
                .contains(annotationName)
            ) {
                validationErrors.add(
                    new GroupAnnotationCombinationError(
                        qualifiedName,
                        annotationName
                    )
                );
            }
        });
    }
}
