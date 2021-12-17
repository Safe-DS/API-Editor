package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PureAnnotation
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test

class PureAnnotationProcessorTest {

    @Test
    fun `should mark functions as pure`() {
        val annotatedFunction = createPythonFunction("testFunction").apply {
            annotations += PureAnnotation
        }

        val annotatedPackage = createPythonPackage(
            "testPackage",
            modules = listOf(
                createPythonModule(
                    "testModule",
                    functions = listOf(annotatedFunction)
                )
            )
        )

        annotatedPackage.accept(PureAnnotationProcessor)

        annotatedFunction.isPure shouldBe true
    }

    @Test
    fun `should remove all PureAnnotations from the annotation list`() {
        val annotatedFunction = createPythonFunction("testFunction").apply {
            annotations += PureAnnotation
        }

        val annotatedPackage = createPythonPackage(
            "testPackage",
            modules = listOf(
                createPythonModule(
                    "testModule",
                    functions = listOf(annotatedFunction)
                )
            )
        )

        annotatedPackage.accept(PureAnnotationProcessor)

        annotatedFunction.annotations
            .filterIsInstance<PureAnnotation>()
            .shouldBeEmpty()
    }
}
