package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter;
import com.larsreimann.api_editor.server.data.AnnotatedPythonResult;

import java.util.ArrayList;
import java.util.List;

class FunctionStubContentBuilder extends FileBuilder {
    AnnotatedPythonFunction pythonFunction;

    /**
     * Constructor for FunctionStubContentBuilder
     *
     * @param pythonFunction The function whose stub content should be built
     */
    public FunctionStubContentBuilder(AnnotatedPythonFunction pythonFunction) {
        this.pythonFunction = pythonFunction;
    }

    /**
     * Builds a string containing the formatted function content
     *
     * @return The string containing the formatted function content
     */
    protected String buildFunction() {
        return "fun "
            + pythonFunction.getName()
            + "("
            + buildAllFunctionParameters()
            + ")"
            + buildAllFormattedResults();
    }

    private String buildAllFunctionParameters() {
        List<AnnotatedPythonParameter> pythonParameters = pythonFunction.getParameters();
        if (pythonParameters.isEmpty()) {
            return "";
        }
        List<String> formattedFunctionParameters = new ArrayList<>();
        pythonParameters.forEach(pythonParameter ->
            formattedFunctionParameters
                .add(buildFormattedParameter(pythonParameter)));
        return String.join(", ", formattedFunctionParameters);
    }

    private String buildFormattedParameter(
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

    private String buildAllFormattedResults() {
        List<AnnotatedPythonResult> pythonResults = pythonFunction.getResults();
        if (pythonResults.isEmpty()) {
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

    private String buildFormattedResult(
        AnnotatedPythonResult pythonResult
    ) {
        return pythonResult.getName()
            + ": "
            + pythonResult.getType();
    }
}
