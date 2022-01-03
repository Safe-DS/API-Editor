package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.mutable_model.MutablePythonAttribute
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class BoundaryAnnotationProcessorTest {
    private lateinit var pythonAttribute: MutablePythonAttribute
    private lateinit var pythonParameter: MutablePythonParameter
    private lateinit var pythonPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        pythonAttribute = MutablePythonAttribute("testAttribute")
        pythonParameter = MutablePythonParameter("testParameter")
        pythonPackage = MutablePythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                MutablePythonModule(
                    name = "testModule",
                    classes = listOf(
                        MutablePythonClass(
                            name = "testClass",
                            attributes = listOf(pythonAttribute)
                        )
                    ),
                    functions = listOf(
                        MutablePythonFunction(
                            name = "testFunction",
                            parameters = listOf(pythonParameter)
                        )
                    )
                )
            )
        )
    }

    @Test
    fun `should add boundary to attributes`() {
        pythonAttribute.annotations.add(
            BoundaryAnnotation(
                true,
                0.0,
                ComparisonOperator.UNRESTRICTED,
                0.0,
                ComparisonOperator.UNRESTRICTED
            )
        )

        pythonPackage.processBoundaryAnnotations()

        pythonAttribute.boundary shouldBe Boundary(
            true,
            0.0,
            ComparisonOperator.UNRESTRICTED,
            0.0,
            ComparisonOperator.UNRESTRICTED
        )
    }

    @Test
    fun `should remove all BoundaryAnnotations from attributes`() {
        pythonAttribute.annotations.add(
            BoundaryAnnotation(
                true,
                0.0,
                ComparisonOperator.UNRESTRICTED,
                0.0,
                ComparisonOperator.UNRESTRICTED
            )
        )

        pythonPackage.processBoundaryAnnotations()

        pythonAttribute.annotations
            .filterIsInstance<BoundaryAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should add boundary to parameters`() {
        pythonParameter.annotations.add(
            BoundaryAnnotation(
                isDiscrete = true,
                lowerIntervalLimit = 2.0,
                lowerLimitType = ComparisonOperator.LESS_THAN,
                upperIntervalLimit = 10.0,
                upperLimitType = ComparisonOperator.LESS_THAN
            )
        )

        pythonPackage.processBoundaryAnnotations()

        pythonParameter.boundary shouldBe Boundary(
            isDiscrete = true,
            lowerIntervalLimit = 2.0,
            lowerLimitType = ComparisonOperator.LESS_THAN,
            upperIntervalLimit = 10.0,
            upperLimitType = ComparisonOperator.LESS_THAN
        )
    }

    @Test
    fun `should remove all BoundaryAnnotations from parameters`() {
        pythonParameter.annotations.add(
            BoundaryAnnotation(
                isDiscrete = true,
                lowerIntervalLimit = 2.0,
                lowerLimitType = ComparisonOperator.LESS_THAN,
                upperIntervalLimit = 10.0,
                upperLimitType = ComparisonOperator.LESS_THAN
            )
        )

        pythonPackage.processBoundaryAnnotations()

        pythonParameter.annotations
            .filterIsInstance<BoundaryAnnotation>()
            .shouldBeEmpty()
    }
}
