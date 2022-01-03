package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PureAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class PureAnnotationProcessorTest {

    private lateinit var pythonFunction: MutablePythonFunction

    private lateinit var pythonPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        pythonFunction = MutablePythonFunction("testFunction").apply {
            annotations += PureAnnotation
        }

        pythonPackage = MutablePythonPackage(
            "testPackage",
            "testPackage",
            "1.0.0",
            modules = listOf(
                MutablePythonModule(
                    "testModule",
                    functions = listOf(pythonFunction)
                )
            )
        )
    }

    @Test
    fun `should mark functions as pure`() {
        pythonPackage.processPureAnnotations()

        pythonFunction.isPure shouldBe true
    }

    @Test
    fun `should remove all PureAnnotations from the annotation list`() {
        pythonPackage.processPureAnnotations()

        pythonFunction.annotations
            .filterIsInstance<PureAnnotation>()
            .shouldBeEmpty()
    }
}
