package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.assertions.findUniqueDescendantOrFail
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.RenameAnnotation
import com.larsreimann.api_editor.util.createPythonAttribute
import com.larsreimann.api_editor.util.createPythonClass
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonPackage
import com.larsreimann.api_editor.util.createPythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

internal class RenameAnnotationProcessorTest {

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
                            qualifiedName = "testModule.testClass",
                            attributes = listOf(
                                createPythonAttribute(
                                    name = "testAttribute",
                                    qualifiedName = "testModule.testClass.testAttribute"
                                )
                            ),
                            methods = listOf(
                                createPythonFunction(
                                    name = "testMethod",
                                    qualifiedName = "testModule.testClass.testMethod",
                                    parameters = listOf(
                                        createPythonParameter(
                                            name = "testParameter",
                                            qualifiedName = "testModule.testClass.testMethod.testParameter",
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    functions = listOf(
                        createPythonFunction(
                            name = "testFunction",
                            qualifiedName = "testModule.testFunction",
                            parameters = listOf(
                                createPythonParameter(
                                    name = "testParameter",
                                    qualifiedName = "testModule.testFunction.testParameter",
                                )
                            )
                        )
                    )
                )
            )
        )
    }

    @Test
    fun `should rename class`() {
        // given
        val testClass = testPackage.findUniqueDescendantOrFail<SerializablePythonClass>("testClass")
        testClass.annotations += RenameAnnotation("renamedTestClass")

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
    fun `should rename method`() {
        // given
        val testMethod = testPackage.findUniqueDescendantOrFail<SerializablePythonFunction>("testMethod")
        testMethod.annotations += RenameAnnotation("renamedTestMethod")

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
    fun `should rename global function`() {
        // given
        val testFunction = testPackage.findUniqueDescendantOrFail<SerializablePythonFunction>("testFunction")
        testFunction.annotations += RenameAnnotation("renamedTestFunction")

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
    fun `should rename parameter`() {
        // given
        val testMethod = testPackage.findUniqueDescendantOrFail<SerializablePythonFunction>("testMethod")
        val testParameter = testMethod.findUniqueDescendantOrFail<SerializablePythonParameter>("testParameter")
        testParameter.annotations += RenameAnnotation("renamedTestParameter")

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods[0].parameters.shouldHaveSize(1)

        val (parameterName, parameterQualifiedName) = modifiedPackage.modules[0].classes[0].methods[0].parameters[0]
        parameterName shouldBe "renamedTestParameter"
        parameterQualifiedName shouldBe "testModule.testClass.testMethod.renamedTestParameter"
    }

    @Test
    fun `should change qualified names of descendants when renaming class`() {
        // given
        val testClass = testPackage.findUniqueDescendantOrFail<SerializablePythonClass>("testClass")
        testClass.annotations += RenameAnnotation("renamedTestClass")

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].attributes.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods[0].parameters.shouldHaveSize(1)

        val (className, classQualifiedName) = modifiedPackage.modules[0].classes[0]
        className shouldBe "renamedTestClass"
        classQualifiedName shouldBe "testModule.renamedTestClass"

        val (attributeName, attributeQualifiedName) = modifiedPackage.modules[0].classes[0].attributes[0]
        attributeName shouldBe "testAttribute"
        attributeQualifiedName shouldBe "testModule.renamedTestClass.testAttribute"

        val (methodName, methodQualifiedName) = modifiedPackage.modules[0].classes[0].methods[0]
        methodName shouldBe "testMethod"
        methodQualifiedName shouldBe "testModule.renamedTestClass.testMethod"

        val (parameterName, parameterQualifiedName) = modifiedPackage.modules[0].classes[0].methods[0].parameters[0]
        parameterName shouldBe "testParameter"
        parameterQualifiedName shouldBe "testModule.renamedTestClass.testMethod.testParameter"
    }

    @Test
    fun `should change qualified names of descendants when renaming method`() {
        // given
        val testMethod = testPackage.findUniqueDescendantOrFail<SerializablePythonFunction>("testMethod")
        testMethod.annotations += RenameAnnotation("renamedTestMethod")

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods.shouldHaveSize(1)
        modifiedPackage.modules[0].classes[0].methods[0].parameters.shouldHaveSize(1)

        val (methodName, methodQualifiedName) = modifiedPackage.modules[0].classes[0].methods[0]
        methodName shouldBe "renamedTestMethod"
        methodQualifiedName shouldBe "testModule.testClass.renamedTestMethod"

        val (parameterName, parameterQualifiedName) = modifiedPackage.modules[0].classes[0].methods[0].parameters[0]
        parameterName shouldBe "testParameter"
        parameterQualifiedName shouldBe "testModule.testClass.renamedTestMethod.testParameter"
    }

    @Test
    fun `should change qualified names of descendants when renaming global function`() {
        // given
        val testFunction = testPackage.findUniqueDescendantOrFail<SerializablePythonFunction>("testFunction")
        testFunction.annotations += RenameAnnotation("renamedTestFunction")

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
        parameterName shouldBe "testParameter"
        parameterQualifiedName shouldBe "testModule.renamedTestFunction.testParameter"
    }

    @Test
    fun `should remove all RenameAnnotations from the annotation list of classes`() {
        // given
        val testClass = testPackage.findUniqueDescendantOrFail<SerializablePythonClass>("testClass")
        testClass.annotations += RenameAnnotation("renamedTestClass")

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)

        val renameAnnotations = modifiedPackage.modules[0].classes[0].annotations.filterIsInstance<RenameAnnotation>()
        renameAnnotations.shouldBeEmpty()
    }

    @Test
    fun `should remove all RenameAnnotations from the annotation list of functions`() {
        // given
        val testFunction = testPackage.findUniqueDescendantOrFail<SerializablePythonFunction>("testFunction")
        testFunction.annotations += RenameAnnotation("renamedTestFunction")

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)

        val renameAnnotations = modifiedPackage.modules[0].functions[0].annotations.filterIsInstance<RenameAnnotation>()
        renameAnnotations.shouldBeEmpty()
    }

    @Test
    fun `should remove all RenameAnnotations from the annotation list of parameters`() {
        // given
        val testFunction = testPackage.findUniqueDescendantOrFail<SerializablePythonFunction>("testFunction")
        val testParameter = testFunction.findUniqueDescendantOrFail<SerializablePythonParameter>("testParameter")
        testParameter.annotations += RenameAnnotation("renamedTestParameter")

        // when
        val modifiedPackage = testPackage.accept(RenameAnnotationProcessor())

        // then
        modifiedPackage.shouldNotBeNull()
        modifiedPackage.modules.shouldHaveSize(1)
        modifiedPackage.modules[0].classes.shouldHaveSize(1)

        val renameAnnotations =
            modifiedPackage.modules[0].functions[0].parameters[0].annotations.filterIsInstance<RenameAnnotation>()
        renameAnnotations.shouldBeEmpty()
    }
}
