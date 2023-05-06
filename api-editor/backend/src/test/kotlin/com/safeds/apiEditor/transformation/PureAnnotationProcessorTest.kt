package com.safeds.apiEditor.transformation

import com.safeds.apiEditor.model.PureAnnotation
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonModule
import com.safeds.apiEditor.mutableModel.PythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class PureAnnotationProcessorTest {
    private lateinit var testFunction: PythonFunction
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testFunction = PythonFunction(
            name = "testFunction",
            annotations = mutableListOf(PureAnnotation),
        )
        testPackage = PythonPackage(
            "testPackage",
            "testPackage",
            "1.0.0",
            modules = listOf(
                PythonModule(
                    "testModule",
                    functions = listOf(testFunction),
                ),
            ),
        )
    }

    @Test
    fun `should process PureAnnotations`() {
        testPackage.processPureAnnotations()

        testFunction.isPure shouldBe true
    }

    @Test
    fun `should remove PureAnnotations`() {
        testPackage.processPureAnnotations()

        testFunction.annotations
            .filterIsInstance<PureAnnotation>()
            .shouldBeEmpty()
    }
}
