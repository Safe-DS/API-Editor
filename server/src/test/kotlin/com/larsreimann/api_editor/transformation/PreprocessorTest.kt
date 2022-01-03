package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.UnusedAnnotation
import com.larsreimann.api_editor.util.createPythonClass
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonPackage
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test

class PreprocessorTest {
    @Test
    fun `should add original declaration to function`() {
        // given
        val testFunction = createPythonFunction(
            name = "testFunction",
            qualifiedName = "testPackage/testFunction",
        )

        var testPackage = createPythonPackage(
            "testPackage",
            modules = listOf(
                createPythonModule(
                    "testModule",
                    functions = listOf(testFunction)
                )
            )
        )

        // when
        val originalFunction = testPackage.modules[0].functions[0].copy()
        testPackage = testPackage.accept(Preprocessor())!!

        // then
        testPackage.modules[0]
            .functions[0]
            .originalDeclaration shouldBe
            originalFunction
    }

    @Test
    fun `should add original declaration to class`() {
        // given
        val testClass = createPythonClass(
            name = "testClass",
            qualifiedName = "testPackage/testClass",
        ).apply { annotations += UnusedAnnotation }

        var testPackage = createPythonPackage(
            "testPackage",
            modules = listOf(
                createPythonModule(
                    "testModule",
                    classes = listOf(testClass)
                )
            )
        )

        // when
        val originalClass = testPackage.modules[0].classes[0].copy()
        testPackage = testPackage.accept(Preprocessor())!!

        // then
        testPackage.modules[0]
            .classes[0]
            .originalDeclaration shouldBe originalClass
    }

    @Test
    fun `should add original declaration to class method`() {
        // given
        val testMethod = createPythonFunction(
            name = "testMethod",
            qualifiedName = "testPackage/testClass/testMethod",
        )

        val testClass = createPythonClass(
            name = "testClass",
            qualifiedName = "testPackage/testClass",
            methods = listOf(testMethod)
        )

        var testPackage = createPythonPackage(
            "testPackage",
            modules = listOf(
                createPythonModule(
                    "testModule",
                    classes = listOf(testClass)
                )
            )
        )

        // when
        val originalMethod = testPackage
            .modules[0]
            .classes[0]
            .methods[0]
            .copy()
        testPackage = testPackage.accept(Preprocessor())!!

        // then
        testPackage.modules[0]
            .classes[0]
            .methods[0]
            .originalDeclaration shouldBe originalMethod
    }
}
