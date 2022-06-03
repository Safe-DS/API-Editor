package com.larsreimann.api_editor.validation

import com.larsreimann.api_editor.model.AnnotationTarget
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.model.SerializablePythonParameter

class AnnotationValidator(private val annotatedPythonPackage: SerializablePythonPackage) {
    private val validationErrors = mutableListOf<AnnotationError>()
    private val groupAnnotationName = "Group"

    /**
     * Validates the classes annotated python package and returns validation errors.
     *
     * @return the validation errors found
     */
    fun validate(): List<AnnotationError> {
        validationErrors.clear()
        validatePackage()
        return validationErrors
    }

    private fun validatePackage() {
        annotatedPythonPackage.modules.forEach { validateModule(it) }
    }

    private fun validateModule(annotatedPythonModule: SerializablePythonModule) {
        annotatedPythonModule.classes.forEach { validateClass(it) }
        annotatedPythonModule.functions.forEach { validateGlobalFunction(it) }
    }

    private fun validateClass(annotatedPythonClass: SerializablePythonClass) {
        annotatedPythonClass.methods.forEach { validateMethod(it) }

        validateAnnotationsValidOnTarget(
            annotatedPythonClass.annotations,
            AnnotationTarget.CLASS,
            annotatedPythonClass.qualifiedName
        )
        validateAnnotationCombinations(
            annotatedPythonClass.annotations,
            annotatedPythonClass.qualifiedName
        )
    }

    private fun validateMethod(annotatedPythonFunction: SerializablePythonFunction) {
        val groupedParameterNames = getParameterNamesInGroups(annotatedPythonFunction.annotations)
        if (annotatedPythonFunction.isConstructor()) {
            annotatedPythonFunction.parameters.forEach {
                validateConstructorParameter(it, groupedParameterNames.contains(it.name))
            }
        } else {
            annotatedPythonFunction.parameters.forEach {
                validateFunctionParameter(it, groupedParameterNames.contains(it.name))
            }
        }

        validateAnnotationsValidOnTarget(
            annotatedPythonFunction.annotations,
            AnnotationTarget.METHOD,
            annotatedPythonFunction.qualifiedName
        )
        validateAnnotationCombinations(
            annotatedPythonFunction.annotations,
            annotatedPythonFunction.qualifiedName
        )
    }

    private fun validateGlobalFunction(annotatedPythonFunction: SerializablePythonFunction) {
        val groupedParameterNames = getParameterNamesInGroups(annotatedPythonFunction.annotations)
        annotatedPythonFunction.parameters.forEach {
            validateFunctionParameter(it, groupedParameterNames.contains(it.name))
        }

        validateAnnotationsValidOnTarget(
            annotatedPythonFunction.annotations,
            AnnotationTarget.GLOBAL_FUNCTION,
            annotatedPythonFunction.qualifiedName
        )
        validateAnnotationCombinations(
            annotatedPythonFunction.annotations,
            annotatedPythonFunction.qualifiedName
        )
    }

    private fun validateFunctionParameter(
        annotatedPythonParameter: SerializablePythonParameter,
        parameterInGroup: Boolean
    ) {
        validateAnnotationsValidOnTarget(
            annotatedPythonParameter.annotations,
            AnnotationTarget.FUNCTION_PARAMETER,
            annotatedPythonParameter.qualifiedName
        )
        validateAnnotationCombinations(
            annotatedPythonParameter.annotations,
            annotatedPythonParameter.qualifiedName
        )

        if (parameterInGroup) {
            validateGroupCombinations(
                annotatedPythonParameter.qualifiedName,
                annotatedPythonParameter.annotations
            )
        }
    }

