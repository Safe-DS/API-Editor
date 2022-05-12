package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.UnusedAnnotation
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class UnusedAnnotationProcessorTest {
    private lateinit var testMethod: PythonFunction
    private lateinit var testGlobalFunction: PythonFunction
    private lateinit var testClass: PythonClass
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testMethod = PythonFunction(name = "testMethod")
        testGlobalFunction = PythonFunction(name = "testGlobalFunction")
        testClass = PythonClass(
            name = "TestClass",
            methods = listOf(testMethod)
        )
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                PythonModule(
                    name = "testModule",
                    classes = listOf(testClass),
                    functions = listOf(testGlobalFunction)
                )
            )
        )
    }

    @Test
    fun `should process UnusedAnnotations of classes`() {
        testClass.annotations += UnusedAnnotation

        testPackage.processUnusedAnnotations()

        val modules = testPackage.modules
        modules.shouldHaveSize(1)

        modules[0].classes.shouldBeEmpty()
    }

    @Test
    fun `should process UnusedAnnotations of global functions`() {
        testGlobalFunction.annotations += UnusedAnnotation

        testPackage.processUnusedAnnotations()

        val modules = testPackage.modules
        modules.shouldHaveSize(1)

        modules[0].functions.shouldBeEmpty()
    }

    @Test
    fun `should process UnusedAnnotations of methods`() {
        testMethod.annotations += UnusedAnnotation

        testPackage.processUnusedAnnotations()

        val modules = testPackage.modules
        modules.shouldHaveSize(1)

        val classes = modules[0].classes
        classes.shouldHaveSize(1)

        classes[0].methods.shouldBeEmpty()
    }
}
