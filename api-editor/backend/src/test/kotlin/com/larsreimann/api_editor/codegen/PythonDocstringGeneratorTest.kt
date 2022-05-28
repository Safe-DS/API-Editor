package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonConstructor
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonInt
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonStringifiedType
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PythonDocstringGeneratorTest {

    @Nested
    inner class ClassDocstring {
        private lateinit var testClass: PythonClass

        @BeforeEach
        fun reset() {
            testClass = PythonClass(
                name = "TestClass",
                constructor = PythonConstructor(
                    parameters = listOf(
                        PythonParameter(
                            name = "testParameter1",
                            description = "Test parameter 1"
                        ),
                        PythonParameter(
                            name = "testParameter2",
                            type = PythonStringifiedType("int"),
                            description = "Test parameter 2"
                        ),
                        PythonParameter(
                            name = "testParameter3"
                        ),
                        PythonParameter(
                            name = "testParameter4",
                            type = PythonStringifiedType("str")
                        )
                    )
                ),
                attributes = listOf(
                    PythonAttribute(
                        name = "testAttribute1",
                        value = PythonInt(1),
                        description = "Test attribute 1"
                    ),
                    PythonAttribute(
                        name = "testAttribute2",
                        type = PythonStringifiedType("int"),
                        value = PythonInt(2),
                        description = "Test attribute 2"
                    ),
                    PythonAttribute(
                        name = "testAttribute3",
                        value = PythonInt(3),
                    ),
                    PythonAttribute(
                        name = "testAttribute4",
                        type = PythonStringifiedType("str"),
                        value = PythonInt(4),
                    )
                ),
                description = "Lorem ipsum"
            )
        }

        @Test
        fun `should create docstring (no description, no parameters, no attributes)`() {
            testClass.description = ""
            testClass.constructor = null
            testClass.attributes.clear()

            testClass.docstring() shouldBe ""
        }

        @Test
        fun `should create docstring (no description, no parameters, attributes)`() {
            testClass.description = ""
            testClass.constructor = null

            testClass.docstring() shouldBe """
                    |Attributes
                    |----------
                    |testAttribute1
                    |    Test attribute 1
                    |testAttribute2 : int
                    |    Test attribute 2
                    |testAttribute3
                    |testAttribute4 : str
            """.trimMargin()
        }

        @Test
        fun `should create docstring (no description, parameters, no attributes)`() {
            testClass.description = ""
            testClass.attributes.clear()

            testClass.docstring() shouldBe """
                    |Parameters
                    |----------
                    |testParameter1
                    |    Test parameter 1
                    |testParameter2 : int
                    |    Test parameter 2
                    |testParameter3
                    |testParameter4 : str
            """.trimMargin()
        }

        @Test
        fun `should create docstring (no description, parameters, attributes)`() {
            testClass.description = ""

            testClass.docstring() shouldBe """
                    |Parameters
                    |----------
                    |testParameter1
                    |    Test parameter 1
                    |testParameter2 : int
                    |    Test parameter 2
                    |testParameter3
                    |testParameter4 : str
                    |
                    |Attributes
                    |----------
                    |testAttribute1
                    |    Test attribute 1
                    |testAttribute2 : int
                    |    Test attribute 2
                    |testAttribute3
                    |testAttribute4 : str
            """.trimMargin()
        }

        @Test
        fun `should create docstring (description, no parameter, no attributes)`() {
            testClass.constructor = null
            testClass.attributes.clear()

            testClass.docstring() shouldBe """
                    |Lorem ipsum
            """.trimMargin()
        }

        @Test
        fun `should create docstring (description, no parameters, attributes)`() {
            testClass.constructor = null

            testClass.docstring() shouldBe """
                    |Lorem ipsum
                    |
                    |Attributes
                    |----------
                    |testAttribute1
                    |    Test attribute 1
                    |testAttribute2 : int
                    |    Test attribute 2
                    |testAttribute3
                    |testAttribute4 : str
            """.trimMargin()
        }

        @Test
        fun `should create docstring (description, parameters, no attributes)`() {
            testClass.attributes.clear()

            testClass.docstring() shouldBe """
                    |Lorem ipsum
                    |
                    |Parameters
                    |----------
                    |testParameter1
                    |    Test parameter 1
                    |testParameter2 : int
                    |    Test parameter 2
                    |testParameter3
                    |testParameter4 : str
            """.trimMargin()
        }


        @Test
        fun `should create docstring (description, parameters, attributes)`() {
            testClass.docstring() shouldBe """
                    |Lorem ipsum
                    |
                    |Parameters
                    |----------
                    |testParameter1
                    |    Test parameter 1
                    |testParameter2 : int
                    |    Test parameter 2
                    |testParameter3
                    |testParameter4 : str
                    |
                    |Attributes
                    |----------
                    |testAttribute1
                    |    Test attribute 1
                    |testAttribute2 : int
                    |    Test attribute 2
                    |testAttribute3
                    |testAttribute4 : str
            """.trimMargin()
        }
    }

    @Nested
    inner class FunctionToPythonCode {

        private lateinit var testFunction: PythonFunction

        @BeforeEach
        fun reset() {
            testFunction = PythonFunction(
                name = "testFunction",
                parameters = listOf(
                    PythonParameter(
                        name = "testParameter1",
                        description = "Test parameter 1"
                    ),
                    PythonParameter(
                        name = "testParameter2",
                        type = PythonStringifiedType("int"),
                        description = "Test parameter 2"
                    ),
                    PythonParameter(
                        name = "testParameter3"
                    ),
                    PythonParameter(
                        name = "testParameter4",
                        type = PythonStringifiedType("str")
                    )
                ),
                description = "Lorem ipsum"
            )
        }

        @Test
        fun `should create docstring (no description, no parameters)`() {
            testFunction.description = ""
            testFunction.parameters.clear()

            testFunction.docstring() shouldBe ""
        }

        @Test
        fun `should create docstring (no description, parameters)`() {
            testFunction.description = ""

            testFunction.docstring() shouldBe """
                    |Parameters
                    |----------
                    |testParameter1
                    |    Test parameter 1
                    |testParameter2 : int
                    |    Test parameter 2
                    |testParameter3
                    |testParameter4 : str
            """.trimMargin()
        }

        @Test
        fun `should create docstring (description, no parameters)`() {
            testFunction.parameters.clear()

            testFunction.docstring() shouldBe """
                    |Lorem ipsum
            """.trimMargin()
        }

        @Test
        fun `should create docstring (description, parameters)`() {
            testFunction.docstring() shouldBe """
                    |Lorem ipsum
                    |
                    |Parameters
                    |----------
                    |testParameter1
                    |    Test parameter 1
                    |testParameter2 : int
                    |    Test parameter 2
                    |testParameter3
                    |testParameter4 : str
            """.trimMargin()
        }
    }
}
