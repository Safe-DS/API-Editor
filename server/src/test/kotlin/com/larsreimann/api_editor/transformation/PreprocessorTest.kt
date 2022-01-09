package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.OriginalPythonClass
import com.larsreimann.api_editor.mutable_model.OriginalPythonFunction
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonReference
import io.kotest.assertions.asClue
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PreprocessorTest {
    private lateinit var testRequiredParameter: PythonParameter
    private lateinit var testOptionalParameter: PythonParameter
    private lateinit var testGlobalFunction: PythonFunction
    private lateinit var testMethodParameter: PythonParameter
    private lateinit var testAttribute: PythonAttribute
    private lateinit var testMethod: PythonFunction
    private lateinit var testClass: PythonClass
    private lateinit var testModule: PythonModule
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testRequiredParameter = PythonParameter(
            name = "testRequiredParameter",
            defaultValue = null,
            assignedBy = PythonParameterAssignment.POSITION_ONLY
        )
        testOptionalParameter = PythonParameter(
            name = "testOptionalParameter",
            defaultValue = "'value'",
            assignedBy = PythonParameterAssignment.POSITION_OR_NAME
        )
        testGlobalFunction = PythonFunction(
            name = "testGlobalFunction",
            parameters = listOf(
                testRequiredParameter,
                testOptionalParameter
            )
        )
        testMethodParameter = PythonParameter(
            name = "testMethodParameter",
            assignedBy = PythonParameterAssignment.POSITION_ONLY
        )
        testAttribute = PythonAttribute(name = "testAttribute")
        testMethod = PythonFunction(
            name = "testMethod",
            parameters = listOf(testMethodParameter)
        )
        testClass = PythonClass(
            name = "testClass",
            attributes = listOf(testAttribute),
            methods = listOf(testMethod),
        )
        testModule = PythonModule(
            "testModule",
            classes = listOf(testClass),
            functions = listOf(testGlobalFunction)
        )
        testPackage = PythonPackage(
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

            // TODO: remove
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
            // end remove

            val callToOriginalAPI = testGlobalFunction.callToOriginalAPI.shouldNotBeNull()
            callToOriginalAPI.receiver shouldBe "testModule.testGlobalFunction"

            val arguments = callToOriginalAPI.arguments
            arguments.shouldHaveSize(2)

            arguments[0].name.shouldBeNull()
            arguments[0].value.asClue {
                it.shouldBeInstanceOf<PythonReference>()
                it.declaration shouldBe testRequiredParameter
            }

            arguments[1].name.shouldBeNull()
            arguments[1].value.asClue {
                it.shouldBeInstanceOf<PythonReference>()
                it.declaration shouldBe testOptionalParameter
            }
        }

        @Test
        fun `should add original declaration to class methods`() {
            testPackage.addOriginalDeclarations()

            // TODO: remove
            testMethod.originalFunction shouldBe OriginalPythonFunction(
                qualifiedName = "testModule.testClass.testMethod",
                parameters = listOf(
                    OriginalPythonParameter(
                        name = "testMethodParameter",
                        assignedBy = PythonParameterAssignment.POSITION_ONLY
                    )
                )
            )
            // end remove

            val callToOriginalAPI = testMethod.callToOriginalAPI.shouldNotBeNull()
            callToOriginalAPI.receiver shouldBe "testModule.testClass.testMethod"

            val arguments = callToOriginalAPI.arguments
            arguments.shouldHaveSize(1)

            arguments[0].name.shouldBeNull()
            arguments[0].value.asClue {
                it.shouldBeInstanceOf<PythonReference>()
                it.declaration shouldBe testMethodParameter
            }
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
    inner class ChangeModulePrefix {

        @Test
        fun `should change the prefix of all modules`() {
            testPackage.changeModulePrefix("simpleml")

            testModule.name shouldBe "simpleml"
        }
    }

    @Nested
    inner class ReplaceClassMethodsWithStaticMethods {

        @Test
        fun `should change decorator from @classmethod to @staticmethod`() {
            testMethod.decorators += "classmethod"
            testPackage.replaceClassMethodsWithStaticMethods()

            testMethod.decorators.shouldContainExactly("staticmethod")
        }

        @Test
        fun `should remove first parameter`() {
            testMethod.decorators += "classmethod"
            testPackage.replaceClassMethodsWithStaticMethods()

            testMethod.parameters.shouldBeEmpty()
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
    inner class NormalizeNamesOfImplicitParameters {

        @Test
        fun `should change the name of implicit parameters to 'self'`() {
            testMethodParameter.assignedBy = PythonParameterAssignment.IMPLICIT
            testPackage.normalizeNamesOfImplicitParameters()

            testMethodParameter.name shouldBe "self"
        }

        @Test
        fun `should not change name of non-implicit parameters`() {
            testPackage.normalizeNamesOfImplicitParameters()

            testRequiredParameter.name shouldBe "testRequiredParameter"
        }
    }
}
