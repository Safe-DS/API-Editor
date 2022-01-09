package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.RenameAnnotation
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class RenameAnnotationProcessorTest {
    private lateinit var testClass: PythonClass
    private lateinit var testFunction: PythonFunction
    private lateinit var testParameter: PythonParameter
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testClass = PythonClass(
            name = "TestClass",
            annotations = mutableListOf(RenameAnnotation("NewTestClass"))
        )
        testFunction = PythonFunction(
            name = "testFunction",
            annotations = mutableListOf(RenameAnnotation("newTestFunction"))
        )
        testParameter = PythonParameter(
            name = "testParameter",
            annotations = mutableListOf(RenameAnnotation("newTestParameter"))
        )

        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                PythonModule(
                    name = "testModule",
                    classes = listOf(testClass),
                    functions = listOf(
                        testFunction,
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
