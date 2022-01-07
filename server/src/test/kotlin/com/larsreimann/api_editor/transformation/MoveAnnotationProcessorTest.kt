package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.MoveAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class MoveAnnotationProcessorTest {
    private lateinit var testClass: MutablePythonClass
    private lateinit var testFunction: MutablePythonFunction
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        testClass = MutablePythonClass(name = "TestClass")
        testFunction = MutablePythonFunction(name = "testFunction")
        testPackage = MutablePythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                MutablePythonModule(name = "existingTestModule"),
                MutablePythonModule(
                    name = "testModule",
                    classes = listOf(testClass),
                    functions = listOf(testFunction)
                )
            )
        )
    }

    @Test
    fun `should process MoveAnnotations of classes with an existing module as destination`() {
        testClass.annotations += MoveAnnotation("existingTestModule")

        testPackage.processMoveAnnotations()

        testClass.qualifiedName() shouldBe "existingTestModule.TestClass"
    }

    @Test
    fun `should process MoveAnnotations of classes with a new module as destination`() {
        testClass.annotations += MoveAnnotation("newTestModule")

        testPackage.processMoveAnnotations()

        testClass.qualifiedName() shouldBe "newTestModule.TestClass"
    }

    @Test
    fun `should remove MoveAnnotations of classes`() {
        testClass.annotations += MoveAnnotation("testModule")

        testPackage.processMoveAnnotations()

        testClass.annotations
            .filterIsInstance<MoveAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process MoveAnnotations of functions with an existing module as destination`() {
        testFunction.annotations += MoveAnnotation("existingTestModule")

        testPackage.processMoveAnnotations()

        testFunction.qualifiedName() shouldBe "existingTestModule.testFunction"
    }

    @Test
    fun `should process MoveAnnotations of functions with a new module as destination`() {
        testFunction.annotations += MoveAnnotation("newTestModule")

        testPackage.processMoveAnnotations()

        testFunction.qualifiedName() shouldBe "newTestModule.testFunction"
    }

    @Test
    fun `should remove MoveAnnotations of functions`() {
        testFunction.annotations += MoveAnnotation("testModule")

        testPackage.processMoveAnnotations()

        testFunction.annotations
            .filterIsInstance<MoveAnnotation>()
            .shouldBeEmpty()
    }
}
