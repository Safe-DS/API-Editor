package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.util.createPythonAttribute
import com.larsreimann.api_editor.util.createPythonClass
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonPackage
import com.larsreimann.api_editor.util.createPythonParameter
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class BoundaryAnnotationProcessorTest {
    @Test
    fun boundaryAnnotationAddsBoundaryToFunctionParameter1() {
        // given
        val testParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            null
        )
        testParameter1.annotations.add(
            BoundaryAnnotation(
                true,
                2.0,
                ComparisonOperator.LESS_THAN,
                10.0,
                ComparisonOperator.LESS_THAN
            )
        )
        val testFunction = createPythonFunction("testFunction")
        testFunction.parameters.add(testParameter1)
        val testModule = createPythonModule("testModule")
        testModule.functions.add(testFunction)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val boundaryAnnotationProcessor = BoundaryAnnotationProcessor()
        val (_, _, _, modules) = testPackage.accept(boundaryAnnotationProcessor)!!
        val modifiedParameter = modules[0]
            .functions[0]
            .parameters[0]
        val addedBoundary = modifiedParameter.boundary
        Assertions.assertNotNull(addedBoundary)
        val expectedIsDiscrete = true
        val expectedLowerIntervalLimit = 2.0
        val expectedUpperIntervalLimit = 10.0
        val expectedUpperLimitType = ComparisonOperator.LESS_THAN
        val expectedLowerLimitType = ComparisonOperator.LESS_THAN
        Assertions.assertEquals(expectedIsDiscrete, addedBoundary!!.isDiscrete)
        Assertions.assertEquals(expectedLowerIntervalLimit, addedBoundary.lowerIntervalLimit)
        Assertions.assertEquals(expectedUpperIntervalLimit, addedBoundary.upperIntervalLimit)
        Assertions.assertEquals(expectedLowerLimitType, addedBoundary.lowerLimitType)
        Assertions.assertEquals(expectedUpperLimitType, addedBoundary.upperLimitType)
    }

    @Test
    fun boundaryAnnotationAddsBoundaryToFunctionParameter2() {
        // given
        val testParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            null
        )
        testParameter1.annotations.add(
            BoundaryAnnotation(
                false,
                2.0,
                ComparisonOperator.LESS_THAN_OR_EQUALS,
                10.0,
                ComparisonOperator.LESS_THAN_OR_EQUALS
            )
        )
        val testFunction = createPythonFunction("testFunction")
        testFunction.parameters.add(testParameter1)
        val testModule = createPythonModule("testModule")
        testModule.functions.add(testFunction)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val boundaryAnnotationProcessor = BoundaryAnnotationProcessor()
        val (_, _, _, modules) = testPackage.accept(boundaryAnnotationProcessor)!!
        val modifiedParameter = modules[0]
            .functions[0]
            .parameters[0]
        val addedBoundary = modifiedParameter.boundary
        Assertions.assertNotNull(addedBoundary)
        val expectedIsDiscrete = false
        val expectedLowerIntervalLimit = 2.0
        val expectedUpperIntervalLimit = 10.0
        val expectedUpperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
        val expectedLowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
        Assertions.assertEquals(expectedIsDiscrete, addedBoundary!!.isDiscrete)
        Assertions.assertEquals(expectedLowerIntervalLimit, addedBoundary.lowerIntervalLimit)
        Assertions.assertEquals(expectedUpperIntervalLimit, addedBoundary.upperIntervalLimit)
        Assertions.assertEquals(expectedLowerLimitType, addedBoundary.lowerLimitType)
        Assertions.assertEquals(expectedUpperLimitType, addedBoundary.upperLimitType)
    }

    @Test
    fun boundaryAnnotationAddsBoundaryToAttribute() {
        // given
        val testAttribute = createPythonAttribute(
            "testAttribute",
            "testModule.testClass.testAttribute",
            null
        )
        testAttribute.annotations.add(
            BoundaryAnnotation(
                true,
                0.0,
                ComparisonOperator.UNRESTRICTED,
                0.0,
                ComparisonOperator.UNRESTRICTED
            )
        )
        val testClass = createPythonClass("testClass")
        testClass.attributes.add(testAttribute)
        val testModule = createPythonModule("testModule")
        testModule.classes.add(testClass)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val boundaryAnnotationProcessor = BoundaryAnnotationProcessor()
        val (_, _, _, modules) = testPackage.accept(boundaryAnnotationProcessor)!!
        val modifiedAttribute = modules[0]
            .classes[0]
            .attributes[0]
        val addedBoundary = modifiedAttribute.boundary
        Assertions.assertNotNull(addedBoundary)
        val expectedIsDiscrete = true
        val expectedUpperLimitType = ComparisonOperator.UNRESTRICTED
        val expectedLowerLimitType = ComparisonOperator.UNRESTRICTED
        Assertions.assertEquals(expectedIsDiscrete, addedBoundary!!.isDiscrete)
        Assertions.assertEquals(expectedLowerLimitType, addedBoundary.lowerLimitType)
        Assertions.assertEquals(expectedUpperLimitType, addedBoundary.upperLimitType)
    }
}
