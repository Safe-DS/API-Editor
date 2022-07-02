package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.ConstantAnnotation
import com.larsreimann.api_editor.model.DefaultBoolean
import com.larsreimann.api_editor.model.DefaultNone
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RequiredAnnotation
import com.larsreimann.api_editor.mutable_model.PythonArgument
import com.larsreimann.api_editor.mutable_model.PythonBoolean
import com.larsreimann.api_editor.mutable_model.PythonCall
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonNone
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonReference
import com.larsreimann.api_editor.mutable_model.PythonStringifiedExpression
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
                        value = PythonReference(testParameter)
                    )
                )
            )
        )
        testClass = PythonClass(
            name = "TestClass",
            methods = listOf(testMethod)
        )
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                PythonModule(
                    name = "testModule",
                    classes = listOf(testClass)
                )
            )
        )
    }

    @Test
    fun `should update the function call when processing ConstantAnnotations`() {
        testParameter.annotations += ConstantAnnotation(DefaultBoolean(true))

        testPackage.processParameterAnnotations()

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

        testPackage.processParameterAnnotations()

        testMethod.parameters.shouldBeEmpty()
    }

    @Test
    fun `should remove ConstantAnnotations`() {
        testParameter.annotations += ConstantAnnotation(DefaultBoolean(true))

        testPackage.processParameterAnnotations()

        testPackage.annotations
            .filterIsInstance<ConstantAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process OptionalAnnotations`() {
        testParameter.annotations += OptionalAnnotation(DefaultBoolean(true))

        testPackage.processParameterAnnotations()

        testParameter.assignedBy shouldBe PythonParameterAssignment.NAME_ONLY
        testParameter.defaultValue shouldBe PythonStringifiedExpression("True")
    }

    @Test
    fun `should remove OptionalAnnotations`() {
        testParameter.annotations += OptionalAnnotation(DefaultBoolean(true))

        testPackage.processParameterAnnotations()

        testPackage.annotations
            .filterIsInstance<OptionalAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process RequiredAnnotations`() {
        testParameter.defaultValue = PythonStringifiedExpression("true")
        testParameter.annotations += RequiredAnnotation

        testPackage.processParameterAnnotations()

        testParameter.assignedBy shouldBe PythonParameterAssignment.POSITION_OR_NAME
        testParameter.defaultValue.shouldBeNull()
    }

    @Test
    fun `should remove RequiredAnnotations`() {
        testParameter.defaultValue = PythonStringifiedExpression("true")
        testParameter.annotations += RequiredAnnotation

        testPackage.processParameterAnnotations()

        testPackage.annotations
            .filterIsInstance<RequiredAnnotation>()
            .shouldBeEmpty()
    }

    @Test // https://github.com/lars-reimann/api-editor/issues/616
    fun `should work when multiple parameters are set to constant null`() {
        val callToOriginalAPI = testMethod.callToOriginalAPI.shouldNotBeNull()

        val testParameter2 = PythonParameter(name = "testParameter2")
        testMethod.parameters += testParameter2
        callToOriginalAPI.arguments += PythonArgument(
            value = PythonReference(testParameter2)
        )

        testParameter.annotations += ConstantAnnotation(DefaultNone)
        testParameter2.annotations += ConstantAnnotation(DefaultNone)

        testPackage.processParameterAnnotations()

        callToOriginalAPI.arguments.shouldHaveSize(2)
        callToOriginalAPI.arguments[0].value.shouldBeInstanceOf<PythonNone>()
        callToOriginalAPI.arguments[1].value.shouldBeInstanceOf<PythonNone>()
    }
}
