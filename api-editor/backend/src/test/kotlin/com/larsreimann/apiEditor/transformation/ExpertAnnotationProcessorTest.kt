package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.ExpertAnnotation
import com.larsreimann.apiEditor.mutableModel.PythonClass
import com.larsreimann.apiEditor.mutableModel.PythonFunction
import com.larsreimann.apiEditor.mutableModel.PythonModule
import com.larsreimann.apiEditor.mutableModel.PythonPackage
import com.larsreimann.apiEditor.mutableModel.PythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class ExpertAnnotationProcessorTest {
    private lateinit var testParameter: PythonParameter
    private lateinit var testFunction: PythonFunction
    private lateinit var testClass: PythonClass
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testParameter = PythonParameter(name = "testParameter")
        testFunction = PythonFunction(name = "testFunction", parameters = listOf(testParameter))
        testClass = PythonClass(name = "TestClass")
        testPackage = PythonPackage(
            "testPackage",
            "testPackage",
            "1.0.0",
            modules = listOf(
                PythonModule(
                    "testModule",
                    functions = listOf(testFunction),
                    classes = listOf(testClass)
                ),
            ),
        )
    }

    @Test
    fun `should process ExpertAnnotations of classes`() {
        testClass.annotations += ExpertAnnotation

        testPackage.processExpertAnnotations()

        testClass.isExpert shouldBe true
    }

    @Test
    fun `should remove ExpertAnnotations of classes`() {
        testClass.annotations += ExpertAnnotation

        testPackage.processExpertAnnotations()

        testClass.annotations
            .filterIsInstance<ExpertAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process ExpertAnnotations of functions`() {
        testFunction.annotations += ExpertAnnotation

        testPackage.processExpertAnnotations()

        testFunction.isExpert shouldBe true
    }

    @Test
    fun `should remove ExpertAnnotations of functions`() {
        testFunction.annotations += ExpertAnnotation

        testPackage.processExpertAnnotations()

        testFunction.annotations
            .filterIsInstance<ExpertAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process ExpertAnnotations of parameters`() {
        testParameter.annotations += ExpertAnnotation

        testPackage.processExpertAnnotations()

        testParameter.isExpert shouldBe true
    }

    @Test
    fun `should remove ExpertAnnotations of parameters`() {
        testParameter.annotations += ExpertAnnotation

        testPackage.processExpertAnnotations()

        testParameter.annotations
            .filterIsInstance<ExpertAnnotation>()
            .shouldBeEmpty()
    }
}
