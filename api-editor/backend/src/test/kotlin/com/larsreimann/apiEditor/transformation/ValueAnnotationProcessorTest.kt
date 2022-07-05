package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.ConstantAnnotation
import com.larsreimann.apiEditor.model.DefaultBoolean
import com.larsreimann.apiEditor.model.DefaultNone
import com.larsreimann.apiEditor.model.OmittedAnnotation
import com.larsreimann.apiEditor.model.OptionalAnnotation
import com.larsreimann.apiEditor.model.PythonParameterAssignment
import com.larsreimann.apiEditor.model.RequiredAnnotation
import com.larsreimann.apiEditor.mutableModel.PythonArgument
import com.larsreimann.apiEditor.mutableModel.PythonBoolean
import com.larsreimann.apiEditor.mutableModel.PythonCall
import com.larsreimann.apiEditor.mutableModel.PythonClass
import com.larsreimann.apiEditor.mutableModel.PythonFunction
import com.larsreimann.apiEditor.mutableModel.PythonModule
import com.larsreimann.apiEditor.mutableModel.PythonNone
import com.larsreimann.apiEditor.mutableModel.PythonPackage
import com.larsreimann.apiEditor.mutableModel.PythonParameter
import com.larsreimann.apiEditor.mutableModel.PythonReference
import com.larsreimann.apiEditor.mutableModel.PythonStringifiedExpression
import io.kotest.assertions.asClue
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class ValueAnnotationProcessorTest {
    private lateinit var testParameter: PythonParameter
    private lateinit var testClass: PythonClass
    private lateinit var testMethod: PythonFunction
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testParameter = PythonParameter(name = "testParameter")
        testMethod = PythonFunction(
            name = "testMethod",
            parameters = listOf(testParameter),
            callToOriginalAPI = PythonCall(
                receiver = PythonStringifiedExpression("testModule.TestClass.testMethod"),
                arguments = listOf(
                    PythonArgument(
                        value = PythonReference(testParameter),
                    ),
                ),
            ),
        )
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
                ),
            ),
        )
    }

    @Test
    fun `should update the function call when processing ConstantAnnotations`() {
        testParameter.annotations += ConstantAnnotation(DefaultBoolean(true))

        testPackage.processValueAnnotations()

        val callToOriginalAPI = testMethod.callToOriginalAPI.shouldNotBeNull()
        callToOriginalAPI.arguments.shouldHaveSize(1)

        val argument = callToOriginalAPI.arguments[0]
        argument.name.shouldBeNull()
        argument.value.asClue {
            it.shouldBeInstanceOf<PythonBoolean>()
            it.value shouldBe true
        }
    }

    @Test
    fun `should remove parameters marked with ConstantAnnotation`() {
        testParameter.annotations += ConstantAnnotation(DefaultBoolean(true))

        testPackage.processValueAnnotations()

        testMethod.parameters.shouldBeEmpty()
    }

    @Test
    fun `should remove ConstantAnnotations`() {
        testParameter.annotations += ConstantAnnotation(DefaultBoolean(true))

        testPackage.processValueAnnotations()

        testParameter.annotations
            .filterIsInstance<ConstantAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process OmittedAnnotations`() {
        testParameter.annotations += OmittedAnnotation

        testPackage.processValueAnnotations()

        testMethod.parameters.shouldBeEmpty()
        testMethod.callToOriginalAPI?.arguments.shouldBeEmpty()
    }

    @Test
    fun `should remove OmittedAnnotations`() {
        testParameter.annotations += OmittedAnnotation

        testPackage.processValueAnnotations()

        testParameter.annotations
            .filterIsInstance<OmittedAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process OptionalAnnotations`() {
        testParameter.annotations += OptionalAnnotation(DefaultBoolean(true))

        testPackage.processValueAnnotations()

        testParameter.assignedBy shouldBe PythonParameterAssignment.NAME_ONLY
        testParameter.defaultValue shouldBe PythonStringifiedExpression("True")
    }

    @Test
    fun `should remove OptionalAnnotations`() {
        testParameter.annotations += OptionalAnnotation(DefaultBoolean(true))

        testPackage.processValueAnnotations()

        testParameter.annotations
            .filterIsInstance<OptionalAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process RequiredAnnotations`() {
        testParameter.defaultValue = PythonStringifiedExpression("true")
        testParameter.annotations += RequiredAnnotation

        testPackage.processValueAnnotations()

        testParameter.assignedBy shouldBe PythonParameterAssignment.POSITION_OR_NAME
        testParameter.defaultValue.shouldBeNull()
    }

    @Test
    fun `should remove RequiredAnnotations`() {
        testParameter.defaultValue = PythonStringifiedExpression("true")
        testParameter.annotations += RequiredAnnotation

        testPackage.processValueAnnotations()

        testParameter.annotations
            .filterIsInstance<RequiredAnnotation>()
            .shouldBeEmpty()
    }

    @Test // https://github.com/lars-reimann/api-editor/issues/616
    fun `should work when multiple parameters are set to constant null`() {
        val callToOriginalAPI = testMethod.callToOriginalAPI.shouldNotBeNull()

        val testParameter2 = PythonParameter(name = "testParameter2")
        testMethod.parameters += testParameter2
        callToOriginalAPI.arguments += PythonArgument(
            value = PythonReference(testParameter2),
        )

        testParameter.annotations += ConstantAnnotation(DefaultNone)
        testParameter2.annotations += ConstantAnnotation(DefaultNone)

        testPackage.processValueAnnotations()

        callToOriginalAPI.arguments.shouldHaveSize(2)
        callToOriginalAPI.arguments[0].value.shouldBeInstanceOf<PythonNone>()
        callToOriginalAPI.arguments[1].value.shouldBeInstanceOf<PythonNone>()
    }
}
