package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonConstructor
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.OriginalPythonFunction
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter
import io.kotest.assertions.asClue
import io.kotest.matchers.collections.exist
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldExist
import io.kotest.matchers.collections.shouldNotContain
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNot
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PostprocessorTest {
    private lateinit var testFunction: MutablePythonFunction
    private lateinit var testClass: MutablePythonClass
    private lateinit var testModule: MutablePythonModule
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        testFunction = MutablePythonFunction(name = "testFunction")
        testClass = MutablePythonClass(
            name = "TestClass",
            constructor = MutablePythonConstructor(
                parameters = listOf(
                    MutablePythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    MutablePythonParameter(
                        name = "positionOrName",
                        assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                    ),
                    MutablePythonParameter(
                        name = "constant",
                        assignedBy = PythonParameterAssignment.CONSTANT
                    )
                )
            ),
            methods = listOf(
                MutablePythonFunction(
                    name = "__init__",
                    parameters = listOf(
                        MutablePythonParameter(
                            name = "constructorParameter",
                            originalParameter = OriginalPythonParameter(name = "constructorParameter")
                        )
                    ),
                    originalFunction = OriginalPythonFunction(
                        qualifiedName = "testModule.TestClass.__init__",
                        parameters = listOf(
                            OriginalPythonParameter(name = "constructorParameter")
                        )
                    )
                )
            )
        )
        testModule = MutablePythonModule(
            name = "testModule",
            classes = listOf(testClass),
            functions = listOf(testFunction)
        )
        testPackage = MutablePythonPackage(
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
            val emptyTestModule = MutablePythonModule(name = "emptyTestModule")
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
        fun `should reorder parameters`() {
            val implicit = MutablePythonParameter(
                name = "implicit",
                assignedBy = PythonParameterAssignment.IMPLICIT
            )
            val positionOnly = MutablePythonParameter(
                name = "positionOnly",
                assignedBy = PythonParameterAssignment.POSITION_ONLY
            )
            val positionOrName = MutablePythonParameter(
                name = "positionOrName",
                assignedBy = PythonParameterAssignment.POSITION_OR_NAME
            )
            val nameOnly = MutablePythonParameter(
                name = "nameOnly",
                assignedBy = PythonParameterAssignment.NAME_ONLY
            )
            val attribute = MutablePythonParameter(
                name = "attribute",
                assignedBy = PythonParameterAssignment.ATTRIBUTE
            )
            val constant = MutablePythonParameter(
                name = "constant",
                assignedBy = PythonParameterAssignment.CONSTANT
            )

            testFunction.parameters += listOf(
                constant,
                attribute,
                nameOnly,
                positionOrName,
                positionOnly,
                implicit
            )

            testPackage.reorderParameters()

            testFunction.parameters.shouldContainExactly(
                listOf(
                    implicit,
                    positionOnly,
                    positionOrName,
                    nameOnly,
                    attribute,
                    constant
                )
            )
        }
    }

    @Nested
    inner class CreateConstructors {

        @Test
        fun `should create empty constructors if no __init__ method exists`() {
            testClass.constructor = null
            testClass.methods.clear()

            testPackage.createConstructors()

            testClass.constructor
                .shouldNotBeNull().asClue {
                    it.parameters.shouldBeEmpty()
                    it.callToOriginalAPI shouldBe OriginalPythonFunction(
                        qualifiedName = "testModule.TestClass",
                        parameters = emptyList()
                    )
                }
        }

        @Test
        fun `should copy parameters of __init__ methods`() {
            testClass.constructor = null

            testPackage.createConstructors()

            testClass.constructor
                .shouldNotBeNull()
                .parameters
                .map { it.name }
                .shouldContainExactly("constructorParameter")
        }

        @Test
        fun `should store call to original API`() {
            testClass.constructor = null

            testPackage.createConstructors()

            testClass.constructor
                .shouldNotBeNull()
                .callToOriginalAPI
                .shouldBe(
                    OriginalPythonFunction(
                        qualifiedName = "testModule.TestClass",
                        parameters = listOf(
                            OriginalPythonParameter(
                                name = "constructorParameter"
                            )
                        )
                    )
                )
        }

        @Test
        fun `should remove __init__ methods`() {
            testClass.constructor = null

            testPackage.createConstructors()

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
