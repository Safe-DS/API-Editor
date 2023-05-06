package com.safeds.apiEditor.transformation

import com.safeds.apiEditor.model.RemoveAnnotation
import com.safeds.apiEditor.mutableModel.PythonClass
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonModule
import com.safeds.apiEditor.mutableModel.PythonPackage
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class RemoveAnnotationProcessorTest {
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
            methods = listOf(testMethod),
        )
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                PythonModule(
                    name = "testModule",
                    classes = listOf(testClass),
                    functions = listOf(testGlobalFunction),
                ),
            ),
        )
    }

    @Test
    fun `should process RemoveAnnotations of classes`() {
        testClass.annotations += RemoveAnnotation

        testPackage.processRemoveAnnotations()

        val modules = testPackage.modules
        modules.shouldHaveSize(1)

        modules[0].classes.shouldBeEmpty()
    }

    @Test
    fun `should process RemoveAnnotations of global functions`() {
        testGlobalFunction.annotations += RemoveAnnotation

        testPackage.processRemoveAnnotations()

        val modules = testPackage.modules
        modules.shouldHaveSize(1)

        modules[0].functions.shouldBeEmpty()
    }

    @Test
    fun `should process RemoveAnnotations of methods`() {
        testMethod.annotations += RemoveAnnotation

        testPackage.processRemoveAnnotations()

        val modules = testPackage.modules
        modules.shouldHaveSize(1)

        val classes = modules[0].classes
        classes.shouldHaveSize(1)

        classes[0].methods.shouldBeEmpty()
    }
}
