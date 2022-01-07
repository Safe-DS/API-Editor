package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.RenameAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class RenameAnnotationProcessorTest {
    private lateinit var testClass: MutablePythonClass
    private lateinit var testFunction: MutablePythonFunction
    private lateinit var testParameter: MutablePythonParameter
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        testClass = MutablePythonClass(
            name = "TestClass",
            annotations = mutableListOf(RenameAnnotation("NewTestClass"))
        )
        testFunction = MutablePythonFunction(
            name = "testFunction",
            annotations = mutableListOf(RenameAnnotation("newTestFunction"))
        )
        testParameter = MutablePythonParameter(
            name = "testParameter",
            annotations = mutableListOf(RenameAnnotation("newTestParameter"))
        )

        testPackage = MutablePythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                MutablePythonModule(
                    name = "testModule",
                    classes = listOf(testClass),
                    functions = listOf(
                        testFunction,
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
    fun `should process RenameAnnotations of classes`() {
        testPackage.processRenameAnnotations()

        testClass.name shouldBe "NewTestClass"
    }

    @Test
    fun `should remove RenameAnnotations of classes`() {
        testPackage.processRenameAnnotations()

        testClass.annotations
            .filterIsInstance<RenameAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process RenameAnnotations of functions`() {
        testPackage.processRenameAnnotations()

        testFunction.name shouldBe "newTestFunction"
    }

    @Test
    fun `should remove RenameAnnotations of functions`() {
        testPackage.processRenameAnnotations()

        testFunction.annotations
            .filterIsInstance<RenameAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process RenameAnnotations of parameters`() {
        testPackage.processRenameAnnotations()

        testParameter.name shouldBe "newTestParameter"
    }

    @Test
    fun `should remove RenameAnnotations of parameters`() {
        testPackage.processRenameAnnotations()

        testParameter.annotations
            .filterIsInstance<RenameAnnotation>()
            .shouldBeEmpty()
    }
}
