package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.ConstantAnnotation
import com.larsreimann.api_editor.model.DefaultBoolean
import com.larsreimann.api_editor.model.DefaultString
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RequiredAnnotation
import com.larsreimann.api_editor.server.processPackage
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonPackage
import com.larsreimann.api_editor.util.createPythonParameter
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

internal class ParameterAnnotationProcessorTest {
    @Test
    fun optionalAnnotationChangesDefaultValuesAndAssignedByOfFunctionParameters() {
        // given
        val testParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            null
        )
        testParameter1.annotations.add(
            OptionalAnnotation(
                DefaultString("string")
            )
        )
        val testParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            null
        )
        testParameter2.annotations.add(
            OptionalAnnotation(
                DefaultBoolean(false)
            )
        )
        val testParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            null
        )
        val testFunction = createPythonFunction("testFunction")
        testFunction.parameters.add(testParameter1)
        testFunction.parameters.add(testParameter2)
        testFunction.parameters.add(testParameter3)
        val testModule = createPythonModule("testModule")
        testModule.functions.add(testFunction)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val (_, _, _, modules) = processPackage(testPackage)

        // then
        val expectedTestParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            "'string'",
            PythonParameterAssignment.NAME_ONLY
        )
        val expectedTestParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            "false",
            PythonParameterAssignment.NAME_ONLY
        )
        val expectedTestParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            null,
            PythonParameterAssignment.POSITION_OR_NAME
        )
        var testParameter1isContained = false
        var testParameter2isContained = false
        var testParameter3isContained = false
        val actualParameters: List<AnnotatedPythonParameter> = modules[0]
            .functions[0]
            .parameters
        for (actualParameter in actualParameters) {
            if (parameterIsEqual(expectedTestParameter1, actualParameter)) {
                testParameter1isContained = true
            } else if (parameterIsEqual(expectedTestParameter2, actualParameter)) {
                testParameter2isContained = true
            } else if (parameterIsEqual(expectedTestParameter3, actualParameter)) {
                testParameter3isContained = true
            }
        }
        Assertions.assertTrue(testParameter1isContained)
        Assertions.assertTrue(testParameter2isContained)
        Assertions.assertTrue(testParameter3isContained)
    }

    @Test
    fun constantAnnotationChangesDefaultValuesAndAssignedByOfFunctionParameters() {
        // given
        val testParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            null
        )
        testParameter1.annotations.add(
            ConstantAnnotation(
                DefaultString("string")
            )
        )
        val testParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            null
        )
        testParameter2.annotations.add(
            ConstantAnnotation(
                DefaultBoolean(false)
            )
        )
        val testParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            null
        )
        val testFunction = createPythonFunction("testFunction")
        testFunction.parameters.add(testParameter1)
        testFunction.parameters.add(testParameter2)
        testFunction.parameters.add(testParameter3)
        val testModule = createPythonModule("testModule")
        testModule.functions.add(testFunction)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val (_, _, _, modules) = processPackage(testPackage)

        // then
        val expectedTestParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            "'string'",
            PythonParameterAssignment.CONSTANT
        )
        val expectedTestParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            "false",
            PythonParameterAssignment.CONSTANT
        )
        val expectedTestParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            null,
            PythonParameterAssignment.POSITION_OR_NAME
        )
        var testParameter1isContained = false
        var testParameter2isContained = false
        var testParameter3isContained = false
        val actualParameters: List<AnnotatedPythonParameter> = modules[0]
            .functions[0]
            .parameters
        for (actualParameter in actualParameters) {
            if (parameterIsEqual(expectedTestParameter1, actualParameter)) {
                testParameter1isContained = true
            } else if (parameterIsEqual(expectedTestParameter2, actualParameter)) {
                testParameter2isContained = true
            } else if (parameterIsEqual(expectedTestParameter3, actualParameter)) {
                testParameter3isContained = true
            }
        }
        Assertions.assertTrue(testParameter1isContained)
        Assertions.assertTrue(testParameter2isContained)
        Assertions.assertTrue(testParameter3isContained)
    }

    @Test
    fun requiredAnnotationRemovesDefaultValuesAndAssignedByOfFunctionParameters() {
        // given
        val testParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            "'oldDefaultValue'"
        )
        testParameter1.annotations.add(
            RequiredAnnotation
        )
        val testParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            "'oldDefaultValue'"
        )
        testParameter2.annotations.add(
            RequiredAnnotation
        )
        val testParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            "'unchanged'"
        )
        val testFunction = createPythonFunction("testFunction")
        testFunction.parameters.add(testParameter1)
        testFunction.parameters.add(testParameter2)
        testFunction.parameters.add(testParameter3)
        val testModule = createPythonModule("testModule")
        testModule.functions.add(testFunction)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val (_, _, _, modules) = processPackage(testPackage)

        // then
        val expectedTestParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            null,
            PythonParameterAssignment.POSITION_OR_NAME
        )
        val expectedTestParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            null,
            PythonParameterAssignment.POSITION_OR_NAME
        )
        val expectedTestParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            "'unchanged'",
            PythonParameterAssignment.NAME_ONLY
        )
        var testParameter1isContained = false
        var testParameter2isContained = false
        var testParameter3isContained = false
        val actualParameters: List<AnnotatedPythonParameter> = modules[0]
            .functions[0]
            .parameters
        for (actualParameter in actualParameters) {
            if (parameterIsEqual(expectedTestParameter1, actualParameter)) {
                testParameter1isContained = true
            } else if (parameterIsEqual(expectedTestParameter2, actualParameter)) {
                testParameter2isContained = true
            } else if (parameterIsEqual(expectedTestParameter3, actualParameter)) {
                testParameter3isContained = true
            }
        }
        Assertions.assertTrue(testParameter1isContained)
        Assertions.assertTrue(testParameter2isContained)
        Assertions.assertTrue(testParameter3isContained)
    }

    @Test
    fun constantAndOptionalAndRequiredAnnotationChangesDefaultValuesAndAssignedByOfFunctionParameters() {
        // given
        val parameterAnnotationProcessor = ParameterAnnotationProcessor()
        val testParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            null
        )
        testParameter1.annotations.add(
            ConstantAnnotation(
                DefaultString("string")
            )
        )
        val testParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            null
        )
        testParameter2.annotations.add(
            OptionalAnnotation(
                DefaultString("string")
            )
        )
        val testParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            "'toRemove'"
        )
        testParameter3.annotations.add(
            RequiredAnnotation
        )
        val testFunction = createPythonFunction("testFunction")
        testFunction.parameters.add(testParameter1)
        testFunction.parameters.add(testParameter2)
        testFunction.parameters.add(testParameter3)
        val testModule = createPythonModule("testModule")
        testModule.functions.add(testFunction)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val (_, _, _, modules) = processPackage(testPackage)

        // then
        val expectedTestParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            "'string'",
            PythonParameterAssignment.CONSTANT
        )
        val expectedTestParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            "'string'",
            PythonParameterAssignment.NAME_ONLY
        )
        val expectedTestParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            null,
            PythonParameterAssignment.POSITION_OR_NAME
        )
        var testParameter1isContained = false
        var testParameter2isContained = false
        var testParameter3isContained = false
        val actualParameters: List<AnnotatedPythonParameter> = modules[0]
            .functions[0]
            .parameters
        for (actualParameter in actualParameters) {
            if (parameterIsEqual(expectedTestParameter1, actualParameter)) {
                testParameter1isContained = true
            } else if (parameterIsEqual(expectedTestParameter2, actualParameter)) {
                testParameter2isContained = true
            } else if (parameterIsEqual(expectedTestParameter3, actualParameter)) {
                testParameter3isContained = true
            }
        }
        Assertions.assertTrue(testParameter1isContained)
        Assertions.assertTrue(testParameter2isContained)
        Assertions.assertTrue(testParameter3isContained)
    }

    fun parameterIsEqual(
        firstParameter: AnnotatedPythonParameter,
        secondParameter: AnnotatedPythonParameter
    ): Boolean {
        if (firstParameter.name != secondParameter.name) {
            return false
        }
        if (firstParameter.qualifiedName != secondParameter.qualifiedName) {
            return false
        }
        if (firstParameter.defaultValue != null && secondParameter.defaultValue != null) {
            if (firstParameter.defaultValue != secondParameter.defaultValue) {
                return false
            }
        } else if (firstParameter.defaultValue == null &&
            secondParameter.defaultValue != null
        ) {
            return false
        } else if (secondParameter.defaultValue == null &&
            firstParameter.defaultValue != null
        ) {
            return false
        }
        if (firstParameter.assignedBy !== secondParameter.assignedBy) {
            return false
        }
        if (firstParameter.isPublic != secondParameter.isPublic) {
            return false
        }
        if (firstParameter.typeInDocs != secondParameter.typeInDocs) {
            return false
        }
        if (firstParameter.description != secondParameter.description) {
            return false
        }
        if (firstParameter.annotations.size != secondParameter.annotations.size) {
            return false
        }
        return if (!firstParameter.annotations.containsAll(secondParameter.annotations)) {
            false
        } else secondParameter.annotations.containsAll(firstParameter.annotations)
    }
}
