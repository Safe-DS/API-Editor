package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataTransformer
import com.larsreimann.api_editor.model.AnnotatedPythonAttribute
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonModule
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.model.EditorAnnotation

class BoundaryAnnotationProcessor : AbstractPackageDataTransformer() {
    override fun shouldVisitResultsIn(oldFunction: AnnotatedPythonFunction) = false
    override fun shouldVisitEnumsIn(oldModule: AnnotatedPythonModule) = false

    override fun createNewParameter(oldParameter: AnnotatedPythonParameter): AnnotatedPythonParameter {
        val annotations = mutableListOf<EditorAnnotation>()
        var newBoundary = oldParameter.boundary
        for (editorAnnotation in oldParameter.annotations) {
            if (editorAnnotation is BoundaryAnnotation) {
                newBoundary = Boundary(
                    editorAnnotation.isDiscrete,
                    editorAnnotation.lowerIntervalLimit,
                    editorAnnotation.lowerLimitType,
                    editorAnnotation.upperIntervalLimit,
                    editorAnnotation.upperLimitType
                )
            } else {
                annotations.add(editorAnnotation)
            }
        }
        return oldParameter.fullCopy(
            oldParameter.name,
            oldParameter.qualifiedName,
            oldParameter.defaultValue,
            oldParameter.assignedBy,
            oldParameter.isPublic,
            oldParameter.typeInDocs,
            oldParameter.description,
            annotations,
            newBoundary,
            oldParameter.originalDeclaration
        )
    }

    override fun createNewAttribute(
        oldAttribute: AnnotatedPythonAttribute
    ): AnnotatedPythonAttribute {
        val annotations = mutableListOf<EditorAnnotation>()
        var newBoundary = oldAttribute.boundary
        for (editorAnnotation in oldAttribute.annotations) {
            if (editorAnnotation is BoundaryAnnotation) {
                newBoundary = Boundary(
                    editorAnnotation.isDiscrete,
                    editorAnnotation.lowerIntervalLimit,
                    editorAnnotation.lowerLimitType,
                    editorAnnotation.upperIntervalLimit,
                    editorAnnotation.upperLimitType
                )
            } else {
                annotations.add(editorAnnotation)
            }
        }
        return oldAttribute.fullCopy(
            oldAttribute.name,
            oldAttribute.qualifiedName,
            oldAttribute.defaultValue,
            oldAttribute.isPublic,
            oldAttribute.typeInDocs,
            oldAttribute.description,
            annotations,
            newBoundary,
            oldAttribute.originalDeclaration
        )
    }
}
