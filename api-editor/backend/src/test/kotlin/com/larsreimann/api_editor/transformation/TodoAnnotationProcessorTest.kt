package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.TodoAnnotation
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class TodoAnnotationProcessorTest {
    private lateinit var testClass: PythonClass
    private lateinit var testFunction: PythonFunction
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testClass = PythonClass(
            name = "TestClass",
            annotations = mutableListOf(TodoAnnotation("Refactor class"))
        )
        testFunction = PythonFunction(
            name = "testFunction",
            annotations = mutableListOf(TodoAnnotation("Refactor function"))
        )
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                PythonModule(
                    name = "testModule",
                    classes = listOf(testClass),
                    functions = listOf(testFunction)
                )
            )
        )
    }

    @Test
    fun `should process TodoAnnotation of classes`() {
        testPackage.processTodoAnnotations()

        testClass.todo shouldBe "Refactor class"
    }

    @Test
    fun `should remove TodoAnnotation of classes`() {
        testPackage.processTodoAnnotations()

        testClass.annotations
            .filterIsInstance<TodoAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process TodoAnnotation of functions`() {
        testPackage.processTodoAnnotations()

        testFunction.todo shouldBe "Refactor function"
    }

    @Test
    fun `should remove TodoAnnotation of functions`() {
        testPackage.processTodoAnnotations()

        testFunction.annotations
            .filterIsInstance<TodoAnnotation>()
            .shouldBeEmpty()
    }
}
