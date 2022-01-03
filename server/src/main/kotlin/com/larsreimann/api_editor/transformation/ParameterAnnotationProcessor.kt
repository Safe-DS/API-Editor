package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataTransformer
import com.larsreimann.api_editor.model.AnnotatedPythonAttribute
import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.ConstantAnnotation
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RequiredAnnotation

/**
 * Processor for Constant-, Optional- and RequiredAnnotations
 */
class ParameterAnnotationProcessor : AbstractPackageDataTransformer() {
    override fun shouldVisitResultsIn(oldFunction: AnnotatedPythonFunction): Boolean {
        return false
    }

    override fun createNewParameter(oldParameter: AnnotatedPythonParameter): AnnotatedPythonParameter {
        var assignedBy = when {
            oldParameter.isOptional() -> PythonParameterAssignment.NAME_ONLY
            else -> PythonParameterAssignment.POSITION_OR_NAME
        }
        var defaultValue = oldParameter.defaultValue
        val annotations = mutableListOf<EditorAnnotation>()

        for (editorAnnotation in oldParameter.annotations) {
            when (editorAnnotation) {
                is AttributeAnnotation -> {
                    assignedBy = PythonParameterAssignment.ATTRIBUTE
                    defaultValue = editorAnnotation.defaultValue.toString()
                }
                is ConstantAnnotation -> {
                    assignedBy = PythonParameterAssignment.CONSTANT
                    defaultValue = editorAnnotation.defaultValue.toString()
                }
                is OptionalAnnotation -> {
                    assignedBy = PythonParameterAssignment.NAME_ONLY
                    defaultValue = editorAnnotation.defaultValue.toString()
                }
                is RequiredAnnotation -> {
                    assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                    defaultValue = null
                }
                else -> {
                    annotations.add(editorAnnotation)
                }
            }
        }

        return oldParameter.fullCopy(
            oldParameter.name,
            oldParameter.qualifiedName,
            defaultValue,
            assignedBy,
            oldParameter.isPublic,
            oldParameter.typeInDocs,
            oldParameter.description,
            annotations,
            oldParameter.boundary,
            if (oldParameter.originalDeclaration != null) oldParameter.originalDeclaration else oldParameter
        )
    }

    override fun createNewFunctionOnLeave(
        oldFunction: AnnotatedPythonFunction,
        newParameters: List<AnnotatedPythonParameter>,
        newResults: List<AnnotatedPythonResult>
    ): AnnotatedPythonFunction {
        return oldFunction.fullCopy(
            oldFunction.name,
            oldFunction.qualifiedName,
            oldFunction.decorators,
            reorderParameters(newParameters).toMutableList(),
            newResults.toMutableList(),
            oldFunction.isPublic,
            oldFunction.description,
            oldFunction.fullDocstring,
            oldFunction.annotations,
            oldFunction.calledAfter,
            oldFunction.isPure,
            if (oldFunction.originalDeclaration != null) oldFunction.originalDeclaration else oldFunction
        )
    }

    override fun createNewClassOnLeave(
        oldClass: AnnotatedPythonClass,
        newAttributes: List<AnnotatedPythonAttribute>,
        newMethods: List<AnnotatedPythonFunction>
    ): AnnotatedPythonClass {
        val processedNewAttributes = newAttributes.toMutableList()
        for (pythonFunction in newMethods) {
            if (pythonFunction.isConstructor()) {
                for (constructorParameter in pythonFunction.parameters) {
                    // Change default value of old attribute if assigned by of
                    // constructor parameter is of type attribute
                    if (constructorParameter.assignedBy === PythonParameterAssignment.ATTRIBUTE) {
                        val unmodifiedAttribute = processedNewAttributes.firstOrNull {
                            it.originalDeclaration!!.name == constructorParameter.originalDeclaration!!.name
                        }
                        if (unmodifiedAttribute != null) {
                            processedNewAttributes.remove(unmodifiedAttribute)
                            processedNewAttributes.add(
                                unmodifiedAttribute.fullCopy(
                                    unmodifiedAttribute.name,
                                    unmodifiedAttribute.qualifiedName,
                                    constructorParameter.defaultValue,
                                    unmodifiedAttribute.isPublic,
                                    unmodifiedAttribute.typeInDocs,
                                    unmodifiedAttribute.description,
                                    unmodifiedAttribute.annotations,
                                    unmodifiedAttribute.boundary,
                                    unmodifiedAttribute.originalDeclaration
                                )
                            )
                        }
                    } else if (constructorParameter.assignedBy === PythonParameterAssignment.CONSTANT) {
                        processedNewAttributes.removeIf {
                            it.originalDeclaration!!.name == constructorParameter.originalDeclaration!!.name
                        }
                    }
                }
            }
        }
        return oldClass.fullCopy(
            oldClass.name,
            oldClass.qualifiedName,
            oldClass.decorators,
            oldClass.superclasses,
            processedNewAttributes,
            newMethods.toMutableList(),
            oldClass.isPublic,
            oldClass.description,
            oldClass.fullDocstring,
            oldClass.annotations,
            oldClass.originalDeclaration
        )
    }

    private fun reorderParameters(unorderedParameters: List<AnnotatedPythonParameter>): List<AnnotatedPythonParameter> {
        val groups = unorderedParameters.groupBy { it.assignedBy }
        return buildList {
            addAll(groups[PythonParameterAssignment.IMPLICIT].orEmpty())
            addAll(groups[PythonParameterAssignment.POSITION_ONLY].orEmpty())
            addAll(groups[PythonParameterAssignment.POSITION_OR_NAME].orEmpty())
            addAll(groups[PythonParameterAssignment.NAME_ONLY].orEmpty())
            addAll(groups[PythonParameterAssignment.ATTRIBUTE].orEmpty())
            addAll(groups[PythonParameterAssignment.CONSTANT].orEmpty())
        }
    }
}
