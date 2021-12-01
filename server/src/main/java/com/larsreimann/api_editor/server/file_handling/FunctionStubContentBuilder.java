package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter;
import com.larsreimann.api_editor.server.data.AnnotatedPythonResult;

import java.util.ArrayList;
import java.util.List;

class FunctionStubContentBuilder extends FileBuilder {
    /**
     * Builds a string containing the formatted function content
     *
     * @param pythonFunction The function whose content is to be formatted
     *                       and returned
     * @return The string containing the formatted function content
     */
    protected static String buildFunction(AnnotatedPythonFunction pythonFunction) {
        return "fun "
            + pythonFunction.getName()
            + "("
            + buildAllFunctionParameters(pythonFunction.getParameters())
            + ")"
            + buildAllFormattedResults(pythonFunction.getResults());
    }

    private static String buildAllFunctionParameters(
        List<AnnotatedPythonParameter> pythonParameters
    ) {
        if (pythonParameters == null || pythonParameters.isEmpty()) {
            return "";
        }
        List<String> formattedFunctionParameters = new ArrayList<>();
        pythonParameters.forEach(pythonParameter ->
            formattedFunctionParameters
                .add(buildFormattedParameter(pythonParameter)));
        return String.join(", ", formattedFunctionParameters);
    }

    private static String buildFormattedParameter(
        AnnotatedPythonParameter pythonParameter
    ) {
        String formattedParameter = pythonParameter.getName() + ": " + "Any?";
        String defaultValue = pythonParameter.getDefaultValue();
        if (defaultValue != null
            && !defaultValue.isBlank()) {
            formattedParameter = formattedParameter + " or " + defaultValue;
        }
        return formattedParameter;
    }

    private static String buildAllFormattedResults(
        List<AnnotatedPythonResult> pythonResults
    ) {
        if (pythonResults == null || pythonResults.isEmpty()) {
            return "";
        }
        if (pythonResults.size() == 1) {
            return " -> "
                + buildFormattedResult(pythonResults.get(0));
        }
        else {
            List<String> formattedResults = new ArrayList<>();
            pythonResults.forEach(pythonResult -> formattedResults
                .add(buildFormattedResult(pythonResult)));
            String resultsAsString = String.join(", ", formattedResults);
            return " -> [" + resultsAsString + "]";
        }
    }

    private static String buildFormattedResult(
        AnnotatedPythonResult pythonResult
    ) {
        return pythonResult.getName()
            + ": "
            + pythonResult.getType();
    }
}
