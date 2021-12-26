package com.larsreimann.api_editor.codegen;

import com.larsreimann.api_editor.io.FileBuilder;
import com.larsreimann.api_editor.model.AnnotatedPythonAttribute;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonParameter;
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
        return "def "
            + pythonFunction.getName()
            + "("
            + buildParameters()
            + ")"
            + ":\n"
            + indent(buildFunctionBody());
    }

    /**
     * Builds a string containing the formatted constructor
     *
     * @param attributes The attributes of the constructors class
     * @return The string containing the formatted constructor
     */
    public String buildConstructor(List<AnnotatedPythonAttribute> attributes) {
        return "def "
            + pythonFunction.getName()
            + "("
            + buildParameters()
            + ")"
            + ":\n"
            + indent(buildConstructorBody(attributes));
    }

    /**
     * Builds a string containing the formatted class method content
     *
     * @return The string containing the formatted class method content
     */
    public String buildMethod() {
        return "def "
            + pythonFunction.getName()
            + "("
            + buildParameters()
            + ")"
            + ":\n"
            + indent(buildMethodBody());
    }

    private String buildConstructorBody(
        List<AnnotatedPythonAttribute> attributes
    ) {
        String separator = "";
        String assignments = listToString(buildAttributeAssignments(attributes), 1);
        if (!assignments.isBlank()) {
            separator = "\n";
        }
        return Objects.requireNonNull(pythonFunction.getOriginalDeclaration()).getQualifiedName()
            + "("
            + buildParameterCall(true)
            + ")"
            + separator
            + assignments;
    }

    private List<String> buildAttributeAssignments(
        List<AnnotatedPythonAttribute> attributes
    ) {
        List<String> attributeAssignments = new ArrayList<>();
        for (AnnotatedPythonAttribute attribute : attributes) {
            attributeAssignments.add(
                "self."
                    + attribute.getName()
                    + " = "
                    + attribute.getDefaultValue()
            );
        }
        return attributeAssignments;
    }

    private String buildParameters() {
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
            + buildParameterCall(false)
            + ")";
    }

    private String buildMethodBody() {
        return Objects.requireNonNull(pythonFunction.getOriginalDeclaration()).getQualifiedName()
            + "("
            + buildParameterCall(true)
            + ")";
    }

    private String buildParameterCall(boolean isInClass) {
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
        // first parameter in classes is implicitly assigned
        int toSkip = 0;
        if (isInClass) {
            toSkip = 1;
        }
        Objects.requireNonNull(pythonFunction.getOriginalDeclaration())
            .getParameters().stream().skip(toSkip).forEach(pythonParameter -> {
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
