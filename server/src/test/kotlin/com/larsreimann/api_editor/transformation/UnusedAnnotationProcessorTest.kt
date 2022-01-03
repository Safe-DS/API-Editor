package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.UnusedAnnotation
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class UnusedAnnotationProcessorTest {
    private lateinit var testMethod: MutablePythonFunction
    private lateinit var testGlobalFunction: MutablePythonFunction
    private lateinit var testClass: MutablePythonClass
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        testMethod = MutablePythonFunction(name = "testMethod")
        testGlobalFunction = MutablePythonFunction(name = "testGlobalFunction")
        testClass = MutablePythonClass(
            name = "TestClass",
            methods = listOf(testMethod)
        )
        testPackage = MutablePythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                MutablePythonModule(
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
