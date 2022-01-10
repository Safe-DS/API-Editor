package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.ComparisonOperator.LESS_THAN
import com.larsreimann.api_editor.model.ComparisonOperator.LESS_THAN_OR_EQUALS
import com.larsreimann.api_editor.model.ComparisonOperator.UNRESTRICTED
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
        fun `should create valid code without constructor and methods`() {
            val testClass = PythonClass(
                name = "TestClass"
            )

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    pass
                """.trimMargin()
        }

        @Test
        fun `should create valid code without constructor but with methods`() {
            val testClass = PythonClass(
                name = "TestClass",
                methods = listOf(
                    PythonFunction(name = "testFunction1"),
                    PythonFunction(name = "testFunction2")
                )
            )

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    def testFunction1():
                    |        pass
                    |
                    |    def testFunction2():
                    |        pass
                """.trimMargin()
        }

        @Test
        fun `should create valid code with constructor but without methods`() {
            val testClass = PythonClass(
                name = "TestClass",
                constructor = PythonConstructor()
            )

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    def __init__():
                    |        pass
                """.trimMargin()
        }

        @Test
        fun `should create valid code with constructor and methods`() {
            val testClass = PythonClass(
                name = "TestClass",
                constructor = PythonConstructor(),
                methods = listOf(
                    PythonFunction(name = "testFunction1"),
                    PythonFunction(name = "testFunction2")
                )
            )

            testClass.toPythonCode() shouldBe """
                    |class TestClass:
                    |    def __init__():
                    |        pass
                    |
                    |    def testFunction1():
                    |        pass
                    |
                    |    def testFunction2():
                    |        pass
                """.trimMargin()
        }
    }

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
        fun `should add staticmethod decorator to static methods`() {
            val testFunction = PythonFunction(
                name = "testFunction",
                decorators = mutableListOf("staticmethod")
            )
            PythonClass(
                name = "TestClass",
                methods = listOf(testFunction)
            )

            testFunction.toPythonCode() shouldBe """
                |@staticmethod
                |def testFunction():
                |    pass
            """.trimMargin()
        }

        @Test
        fun `should create code for parameters`() {
            val testFunction = PythonFunction(
                name = "testFunction",
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

            testFunction.toPythonCode() shouldBe """
                |def testFunction(self, positionOnly, /, positionOrName, *, nameOnly):
                |    pass
            """.trimMargin()
        }

        @Test
        fun `should handle functions (no boundaries, no call)`() {
            val testFunction = PythonFunction(
                name = "testFunction"
            )

            testFunction.toPythonCode() shouldBe """
                |def testFunction():
                |    pass
            """.trimMargin()
        }

        @Test
        fun `should handle functions (no boundaries, call)`() {
            val testFunction = PythonFunction(
                name = "testFunction",
                callToOriginalAPI = callToOriginalAPI
            )

            testFunction.toPythonCode() shouldBe """
                |def testFunction():
                |    return testModule.testFunction()
            """.trimMargin()
        }

        @Test
        fun `should handle functions (boundaries, no call)`() {
            val testFunction = PythonFunction(
                name = "testFunction",
                parameters = parametersWithBoundaries
            )

            testFunction.toPythonCode() shouldBe """
                |def testFunction(testParameter1, testParameter2):
                |    if not 0.0 <= testParameter1 <= 1.0:
                |        raise ValueError('Valid values of testParameter1 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter1))
                |    if not 0.0 < testParameter2:
                |        raise ValueError('Valid values of testParameter2 must be greater than 0.0, but {} was assigned.'.format(testParameter2))
            """.trimMargin()
        }

        @Test
        fun `should handle functions (boundaries, call)`() {
            val testFunction = PythonFunction(
                name = "testFunction",
                callToOriginalAPI = callToOriginalAPI,
                parameters = parametersWithBoundaries
            )

            testFunction.toPythonCode() shouldBe """
                |def testFunction(testParameter1, testParameter2):
                |    if not 0.0 <= testParameter1 <= 1.0:
                |        raise ValueError('Valid values of testParameter1 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter1))
                |    if not 0.0 < testParameter2:
                |        raise ValueError('Valid values of testParameter2 must be greater than 0.0, but {} was assigned.'.format(testParameter2))
                |
                |    return testModule.testFunction()
            """.trimMargin()
        }
    }

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

        private lateinit var implicit: PythonParameter
        private lateinit var positionOnly: PythonParameter
        private lateinit var positionOrName: PythonParameter
        private lateinit var nameOnly: PythonParameter

        @BeforeEach
        fun reset() {
            implicit = PythonParameter(
                name = "implicit",
                assignedBy = PythonParameterAssignment.IMPLICIT
            )
            positionOnly = PythonParameter(
                name = "positionOnly",
                assignedBy = PythonParameterAssignment.POSITION_ONLY
            )
            positionOrName = PythonParameter(
                name = "positionOrName",
                assignedBy = PythonParameterAssignment.POSITION_OR_NAME
            )
            nameOnly = PythonParameter(
                name = "nameOnly",
                assignedBy = PythonParameterAssignment.NAME_ONLY
            )
        }

        @Test
        fun `should handle parameter lists (no IMPLICIT, no POSITION_ONLY, no POSITION_OR_NAME, no NAME_ONLY`() {
            val parameters = listOf<PythonParameter>()

            parameters.toPythonCode() shouldBe ""
        }

        @Test
        fun `should handle parameter lists (no IMPLICIT, no POSITION_ONLY, no POSITION_OR_NAME, NAME_ONLY`() {
            val parameters = listOf(nameOnly)

            parameters.toPythonCode() shouldBe "*, nameOnly"
        }

        @Test
        fun `should handle parameter lists (no IMPLICIT, no POSITION_ONLY, POSITION_OR_NAME, no NAME_ONLY`() {
            val parameters = listOf(positionOrName)

            parameters.toPythonCode() shouldBe "positionOrName"
        }

        @Test
        fun `should handle parameter lists (no IMPLICIT, no POSITION_ONLY, POSITION_OR_NAME, NAME_ONLY`() {
            val parameters = listOf(positionOrName, nameOnly)

            parameters.toPythonCode() shouldBe "positionOrName, *, nameOnly"
        }

        @Test
        fun `should handle parameter lists (no IMPLICIT, POSITION_ONLY, no POSITION_OR_NAME, no NAME_ONLY`() {
            val parameters = listOf(positionOnly)

            parameters.toPythonCode() shouldBe "positionOnly, /"
        }

        @Test
        fun `should handle parameter lists (no IMPLICIT, POSITION_ONLY, no POSITION_OR_NAME, NAME_ONLY`() {
            val parameters = listOf(positionOnly, nameOnly)

            parameters.toPythonCode() shouldBe "positionOnly, /, *, nameOnly"
        }

        @Test
        fun `should handle parameter lists (no IMPLICIT, POSITION_ONLY, POSITION_OR_NAME, no NAME_ONLY`() {
            val parameters = listOf(positionOnly, positionOrName)

            parameters.toPythonCode() shouldBe "positionOnly, /, positionOrName"
        }

        @Test
        fun `should handle parameter lists (no IMPLICIT, POSITION_ONLY, POSITION_OR_NAME, NAME_ONLY`() {
            val parameters = listOf(positionOnly, positionOrName, nameOnly)

            parameters.toPythonCode() shouldBe "positionOnly, /, positionOrName, *, nameOnly"
        }

        @Test
        fun `should handle parameter lists (IMPLICIT, no POSITION_ONLY, no POSITION_OR_NAME, no NAME_ONLY`() {
            val parameters = listOf(implicit)

            parameters.toPythonCode() shouldBe "implicit"
        }

        @Test
        fun `should handle parameter lists (IMPLICIT, no POSITION_ONLY, no POSITION_OR_NAME, NAME_ONLY`() {
            val parameters = listOf(implicit, nameOnly)

            parameters.toPythonCode() shouldBe "implicit, *, nameOnly"
        }

        @Test
        fun `should handle parameter lists (IMPLICIT, no POSITION_ONLY, POSITION_OR_NAME, no NAME_ONLY`() {
            val parameters = listOf(implicit, positionOrName)

            parameters.toPythonCode() shouldBe "implicit, positionOrName"
        }

        @Test
        fun `should handle parameter lists (IMPLICIT, no POSITION_ONLY, POSITION_OR_NAME, NAME_ONLY`() {
            val parameters = listOf(implicit, positionOrName, nameOnly)

            parameters.toPythonCode() shouldBe "implicit, positionOrName, *, nameOnly"
        }

        @Test
        fun `should handle parameter lists (IMPLICIT, POSITION_ONLY, no POSITION_OR_NAME, no NAME_ONLY`() {
            val parameters = listOf(implicit, positionOnly)

            parameters.toPythonCode() shouldBe "implicit, positionOnly, /"
        }

        @Test
        fun `should handle parameter lists (IMPLICIT, POSITION_ONLY, no POSITION_OR_NAME, NAME_ONLY`() {
            val parameters = listOf(implicit, positionOnly, nameOnly)

            parameters.toPythonCode() shouldBe "implicit, positionOnly, /, *, nameOnly"
        }

        @Test
        fun `should handle parameter lists (IMPLICIT, POSITION_ONLY, POSITION_OR_NAME, no NAME_ONLY`() {
            val parameters = listOf(implicit, positionOnly, positionOrName)

            parameters.toPythonCode() shouldBe "implicit, positionOnly, /, positionOrName"
        }

        @Test
        fun `should handle parameter lists (IMPLICIT, POSITION_ONLY, POSITION_OR_NAME, NAME_ONLY`() {
            val parameters = listOf(implicit, positionOnly, positionOrName, nameOnly)

            parameters.toPythonCode() shouldBe "implicit, positionOnly, /, positionOrName, *, nameOnly"
        }
    }

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

        @Test
        fun `should add an extra check for discrete boundaries`() {
            val boundary = Boundary(
                isDiscrete = true,
                lowerIntervalLimit = 0.0,
                lowerLimitType = UNRESTRICTED,
                upperIntervalLimit = 1.0,
                upperLimitType = UNRESTRICTED
            )

            boundary.toPythonCode("testParameter") shouldBe """
                |if not (isinstance(testParameter, int) or (isinstance(testParameter, float) and testParameter.is_integer())):
                |    raise ValueError('testParameter' needs to be an integer, but {} was assigned.'.format(testParameter))
            """.trimMargin()
        }

        @Test
        fun `should handle continuous boundaries (UNRESTRICTED, UNRESTRICTED)`() {
            val boundary = Boundary(
                isDiscrete = false,
                lowerIntervalLimit = 0.0,
                lowerLimitType = UNRESTRICTED,
                upperIntervalLimit = 1.0,
                upperLimitType = UNRESTRICTED
            )

            boundary.toPythonCode("testParameter") shouldBe ""
        }

        @Test
        fun `should handle continuous boundaries (UNRESTRICTED, LESS_THAN)`() {
            val boundary = Boundary(
                isDiscrete = false,
                lowerIntervalLimit = 0.0,
                lowerLimitType = UNRESTRICTED,
                upperIntervalLimit = 1.0,
                upperLimitType = LESS_THAN
            )

            boundary.toPythonCode("testParameter") shouldBe """
                |if not testParameter < 1.0:
                |    raise ValueError('Valid values of testParameter must be less than 1.0, but {} was assigned.'.format(testParameter))
            """.trimMargin()
        }

        @Test
        fun `should handle continuous boundaries (UNRESTRICTED, LESS_THAN_OR_EQUALS)`() {
            val boundary = Boundary(
                isDiscrete = false,
                lowerIntervalLimit = 0.0,
                lowerLimitType = UNRESTRICTED,
                upperIntervalLimit = 1.0,
                upperLimitType = LESS_THAN_OR_EQUALS
            )

            boundary.toPythonCode("testParameter") shouldBe """
                |if not testParameter <= 1.0:
                |    raise ValueError('Valid values of testParameter must be less than or equal to 1.0, but {} was assigned.'.format(testParameter))
            """.trimMargin()
        }

        @Test
        fun `should handle continuous boundaries (LESS_THAN, UNRESTRICTED)`() {
            val boundary = Boundary(
                isDiscrete = false,
                lowerIntervalLimit = 0.0,
                lowerLimitType = LESS_THAN,
                upperIntervalLimit = 1.0,
                upperLimitType = UNRESTRICTED
            )

            boundary.toPythonCode("testParameter") shouldBe """
                |if not 0.0 < testParameter:
                |    raise ValueError('Valid values of testParameter must be greater than 0.0, but {} was assigned.'.format(testParameter))
            """.trimMargin()
        }

        @Test
        fun `should handle continuous boundaries (LESS_THAN, LESS_THAN)`() {
            val boundary = Boundary(
                isDiscrete = false,
                lowerIntervalLimit = 0.0,
                lowerLimitType = LESS_THAN,
                upperIntervalLimit = 1.0,
                upperLimitType = LESS_THAN
            )

            boundary.toPythonCode("testParameter") shouldBe """
                |if not 0.0 < testParameter < 1.0:
                |    raise ValueError('Valid values of testParameter must be in (0.0, 1.0), but {} was assigned.'.format(testParameter))
            """.trimMargin()
        }

        @Test
        fun `should handle continuous boundaries (LESS_THAN, LESS_THAN_OR_EQUALS)`() {
            val boundary = Boundary(
                isDiscrete = false,
                lowerIntervalLimit = 0.0,
                lowerLimitType = LESS_THAN,
                upperIntervalLimit = 1.0,
                upperLimitType = LESS_THAN_OR_EQUALS
            )

            boundary.toPythonCode("testParameter") shouldBe """
                |if not 0.0 < testParameter <= 1.0:
                |    raise ValueError('Valid values of testParameter must be in (0.0, 1.0], but {} was assigned.'.format(testParameter))
            """.trimMargin()
        }

        @Test
        fun `should handle continuous boundaries (LESS_THAN_OR_EQUALS, UNRESTRICTED)`() {
            val boundary = Boundary(
                isDiscrete = false,
                lowerIntervalLimit = 0.0,
                lowerLimitType = LESS_THAN_OR_EQUALS,
                upperIntervalLimit = 1.0,
                upperLimitType = UNRESTRICTED
            )

            boundary.toPythonCode("testParameter") shouldBe """
                |if not 0.0 <= testParameter:
                |    raise ValueError('Valid values of testParameter must be greater than or equal to 0.0, but {} was assigned.'.format(testParameter))
            """.trimMargin()
        }

        @Test
        fun `should handle continuous boundaries (LESS_THAN_OR_EQUALS, LESS_THAN)`() {
            val boundary = Boundary(
                isDiscrete = false,
                lowerIntervalLimit = 0.0,
                lowerLimitType = LESS_THAN_OR_EQUALS,
                upperIntervalLimit = 1.0,
                upperLimitType = LESS_THAN
            )

            boundary.toPythonCode("testParameter") shouldBe """
                |if not 0.0 <= testParameter < 1.0:
                |    raise ValueError('Valid values of testParameter must be in [0.0, 1.0), but {} was assigned.'.format(testParameter))
            """.trimMargin()
        }

        @Test
        fun `should handle continuous boundaries (LESS_THAN_OR_EQUALS, LESS_THAN_OR_EQUALS)`() {
            val boundary = Boundary(
                isDiscrete = false,
                lowerIntervalLimit = 0.0,
                lowerLimitType = LESS_THAN_OR_EQUALS,
                upperIntervalLimit = 1.0,
                upperLimitType = LESS_THAN_OR_EQUALS
            )

            boundary.toPythonCode("testParameter") shouldBe """
                |if not 0.0 <= testParameter <= 1.0:
                |    raise ValueError('Valid values of testParameter must be in [0.0, 1.0], but {} was assigned.'.format(testParameter))
            """.trimMargin()
        }
    }
}
