package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.ComparisonOperator.LESS_THAN
import com.larsreimann.api_editor.model.ComparisonOperator.LESS_THAN_OR_EQUALS
import com.larsreimann.api_editor.model.ComparisonOperator.UNRESTRICTED
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonCall
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonConstructor
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonInt
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonReference
import com.larsreimann.api_editor.mutable_model.PythonStringifiedType
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PDocstringGeneratorTest {

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

            testClass.toPythonCode() shouldBe ""
        }

        @Test
        fun `should create docstring (no description, no parameters, attributes)`() {
            testClass.description = ""
            testClass.constructor = null

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    ${"\"\"\""}
                    |    Attributes
                    |    ----------
                    |    testAttribute1
                    |        Test attribute 1
                    |    testAttribute2 : int
                    |        Test attribute 2
                    |    testAttribute3
                    |    testAttribute4 : str
                    |    ${"\"\"\""}
                    |
                    |    def __init__():
                    |        self.testAttribute1 = 1
                    |        self.testAttribute2: int = 2
                    |        self.testAttribute3 = 3
                    |        self.testAttribute4: str = 4
            """.trimMargin()
        }

        @Test
        fun `should create docstring (no description, parameters, no attributes)`() {

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    ${"\"\"\""}
                    |    Lorem ipsum
                    |
                    |    Parameters
                    |    ----------
                    |    testParameter1
                    |        Test parameter 1
                    |    testParameter2 : int
                    |        Test parameter 2
                    |    testParameter3
                    |    testParameter4 : str
                    |
                    |    Attributes
                    |    ----------
                    |    testAttribute1
                    |        Test attribute 1
                    |    testAttribute2 : int
                    |        Test attribute 2
                    |    testAttribute3
                    |    testAttribute4 : str
                    |    ${"\"\"\""}
                    |
                    |    def __init__(testParameter1, testParameter2: int, testParameter3, testParameter4: str):
                    |        self.testAttribute1 = 1
                    |        self.testAttribute2: int = 2
                    |        self.testAttribute3 = 3
                    |        self.testAttribute4: str = 4
            """.trimMargin()
        }

        @Test
        fun `should create docstring (no description, parameters, attributes)`() {

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    ${"\"\"\""}
                    |    Lorem ipsum
                    |
                    |    Parameters
                    |    ----------
                    |    testParameter1
                    |        Test parameter 1
                    |    testParameter2 : int
                    |        Test parameter 2
                    |    testParameter3
                    |    testParameter4 : str
                    |
                    |    Attributes
                    |    ----------
                    |    testAttribute1
                    |        Test attribute 1
                    |    testAttribute2 : int
                    |        Test attribute 2
                    |    testAttribute3
                    |    testAttribute4 : str
                    |    ${"\"\"\""}
                    |
                    |    def __init__(testParameter1, testParameter2: int, testParameter3, testParameter4: str):
                    |        self.testAttribute1 = 1
                    |        self.testAttribute2: int = 2
                    |        self.testAttribute3 = 3
                    |        self.testAttribute4: str = 4
            """.trimMargin()
        }

        @Test
        fun `should create docstring (description, no parameter, no attributes)`() {
            testClass.constructor = null
            testClass.attributes.clear()

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    ${"\"\"\""}
                    |    Lorem ipsum
                    |    ${"\"\"\""}
                    |
                    |    pass
            """.trimMargin()
        }

        @Test
        fun `should create docstring (description, no parameters, attributes)`() {

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    ${"\"\"\""}
                    |    Lorem ipsum
                    |
                    |    Parameters
                    |    ----------
                    |    testParameter1
                    |        Test parameter 1
                    |    testParameter2 : int
                    |        Test parameter 2
                    |    testParameter3
                    |    testParameter4 : str
                    |
                    |    Attributes
                    |    ----------
                    |    testAttribute1
                    |        Test attribute 1
                    |    testAttribute2 : int
                    |        Test attribute 2
                    |    testAttribute3
                    |    testAttribute4 : str
                    |    ${"\"\"\""}
                    |
                    |    def __init__(testParameter1, testParameter2: int, testParameter3, testParameter4: str):
                    |        self.testAttribute1 = 1
                    |        self.testAttribute2: int = 2
                    |        self.testAttribute3 = 3
                    |        self.testAttribute4: str = 4
            """.trimMargin()
        }

        @Test
        fun `should create docstring (description, parameters, no attributes)`() {

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    ${"\"\"\""}
                    |    Lorem ipsum
                    |
                    |    Parameters
                    |    ----------
                    |    testParameter1
                    |        Test parameter 1
                    |    testParameter2 : int
                    |        Test parameter 2
                    |    testParameter3
                    |    testParameter4 : str
                    |
                    |    Attributes
                    |    ----------
                    |    testAttribute1
                    |        Test attribute 1
                    |    testAttribute2 : int
                    |        Test attribute 2
                    |    testAttribute3
                    |    testAttribute4 : str
                    |    ${"\"\"\""}
                    |
                    |    def __init__(testParameter1, testParameter2: int, testParameter3, testParameter4: str):
                    |        self.testAttribute1 = 1
                    |        self.testAttribute2: int = 2
                    |        self.testAttribute3 = 3
                    |        self.testAttribute4: str = 4
            """.trimMargin()
        }


        @Test
        fun `should create docstring (description, parameters, attributes)`() {
            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    ${"\"\"\""}
                    |    Lorem ipsum
                    |
                    |    Parameters
                    |    ----------
                    |    testParameter1
                    |        Test parameter 1
                    |    testParameter2 : int
                    |        Test parameter 2
                    |    testParameter3
                    |    testParameter4 : str
                    |
                    |    Attributes
                    |    ----------
                    |    testAttribute1
                    |        Test attribute 1
                    |    testAttribute2 : int
                    |        Test attribute 2
                    |    testAttribute3
                    |    testAttribute4 : str
                    |    ${"\"\"\""}
                    |
                    |    def __init__(testParameter1, testParameter2: int, testParameter3, testParameter4: str):
                    |        self.testAttribute1 = 1
                    |        self.testAttribute2: int = 2
                    |        self.testAttribute3 = 3
                    |        self.testAttribute4: str = 4
            """.trimMargin()
        }
    }

    @Nested
    inner class FunctionToPythonCode {

        private lateinit var callToOriginalAPI: PythonCall
        private lateinit var parametersWithBoundaries: List<PythonParameter>

        @BeforeEach
        fun reset() {
            callToOriginalAPI = PythonCall(
                PythonReference(
                    PythonFunction(name = "testModule.testFunction")
                )
            )
            parametersWithBoundaries = listOf(
                PythonParameter(
                    name = "testParameter1",
                    boundary = Boundary(
                        isDiscrete = false,
                        lowerIntervalLimit = 0.0,
                        lowerLimitType = LESS_THAN_OR_EQUALS,
                        upperIntervalLimit = 1.0,
                        upperLimitType = LESS_THAN_OR_EQUALS
                    )
                ),
                PythonParameter(
                    name = "testParameter2",
                    boundary = Boundary(
                        isDiscrete = false,
                        lowerIntervalLimit = 0.0,
                        lowerLimitType = LESS_THAN,
                        upperIntervalLimit = 1.0,
                        upperLimitType = UNRESTRICTED
                    )
                )
            )
        }

        @Test
        fun `should create docstring if it is not blank`() {
            val testFunction = PythonFunction(
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

            testFunction.toPythonCode() shouldBe """
                    |def testFunction(testParameter1, testParameter2: int, testParameter3, testParameter4: str):
                    |    ${"\"\"\""}
                    |    Lorem ipsum
                    |
                    |    Parameters
                    |    ----------
                    |    testParameter1
                    |        Test parameter 1
                    |    testParameter2 : int
                    |        Test parameter 2
                    |    testParameter3
                    |    testParameter4 : str
                    |    ${"\"\"\""}
                    |
                    |    pass
            """.trimMargin()
        }
    }
}
