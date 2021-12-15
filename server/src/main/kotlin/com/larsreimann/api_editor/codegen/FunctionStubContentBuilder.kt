package com.larsreimann.api_editor.codegen

import com.google.inject.Inject
import com.larsreimann.api_editor.io.FileBuilder
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import java.util.function.Consumer

class FunctionStubContentBuilder
/**
 * Constructor for FunctionStubContentBuilder
 *
 * @param pythonFunction The function whose stub content should be built
 */(@field:Inject var pythonFunction: AnnotatedPythonFunction) : FileBuilder() {
    /**
     * Builds a string containing the formatted function content
     *
     * @return The string containing the formatted function content
     */
    fun buildFunction(): String {
        return (buildPureAnnotation()
            + "fun "
            + pythonFunction.name
            + "("
            + buildAllFunctionParameters()
            + ")"
            + buildAllFormattedResults())
    }

    private fun buildPureAnnotation(): String {
        return if (pythonFunction.isPure) {
            "@Pure\n"
        } else {
            ""
        }
    }

    private fun buildAllFunctionParameters(): String {
        val pythonParameters = pythonFunction.parameters
        if (pythonParameters.isEmpty()) {
            return ""
        }
        val formattedFunctionParameters: MutableList<String> = ArrayList()
        pythonParameters.forEach(Consumer { pythonParameter: AnnotatedPythonParameter ->
            formattedFunctionParameters
                .add(buildFormattedParameter(pythonParameter))
        })
        return java.lang.String.join(", ", formattedFunctionParameters)
    }

    private fun buildFormattedParameter(
        pythonParameter: AnnotatedPythonParameter
    ): String {
        var formattedParameter = pythonParameter.name + ": " + "Any?"
        val defaultValue = pythonParameter.defaultValue
        if (defaultValue != null
            && !defaultValue.isBlank()
        ) {
            formattedParameter = (formattedParameter
                + " or "
                + buildFormattedDefaultValue(defaultValue))
        }
        return formattedParameter
    }

    private fun buildAllFormattedResults(): String {
        val pythonResults = pythonFunction.results
        if (pythonResults.isEmpty()) {
            return ""
        }
        return if (pythonResults.size == 1) {
            (" -> "
                + buildFormattedResult(pythonResults[0]))
        } else {
            val formattedResults: MutableList<String> = ArrayList()
            pythonResults.forEach(Consumer { pythonResult: AnnotatedPythonResult ->
                formattedResults
                    .add(buildFormattedResult(pythonResult))
            })
            val resultsAsString = java.lang.String.join(", ", formattedResults)
            " -> [$resultsAsString]"
        }
    }

    private fun buildFormattedResult(
        pythonResult: AnnotatedPythonResult
    ): String {
        return (pythonResult.name
            + ": "
            + pythonResult.type)
    }
}
