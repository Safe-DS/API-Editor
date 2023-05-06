package com.safeds.apiEditor.transformation

import com.safeds.apiEditor.model.GroupAnnotation
import com.safeds.apiEditor.model.RenameAnnotation
import com.safeds.apiEditor.mutableModel.PythonClass
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonModule
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class RenameAnnotationProcessorTest {
    private lateinit var testClass: PythonClass
    private lateinit var testFunction: PythonFunction
    private lateinit var testParameter: PythonParameter
    private lateinit var testGroupAnnotation: GroupAnnotation
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testClass = PythonClass(
            name = "TestClass",
            annotations = mutableListOf(RenameAnnotation("NewTestClass")),
        )
        testFunction = PythonFunction(
            name = "testFunction",
            annotations = mutableListOf(
                RenameAnnotation("newTestFunction"),
            ),
        )
        testParameter = PythonParameter(
            name = "testParameter",
            annotations = mutableListOf(RenameAnnotation("newTestParameter")),
        )
        testGroupAnnotation = GroupAnnotation(
            groupName = "TestGroup",
            parameters = mutableListOf("testParameter"),
        )
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                PythonModule(
                    name = "testModule",
                    classes = listOf(testClass),
                    functions = listOf(
                        testFunction,
                        PythonFunction(
                            name = "testFunction",
                            parameters = listOf(testParameter),
                            annotations = mutableListOf(testGroupAnnotation),
                        ),
                    ),
                ),
            ),
        )
    }

    @Test
    fun `should process RenameAnnotations of classes`() {
        testPackage.processRenameAnnotations()

        testClass.name shouldBe "NewTestClass"
    }

    @Test
    fun `should remove RenameAnnotations of classes`() {
        testPackage.processRenameAnnotations()

        testClass.annotations
            .filterIsInstance<RenameAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process RenameAnnotations of functions`() {
        testPackage.processRenameAnnotations()

        testFunction.name shouldBe "newTestFunction"
    }

    @Test
    fun `should remove RenameAnnotations of functions`() {
        testPackage.processRenameAnnotations()

        testFunction.annotations
            .filterIsInstance<RenameAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process RenameAnnotations of parameters`() {
        testPackage.processRenameAnnotations()

        testParameter.name shouldBe "newTestParameter"
    }

    @Test
    fun `should update GroupAnnotation on containing function`() {
        testPackage.processRenameAnnotations()

        testGroupAnnotation.parameters.shouldContainExactly("newTestParameter")
    }

    @Test
    fun `should remove RenameAnnotations of parameters`() {
        testPackage.processRenameAnnotations()

        testParameter.annotations
            .filterIsInstance<RenameAnnotation>()
            .shouldBeEmpty()
    }
}
