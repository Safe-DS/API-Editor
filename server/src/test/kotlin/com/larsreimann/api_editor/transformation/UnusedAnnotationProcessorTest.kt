package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.assertions.findUniqueDescendantOrFail
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.model.UnusedAnnotation
import com.larsreimann.api_editor.util.createPythonClass
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonPackage
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class UnusedAnnotationProcessorTest {

    private lateinit var testPackage: SerializablePythonPackage

    @BeforeEach
    fun resetTestPackage() {
        testPackage = createPythonPackage(
            name = "testPackage",
            modules = listOf(
                createPythonModule(
                    name = "testModule",
                    classes = listOf(
                        createPythonClass(
                            name = "testClass",
                            methods = listOf(
                                createPythonFunction("testMethod"),
                                createPythonFunction("annotatedTestMethod")
                            )
                        ),
                        createPythonClass("annotatedTestClass")
                    ),
                    functions = listOf(
                        createPythonFunction("testFunction"),
                        createPythonFunction("annotatedTestFunction")
                    )
                )
            )
        )
    }

    @Test
    fun `should remove unused class`() {
        // given
        val testClass = testPackage.findUniqueDescendantOrFail<SerializablePythonClass>("annotatedTestClass")
        testClass.annotations += UnusedAnnotation

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
        val testFunction = testPackage.findUniqueDescendantOrFail<SerializablePythonFunction>("annotatedTestFunction")
        testFunction.annotations += UnusedAnnotation

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
        val testMethod = testPackage.findUniqueDescendantOrFail<SerializablePythonFunction>("annotatedTestMethod")
        testMethod.annotations += UnusedAnnotation

        // when
        val modifiedPackage = testPackage.accept(UnusedAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(2)
        modifiedPackage.modules[0].classes[0].methods.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods[0].name shouldBe "testMethod"
    }
}
