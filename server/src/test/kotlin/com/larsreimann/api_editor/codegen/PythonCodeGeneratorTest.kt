package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.PythonArgument
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonBoolean
import com.larsreimann.api_editor.mutable_model.PythonCall
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonConstructor
import com.larsreimann.api_editor.mutable_model.PythonEnum
import com.larsreimann.api_editor.mutable_model.PythonEnumInstance
import com.larsreimann.api_editor.mutable_model.PythonFloat
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonInt
import com.larsreimann.api_editor.mutable_model.PythonMemberAccess
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonNamedType
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonReference
import com.larsreimann.api_editor.mutable_model.PythonString
import com.larsreimann.api_editor.mutable_model.PythonStringifiedExpression
import com.larsreimann.api_editor.mutable_model.PythonStringifiedType
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PythonCodeGeneratorTest {

    /* ****************************************************************************************************************
     * Declarations
     * ****************************************************************************************************************/

    @Nested
    inner class AttributeToPythonCode {

        @Test
        fun `should handle attributes without type and default value`() {
            val testAttribute = PythonAttribute(
                name = "attr"
            )

            testAttribute.toPythonCode() shouldBe "self.attr"
        }

        @Test
        fun `should handle attributes with type but without default value`() {
            val testAttribute = PythonAttribute(
                name = "attr",
                type = PythonStringifiedType("int")
            )

            testAttribute.toPythonCode() shouldBe "self.attr: int"
        }

        @Test
        fun `should handle attributes without type but with default value`() {
            val testAttribute = PythonAttribute(
                name = "attr",
                value = PythonStringifiedExpression("1")
            )

            testAttribute.toPythonCode() shouldBe "self.attr = 1"
        }

        @Test
        fun `should handle attributes with type and default value`() {
            val testAttribute = PythonAttribute(
                name = "attr",
                type = PythonStringifiedType("int"),
                value = PythonStringifiedExpression("1")
            )

            testAttribute.toPythonCode() shouldBe "self.attr: int = 1"
        }
    }

    @Nested
    inner class ClassToPythonCode {

        @Test
        fun `should create valid code for empty classes`() {
            val testClass = PythonClass(name = "TestClass")

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    pass
                """.trimMargin()
        }
    } // TODO

    @Nested
    inner class ConstructorToPythonCode {

        private lateinit var callToOriginalAPI: PythonCall
        private lateinit var testClass: PythonClass
        private lateinit var parametersWithBoundaries: List<PythonParameter>

        @BeforeEach
        fun reset() {
            callToOriginalAPI = PythonCall(
                PythonReference(
                    PythonClass(name = "OriginalClass")
                )
            )
            testClass = PythonClass(
                name = "TestClass",
                attributes = listOf(
                    PythonAttribute(
                        name = "testAttribute1",
                        value = PythonInt(1)
                    ),
                    PythonAttribute(
                        name = "testAttribute2",
                        value = PythonInt(2)
                    )
                )
            )
            parametersWithBoundaries = listOf(
                PythonParameter(
                    name = "self",
                    assignedBy = PythonParameterAssignment.IMPLICIT
                ),
                PythonParameter(
                    name = "testParameter1",
                    boundary = Boundary(
                        isDiscrete = false,
                        lowerIntervalLimit = 0.0,
                        lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                        upperIntervalLimit = 1.0,
                        upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
                    )
                ),
                PythonParameter(
                    name = "testParameter2",
                    boundary = Boundary(
                        isDiscrete = false,
                        lowerIntervalLimit = 0.0,
                        lowerLimitType = ComparisonOperator.LESS_THAN,
                        upperIntervalLimit = 1.0,
                        upperLimitType = ComparisonOperator.UNRESTRICTED
                    )
                )
            )
        }

        @Test
        fun `should create code for parameters`() {
            val testConstructor = PythonConstructor(
                parameters = listOf(
                    PythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    PythonParameter(
                        name = "positionOnly",
                        assignedBy = PythonParameterAssignment.POSITION_ONLY
                    ),
                    PythonParameter(
                        name = "positionOrName",
                        assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                    ),
                    PythonParameter(
                        name = "nameOnly",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    )
                )
            )

            testConstructor.toPythonCode() shouldBe """
                |def __init__(self, positionOnly, /, positionOrName, *, nameOnly):
                |    pass
            """.trimMargin()
        }

        @Test
        fun `should handle constructors (no boundaries, no attributes, no call)`() {
            val testConstructor = PythonConstructor()

            testConstructor.toPythonCode() shouldBe """
                |def __init__():
                |    pass
            """.trimMargin()
        }

        @Test
        fun `should handle constructors (no boundaries, no attributes, call)`() {
            val testConstructor = PythonConstructor(callToOriginalAPI = callToOriginalAPI)

            testConstructor.toPythonCode() shouldBe """
                |def __init__():
                |    self.instance = OriginalClass()
            """.trimMargin()
        }

        @Test
        fun `should handle constructors (no boundaries, attributes, no call)`() {
            val testConstructor = PythonConstructor()
            testClass.constructor = testConstructor

            testConstructor.toPythonCode() shouldBe """
                |def __init__():
                |    self.testAttribute1 = 1
                |    self.testAttribute2 = 2
            """.trimMargin()
        }

        @Test
        fun `should handle constructors (no boundaries, attributes, call)`() {
            val testConstructor = PythonConstructor(callToOriginalAPI = callToOriginalAPI)
            testClass.constructor = testConstructor

            testConstructor.toPythonCode() shouldBe """
                |def __init__():
                |    self.testAttribute1 = 1
                |    self.testAttribute2 = 2
                |
                |    self.instance = OriginalClass()
            """.trimMargin()
        }

        @Test
        fun `should handle constructors (boundaries, no attributes, no call)`() {
            val testConstructor = PythonConstructor(parameters = parametersWithBoundaries)

            testConstructor.toPythonCode() shouldBe """
                |def __init__(self, testParameter1, testParameter2):
                |    if not 0.0 <= testParameter1 <= 1.0:
                |        raise ValueError('Valid values of testParameter1 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter1))
                |    if not 0.0 < testParameter2:
                |        raise ValueError('Valid values of testParameter2 must be greater than 0.0, but {} was assigned.'.format(testParameter2))
            """.trimMargin()
        }

        @Test
        fun `should handle constructors (boundaries, no attributes, call)`() {
            val testConstructor = PythonConstructor(
                callToOriginalAPI = callToOriginalAPI,
                parameters = parametersWithBoundaries
            )

            testConstructor.toPythonCode() shouldBe """
                |def __init__(self, testParameter1, testParameter2):
                |    if not 0.0 <= testParameter1 <= 1.0:
                |        raise ValueError('Valid values of testParameter1 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter1))
                |    if not 0.0 < testParameter2:
                |        raise ValueError('Valid values of testParameter2 must be greater than 0.0, but {} was assigned.'.format(testParameter2))
                |
                |    self.instance = OriginalClass()
            """.trimMargin()
        }

        @Test
        fun `should handle constructors (boundaries, attributes, no call)`() {
            val testConstructor = PythonConstructor(
                parameters = parametersWithBoundaries
            )
            testClass.constructor = testConstructor

            testConstructor.toPythonCode() shouldBe """
                |def __init__(self, testParameter1, testParameter2):
                |    if not 0.0 <= testParameter1 <= 1.0:
                |        raise ValueError('Valid values of testParameter1 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter1))
                |    if not 0.0 < testParameter2:
                |        raise ValueError('Valid values of testParameter2 must be greater than 0.0, but {} was assigned.'.format(testParameter2))
                |
                |    self.testAttribute1 = 1
                |    self.testAttribute2 = 2
            """.trimMargin()
        }

        @Test
        fun `should handle constructors (boundaries, attributes, call)`() {
            val testConstructor = PythonConstructor(
                callToOriginalAPI = callToOriginalAPI,
                parameters = parametersWithBoundaries
            )
            testClass.constructor = testConstructor

            testConstructor.toPythonCode() shouldBe """
                |def __init__(self, testParameter1, testParameter2):
                |    if not 0.0 <= testParameter1 <= 1.0:
                |        raise ValueError('Valid values of testParameter1 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter1))
                |    if not 0.0 < testParameter2:
                |        raise ValueError('Valid values of testParameter2 must be greater than 0.0, but {} was assigned.'.format(testParameter2))
                |
                |    self.testAttribute1 = 1
                |    self.testAttribute2 = 2
                |
                |    self.instance = OriginalClass()
            """.trimMargin()
        }
    }

    @Nested
    inner class EnumToPythonCode {

        @Test
        fun `should create valid Python code for enums without instances`() {
            val testEnum = PythonEnum(name = "TestEnum")

            testEnum.toPythonCode() shouldBe """
                |class TestEnum(Enum):
                |    pass
            """.trimMargin()
        }

        @Test
        fun `should create valid Python code for enums with instances`() {
            val testEnum = PythonEnum(
                name = "TestEnum",
                instances = listOf(
                    PythonEnumInstance(
                        name = "TestEnumInstance1",
                        value = PythonString("inst1")
                    ),
                    PythonEnumInstance(
                        name = "TestEnumInstance2",
                        value = PythonString("inst2")
                    )
                )
            )

            testEnum.toPythonCode() shouldBe """
                |class TestEnum(Enum):
                |    TestEnumInstance1 = 'inst1',
                |    TestEnumInstance2 = 'inst2'
            """.trimMargin()
        }
    }

    @Nested
    inner class EnumInstanceToPythonCode {

        @Test
        fun `should create Python code`() {
            val testEnumInstance = PythonEnumInstance(
                name = "TestEnumInstance1",
                value = PythonString("inst1")
            )

            testEnumInstance.toPythonCode() shouldBe "TestEnumInstance1 = 'inst1'"
        }
    }

    @Nested
    inner class FunctionToPythonCode {

        @Test
        fun `should access value of enum parameters`() {
            val testParameter = PythonParameter(name = "testParameter")
            val testFunction = PythonFunction(
                name = "testFunction",
                parameters = listOf(
                    testParameter
                ),
                callToOriginalAPI = PythonCall(
                    receiver = PythonStringifiedExpression("testModule.testFunction"),
                    arguments = listOf(
                        PythonArgument(
                            value = PythonMemberAccess(
                                receiver = PythonReference(testParameter),
                                member = PythonReference(PythonAttribute(name = "value"))
                            )
                        )
                    )
                )
            )

            testFunction.toPythonCode() shouldBe """
                |def testFunction(testParameter):
                |    return testModule.testFunction(testParameter.value)
            """.trimMargin()
        }

        @Test
        fun `should access attribute of parameter objects`() {
            val testParameter = PythonParameter(name = "testGroup")
            val testFunction = PythonFunction(
                name = "testFunction",
                parameters = listOf(
                    testParameter
                ),
                callToOriginalAPI = PythonCall(
                    receiver = PythonStringifiedExpression("testModule.testFunction"),
                    arguments = listOf(
                        PythonArgument(
                            value = PythonMemberAccess(
                                receiver = PythonReference(testParameter),
                                member = PythonReference(
                                    PythonAttribute(name = "newParameter1")
                                )
                            )
                        ),
                        PythonArgument(
                            name = "oldParameter2",
                            value = PythonMemberAccess(
                                receiver = PythonReference(testParameter),
                                member = PythonReference(
                                    PythonAttribute(name = "newParameter2")
                                )
                            )
                        )
                    )
                )
            )

            testFunction.toPythonCode() shouldBe """
                |def testFunction(testGroup):
                |    return testModule.testFunction(testGroup.newParameter1, oldParameter2=testGroup.newParameter2)
            """.trimMargin()
        }
    } // TODO

    @Nested
    inner class ModuleToPythonCode {

        @Test
        fun `should import Enum if the module contains enums`() {
            val testModule = PythonModule(
                name = "testModule",
                enums = listOf(
                    PythonEnum(name = "TestEnum")
                )
            )

            testModule.toPythonCode() shouldBe """
                |from enum import Enum
                |
                |class TestEnum(Enum):
                |    pass
                |
            """.trimMargin()
        }

        @Test
        fun `should not import Enum if the module does not contain enums`() {
            val testModule = PythonModule(name = "testModule")

            testModule.toPythonCode() shouldBe ""
        }
    } // TODO

    @Nested
    inner class ParameterListToPythonCode {

    } // TODO

    @Nested
    inner class ParameterToPythonCode {

        @Test
        fun `should handle parameters without type and default value`() {
            val testParameter = PythonParameter(
                name = "param"
            )

            testParameter.toPythonCode() shouldBe "param"
        }

        @Test
        fun `should handle parameters with type but without default value`() {
            val testParameter = PythonParameter(
                name = "param",
                type = PythonStringifiedType("int")
            )

            testParameter.toPythonCode() shouldBe "param: int"
        }

        @Test
        fun `should handle parameters without type but with default value`() {
            val testParameter = PythonParameter(
                name = "param",
                defaultValue = PythonStringifiedExpression("1")
            )

            testParameter.toPythonCode() shouldBe "param=1"
        }

        @Test
        fun `should handle parameters with type and default value`() {
            val testParameter = PythonParameter(
                name = "param",
                type = PythonStringifiedType("int"),
                defaultValue = PythonStringifiedExpression("1")
            )

            testParameter.toPythonCode() shouldBe "param: int = 1"
        }
    }


    /* ****************************************************************************************************************
     * Expressions
     * ****************************************************************************************************************/

    @Nested
    inner class ExpressionToPythonCode {

        @Test
        fun `should handle false boolean`() {
            val expression = PythonBoolean(false)
            expression.toPythonCode() shouldBe "False"
        }

        @Test
        fun `should handle true boolean`() {
            val expression = PythonBoolean(true)
            expression.toPythonCode() shouldBe "True"
        }

        @Test
        fun `should handle calls`() {
            val expression = PythonCall(
                receiver = PythonStringifiedExpression("function"),
                arguments = listOf(
                    PythonArgument(value = PythonInt(1)),
                    PythonArgument(
                        name = "param",
                        value = PythonInt(1)
                    )
                )
            )
            expression.toPythonCode() shouldBe "function(1, param=1)"
        }

        @Test
        fun `should handle floats`() {
            val expression = PythonFloat(1.0)
            expression.toPythonCode() shouldBe "1.0"
        }

        @Test
        fun `should handle ints`() {
            val expression = PythonInt(1)
            expression.toPythonCode() shouldBe "1"
        }

        @Test
        fun `should handle member accesses`() {
            val expression = PythonMemberAccess(
                receiver = PythonReference(PythonParameter(name = "param")),
                member = PythonReference(PythonAttribute(name = "value"))
            )
            expression.toPythonCode() shouldBe "param.value"
        }

        @Test
        fun `should handle references`() {
            val expression = PythonReference(PythonParameter("param"))
            expression.toPythonCode() shouldBe "param"
        }

        @Test
        fun `should handle strings`() {
            val expression = PythonString("string")
            expression.toPythonCode() shouldBe "'string'"
        }

        @Test
        fun `should handle stringified expression`() {
            val expression = PythonStringifiedExpression("1")
            expression.toPythonCode() shouldBe "1"
        }
    }


    /* ****************************************************************************************************************
     * Types
     * ****************************************************************************************************************/

    @Nested
    inner class TypeToPythonCodeOrNull {

        @Test
        fun `should handle named types`() {
            val type = PythonNamedType(PythonEnum("TestEnum"))
            type.toPythonCodeOrNull() shouldBe "TestEnum"
        }

        @Test
        fun `should convert stringified type 'bool' to Boolean`() {
            val smlType = PythonStringifiedType("bool")
            smlType.toPythonCodeOrNull() shouldBe "bool"
        }

        @Test
        fun `should convert stringified type 'float' to Float`() {
            val smlType = PythonStringifiedType("float")
            smlType.toPythonCodeOrNull() shouldBe "float"
        }

        @Test
        fun `should convert stringified type 'int' to Int`() {
            val smlType = PythonStringifiedType("int")
            smlType.toPythonCodeOrNull() shouldBe "int"
        }

        @Test
        fun `should convert stringified type 'str' to String`() {
            val smlType = PythonStringifiedType("str")
            smlType.toPythonCodeOrNull() shouldBe "str"
        }

        @Test
        fun `should return null for other types`() {
            val type = PythonStringifiedType("")
            type.toPythonCodeOrNull().shouldBeNull()
        }
    }


    /* ****************************************************************************************************************
     * Other
     * ****************************************************************************************************************/

    @Nested
    inner class ArgumentToPythonCode {

        @Test
        fun `should handle positional arguments`() {
            val testArgument = PythonArgument(value = PythonInt(1))

            testArgument.toPythonCode() shouldBe "1"
        }

        @Test
        fun `should handle named arguments`() {
            val testArgument = PythonArgument(
                name = "arg",
                value = PythonInt(1)
            )

            testArgument.toPythonCode() shouldBe "arg=1"
        }
    }

    @Nested
    inner class BoundaryToPythonCode {

    } // TODO
}
