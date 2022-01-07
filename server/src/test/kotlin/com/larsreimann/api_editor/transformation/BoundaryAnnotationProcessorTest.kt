package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class BoundaryAnnotationProcessorTest {
    private lateinit var testParameter: MutablePythonParameter
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        testParameter = MutablePythonParameter(
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
        testPackage = MutablePythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                MutablePythonModule(
                    name = "testModule",
                    functions = listOf(
                        MutablePythonFunction(
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
