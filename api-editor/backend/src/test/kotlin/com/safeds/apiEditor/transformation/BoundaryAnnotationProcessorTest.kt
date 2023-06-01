package com.safeds.apiEditor.transformation

import com.safeds.apiEditor.model.Boundary
import com.safeds.apiEditor.model.BoundaryAnnotation
import com.safeds.apiEditor.model.ComparisonOperator
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonModule
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class BoundaryAnnotationProcessorTest {
    private lateinit var testParameter: PythonParameter
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testParameter = PythonParameter(
            name = "testParameter",
            annotations = mutableListOf(
                BoundaryAnnotation(
                    isDiscrete = true,
                    lowerIntervalLimit = 0.0,
                    lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                    upperIntervalLimit = 1.0,
                    upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                ),
            ),
        )
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                PythonModule(
                    name = "testModule",
                    functions = listOf(
                        PythonFunction(
                            name = "testFunction",
                            parameters = listOf(testParameter),
                        ),
                    ),
                ),
            ),
        )
    }

    @Test
    fun `should process BoundaryAnnotations`() {
        testPackage.processBoundaryAnnotations()

        testParameter.boundary shouldBe Boundary(
            isDiscrete = true,
            lowerIntervalLimit = 0.0,
            lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
            upperIntervalLimit = 1.0,
            upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
        )
    }

    @Test
    fun `should remove BoundaryAnnotations`() {
        testPackage.processBoundaryAnnotations()

        testParameter.annotations
            .filterIsInstance<BoundaryAnnotation>()
            .shouldBeEmpty()
    }
}