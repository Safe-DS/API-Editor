package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.*;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;

public class AttributesInitializer extends AbstractPackageDataTransformer {
    @Override
    public boolean shouldVisitResultsIn(
        @NotNull SerializablePythonFunction pythonFunction
    ) {
        return false;
    }

    @Override
    public boolean shouldVisitEnumsIn(
        @NotNull SerializablePythonModule pythonModule
    ) {
        return false;
    }

    @Override
    public SerializablePythonClass createNewClassOnLeave(
        @NotNull SerializablePythonClass oldClass,
        @NotNull List<SerializablePythonAttribute> newAttributes,
        @NotNull List<SerializablePythonFunction> newMethods
    ) {
        List<SerializablePythonAttribute> attributesToAdd = new ArrayList<>(newAttributes);

        for (SerializablePythonFunction pythonFunction : newMethods) {
            if (pythonFunction.isConstructor()) {
                for (SerializablePythonParameter constructorParameter :
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

    private SerializablePythonAttribute convertParameterToAttribute(
        SerializablePythonParameter pythonParameter
    ) {
        List<EditorAnnotation> filteredAnnotations =
            getFilteredAnnotations(pythonParameter.getAnnotations());
        return new SerializablePythonAttribute(
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
