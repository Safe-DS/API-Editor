package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.*;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;

public class AttributesInitializer extends AbstractPackageDataTransformer {
    @Override
    public boolean shouldVisitResultsIn(
        @NotNull AnnotatedPythonFunction pythonFunction
    ) {
        return false;
    }

    @Override
    public boolean shouldVisitEnumsIn(
        @NotNull AnnotatedPythonModule pythonModule
    ) {
        return false;
    }

    @Override
    public AnnotatedPythonClass createNewClassOnLeave(
        @NotNull AnnotatedPythonClass oldClass,
        @NotNull List<AnnotatedPythonAttribute> newAttributes,
        @NotNull List<AnnotatedPythonFunction> newMethods
    ) {
        List<AnnotatedPythonAttribute> attributesToAdd = new ArrayList<>(newAttributes);

        for (AnnotatedPythonFunction pythonFunction : newMethods) {
            if (pythonFunction.isConstructor()) {
                for (AnnotatedPythonParameter constructorParameter :
                    pythonFunction.getParameters()) {
                    attributesToAdd.add(
                        convertParameterToAttribute(constructorParameter)
                    );
                }
            }
        }

        return oldClass.fullCopy(
            oldClass.getName(),
            oldClass.getQualifiedName(),
            oldClass.getDecorators(),
            oldClass.getSuperclasses(),
            attributesToAdd,
            newMethods,
            oldClass.isPublic(),
            oldClass.getDescription(),
            oldClass.getFullDocstring(),
            oldClass.getAnnotations(),
            oldClass.getOriginalDeclaration()
        );
    }

    private AnnotatedPythonAttribute convertParameterToAttribute(
        AnnotatedPythonParameter pythonParameter
    ) {
        List<EditorAnnotation> filteredAnnotations =
            getFilteredAnnotations(pythonParameter.getAnnotations());
        return new AnnotatedPythonAttribute(
            pythonParameter.getName(),
            pythonParameter.getQualifiedName(),
            pythonParameter.getDefaultValue(),
            pythonParameter.isPublic(),
            pythonParameter.getTypeInDocs(),
            pythonParameter.getDescription(),
            filteredAnnotations
        );
    }

    /**
     * Only return those annotations that are processed on attribute level
     *
     * @param unfilteredAnnotations The unfiltered annotations
     *
     * @return The filtered annotations
     */
    private List<EditorAnnotation> getFilteredAnnotations(List<EditorAnnotation> unfilteredAnnotations) {
        List<EditorAnnotation> filteredAnnotations = new ArrayList<>();
        for (EditorAnnotation annotation : unfilteredAnnotations) {
            switch(annotation.getType()) {
                case "Attribute":
                case "Constant":
                case "Optional":
                case "Required":
                    break;
                default: filteredAnnotations.add(annotation);
            }
        }
        return filteredAnnotations;
    }
}
