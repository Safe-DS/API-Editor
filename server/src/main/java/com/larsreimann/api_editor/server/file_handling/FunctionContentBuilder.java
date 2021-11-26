package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter;
import com.larsreimann.api_editor.server.data.PythonParameterAssignment;

import java.util.ArrayList;
import java.util.List;

public class FunctionContentBuilder extends PythonFileBuilder {
    public static String buildFunction(AnnotatedPythonFunction pythonFunction) {
        return "def "
            + pythonFunction.getName()
            + "("
            + buildFunctionParameters(pythonFunction.getParameters())
            + ")"
            + ":\n"
            + indent(buildFunctionBody(pythonFunction));
    }

    private static String buildFunctionParameters(
        List<AnnotatedPythonParameter> pythonParameters
    ) {
        String formattedFunctionParameters = "";
        List<String> positionOnlyParameters = new ArrayList<>();
        List<String> positionOrNameParameters = new ArrayList<>();
        List<String> nameOnlyParameters = new ArrayList<>();
        pythonParameters.forEach(pythonParameter -> {
            switch (pythonParameter.getAssignedBy()) {
                case POSITION_ONLY -> positionOnlyParameters
                    .add(pythonParameter.getName());
                case POSITION_OR_NAME -> positionOrNameParameters
                    .add(pythonParameter.getName());
                case NAME_ONLY -> nameOnlyParameters
                    .add(pythonParameter.getName());
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

    private static String buildFunctionBody(AnnotatedPythonFunction pythonFunction) {
        return pythonFunction.getQualifiedName()
            + "("
            + buildFunctionParameterCall(pythonFunction.getParameters())
            + ")";
    }

    private static String buildFunctionParameterCall(
        List<AnnotatedPythonParameter> pythonParameters
    ) {
        List<String> formattedParameters = new ArrayList<>();
        pythonParameters.forEach(pythonParameter -> {
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
