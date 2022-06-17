package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.DescriptionAnnotation
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class DescriptionAnnotationProcessorTest {
    private lateinit var testClass: PythonClass
    private lateinit var testFunction: PythonFunction
    private lateinit var testParameter: PythonParameter
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testClass = PythonClass(
            name = "TestClass",
            description = "Lorem ipsum",
            annotations = mutableListOf(DescriptionAnnotation("Important class"))
        )
        testParameter = PythonParameter(
            name = "testParameter",
            description = "Lorem ipsum",
            annotations = mutableListOf(DescriptionAnnotation("Important parameter"))
        )
        testFunction = PythonFunction(
            name = "testFunction",
            description = "Lorem ipsum",
            annotations = mutableListOf(DescriptionAnnotation("Important function")),
            parameters = mutableListOf(testParameter)
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
    fun `should process DescriptionAnnotation of classes`() {
        testPackage.processDescriptionAnnotations()

        testClass.description shouldBe "Important class"
    }

    @Test
    fun `should remove DescriptionAnnotation of classes`() {
        testPackage.processDescriptionAnnotations()

        testClass.annotations
            .filterIsInstance<DescriptionAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process DescriptionAnnotation of functions`() {
        testPackage.processDescriptionAnnotations()

        testFunction.description shouldBe "Important function"
    }

    @Test
    fun `should remove DescriptionAnnotation of functions`() {
        testPackage.processDescriptionAnnotations()

        testFunction.annotations
            .filterIsInstance<DescriptionAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process DescriptionAnnotation of parameters`() {
        testPackage.processDescriptionAnnotations()

        testParameter.description shouldBe "Important parameter"
    }

    @Test
    fun `should remove DescriptionAnnotation of parameters`() {
        testPackage.processDescriptionAnnotations()

        testParameter.annotations
            .filterIsInstance<DescriptionAnnotation>()
            .shouldBeEmpty()
    }
}
