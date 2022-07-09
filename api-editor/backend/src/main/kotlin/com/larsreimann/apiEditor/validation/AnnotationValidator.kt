package com.larsreimann.apiEditor.validation

import com.larsreimann.apiEditor.model.AnnotationTarget
import com.larsreimann.apiEditor.model.EditorAnnotation
import com.larsreimann.apiEditor.model.GroupAnnotation
import com.larsreimann.apiEditor.model.SerializablePythonClass
import com.larsreimann.apiEditor.model.SerializablePythonFunction
import com.larsreimann.apiEditor.model.SerializablePythonModule
import com.larsreimann.apiEditor.model.SerializablePythonPackage
import com.larsreimann.apiEditor.model.SerializablePythonParameter

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
            annotatedPythonClass.qualifiedName,
        )
        validateAnnotationCombinations(
            annotatedPythonClass.annotations,
            annotatedPythonClass.qualifiedName,
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
            annotatedPythonFunction.qualifiedName,
        )
        validateAnnotationCombinations(
            annotatedPythonFunction.annotations,
            annotatedPythonFunction.qualifiedName,
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
            annotatedPythonFunction.qualifiedName,
        )
        validateAnnotationCombinations(
            annotatedPythonFunction.annotations,
            annotatedPythonFunction.qualifiedName,
        )
    }

    private fun validateFunctionParameter(
        annotatedPythonParameter: SerializablePythonParameter,
        parameterInGroup: Boolean,
    ) {
        validateAnnotationsValidOnTarget(
            annotatedPythonParameter.annotations,
            AnnotationTarget.FUNCTION_PARAMETER,
            annotatedPythonParameter.qualifiedName,
        )
        validateAnnotationCombinations(
            annotatedPythonParameter.annotations,
            annotatedPythonParameter.qualifiedName,
        )

        if (parameterInGroup) {
            validateGroupCombinations(
                annotatedPythonParameter.qualifiedName,
                annotatedPythonParameter.annotations,
            )
        }
    }

    private fun validateConstructorParameter(
        annotatedPythonParameter: SerializablePythonParameter,
        parameterInGroup: Boolean,
    ) {
        validateAnnotationsValidOnTarget(
            annotatedPythonParameter.annotations,
            AnnotationTarget.CONSTRUCTOR_PARAMETER,
            annotatedPythonParameter.qualifiedName,
        )
        validateAnnotationCombinations(
            annotatedPythonParameter.annotations,
            annotatedPythonParameter.qualifiedName,
        )

        if (parameterInGroup) {
            validateGroupCombinations(
                annotatedPythonParameter.qualifiedName,
                annotatedPythonParameter.annotations,
            )
        }
    }

    private fun validateAnnotationsValidOnTarget(
        editorAnnotations: Iterable<EditorAnnotation>,
        target: AnnotationTarget,
        qualifiedName: String,
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
        secondAnnotation: EditorAnnotation,
    ) {
        val firstAnnotationName = firstAnnotation.type
        val secondAnnotationName = secondAnnotation.type
        val annotationPair = createAnnotationPair(firstAnnotationName, secondAnnotationName)

        if (annotationPair in forbiddenCombinations) {
            validationErrors.add(AnnotationCombinationError(qualifiedName, firstAnnotationName, secondAnnotationName))
        }
    }

    private fun validateGroupCombinations(qualifiedName: String, editorAnnotations: List<EditorAnnotation>) {
        editorAnnotations.forEach {
            val firstAnnotationName = it.type
            val secondAnnotationName = groupAnnotationName
            val annotationPair = createAnnotationPair(firstAnnotationName, secondAnnotationName)

            if (annotationPair in forbiddenCombinations) {
                validationErrors.add(GroupAnnotationCombinationError(qualifiedName, firstAnnotationName))
            }
        }
    }

    private fun createAnnotationPair(firstAnnotationName: String, secondAnnotationName: String): Pair<String, String> {
        return if (firstAnnotationName < secondAnnotationName) {
            firstAnnotationName to secondAnnotationName
        } else {
            secondAnnotationName to firstAnnotationName
        }
    }

    companion object {
        private val forbiddenCombinations = setOf(
            "Constant" to "Constant",
            "Constant" to "Enum",
            "Constant" to "Group",
            "Constant" to "Omitted",
            "Constant" to "Optional",
            "Constant" to "Required",
            "Enum" to "Optional",
            "Omitted" to "Omitted",
            "Optional" to "Optional",
            "Required" to "Required",
        )
    }
}
