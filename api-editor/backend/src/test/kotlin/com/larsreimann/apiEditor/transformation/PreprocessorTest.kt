package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.PythonParameterAssignment
import com.larsreimann.apiEditor.mutable_model.OriginalPythonClass
import com.larsreimann.apiEditor.mutable_model.PythonAttribute
import com.larsreimann.apiEditor.mutable_model.PythonClass
import com.larsreimann.apiEditor.mutable_model.PythonFunction
import com.larsreimann.apiEditor.mutable_model.PythonModule
import com.larsreimann.apiEditor.mutable_model.PythonNamedSpread
import com.larsreimann.apiEditor.mutable_model.PythonPackage
import com.larsreimann.apiEditor.mutable_model.PythonParameter
import com.larsreimann.apiEditor.mutable_model.PythonPositionalSpread
import com.larsreimann.apiEditor.mutable_model.PythonReference
import com.larsreimann.apiEditor.mutable_model.PythonStringifiedExpression
import io.kotest.assertions.asClue
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.collections.shouldNotContain
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
    private lateinit var testPositionalVarargParameter: PythonParameter
    private lateinit var testNamedVarargParameter: PythonParameter
    private lateinit var testGlobalFunction: PythonFunction
    private lateinit var testGlobalFunctionWithVariadicParameters: PythonFunction
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
            defaultValue = PythonStringifiedExpression("'value'"),
            assignedBy = PythonParameterAssignment.POSITION_OR_NAME
        )
        testPositionalVarargParameter = PythonParameter(
            name = "testPositionalVarargParameter",
            assignedBy = PythonParameterAssignment.POSITIONAL_VARARG
        )
        testNamedVarargParameter = PythonParameter(
            name = "testNamedVarargParameter",
            assignedBy = PythonParameterAssignment.NAMED_VARARG
        )
        testGlobalFunction = PythonFunction(
            name = "testGlobalFunction",
            parameters = listOf(
                testRequiredParameter,
                testOptionalParameter
            )
        )
        testGlobalFunctionWithVariadicParameters = PythonFunction(
            name = "testGlobalFunctionWithVariadicParameters",
            parameters = listOf(
                testPositionalVarargParameter,
                testNamedVarargParameter
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
            functions = listOf(
                testGlobalFunction,
                testGlobalFunctionWithVariadicParameters
            )
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

            testModule.functions.shouldNotContain(testGlobalFunction)
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

            val callToOriginalAPI = testGlobalFunction.callToOriginalAPI.shouldNotBeNull()
            callToOriginalAPI.receiver shouldBe PythonStringifiedExpression("testModule.testGlobalFunction")

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
        fun `should add original declaration to global functions with variadic parameters`() {
            testPackage.addOriginalDeclarations()

            val callToOriginalAPI = testGlobalFunctionWithVariadicParameters.callToOriginalAPI.shouldNotBeNull()
            callToOriginalAPI.receiver shouldBe PythonStringifiedExpression("testModule.testGlobalFunctionWithVariadicParameters")

            val arguments = callToOriginalAPI.arguments
            arguments.shouldHaveSize(2)

            arguments[0].name.shouldBeNull()
            arguments[0].value.asClue {
                it.shouldBeInstanceOf<PythonPositionalSpread>()
                val spreadArgument = it.argument
                spreadArgument.shouldBeInstanceOf<PythonReference>()
                spreadArgument.declaration shouldBe testPositionalVarargParameter
            }

            arguments[1].name.shouldBeNull()
            arguments[1].value.asClue {
                it.shouldBeInstanceOf<PythonNamedSpread>()
                val spreadArgument = it.argument
                spreadArgument.shouldBeInstanceOf<PythonReference>()
                spreadArgument.declaration shouldBe testNamedVarargParameter
            }
        }

        @Test
        fun `should add original declaration to class methods but skip implicit parameters`() {
            testPackage.addOriginalDeclarations()

            val callToOriginalAPI = testMethod.callToOriginalAPI.shouldNotBeNull()
            callToOriginalAPI.receiver shouldBe PythonStringifiedExpression("self.instance.testMethod")
            callToOriginalAPI.arguments.shouldHaveSize(0)
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

        @Test
        fun `should keep positional variadic parameters unchanged`() {
            testPackage.updateParameterAssignment()

            testPositionalVarargParameter.assignedBy shouldBe PythonParameterAssignment.POSITIONAL_VARARG
        }

        @Test
        fun `should keep named variadic parameters unchanged`() {
            testPackage.updateParameterAssignment()

            testNamedVarargParameter.assignedBy shouldBe PythonParameterAssignment.NAMED_VARARG
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
