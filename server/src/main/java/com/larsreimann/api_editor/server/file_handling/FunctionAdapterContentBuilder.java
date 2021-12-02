package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter;
import com.larsreimann.api_editor.server.data.PythonParameterAssignment;

import java.util.ArrayList;
import java.util.List;

class FunctionAdapterContentBuilder extends FileBuilder {
    AnnotatedPythonFunction pythonFunction;

    /**
     * Constructor for FunctionAdapterContentBuilder
     *
     * @param pythonFunction The function whose adapter content should be built
     */
    public FunctionAdapterContentBuilder(
        AnnotatedPythonFunction pythonFunction
    ) {
        this.pythonFunction = pythonFunction;
    }

    /**
     * Builds a string containing the formatted function content
     *
     * @return The string containing the formatted function content
     */
    protected String buildFunction() {
        return "def "
            + pythonFunction.getName()
            + "("
            + buildFunctionParameters()
            + ")"
            + ":\n"
            + indent(buildFunctionBody());
    }

    private String buildFunctionParameters() {
        String formattedFunctionParameters = "";
        List<String> positionOnlyParameters = new ArrayList<>();
        List<String> positionOrNameParameters = new ArrayList<>();
        List<String> nameOnlyParameters = new ArrayList<>();
        pythonFunction.getParameters().forEach(pythonParameter -> {
            switch (pythonParameter.getAssignedBy()) {
                case POSITION_ONLY -> positionOnlyParameters
                    .add(buildFormattedParameter(pythonParameter));
                case POSITION_OR_NAME -> positionOrNameParameters
                    .add(buildFormattedParameter(pythonParameter));
                case NAME_ONLY -> nameOnlyParameters
                    .add(buildFormattedParameter(pythonParameter));
            }
        });
        boolean hasPositionOnlyParameters = !positionOnlyParameters.isEmpty();
        boolean hasPositionOrNameParameters = !positionOrNameParameters.isEmpty();
        boolean hasNameOnlyParameters = !nameOnlyParameters.isEmpty();

        if (hasPositionOnlyParameters) {
            formattedFunctionParameters =
                formattedFunctionParameters
                    + String.join(", ", positionOnlyParameters);
            if (hasPositionOrNameParameters) {
                formattedFunctionParameters =
                    formattedFunctionParameters
                        + ", /, ";
            }
            else if(hasNameOnlyParameters) {
                formattedFunctionParameters =
                    formattedFunctionParameters
                        + ", /";
            }
            else {
                formattedFunctionParameters =
                    formattedFunctionParameters
                        + ", /";
            }
        }
        if (hasPositionOrNameParameters) {
            formattedFunctionParameters =
                formattedFunctionParameters
                    + String.join(", ", positionOrNameParameters);
        }
        if (hasNameOnlyParameters) {
            if (hasPositionOnlyParameters || hasPositionOrNameParameters) {
                formattedFunctionParameters =
                    formattedFunctionParameters + ", *, ";
            }
            else {
                formattedFunctionParameters =
                    formattedFunctionParameters + "*, ";
            }
            formattedFunctionParameters =
                formattedFunctionParameters
                    + String.join(", ", nameOnlyParameters);
        }
        return formattedFunctionParameters;
    }

    private String buildFormattedParameter(AnnotatedPythonParameter pythonParameter) {
        String formattedParameter = pythonParameter.getName();
        String defaultValue = pythonParameter.getDefaultValue();
        if (defaultValue != null
            && !defaultValue.isBlank()) {
            formattedParameter = formattedParameter + "=" + defaultValue;
        }
        return formattedParameter;
    }

    private String buildFunctionBody() {
        return pythonFunction.getQualifiedName()
            + "("
            + buildFunctionParameterCall()
            + ")";
    }

    private String buildFunctionParameterCall() {
        List<String> formattedParameters = new ArrayList<>();
        pythonFunction.getParameters().forEach(pythonParameter -> {
            if (pythonParameter.getAssignedBy()
                == PythonParameterAssignment.NAME_ONLY) {
                formattedParameters.add(
                    pythonParameter.getName()
                        + "="
                        + pythonParameter.getName()
                );
            } else {
                formattedParameters.add(
                    pythonParameter.getName()
                );
            }
        });
        return String.join(", ", formattedParameters);
    }
}
