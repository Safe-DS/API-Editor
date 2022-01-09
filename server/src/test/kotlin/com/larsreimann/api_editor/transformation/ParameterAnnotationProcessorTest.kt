package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.ConstantAnnotation
import com.larsreimann.api_editor.model.DefaultBoolean
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RequiredAnnotation
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class ParameterAnnotationProcessorTest {
    private lateinit var testParameter: PythonParameter
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testParameter = PythonParameter(name = "testParameter")
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                PythonModule(
                    name = "testModule",
                    functions = listOf(
                        PythonFunction(
                            name = "testFunction",
                            parameters = listOf(testParameter)
                        )
                    )
                )
            )
        )
    }

    @Test
    fun `should process AttributeAnnotations`() {
        testParameter.annotations += AttributeAnnotation(DefaultBoolean(true))

        testPackage.processParameterAnnotations()

        testParameter.assignedBy shouldBe PythonParameterAssignment.ATTRIBUTE
        testParameter.defaultValue shouldBe "true"
    }

    @Test
    fun `should remove AttributeAnnotations`() {
        testParameter.annotations += AttributeAnnotation(DefaultBoolean(true))

        testPackage.processParameterAnnotations()

        testPackage.annotations
            .filterIsInstance<AttributeAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should process ConstantAnnotations`() {
        testParameter.annotations += ConstantAnnotation(DefaultBoolean(true))

        testPackage.processParameterAnnotations()

        testParameter.assignedBy shouldBe PythonParameterAssignment.CONSTANT
        testParameter.defaultValue shouldBe "true"
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
        testParameter.defaultValue shouldBe "true"
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
        testParameter.defaultValue = "true"
        testParameter.annotations += RequiredAnnotation

        testPackage.processParameterAnnotations()

        testParameter.assignedBy shouldBe PythonParameterAssignment.POSITION_OR_NAME
        testParameter.defaultValue.shouldBeNull()
    }

    @Test
    fun `should remove RequiredAnnotations`() {
        testParameter.defaultValue = "true"
        testParameter.annotations += RequiredAnnotation

        testPackage.processParameterAnnotations()

        testPackage.annotations
            .filterIsInstance<RequiredAnnotation>()
            .shouldBeEmpty()
    }
}
