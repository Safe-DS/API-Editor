package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import java.util.Objects
import java.util.function.Consumer

/**
 * Constructor for FunctionAdapterContentBuilder
 *
 * @param pythonFunction The function whose adapter content should be built
 */
class FunctionAdapterContentBuilder(var pythonFunction: MutablePythonFunction) {

    /**
     * Builds a string containing the formatted function content
     *
     * @return The string containing the formatted function content
     */
    fun buildFunction(): String {
        var constructorSuffix = ""
        if (pythonFunction.isConstructor()) {
            var constructorSeparator = ""
            val assignments = listToString(buildAttributeAssignments(), 1)
            if (assignments.isNotBlank()) {
                constructorSeparator = "\n"
            }
            constructorSuffix = constructorSeparator + assignments
        }
        return """
              def ${pythonFunction.name}(${buildParameters()}):
              ${indent(buildFunctionBody() + constructorSuffix)}
              """.trimIndent()
    }

    private fun buildAttributeAssignments(): List<String> {
        val attributeAssignments: MutableList<String> = ArrayList()
        for ((name, defaultValue, assignedBy) in pythonFunction.parameters) {
            if (assignedBy == PythonParameterAssignment.ATTRIBUTE) {
                attributeAssignments.add(
                    "self."
                        + name
                        + " = "
                        + defaultValue
                )
            }
        }
        return attributeAssignments
    }

    private fun buildParameters(): String {
        var formattedFunctionParameters = ""
        val implicitParameters: MutableList<String> = ArrayList()
        val positionOnlyParameters: MutableList<String> = ArrayList()
        val positionOrNameParameters: MutableList<String> = ArrayList()
        val nameOnlyParameters: MutableList<String> = ArrayList()
        pythonFunction.parameters.forEach(Consumer { pythonParameter: MutablePythonParameter ->
            when (pythonParameter.assignedBy) {
                PythonParameterAssignment.IMPLICIT -> implicitParameters
                    .add(buildFormattedParameter(pythonParameter))
                PythonParameterAssignment.POSITION_ONLY -> positionOnlyParameters
                    .add(buildFormattedParameter(pythonParameter))
                PythonParameterAssignment.POSITION_OR_NAME -> positionOrNameParameters
                    .add(buildFormattedParameter(pythonParameter))
                PythonParameterAssignment.NAME_ONLY -> nameOnlyParameters
                    .add(buildFormattedParameter(pythonParameter))
                else -> {}
            }
        })
        assert(implicitParameters.size < 2)
        val hasImplicitParameter = implicitParameters.isNotEmpty()
        val hasPositionOnlyParameters = positionOnlyParameters.isNotEmpty()
        val hasPositionOrNameParameters = positionOrNameParameters.isNotEmpty()
        val hasNameOnlyParameters = nameOnlyParameters.isNotEmpty()
        if (hasImplicitParameter) {
            formattedFunctionParameters = (formattedFunctionParameters
                + implicitParameters[0])
            if (hasPositionOnlyParameters ||
                hasPositionOrNameParameters ||
                hasNameOnlyParameters
            ) {
                formattedFunctionParameters = "$formattedFunctionParameters, "
            }
        }
        if (hasPositionOnlyParameters) {
            formattedFunctionParameters = (formattedFunctionParameters
                + java.lang.String.join(", ", positionOnlyParameters))
            formattedFunctionParameters = if (hasPositionOrNameParameters) {
                (formattedFunctionParameters
                    + ", /, ")
            } else if (hasNameOnlyParameters) {
                (formattedFunctionParameters
                    + ", /")
            } else {
                (formattedFunctionParameters
                    + ", /")
            }
        }
        if (hasPositionOrNameParameters) {
            formattedFunctionParameters = (formattedFunctionParameters + java.lang.String.join(", ", positionOrNameParameters))
        }
        if (hasNameOnlyParameters) {
            formattedFunctionParameters = if (hasPositionOnlyParameters || hasPositionOrNameParameters) {
                "$formattedFunctionParameters, *, "
            } else {
                "$formattedFunctionParameters*, "
            }
            formattedFunctionParameters = (formattedFunctionParameters
                + java.lang.String.join(", ", nameOnlyParameters))
        }
        return formattedFunctionParameters
    }

    private fun buildFormattedParameter(pythonParameter: MutablePythonParameter): String {
        var formattedParameter = pythonParameter.name
        val defaultValue = pythonParameter.defaultValue
        if (defaultValue != null) {
            formattedParameter = "$formattedParameter=$defaultValue"
        }
        return formattedParameter
    }

    private fun buildFunctionBody(): String {
        var formattedBoundaries = listToString(buildBoundaryChecks(), 1)
        if (formattedBoundaries.isNotBlank()) {
            formattedBoundaries = """
                $formattedBoundaries

                """.trimIndent()
        }
        return (formattedBoundaries
            + Objects.requireNonNull(pythonFunction.originalDeclaration)!!.qualifiedName
            + "("
            + buildParameterCall()
            + ")")
    }

