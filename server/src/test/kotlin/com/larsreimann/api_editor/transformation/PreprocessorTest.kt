package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonAttribute
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.OriginalPythonClass
import com.larsreimann.api_editor.mutable_model.OriginalPythonFunction
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PreprocessorTest {
    private lateinit var testRequiredParameter: MutablePythonParameter
    private lateinit var testOptionalParameter: MutablePythonParameter
    private lateinit var testGlobalFunction: MutablePythonFunction
    private lateinit var testMethodParameter: MutablePythonParameter
    private lateinit var testAttribute: MutablePythonAttribute
    private lateinit var testMethod: MutablePythonFunction
    private lateinit var testClass: MutablePythonClass
    private lateinit var testModule: MutablePythonModule
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        testRequiredParameter = MutablePythonParameter(
            name = "testRequiredParameter",
            defaultValue = null,
            assignedBy = PythonParameterAssignment.POSITION_ONLY
        )
        testOptionalParameter = MutablePythonParameter(
            name = "testOptionalParameter",
            defaultValue = "'value'",
            assignedBy = PythonParameterAssignment.POSITION_OR_NAME
        )
        testGlobalFunction = MutablePythonFunction(
            name = "testGlobalFunction",
            parameters = listOf(
                testRequiredParameter,
                testOptionalParameter
            )
        )
        testMethodParameter = MutablePythonParameter(
            name = "testMethodParameter",
            assignedBy = PythonParameterAssignment.POSITION_ONLY
        )
        testAttribute = MutablePythonAttribute(name = "testAttribute")
        testMethod = MutablePythonFunction(
            name = "testMethod",
            parameters = listOf(testMethodParameter)
        )
        testClass = MutablePythonClass(
            name = "testClass",
            attributes = listOf(testAttribute),
            methods = listOf(testMethod),
        )
        testModule = MutablePythonModule(
            "testModule",
            classes = listOf(testClass),
            functions = listOf(testGlobalFunction)
        )
        testPackage = MutablePythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(testModule)
        )
    }

    @Nested
    inner class RemovePrivateDeclarations {

        @Test
        fun `should remove private attributes`() {
            testAttribute.isPublic = false
            testPackage.removePrivateDeclarations()

            testClass.attributes.shouldBeEmpty()
        }

        @Test
        fun `should not remove public attributes`() {
            testAttribute.isPublic = true
            testPackage.removePrivateDeclarations()

            testClass.attributes.shouldContain(testAttribute)
        }

        @Test
        fun `should remove private classes`() {
            testClass.isPublic = false
            testPackage.removePrivateDeclarations()

            testModule.classes.shouldBeEmpty()
        }

        @Test
        fun `should not remove public classes`() {
            testClass.isPublic = true
            testPackage.removePrivateDeclarations()

            testModule.classes.shouldContain(testClass)
        }

        @Test
        fun `should remove private global functions`() {
            testGlobalFunction.isPublic = false
            testPackage.removePrivateDeclarations()

            testModule.functions.shouldBeEmpty()
        }

        @Test
        fun `should not remove public global functions`() {
            testGlobalFunction.isPublic = true
            testPackage.removePrivateDeclarations()

            testModule.functions.shouldContain(testGlobalFunction)
        }

        @Test
        fun `should remove private methods`() {
            testMethod.isPublic = false
            testPackage.removePrivateDeclarations()

            testClass.methods.shouldBeEmpty()
        }

        @Test
        fun `should not remove public methods`() {
            testMethod.isPublic = true
            testPackage.removePrivateDeclarations()

            testClass.methods.shouldContain(testMethod)
        }
    }

    @Nested
    inner class AddOriginalDeclarations {

        @Test
        fun `should add original declaration to classes`() {
            testPackage.addOriginalDeclarations()

            testClass.originalClass shouldBe OriginalPythonClass("testModule.testClass")
        }

        @Test
        fun `should add original declaration to global functions`() {
            testPackage.addOriginalDeclarations()

            testGlobalFunction.originalFunction shouldBe OriginalPythonFunction(
                qualifiedName = "testModule.testGlobalFunction",
                parameters = listOf(
                    OriginalPythonParameter(
                        name = "testRequiredParameter",
                        assignedBy = PythonParameterAssignment.POSITION_ONLY
                    ),
                    OriginalPythonParameter(
                        name = "testOptionalParameter",
                        assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                    )
                )
            )
        }

        @Test
        fun `should add original declaration to class methods`() {
            testPackage.addOriginalDeclarations()

            testMethod.originalFunction shouldBe OriginalPythonFunction(
                qualifiedName = "testModule.testClass.testMethod",
                parameters = listOf(
                    OriginalPythonParameter(
                        name = "testMethodParameter",
                        assignedBy = PythonParameterAssignment.POSITION_ONLY
                    )
                )
            )
        }

        @Test
        fun `should add original declaration to parameters`() {
            testPackage.addOriginalDeclarations()

            testRequiredParameter.originalParameter shouldBe OriginalPythonParameter(
                name = "testRequiredParameter",
                assignedBy = PythonParameterAssignment.POSITION_ONLY
            )
        }
    }

    @Nested
    inner class UpdateParameterAssignment {

        @Test
        fun `should mark implicit parameters`() {
            testPackage.updateParameterAssignment()

            testMethodParameter.assignedBy shouldBe PythonParameterAssignment.IMPLICIT
        }

        @Test
        fun `should make required parameters assigned by position or name`() {
            testPackage.updateParameterAssignment()

            testRequiredParameter.assignedBy shouldBe PythonParameterAssignment.POSITION_OR_NAME
        }

        @Test
        fun `should make optional parameters assigned by name only`() {
            testPackage.updateParameterAssignment()

            testOptionalParameter.assignedBy shouldBe PythonParameterAssignment.NAME_ONLY
        }
    }

    @Nested
    inner class ChangeModulePrefix {

        @Test
        fun `should change the prefix of all modules`() {
            testPackage.changeModulePrefix("simpleml")

            testModule.name shouldBe "simpleml"
        }
    }
}