    private fun validateConstructorParameter(
        annotatedPythonParameter: SerializablePythonParameter,
        parameterInGroup: Boolean
    ) {
        validateAnnotationsValidOnTarget(
            annotatedPythonParameter.annotations,
            AnnotationTarget.CONSTRUCTOR_PARAMETER,
            annotatedPythonParameter.qualifiedName
        )
        validateAnnotationCombinations(
            annotatedPythonParameter.annotations,
            annotatedPythonParameter.qualifiedName
        )

        if (parameterInGroup) {
            validateGroupCombinations(
                annotatedPythonParameter.qualifiedName,
                annotatedPythonParameter.annotations
            )
        }
    }

    private fun validateAnnotationsValidOnTarget(
        editorAnnotations: Iterable<EditorAnnotation>,
        target: AnnotationTarget,
        qualifiedName: String
    ) {
        for (editorAnnotation in editorAnnotations) {
            if (!editorAnnotation.isApplicableTo(target)) {
                validationErrors.add(AnnotationTargetError(qualifiedName, editorAnnotation.type, target))
            }
        }
    }

    private fun getParameterNamesInGroups(editorAnnotations: List<EditorAnnotation>): Set<String> {
        return editorAnnotations
            .filterIsInstance<GroupAnnotation>()
            .flatMap { it.parameters }
            .toSet()
    }

    private fun validateAnnotationCombinations(editorAnnotations: List<EditorAnnotation>, qualifiedName: String) {
        for (i in editorAnnotations.indices) {
            for (j in i + 1 until editorAnnotations.size) {
                validateAnnotationCombination(qualifiedName, editorAnnotations[i], editorAnnotations[j])
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
        if (firstAnnotationName !in possibleCombinations || secondAnnotationName !in possibleCombinations[firstAnnotationName]!!) {
            validationErrors.add(AnnotationCombinationError(qualifiedName, firstAnnotationName, secondAnnotationName))
        }
    }

    private fun validateGroupCombinations(qualifiedName: String, editorAnnotations: List<EditorAnnotation>) {
        editorAnnotations.forEach {
            val annotationName = it.type
            if (annotationName !in possibleCombinations[groupAnnotationName]!!) {
                validationErrors.add(GroupAnnotationCombinationError(qualifiedName, annotationName))
            }
        }
    }

    companion object {
        private var possibleCombinations = buildMap<String, Set<String>> {
            this["Attribute"] = mutableSetOf("Description", "Rename", "Todo")
            this["Boundary"] = mutableSetOf("Description", "Group", "Optional", "Rename", "Required", "Todo")
            this["CalledAfter"] = mutableSetOf("CalledAfter", "Description", "Group", "Move", "Pure", "Rename")
            this["Constant"] = mutableSetOf()
            this["Description"] = mutableSetOf(
                "Attribute",
                "Boundary",
                "CalledAfter",
                "Enum",
                "Group",
                "Move",
                "Optional",
                "Pure",
                "Rename",
                "Required", "Todo"
            )
            this["Enum"] = mutableSetOf("Description", "Group", "Rename", "Required", "Todo")
            this["Group"] =
                mutableSetOf(
                    "Boundary",
                    "CalledAfter",
                    "Description",
                    "Enum",
                    "Group",
                    "Move",
                    "Optional",
                    "Pure",
                    "Rename",
                    "Required",
                    "Todo"
                )
            this["Move"] = mutableSetOf("CalledAfter", "Description", "Group", "Pure", "Rename")
            this["Optional"] = mutableSetOf("Boundary", "Description", "Group", "Rename", "Todo")
            this["Pure"] = mutableSetOf("CalledAfter", "Description", "Group", "Move", "Rename")
            this["Remove"] = mutableSetOf()
            this["Rename"] = mutableSetOf(
                "Attribute",
                "Boundary",
                "CalledAfter",
                "Description",
                "Enum",
                "Group",
                "Move",
                "Optional",
                "Pure",
                "Required", "Todo"
            )
            this["Required"] = mutableSetOf("Boundary", "Description", "Enum", "Group", "Rename", "Todo")
            this["Todo"] = mutableSetOf(
                "Attribute",
                "Boundary",
                "Description",
                "Enum",
                "Group",
                "Optional",
                "Rename",
                "Required"
            )
        }
    }
}
