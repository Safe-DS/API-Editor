package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.RenameAnnotation
import com.larsreimann.api_editor.util.createPythonClass
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonPackage
import com.larsreimann.api_editor.util.createPythonParameter
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test

internal class RenameAnnotationProcessorTest {
    @Test
    fun `should rename class`() {
        // given
        val testPackage = createPythonPackage(
            name = "testPackage",
            modules = listOf(
                createPythonModule(
                    name = "testModule",
                    classes = listOf(
                        createPythonClass(
                            name = "testClass",
                            qualifiedName = "testModule.testClass",
                            annotations = mutableListOf(RenameAnnotation("renamedTestClass"))
                        )
                    )
                )
            )
        )

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)

        val (name, qualifiedName) = modifiedPackage.modules[0].classes[0]
        name shouldBe "renamedTestClass"
        qualifiedName shouldBe "testModule.renamedTestClass"
    }

    @Test
    fun `should rename global function`() {
        // given
        val testPackage = createPythonPackage(
            name = "testPackage",
            modules = listOf(
                createPythonModule(
                    name = "testModule",
                    functions = listOf(
                        createPythonFunction(
                            name = "testFunction",
                            qualifiedName = "testModule.testFunction",
                            annotations = mutableListOf(RenameAnnotation("renamedTestFunction"))
                        )
                    )
                )
            )
        )

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].functions.shouldHaveSize(1)

        val (name, qualifiedName) = modifiedPackage.modules[0].functions[0]
        name shouldBe "renamedTestFunction"
        qualifiedName shouldBe "testModule.renamedTestFunction"
    }

    @Test
    fun `should rename method`() {
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
                                createPythonFunction(
                                    name = "testMethod",
                                    qualifiedName = "testModule.testClass.testMethod",
                                    annotations = mutableListOf(RenameAnnotation("renamedTestMethod"))
                                )
                            )
                        )
                    )
                )
            )
        )

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods.shouldHaveSize(1)

        val (name, qualifiedName) = modifiedPackage.modules[0].classes[0].methods[0]
        name shouldBe "renamedTestMethod"
        qualifiedName shouldBe "testModule.testClass.renamedTestMethod"
    }

    @Test
    fun `should rename class and its method`() {
        // given
        val testPackage = createPythonPackage(
            name = "testPackage",
            modules = listOf(
                createPythonModule(
                    name = "testModule",
                    classes = listOf(
                        createPythonClass(
                            name = "testClass",
                            qualifiedName = "testModule.testClass",
                            annotations = mutableListOf(RenameAnnotation("renamedTestClass")),
                            methods = listOf(
                                createPythonFunction(
                                    name = "testMethod",
                                    qualifiedName = "testModule.testClass.testMethod",
                                    annotations = mutableListOf(RenameAnnotation("renamedTestMethod"))
                                )
                            )
                        )
                    )
                )
            )
        )

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods.shouldHaveSize(1)

        val (className, classQualifiedName) = modifiedPackage.modules[0].classes[0]
        className shouldBe "renamedTestClass"
        classQualifiedName shouldBe "testModule.renamedTestClass"

        val (methodName, methodQualifiedName) = modifiedPackage.modules[0].classes[0].methods[0]
        methodName shouldBe "renamedTestMethod"
        methodQualifiedName shouldBe "testModule.renamedTestClass.renamedTestMethod"
    }

    @Test
    fun `should rename class, method, and parameter`() {
        // given
        val testPackage = createPythonPackage(
            name = "testPackage",
            modules = listOf(
                createPythonModule(
                    name = "testModule",
                    classes = listOf(
                        createPythonClass(
                            name = "testClass",
                            qualifiedName = "testModule.testClass",
                            annotations = mutableListOf(RenameAnnotation("renamedTestClass")),
                            methods = listOf(
                                createPythonFunction(
                                    name = "testMethod",
                                    qualifiedName = "testModule.testClass.testMethod",
                                    annotations = mutableListOf(RenameAnnotation("renamedTestMethod")),
                                    parameters = listOf(
                                        createPythonParameter(
                                            name = "testParameter",
                                            qualifiedName = "testModule.testClass.testMethod.testParameter",
                                            annotations = mutableListOf(RenameAnnotation("renamedTestParameter"))
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods[0].parameters.shouldHaveSize(1)

        val (className, classQualifiedName) = modifiedPackage.modules[0].classes[0]
        className shouldBe "renamedTestClass"
        classQualifiedName shouldBe "testModule.renamedTestClass"

        val (methodName, methodQualifiedName) = modifiedPackage.modules[0].classes[0].methods[0]
        methodName shouldBe "renamedTestMethod"
        methodQualifiedName shouldBe "testModule.renamedTestClass.renamedTestMethod"

        val (parameterName, parameterQualifiedName) = modifiedPackage.modules[0].classes[0].methods[0].parameters[0]
        parameterName shouldBe "renamedTestParameter"
        parameterQualifiedName shouldBe "testModule.renamedTestClass.renamedTestMethod.renamedTestParameter"
    }

    @Test
    fun `should rename global function and parameter`() {
        // given
        val testPackage = createPythonPackage(
            name = "testPackage",
            modules = listOf(
                createPythonModule(
                    name = "testModule",
                    functions = listOf(
                        createPythonFunction(
                            name = "testMethod",
                            qualifiedName = "testModule.testClass.testFunction",
                            annotations = mutableListOf(RenameAnnotation("renamedTestFunction")),
                            parameters = listOf(
                                createPythonParameter(
                                    name = "testParameter",
                                    qualifiedName = "testModule.testClass.testFunction.testParameter",
                                    annotations = mutableListOf(RenameAnnotation("renamedTestParameter"))
                                )

                            )
                        )
                    )
                )
            )
        )

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].functions.shouldHaveSize(1)
        modifiedPackage.modules[0].functions[0].parameters.shouldHaveSize(1)

        val (functionName, functionQualifiedName) = modifiedPackage.modules[0].functions[0]
        functionName shouldBe "renamedTestFunction"
        functionQualifiedName shouldBe "testModule.renamedTestFunction"

        val (parameterName, parameterQualifiedName) = modifiedPackage.modules[0].functions[0].parameters[0]
        parameterName shouldBe "renamedTestParameter"
        parameterQualifiedName shouldBe "testModule.renamedTestFunction.renamedTestParameter"
    }
}
