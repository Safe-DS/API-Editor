package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.MoveAnnotation
import com.larsreimann.apiEditor.mutableModel.PythonClass
import com.larsreimann.apiEditor.mutableModel.PythonFunction
import com.larsreimann.apiEditor.mutableModel.PythonModule
import com.larsreimann.apiEditor.mutableModel.PythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class MoveAnnotationProcessorTest {
    private lateinit var testClass: PythonClass
    private lateinit var testFunction: PythonFunction
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testClass = PythonClass(name = "TestClass")
        testFunction = PythonFunction(name = "testFunction")
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                PythonModule(name = "existingTestModule"),
                PythonModule(
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
