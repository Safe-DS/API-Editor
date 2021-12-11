package com.larsreimann.api_editor.server.annotationProcessing

import com.larsreimann.api_editor.server.data.UnusedAnnotation
import com.larsreimann.api_editor.server.util.createAnnotatedPythonClass
import com.larsreimann.api_editor.server.util.createAnnotatedPythonFunction
import com.larsreimann.api_editor.server.util.createAnnotatedPythonModule
import com.larsreimann.api_editor.server.util.createAnnotatedPythonPackage
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test

class OriginalDeclarationProcessorTest {
    @Test
    fun `should add original declaration to function`() {
        // given
        val testFunction = createAnnotatedPythonFunction(
            name = "testFunction",
            qualifiedName = "testPackage/testFunction",
        )

        val testPackage = createAnnotatedPythonPackage(
            "testPackage",
            modules = listOf(
                createAnnotatedPythonModule(
                    "testModule",
                    functions = listOf(testFunction)
                )
            )
        )

        // when
        val originalFunction = testPackage.modules[0].functions[0].copy()
        testPackage.accept(OriginalDeclarationProcessor)

        // then
        testPackage.modules[0]
            .functions[0]
            .originalDeclaration shouldBe
            originalFunction
    }

    @Test
    fun `should add original declaration to class`() {
        // given
        val testClass = createAnnotatedPythonClass(
            name = "testClass",
            qualifiedName = "testPackage/testClass",
        ).apply {annotations += UnusedAnnotation}

        val testPackage = createAnnotatedPythonPackage(
            "testPackage",
            modules = listOf(
                createAnnotatedPythonModule(
                    "testModule",
                    classes = listOf(testClass)
                )
            )
        )

        // when
        val originalClass = testPackage.modules[0].classes[0].copy()
        testPackage.accept(OriginalDeclarationProcessor)

        // then
        testPackage.modules[0]
            .classes[0]
            .originalDeclaration shouldBe originalClass
    }

    @Test
    fun `should add original declaration to class method`() {
        // given
        val testMethod = createAnnotatedPythonFunction(
            name = "testMethod",
            qualifiedName = "testPackage/testClass/testMethod",
            )

        val testClass = createAnnotatedPythonClass(
            name = "testClass",
            qualifiedName = "testPackage/testClass",
            methods = listOf(testMethod)
        )

        val testPackage = createAnnotatedPythonPackage(
            "testPackage",
            modules = listOf(
                createAnnotatedPythonModule(
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
        testPackage.accept(OriginalDeclarationProcessor)

        // then
        testPackage.modules[0]
            .classes[0]
            .methods[0]
            .originalDeclaration shouldBe originalMethod

    }
}
