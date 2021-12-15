package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PureAnnotation
import com.larsreimann.api_editor.util.createAnnotatedPythonFunction
import com.larsreimann.api_editor.util.createAnnotatedPythonModule
import com.larsreimann.api_editor.util.createAnnotatedPythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test

class PureAnnotationProcessorTest {

    @Test
    fun `should mark functions as pure`() {
        val annotatedFunction = createAnnotatedPythonFunction("testFunction").apply {
            annotations += PureAnnotation
        }

        val annotatedPackage = createAnnotatedPythonPackage(
            "testPackage",
            modules = listOf(
                createAnnotatedPythonModule(
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
        val annotatedFunction = createAnnotatedPythonFunction("testFunction").apply {
            annotations += PureAnnotation
        }

        val annotatedPackage = createAnnotatedPythonPackage(
            "testPackage",
            modules = listOf(
                createAnnotatedPythonModule(
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
