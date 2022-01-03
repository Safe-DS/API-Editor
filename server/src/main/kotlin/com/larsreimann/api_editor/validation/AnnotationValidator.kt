package com.larsreimann.api_editor.validation

import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.AnnotationTarget
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.GroupAnnotation

class AnnotationValidator(private val annotatedPythonPackage: SerializablePythonPackage) {
    private val validationErrors: MutableList<AnnotationError>
    private val groupAnnotationName = "Group"

    init {
        validationErrors = ArrayList()
    }

    /**
     * Validates the classes annotated python package and returns validation errors.
     *
     * @return the validation errors found
     */
    fun validate(): List<AnnotationError> {
        validatePackage()
        return validationErrors
    }

    private fun validatePackage() {
        annotatedPythonPackage.modules.forEach { annotatedPythonModule: SerializablePythonModule ->
            validateModule(
                annotatedPythonModule
            )
        }
    }

    private fun validateModule(annotatedPythonModule: SerializablePythonModule) {
        annotatedPythonModule.classes.forEach { annotatedPythonClass: SerializablePythonClass ->
            validateClass(
                annotatedPythonClass
            )
        }
        annotatedPythonModule.functions.forEach { annotatedPythonFunction: SerializablePythonFunction ->
            validateGlobalFunction(
                annotatedPythonFunction
            )
        }
    }

    private fun validateClass(annotatedPythonClass: SerializablePythonClass) {
        annotatedPythonClass.methods.forEach { annotatedPythonFunction: SerializablePythonFunction ->
            validateMethod(
                annotatedPythonFunction
            )
        }
        val classAnnotations: List<EditorAnnotation> = annotatedPythonClass.annotations
        validateAnnotationsValidOnTarget(
            classAnnotations,
            AnnotationTarget.CLASS, annotatedPythonClass.qualifiedName
        )
        validateAnnotationCombinations(
            classAnnotations,
            annotatedPythonClass.qualifiedName
        )
    }

    private fun validateMethod(annotatedPythonFunction: SerializablePythonFunction) {
        val groupedParameterNames = getParameterNamesInGroups(
            annotatedPythonFunction.annotations
        )
        if (annotatedPythonFunction.isConstructor()) {
            annotatedPythonFunction.parameters.forEach { parameter: SerializablePythonParameter ->
                validateConstructorParameter(
                    parameter,
                    groupedParameterNames.contains(parameter.name)
                )
            }
        } else {
            annotatedPythonFunction.parameters.forEach { parameter: SerializablePythonParameter ->
                validateFunctionParameter(
                    parameter,
                    groupedParameterNames.contains(parameter.name)
                )
            }
        }
        val functionAnnotations: List<EditorAnnotation> = annotatedPythonFunction.annotations
        validateAnnotationsValidOnTarget(
            functionAnnotations,
            AnnotationTarget.METHOD,
            annotatedPythonFunction.qualifiedName
        )
        validateAnnotationCombinations(
            functionAnnotations,
            annotatedPythonFunction.qualifiedName
        )
    }

    private fun validateGlobalFunction(
        annotatedPythonFunction: SerializablePythonFunction
    ) {
        val groupedParameterNames = getParameterNamesInGroups(annotatedPythonFunction.annotations)
        annotatedPythonFunction.parameters.forEach {
            validateFunctionParameter(
                it,
                groupedParameterNames.contains(it.name)
            )
        }
        val functionAnnotations: List<EditorAnnotation> = annotatedPythonFunction.annotations
        validateAnnotationsValidOnTarget(
            functionAnnotations,
            AnnotationTarget.GLOBAL_FUNCTION,
            annotatedPythonFunction.qualifiedName
        )
        validateAnnotationCombinations(
            functionAnnotations,
            annotatedPythonFunction.qualifiedName
        )
    }

    private fun validateFunctionParameter(
        annotatedPythonParameter: SerializablePythonParameter,
        parameterInGroup: Boolean
    ) {
        val parameterAnnotations: List<EditorAnnotation> = annotatedPythonParameter.annotations
        val qualifiedName = annotatedPythonParameter.qualifiedName
        validateAnnotationsValidOnTarget(
            parameterAnnotations,
            AnnotationTarget.FUNCTION_PARAMETER,
            qualifiedName
        )
        validateAnnotationCombinations(
            parameterAnnotations,
            qualifiedName
        )
        if (parameterInGroup) {
            validateGroupCombinations(qualifiedName, parameterAnnotations)
        }
    }