    private fun buildBoundaryChecks(): List<String> {
        val formattedBoundaries: MutableList<String> = ArrayList()
        pythonFunction
            .parameters
            .filter { (_, _, _, _, _, _, boundary): MutablePythonParameter -> boundary != null }
            .forEach { (name, _, _, _, _, _, boundary) ->
                assert(boundary != null)
                if (boundary!!.isDiscrete) {
                    formattedBoundaries.add(
                        """
                            if not (isinstance($name, int) or (isinstance($name, float) and $name.is_integer())):

                            """.trimIndent()
                            + indent(
                            "raise ValueError('"
                                + name
                                + " needs to be an integer, but {} was assigned."
                                + "'.format("
                                + name
                                + "))"
                        )
                    )
                }
                if (boundary.lowerLimitType !== ComparisonOperator.UNRESTRICTED && boundary.upperLimitType !== ComparisonOperator.UNRESTRICTED) {
                    formattedBoundaries.add(
                        """if not ${boundary.lowerIntervalLimit} ${boundary.lowerLimitType.operator} $name ${boundary.upperLimitType.operator} ${boundary.upperIntervalLimit}:
    """
                            + indent(
                            "raise ValueError('Valid values of "
                                + name
                                + " must be in "
                                + boundary.asInterval()
                                + ", but {} was assigned."
                                + "'.format("
                                + name
                                + "))"
                        )
                    )
                } else if (boundary.lowerLimitType === ComparisonOperator.LESS_THAN) {
                    formattedBoundaries.add(
                        """if not ${boundary.lowerIntervalLimit} < $name:
    """
                            + indent(
                            "raise ValueError('Valid values of "
                                + name
                                + " must be greater than "
                                + boundary.lowerIntervalLimit
                                + ", but {} was assigned."
                                + "'.format("
                                + name
                                + "))"
                        )
                    )
                } else if (boundary.lowerLimitType === ComparisonOperator.LESS_THAN_OR_EQUALS) {
                    formattedBoundaries.add(
                        """if not ${boundary.lowerIntervalLimit} <= $name:
    """
                            + indent(
                            "raise ValueError('Valid values of "
                                + name
                                + " must be greater than or equal to "
                                + boundary.lowerIntervalLimit
                                + ", but {} was assigned."
                                + "'.format("
                                + name
                                + "))"
                        )
                    )
                }
                if (boundary.upperLimitType === ComparisonOperator.LESS_THAN) {
                    formattedBoundaries.add(
                        """if not $name < ${boundary.upperIntervalLimit}:
    """
                            + indent(
                            "raise ValueError('Valid values of "
                                + name
                                + " must be less than "
                                + boundary.upperIntervalLimit
                                + ", but {} was assigned."
                                + "'.format("
                                + name
                                + "))"
                        )
                    )
                } else if (boundary.upperLimitType === ComparisonOperator.LESS_THAN) {
                    formattedBoundaries.add(
                        """if not $name <= ${boundary.upperIntervalLimit}:
    """
                            + indent(
                            "raise ValueError('Valid values of "
                                + name
                                + " must be less than or equal to "
                                + boundary.upperIntervalLimit
                                + ", but {} was assigned."
                                + "'.format("
                                + name
                                + "))"
                        )
                    )
                }
            }
        return formattedBoundaries
    }

    private fun buildParameterCall(): String {
        val formattedParameters: MutableList<String?> = ArrayList()
        val originalNameToValueMap: MutableMap<String, String?> = HashMap()
        pythonFunction.parameters.forEach { (name, defaultValue, assignedBy, _, _, _, _, _, originalDeclaration): MutablePythonParameter ->
            val value: String? =
                if (assignedBy == PythonParameterAssignment.CONSTANT || assignedBy == PythonParameterAssignment.ATTRIBUTE) {
                    defaultValue
                } else {
                    name
                }
            originalNameToValueMap[Objects.requireNonNull(originalDeclaration)!!.name] = value
        }
        Objects.requireNonNull(pythonFunction.originalDeclaration)!!.parameters.stream()
            .filter { (_, _, _, assignedBy): SerializablePythonParameter -> assignedBy != PythonParameterAssignment.IMPLICIT }
            .forEach { (name, _, _, assignedBy): SerializablePythonParameter ->
                if (assignedBy === PythonParameterAssignment.NAME_ONLY) {
                    formattedParameters.add(name + "=" + originalNameToValueMap[name])
                } else {
                    formattedParameters.add(originalNameToValueMap[name])
                }
            }
        return java.lang.String.join(", ", formattedParameters)
    }
}
