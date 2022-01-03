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
import java.util.Objects
import java.util.function.Consumer

/**
 * Processor for Constant-, Optional- and RequiredAnnotations
 */
class ParameterAnnotationProcessor : AbstractPackageDataTransformer() {
    override fun shouldVisitResultsIn(oldFunction: AnnotatedPythonFunction): Boolean {
        return false
    }

    override fun createNewParameter(oldParameter: AnnotatedPythonParameter): AnnotatedPythonParameter {
        val annotations = ArrayList<EditorAnnotation>()
        var defaultValue = oldParameter.defaultValue
        var assignedBy: PythonParameterAssignment
        /* preprocessing:
        required parameters -> position_or_name,
        optional parameters -> name_only
         */assignedBy = if (oldParameter.defaultValue != null) {
            PythonParameterAssignment.NAME_ONLY
        } else {
            PythonParameterAssignment.POSITION_OR_NAME
        }
        for (editorAnnotation in oldParameter.annotations) {
            when (editorAnnotation) {
                is AttributeAnnotation -> {
                    assignedBy = PythonParameterAssignment.ATTRIBUTE
                    defaultValue = editorAnnotation
                        .defaultValue.toString()
                }
                is ConstantAnnotation -> {
                    assignedBy = PythonParameterAssignment.CONSTANT
                    defaultValue = editorAnnotation
                        .defaultValue.toString()
                }
                is OptionalAnnotation -> {
                    defaultValue = editorAnnotation
                        .defaultValue.toString()
                    assignedBy = PythonParameterAssignment.NAME_ONLY
                }
                is RequiredAnnotation -> {
                    defaultValue = null
                    assignedBy = PythonParameterAssignment.POSITION_OR_NAME
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
        val processedNewAttributes: MutableList<AnnotatedPythonAttribute> = ArrayList(newAttributes)
        for (pythonFunction in newMethods) {
            if (pythonFunction.isConstructor()) {
                for (constructorParameter in pythonFunction.parameters) {
                    // Change default value of old attribute if assigned by of
                    // constructor parameter is of type attribute
                    if (constructorParameter.assignedBy
                        === PythonParameterAssignment.ATTRIBUTE
                    ) {
                        val unmodifiedAttribute =
                            processedNewAttributes.stream().filter { pythonAttribute: AnnotatedPythonAttribute ->
                                (Objects.requireNonNull(
                                    pythonAttribute.originalDeclaration
                                )!!.name
                                    ==
                                    Objects.requireNonNull(
                                        constructorParameter
                                            .originalDeclaration
                                    )
                                    !!.name
                                    )
                            }.findAny()
                        if (unmodifiedAttribute.isPresent) {
                            val unmodifiedPresentAttribute = unmodifiedAttribute.get()
                            processedNewAttributes.remove(unmodifiedPresentAttribute)
                            processedNewAttributes.add(
                                unmodifiedPresentAttribute.fullCopy(
                                    unmodifiedPresentAttribute.name,
                                    unmodifiedPresentAttribute.qualifiedName,
                                    constructorParameter.defaultValue,
                                    unmodifiedPresentAttribute.isPublic,
                                    unmodifiedPresentAttribute.typeInDocs,
                                    unmodifiedPresentAttribute.description,
                                    unmodifiedPresentAttribute.annotations,
                                    unmodifiedPresentAttribute.boundary,
                                    unmodifiedPresentAttribute.originalDeclaration
                                )
                            )
                        }
                    } else if (constructorParameter.assignedBy
                        === PythonParameterAssignment.CONSTANT
                    ) {
                        processedNewAttributes.removeIf { pythonAttribute: AnnotatedPythonAttribute ->
                            (Objects.requireNonNull(
                                pythonAttribute
                                    .originalDeclaration
                            )
                            !!.name
                                ==
                                Objects.requireNonNull(
                                    constructorParameter
                                        .originalDeclaration
                                )
                                !!.name
                                )
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
        val orderedParameters = mutableListOf<AnnotatedPythonParameter>()
        val attributeParameters = mutableListOf<AnnotatedPythonParameter>()
        val constantParameters = mutableListOf<AnnotatedPythonParameter>()
        val implicitParameters = mutableListOf<AnnotatedPythonParameter>()
        val optionalParameters = mutableListOf<AnnotatedPythonParameter>()
        val requiredParameters = mutableListOf<AnnotatedPythonParameter>()
        unorderedParameters.forEach(Consumer { pythonParameter: AnnotatedPythonParameter ->
            when (pythonParameter.assignedBy) {
                PythonParameterAssignment.IMPLICIT -> implicitParameters.add(pythonParameter)
                PythonParameterAssignment.POSITION_OR_NAME -> requiredParameters.add(pythonParameter)
                PythonParameterAssignment.NAME_ONLY -> optionalParameters.add(pythonParameter)
                PythonParameterAssignment.CONSTANT -> constantParameters.add(pythonParameter)
                PythonParameterAssignment.ATTRIBUTE -> attributeParameters.add(pythonParameter)
                PythonParameterAssignment.POSITION_ONLY -> throw RuntimeException(
                    "Position_only parameters must not exist after executing ParameterAnnotationProcessor"
                )
            }
        })
        orderedParameters.addAll(implicitParameters)
        orderedParameters.addAll(requiredParameters)
        orderedParameters.addAll(optionalParameters)
        orderedParameters.addAll(constantParameters)
        orderedParameters.addAll(attributeParameters)
        return orderedParameters
    }
}
