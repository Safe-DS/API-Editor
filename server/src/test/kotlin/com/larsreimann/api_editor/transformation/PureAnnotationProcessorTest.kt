package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PureAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class PureAnnotationProcessorTest {
    private lateinit var testFunction: MutablePythonFunction
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        testFunction = MutablePythonFunction(
            name = "testFunction",
            annotations = mutableListOf(PureAnnotation)
        )
        testPackage = MutablePythonPackage(
            "testPackage",
            "testPackage",
            "1.0.0",
            modules = listOf(
                MutablePythonModule(
                    "testModule",
                    functions = listOf(testFunction)
                )
            )
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
