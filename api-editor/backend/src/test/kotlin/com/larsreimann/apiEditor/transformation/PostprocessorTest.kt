package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.PythonParameterAssignment
import com.larsreimann.apiEditor.mutable_model.OriginalPythonClass
import com.larsreimann.apiEditor.mutable_model.PythonArgument
import com.larsreimann.apiEditor.mutable_model.PythonCall
import com.larsreimann.apiEditor.mutable_model.PythonClass
import com.larsreimann.apiEditor.mutable_model.PythonConstructor
import com.larsreimann.apiEditor.mutable_model.PythonFunction
import com.larsreimann.apiEditor.mutable_model.PythonModule
import com.larsreimann.apiEditor.mutable_model.PythonPackage
import com.larsreimann.apiEditor.mutable_model.PythonParameter
import com.larsreimann.apiEditor.mutable_model.PythonReference
import com.larsreimann.apiEditor.mutable_model.PythonStringifiedExpression
import io.kotest.assertions.asClue
import io.kotest.matchers.collections.exist
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldExist
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.collections.shouldNotContain
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNot
import io.kotest.matchers.types.shouldBeInstanceOf
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PostprocessorTest {
    private lateinit var testFunction: PythonFunction
    private lateinit var testConstructor: PythonConstructor
    private lateinit var testConstructorParameter: PythonParameter
    private lateinit var testClass: PythonClass
    private lateinit var testModule: PythonModule
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testFunction = PythonFunction(name = "testFunction")
        testConstructor = PythonConstructor(
            parameters = listOf(
                PythonParameter(
                    name = "self",
                    assignedBy = PythonParameterAssignment.IMPLICIT
                ),
                PythonParameter(
                    name = "positionOrName",
                    assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                )
            )
        )
        testConstructorParameter = PythonParameter(name = "constructorParameter")
        testClass = PythonClass(
            name = "TestClass",
            constructor = testConstructor,
            methods = listOf(
                PythonFunction(
                    name = "__init__",
                    parameters = listOf(testConstructorParameter),
                    callToOriginalAPI = PythonCall(
                        receiver = PythonStringifiedExpression("testModule.TestClass.__init__"),
                        arguments = listOf(
                            PythonArgument(value = PythonReference(testConstructorParameter))
                        )
                    )
                )
            ),
            originalClass = OriginalPythonClass(qualifiedName = "testModule.TestClass")
        )
        testModule = PythonModule(
            name = "testModule",
            classes = listOf(testClass),
            functions = listOf(testFunction)
        )
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(testModule)
        )
    }

    @Nested
    inner class RemoveEmptyModules {

        @Test
        fun `should remove empty modules`() {
            val emptyTestModule = PythonModule(name = "emptyTestModule")
            testPackage.modules += emptyTestModule

            testPackage.removeEmptyModules()

            testPackage.modules.shouldNotContain(emptyTestModule)
        }

        @Test
        fun `should not remove non-empty modules`() {
            testPackage.removeEmptyModules()

            testPackage.modules.shouldContain(testModule)
        }
    }

    @Nested
    inner class ReorderParameters {

        @Test
        fun `should reorder parameters of constructors`() {
            val implicit = PythonParameter(
                name = "implicit",
                assignedBy = PythonParameterAssignment.IMPLICIT
            )
            val positionOnly = PythonParameter(
                name = "positionOnly",
                assignedBy = PythonParameterAssignment.POSITION_ONLY
            )
            val positionOrName = PythonParameter(
                name = "positionOrName",
                assignedBy = PythonParameterAssignment.POSITION_OR_NAME
            )
            val positionalVararg = PythonParameter(
                name = "positionalVararg",
                assignedBy = PythonParameterAssignment.POSITIONAL_VARARG
            )
            val nameOnly = PythonParameter(
                name = "nameOnly",
                assignedBy = PythonParameterAssignment.NAME_ONLY
            )
            val namedVararg = PythonParameter(
                name = "namedVararg",
                assignedBy = PythonParameterAssignment.NAMED_VARARG
            )

            testConstructor.parameters.clear()
            testConstructor.parameters += listOf(
                namedVararg,
                nameOnly,
                positionalVararg,
                positionOrName,
                positionOnly,
                implicit
            )

            testPackage.reorderParameters()

            testConstructor.parameters.shouldContainExactly(
                implicit,
                positionOnly,
                positionOrName,
                positionalVararg,
                nameOnly,
                namedVararg
            )
        }

        @Test
        fun `should reorder parameters of functions`() {
            val implicit = PythonParameter(
                name = "implicit",
                assignedBy = PythonParameterAssignment.IMPLICIT
            )
            val positionOnly = PythonParameter(
                name = "positionOnly",
                assignedBy = PythonParameterAssignment.POSITION_ONLY
            )
            val positionOrName = PythonParameter(
                name = "positionOrName",
                assignedBy = PythonParameterAssignment.POSITION_OR_NAME
            )
            val nameOnly = PythonParameter(
                name = "nameOnly",
                assignedBy = PythonParameterAssignment.NAME_ONLY
            )

            testFunction.parameters += listOf(
                nameOnly,
                positionOrName,
                positionOnly,
                implicit
            )

            testPackage.reorderParameters()

            testFunction.parameters.shouldContainExactly(
                implicit,
                positionOnly,
                positionOrName,
                nameOnly
            )
        }
    }

    @Nested
    inner class CreateConstructors {

        @Test
        fun `should create empty constructors if no __init__ method exists`() {
            testClass.constructor = null
            testClass.methods.clear()

            testPackage.extractConstructors()

            testClass.constructor
                .shouldNotBeNull().asClue {
                    it.parameters.shouldHaveSize(1)
                    it.parameters[0].name.shouldBe("self")

                    val callToOriginalAPI = it.callToOriginalAPI.shouldNotBeNull()
                    callToOriginalAPI.receiver shouldBe PythonStringifiedExpression("testModule.TestClass")
                    callToOriginalAPI.arguments.shouldBeEmpty()
                }
        }

        @Test
        fun `should copy parameters of __init__ methods`() {
            testClass.constructor = null

            testPackage.extractConstructors()

            testClass.constructor
                .shouldNotBeNull()
                .parameters
                .map { it.name }
                .shouldContainExactly("constructorParameter")
        }

        @Test
        fun `should store call to original API`() {
            testClass.constructor = null

            testPackage.extractConstructors()

            testClass.constructor
                .shouldNotBeNull()
                .callToOriginalAPI
                .asClue {
                    it.shouldNotBeNull()
                    it.receiver shouldBe PythonStringifiedExpression("testModule.TestClass")
                    it.arguments.shouldHaveSize(1)

                    val argument = it.arguments[0]
                    argument.name.shouldBeNull()

                    val value = argument.value.shouldBeInstanceOf<PythonReference>()
                    value.declaration?.name shouldBe "constructorParameter"
                }
        }

        @Test
        fun `should remove __init__ methods`() {
            testClass.constructor = null

            testPackage.extractConstructors()

            testClass.methods shouldNot exist { it.name == "__init__" }
        }
    }

    @Nested
    inner class CreateAttributesForParametersOfConstructor {

        @Test
        fun `should create attributes for parameters of constructors that are neither implicit nor constant`() {
            testPackage.createAttributesForParametersOfConstructor()

            testClass.attributes.shouldExist { it.name == "positionOrName" }
        }

        @Test
        fun `should not create attributes for implicit parameters of constructors`() {
            testPackage.createAttributesForParametersOfConstructor()

            testClass.attributes shouldNot exist { it.name == "self" }
        }

        @Test
        fun `should not create attributes for constant parameters of constructors`() {
            testPackage.createAttributesForParametersOfConstructor()

            testClass.attributes shouldNot exist { it.name == "constant" }
        }
    }
}
