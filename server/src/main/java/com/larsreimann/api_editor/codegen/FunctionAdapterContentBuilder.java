package com.larsreimann.api_editor.codegen;

import com.larsreimann.api_editor.io.FileBuilder;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonParameter;
import com.larsreimann.api_editor.model.PythonParameterAssignment;

import java.util.*;

public class FunctionAdapterContentBuilder extends FileBuilder {
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
    public String buildFunction(boolean isConstructor) {
        String constructorSuffix = "";
        if (isConstructor) {
            String constructorSeparator = "";
            String assignments = listToString(buildAttributeAssignments(), 1);
            if (!assignments.isBlank()) {
                constructorSeparator = "\n";
            }
            constructorSuffix = constructorSeparator + assignments;
        }

        return "def "
            + pythonFunction.getName()
            + "("
            + buildParameters()
            + ")"
            + ":\n"
            + indent(buildFunctionBody() + constructorSuffix);
    }

    private List<String> buildAttributeAssignments() {
        List<String> attributeAssignments = new ArrayList<>();
        for (AnnotatedPythonParameter parameterAttribute : pythonFunction.getParameters()) {
            if (parameterAttribute.getAssignedBy().equals(PythonParameterAssignment.ATTRIBUTE)) {
                attributeAssignments.add(
                    "self."
                        + parameterAttribute.getName()
                        + " = "
                        + parameterAttribute.getDefaultValue()
                );
            }
        }
        return attributeAssignments;
    }

    private String buildParameters() {
        String formattedFunctionParameters = "";
        List<String> implicitParameters = new ArrayList<>();
        List<String> positionOnlyParameters = new ArrayList<>();
        List<String> positionOrNameParameters = new ArrayList<>();
        List<String> nameOnlyParameters = new ArrayList<>();
        pythonFunction.getParameters().forEach(pythonParameter -> {
            switch (pythonParameter.getAssignedBy()) {
                case IMPLICIT -> implicitParameters
                    .add(buildFormattedParameter(pythonParameter));
                case POSITION_ONLY -> positionOnlyParameters
                    .add(buildFormattedParameter(pythonParameter));
                case POSITION_OR_NAME -> positionOrNameParameters
                    .add(buildFormattedParameter(pythonParameter));
                case NAME_ONLY -> nameOnlyParameters
                    .add(buildFormattedParameter(pythonParameter));
            }
        });
        // A function has at most one implicit parameter
        assert implicitParameters.size() < 2;
        boolean hasImplicitParameter = !implicitParameters.isEmpty();
        boolean hasPositionOnlyParameters = !positionOnlyParameters.isEmpty();
        boolean hasPositionOrNameParameters = !positionOrNameParameters.isEmpty();
        boolean hasNameOnlyParameters = !nameOnlyParameters.isEmpty();

        if (hasImplicitParameter) {
            formattedFunctionParameters =
                formattedFunctionParameters
                    + implicitParameters.get(0);
            if (
                hasPositionOnlyParameters ||
                    hasPositionOrNameParameters ||
                    hasNameOnlyParameters
            ) {
                formattedFunctionParameters =
                    formattedFunctionParameters + ", ";
            }
        }

        if (hasPositionOnlyParameters) {
            formattedFunctionParameters =
                formattedFunctionParameters
                    + String.join(", ", positionOnlyParameters);
            if (hasPositionOrNameParameters) {
                formattedFunctionParameters =
                    formattedFunctionParameters
                        + ", /, ";
            } else if (hasNameOnlyParameters) {
                formattedFunctionParameters =
                    formattedFunctionParameters
                        + ", /";
            } else {
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
            } else {
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
        if (defaultValue != null) {
            formattedParameter = formattedParameter + "=" + defaultValue;
        }
        return formattedParameter;
    }

    private String buildFunctionBody() {
        return Objects.requireNonNull(pythonFunction.getOriginalDeclaration()).getQualifiedName()
            + "("
            + buildParameterCall()
            + ")";
    }

    private String buildParameterCall() {
        List<String> formattedParameters = new ArrayList<>();
        Map<String, String> originalNameToValueMap = new HashMap<>();
        pythonFunction.getParameters().forEach(
            pythonParameter -> {
                String value;
                if (
                    pythonParameter.getAssignedBy().equals(PythonParameterAssignment.CONSTANT)
                        || pythonParameter.getAssignedBy().equals(PythonParameterAssignment.ATTRIBUTE)
                ) {
                    value = pythonParameter.getDefaultValue();
                } else {
                    value = pythonParameter.getName();
                }
                originalNameToValueMap.put(
                    Objects
                        .requireNonNull(pythonParameter.getOriginalDeclaration())
                        .getName(),
                    value
                );
            }
        );
        Objects.requireNonNull(pythonFunction.getOriginalDeclaration())
            .getParameters().stream()
            .filter(pythonParameter ->
                !pythonParameter.getAssignedBy()
                    .equals(PythonParameterAssignment.IMPLICIT)
            ).forEach(pythonParameter -> {
                if (pythonParameter.getAssignedBy()
                    == PythonParameterAssignment.NAME_ONLY) {
                    formattedParameters.add(
                        pythonParameter.getName()
                            + "="
                            + originalNameToValueMap.get(pythonParameter.getName())
                    );
                } else {
                    formattedParameters.add(
                        originalNameToValueMap.get(pythonParameter.getName())
                    );
                }
            });
        return String.join(", ", formattedParameters);
    }
}
