package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.UnusedAnnotation
import com.larsreimann.api_editor.util.createPythonClass
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonPackage
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test

internal class UnusedAnnotationProcessorTest {

    @Test
    fun `should remove unused class`() {
        // given
        val testPackage = createPythonPackage(
            name = "testPackage",
            modules = listOf(
                createPythonModule(
                    name = "testModule",
                    classes = listOf(
                        createPythonClass("testClass"),
                        createPythonClass(
                            name = "annotatedTestClass",
                            annotations = mutableListOf(UnusedAnnotation)
                        )
                    )
                )
            )
        )

        // when
        val modifiedPackage = testPackage.accept(UnusedAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].name shouldBe "testClass"
    }

    @Test
    fun `should remove unused global function`() {
        // given
        val testPackage = createPythonPackage(
            name = "testPackage",
            modules = listOf(
                createPythonModule(
                    name = "testModule",
                    functions = listOf(
                        createPythonFunction("testFunction"),
                        createPythonFunction(
                            name = "annotatedTestFunction",
                            annotations = mutableListOf(UnusedAnnotation)
                        )
                    )
                )
            )
        )

        // when
        val modifiedPackage = testPackage.accept(UnusedAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].functions.shouldHaveSize(1)
        modifiedPackage.modules[0].functions[0].name shouldBe "testFunction"
    }

    @Test
    fun `should remove unused method`() {
        // given
        val testPackage = createPythonPackage(
            name = "testPackage",
            modules = listOf(
                createPythonModule(
                    name = "testModule",
                    classes = listOf(
                        createPythonClass(
                            name = "testClass",
                            methods = listOf(
                                createPythonFunction("testMethod"),
                                createPythonFunction(
                                    name = "annotatedTestMethod",
                                    annotations = mutableListOf(UnusedAnnotation)
                                )
                            )
                        )
                    )
                )
            )
        )

        // when
        val modifiedPackage = testPackage.accept(UnusedAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods[0].name shouldBe "testMethod"
    }
}
