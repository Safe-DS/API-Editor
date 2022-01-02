package com.larsreimann.api_editor.codegen;

import com.larsreimann.api_editor.io.FileBuilder;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonParameter;
import com.larsreimann.api_editor.model.Boundary;
import com.larsreimann.api_editor.model.ComparisonOperator;
import com.larsreimann.api_editor.model.PythonParameterAssignment;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

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
    public String buildFunction() {
        String constructorSuffix = "";
        if (pythonFunction.isConstructor()) {
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
        String formattedBoundaries = listToString(buildBoundaryChecks(), 1);
        if (!formattedBoundaries.isBlank()) {
            formattedBoundaries = formattedBoundaries + "\n";
        }
        return formattedBoundaries
            + Objects.requireNonNull(pythonFunction.getOriginalDeclaration()).getQualifiedName()
            + "("
            + buildParameterCall()
            + ")";
    }

    private List<String> buildBoundaryChecks() {
        List<String> formattedBoundaries = new ArrayList<>();
        for (AnnotatedPythonParameter pythonParameter :
            pythonFunction
                .getParameters()
                .stream()
                .filter(pythonParameter -> pythonParameter.getBoundary() != null).toList()) {
            Boundary boundary = pythonParameter.getBoundary();
            assert boundary != null;
            if (boundary.isDiscrete()) {
                formattedBoundaries.add(
                    "if not (isinstance("
                        + pythonParameter.getName()
                        + ", int) or (isinstance("
                        + pythonParameter.getName()
                        + ", float)"
                        + " and "
                        + pythonParameter.getName()
                        + ".is_integer())):\n"
                        + indent(
                        "raise ValueError('"
                            + pythonParameter.getName()
                            + " needs to be an integer, but {} was assigned."
                            + "'.format("
                            + pythonParameter.getName()
                            + "))"
                    )
                );
            }

            if (boundary.getLowerLimitType() != ComparisonOperator.UNRESTRICTED && boundary.getUpperLimitType() != ComparisonOperator.UNRESTRICTED) {
                formattedBoundaries.add(
                    "if not "
                        + boundary.getLowerIntervalLimit()
                        + " "
                        + boundary.getLowerLimitType().getOperator()
                        + " "
                        + pythonParameter.getName()
                        + " "
                        + boundary.getUpperLimitType().getOperator()
                        + " "
                        + boundary.getUpperIntervalLimit()
                        + ":\n"
                        + indent(
                            "raise ValueError('Valid values of "
                            + pythonParameter.getName()
                            + " must be in "
                            + boundary.asInterval()
                            + ", but {} was assigned."
                            + "'.format("
                            + pythonParameter.getName()
                            + "))"
                    )
                );
            } else if (boundary.getLowerLimitType() == ComparisonOperator.LESS_THAN) {
                formattedBoundaries.add(
                    "if not "
                        + boundary.getLowerIntervalLimit()
                        + " < "
                        + pythonParameter.getName()
                        + ":\n"
                        + indent(
                        "raise ValueError('Valid values of "
                            + pythonParameter.getName()
                            + " must be greater than "
                            + boundary.getLowerIntervalLimit()
                            + ", but {} was assigned."
                            + "'.format("
                            + pythonParameter.getName()
                            + "))"
                    )
                );
            } else if (boundary.getLowerLimitType() == ComparisonOperator.LESS_THAN_OR_EQUALS) {
                formattedBoundaries.add(
                    "if not "
                        + boundary.getLowerIntervalLimit()
                        + " <= "
                        + pythonParameter.getName()
                        + ":\n"
                        + indent(
                        "raise ValueError('Valid values of "
                            + pythonParameter.getName()
                            + " must be greater than or equal to "
                            + boundary.getLowerIntervalLimit()
                            + ", but {} was assigned."
                            + "'.format("
                            + pythonParameter.getName()
                            + "))"
                    )
                );
            }
            if (boundary.getUpperLimitType() == ComparisonOperator.LESS_THAN) {
                formattedBoundaries.add(
                    "if not "
                        + pythonParameter.getName()
                        + " < "
                        + boundary.getUpperIntervalLimit()
                        + ":\n"
                        + indent(
                        "raise ValueError('Valid values of "
                            + pythonParameter.getName()
                            + " must be less than "
                            + boundary.getUpperIntervalLimit()
                            + ", but {} was assigned."
                            + "'.format("
                            + pythonParameter.getName()
                            + "))"
                    )
                );
            } else if (boundary.getUpperLimitType() == ComparisonOperator.LESS_THAN) {
                formattedBoundaries.add(
                    "if not "
                        + pythonParameter.getName()
                        + " <= "
                        + boundary.getUpperIntervalLimit()
                        + ":\n"
                        + indent(
                        "raise ValueError('Valid values of "
                            + pythonParameter.getName()
                            + " must be less than or equal to "
                            + boundary.getUpperIntervalLimit()
                            + ", but {} was assigned."
                            + "'.format("
                            + pythonParameter.getName()
                            + "))"
                    )
                );
            }
        }
        return formattedBoundaries;
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
