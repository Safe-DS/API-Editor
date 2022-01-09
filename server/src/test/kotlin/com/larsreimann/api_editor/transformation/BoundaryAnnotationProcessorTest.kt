package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
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
                    upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
                )
            )
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
                            parameters = listOf(testParameter)
                        )
                    )
                )
            )
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
            upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
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
