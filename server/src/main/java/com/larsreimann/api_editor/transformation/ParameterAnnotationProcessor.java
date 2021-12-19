package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.*;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;

/**
 * Processor for Constant-, Optional- and RequiredAnnotations
 */
public class ParameterAnnotationProcessor extends AbstractPackageDataTransformer {
    @Override
    public boolean shouldVisitResultsIn(
        @NotNull AnnotatedPythonFunction pythonFunction
    ) {
        return false;
    }

    @Override
    public AnnotatedPythonParameter createNewParameter(
        @NotNull AnnotatedPythonParameter oldParameter
    ) {
        ArrayList<EditorAnnotation> annotations = new ArrayList<>();
        String defaultValue = oldParameter.getDefaultValue();
        PythonParameterAssignment assignedBy;
        /* preprocessing:
        required parameters -> position_or_name,
        optional parameters -> name_only
         */
        if (oldParameter.getDefaultValue() != null && !oldParameter.getDefaultValue().isBlank()) {
            assignedBy = PythonParameterAssignment.NAME_ONLY;
        }
        else {
            assignedBy = PythonParameterAssignment.POSITION_OR_NAME;
        }
        for (EditorAnnotation editorAnnotation : oldParameter.getAnnotations()) {
            if (editorAnnotation instanceof ConstantAnnotation) {
                assignedBy = PythonParameterAssignment.CONSTANT;
                // TODO
                defaultValue = ((DefaultString)(((ConstantAnnotation) editorAnnotation)
                    .getDefaultValue())).getValue();
            }
            else if (editorAnnotation instanceof OptionalAnnotation) {
                // TODO
                defaultValue = ((DefaultString)(((OptionalAnnotation) editorAnnotation)
                    .getDefaultValue())).getValue();
                assignedBy = PythonParameterAssignment.NAME_ONLY;
            }
            else if (editorAnnotation instanceof RequiredAnnotation) {
                defaultValue = null;
            }
            else {
                annotations.add(editorAnnotation);
            }
        }
        return oldParameter.fullCopy(
            oldParameter.getName(),
            oldParameter.getQualifiedName(),
            defaultValue,
            assignedBy,
            oldParameter.isPublic(),
            oldParameter.getTypeInDocs(),
            oldParameter.getDescription(),
            annotations,
            oldParameter.getBoundary(),
            oldParameter.getOriginalDeclaration() != null ?
                oldParameter.getOriginalDeclaration() : oldParameter
        );
    }

    @Override
    public AnnotatedPythonFunction createNewFunctionOnLeave(
        @NotNull AnnotatedPythonFunction oldFunction,
        @NotNull List<AnnotatedPythonParameter> newParameters,
        @NotNull List<AnnotatedPythonResult> newResults
    ) {

        return oldFunction.fullCopy(
            oldFunction.getName(),
            oldFunction.getQualifiedName(),
            oldFunction.getDecorators(),
            reorderParameters(newParameters),
            newResults,
            oldFunction.isPublic(),
            oldFunction.getDescription(),
            oldFunction.getFullDocstring(),
            oldFunction.getAnnotations(),
            oldFunction.getCalledAfter(),
            oldFunction.isPure(),
            oldFunction.getOriginalDeclaration() != null ?
                oldFunction.getOriginalDeclaration() : oldFunction
        );
    }

    private List<AnnotatedPythonParameter> reorderParameters(
        List<AnnotatedPythonParameter> unorderedParameters
    ) {
        List<AnnotatedPythonParameter> orderedParameters = new ArrayList<>();
        List<AnnotatedPythonParameter> constantParameters = new ArrayList<>();
        List<AnnotatedPythonParameter> optionalParameters = new ArrayList<>();
        List<AnnotatedPythonParameter> requiredParameters = new ArrayList<>();
        unorderedParameters.forEach(pythonParameter -> {
            switch (pythonParameter.getAssignedBy()) {
                case POSITION_OR_NAME -> requiredParameters.add(pythonParameter);
                case NAME_ONLY -> optionalParameters.add(pythonParameter);
                case CONSTANT -> constantParameters.add(pythonParameter);
                case POSITION_ONLY -> throw new RuntimeException(
                    "Position_only parameters must not exist after executing ParameterAnnotationProcessor"
                );
            }
        });
        orderedParameters.addAll(requiredParameters);
        orderedParameters.addAll(optionalParameters);
        orderedParameters.addAll(constantParameters);

        return orderedParameters;
    }
}