    private fun validateConstructorParameter(
        annotatedPythonParameter: SerializablePythonParameter,
        parameterInGroup: Boolean
    ) {
        val parameterAnnotations: List<EditorAnnotation> = annotatedPythonParameter.annotations
        val qualifiedName = annotatedPythonParameter.qualifiedName
        validateAnnotationsValidOnTarget(
            parameterAnnotations,
            AnnotationTarget.CONSTRUCTOR_PARAMETER,
            qualifiedName
        )
        validateAnnotationCombinations(
            parameterAnnotations,
            qualifiedName
        )
        if (parameterInGroup) {
            validateGroupCombinations(qualifiedName, parameterAnnotations)
        }
    }

    private fun validateAnnotationsValidOnTarget(
        editorAnnotations: Iterable<EditorAnnotation>,
        target: AnnotationTarget,
        qualifiedName: String
    ) {
        for (editorAnnotation in editorAnnotations) {
            if (!editorAnnotation.isApplicableTo(target)) {
                validationErrors.add(
                    AnnotationTargetError(
                        qualifiedName,
                        editorAnnotation.type,
                        target
                    )
                )
            }
        }
    }

    private fun getParameterNamesInGroups(
        editorAnnotations: List<EditorAnnotation>
    ): Set<String> {
        val groupAnnotations = getGroupAnnotations(
            editorAnnotations
        )
        if (groupAnnotations.isEmpty()) {
            return emptySet()
        }
        val groupedParameterNames: MutableSet<String> = HashSet()
        groupAnnotations.forEach { (_, parameters): GroupAnnotation ->
            groupedParameterNames.addAll(
                parameters
            )
        }
        return groupedParameterNames
    }

    private fun getGroupAnnotations(
        editorAnnotations: List<EditorAnnotation>
    ): List<GroupAnnotation> {
        val groupAnnotations: MutableList<GroupAnnotation> = ArrayList()
        editorAnnotations.forEach { annotation: EditorAnnotation ->
            if (annotation.type == "Group") {
                groupAnnotations.add(annotation as GroupAnnotation)
            }
        }
        return groupAnnotations
    }

    private fun validateAnnotationCombinations(
        editorAnnotations: List<EditorAnnotation>,
        qualifiedName: String
    ) {
        for (i in editorAnnotations.indices) {
            for (j in i + 1 until editorAnnotations.size) {
                validateAnnotationCombination(
                    qualifiedName,
                    editorAnnotations[i],
                    editorAnnotations[j]
                )
            }
        }
    }

    private fun validateAnnotationCombination(
        qualifiedName: String,
        firstAnnotation: EditorAnnotation,
        secondAnnotation: EditorAnnotation
    ) {
        val firstAnnotationName = firstAnnotation.type
        val secondAnnotationName = secondAnnotation.type
        if (possibleCombinations[firstAnnotationName]!!
            .isEmpty() ||
            !possibleCombinations[firstAnnotationName]!!.contains(secondAnnotationName)
        ) {
            validationErrors.add(
                AnnotationCombinationError(
                    qualifiedName,
                    firstAnnotationName,
                    secondAnnotationName
                )
            )
        }
    }

    private fun validateGroupCombinations(
        qualifiedName: String,
        editorAnnotations: List<EditorAnnotation>
    ) {
        editorAnnotations.forEach { editorAnnotation: EditorAnnotation ->
            val annotationName = editorAnnotation.type
            if (!possibleCombinations[groupAnnotationName]!!.contains(annotationName)
            ) {
                validationErrors.add(
                    GroupAnnotationCombinationError(
                        qualifiedName,
                        annotationName
                    )
                )
            }
        }
    }

    companion object {
        private var possibleCombinations: MutableMap<String, Set<String>> = HashMap()

        init {
            possibleCombinations["Attribute"] = mutableSetOf(
                "Boundary", "Enum", "Rename"
            )
            possibleCombinations["Boundary"] =
                mutableSetOf(
                    "Attribute", "Group", "Optional", "Rename", "Required"
                )
            possibleCombinations["CalledAfter"] = mutableSetOf(
                "CalledAfter", "Group", "Move", "Rename"
            )
            possibleCombinations["Constant"] = mutableSetOf()
            possibleCombinations["Enum"] =
                mutableSetOf(
                    "Attribute", "Group", "Optional", "Rename", "Required"
                )
            possibleCombinations["Group"] = mutableSetOf(
                "CalledAfter", "Group", "Move", "Rename"
            )
            possibleCombinations["Move"] =
                mutableSetOf(
                    "CalledAfter", "Group", "Rename"
                )
            possibleCombinations["Optional"] = mutableSetOf(
                "Boundary", "Enum", "Group", "Rename"
            )
            possibleCombinations["Rename"] =
                mutableSetOf(
                    "Attribute", "Boundary", "CalledAfter", "Enum", "Group", "Move", "Optional", "Required"
                )
            possibleCombinations["Required"] =
                mutableSetOf(
                    "Boundary", "Enum", "Group", "Rename"
                )
            possibleCombinations["Unused"] = mutableSetOf()
        }
    }
}
