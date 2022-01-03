package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.*;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;

public class BoundaryAnnotationProcessor extends AbstractPackageDataTransformer {
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
    public AnnotatedPythonParameter createNewParameter(
        @NotNull AnnotatedPythonParameter oldParameter
    ) {
        ArrayList<EditorAnnotation> annotations = new ArrayList<>();
        Boundary newBoundary = oldParameter.getBoundary();
        for (EditorAnnotation editorAnnotation : oldParameter.getAnnotations()) {
            if (editorAnnotation instanceof BoundaryAnnotation) {
                newBoundary = new Boundary(
                    ((BoundaryAnnotation) editorAnnotation).isDiscrete(),
                    ((BoundaryAnnotation) editorAnnotation).getLowerIntervalLimit(),
                    ((BoundaryAnnotation) editorAnnotation).getLowerLimitType(),
                    ((BoundaryAnnotation) editorAnnotation).getUpperIntervalLimit(),
                    ((BoundaryAnnotation) editorAnnotation).getUpperLimitType()
                );
            }
            else {
                annotations.add(editorAnnotation);
            }
        }

        return oldParameter.fullCopy(
            oldParameter.getName(),
            oldParameter.getQualifiedName(),
            oldParameter.getDefaultValue(),
            oldParameter.getAssignedBy(),
            oldParameter.isPublic(),
            oldParameter.getTypeInDocs(),
            oldParameter.getDescription(),
            annotations,
            newBoundary,
            oldParameter.getOriginalDeclaration()
        );
    }

    @Override
    public AnnotatedPythonAttribute createNewAttribute(
        @NotNull AnnotatedPythonAttribute oldAttribute
    ) {
        ArrayList<EditorAnnotation> annotations = new ArrayList<>();
        Boundary newBoundary = oldAttribute.getBoundary();
        for (EditorAnnotation editorAnnotation : oldAttribute.getAnnotations()) {
            if (editorAnnotation instanceof BoundaryAnnotation) {
                newBoundary = new Boundary(
                    ((BoundaryAnnotation) editorAnnotation).isDiscrete(),
                    ((BoundaryAnnotation) editorAnnotation).getLowerIntervalLimit(),
                    ((BoundaryAnnotation) editorAnnotation).getLowerLimitType(),
                    ((BoundaryAnnotation) editorAnnotation).getUpperIntervalLimit(),
                    ((BoundaryAnnotation) editorAnnotation).getUpperLimitType()
                );
            }
            else {
                annotations.add(editorAnnotation);
            }
        }

        return oldAttribute.fullCopy(
            oldAttribute.getName(),
            oldAttribute.getQualifiedName(),
            oldAttribute.getDefaultValue(),
            oldAttribute.isPublic(),
            oldAttribute.getTypeInDocs(),
            oldAttribute.getDescription(),
            annotations,
            newBoundary,
            oldAttribute.getOriginalDeclaration()
        );
    }
}
