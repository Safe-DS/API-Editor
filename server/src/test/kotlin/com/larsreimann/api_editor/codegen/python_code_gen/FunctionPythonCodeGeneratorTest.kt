package com.larsreimann.api_editor.codegen.python_code_gen

import com.larsreimann.api_editor.codegen.toPythonCode
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.DefaultBoolean
import com.larsreimann.api_editor.model.DefaultNumber
import com.larsreimann.api_editor.model.EnumAnnotation
import com.larsreimann.api_editor.model.EnumPair
import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.RequiredAnnotation
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonStringifiedExpression
import com.larsreimann.api_editor.transformation.transform
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class FunctionPythonCodeGeneratorTest {
    private lateinit var testParameter1: PythonParameter
    private lateinit var testParameter2: PythonParameter
    private lateinit var testParameter3: PythonParameter
    private lateinit var testFunction: PythonFunction
    private lateinit var testModule: PythonModule
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testParameter1 = PythonParameter(
            name = "testParameter1",
        )
        testParameter2 = PythonParameter(
            name = "testParameter2",
        )
        testParameter3 = PythonParameter(
            name = "testParameter3",
        )
        testFunction = PythonFunction(
            name = "__init__",
            parameters = mutableListOf(
                testParameter1,
                testParameter2,
                testParameter3
            )
        )
        testModule = PythonModule(
            name = "testModule",
            functions = mutableListOf(testFunction)
        )
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = mutableListOf(testModule)
        )
    }

    @Test
    fun `should process Boundary- and GroupAnnotation on function level`() {
        // given
        testParameter1.annotations.add(
            BoundaryAnnotation(
                isDiscrete = true,
                lowerIntervalLimit = 0.0,
                lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                upperIntervalLimit = 1.0,
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
            )
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter1", "testParameter3")
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |
            |class TestGroup:
            |    def __init__(self, testParameter1, testParameter3):
            |        if not (isinstance(testParameter1, int) or (isinstance(testParameter1, float) and testParameter1.is_integer())):
            |            raise ValueError('testParameter1' needs to be an integer, but {} was assigned.'.format(testParameter1))
            |        if not 0.0 <= testParameter1 <= 1.0:
            |            raise ValueError('Valid values of testParameter1 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter1))
            |
            |        self.testParameter1 = testParameter1
            |        self.testParameter3 = testParameter3
            |
            |def __init__(testGroup: TestGroup, testParameter2):
            |    return testModule.__init__(testGroup.testParameter1, testParameter2, testGroup.testParameter3)
            |
            |""".trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Boundary-, Group- and OptionalAnnotation on function level`() {
        // given
        testParameter2.annotations.add(
            BoundaryAnnotation(
                isDiscrete = true,
                lowerIntervalLimit = 0.0,
                lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                upperIntervalLimit = 1.0,
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
            )
        )
        testParameter2.annotations.add(
            OptionalAnnotation(
                DefaultNumber(0.5)
            )
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3")
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |
            |class TestGroup:
            |    def __init__(self, testParameter3, *, testParameter2=0.5):
            |        if not (isinstance(testParameter2, int) or (isinstance(testParameter2, float) and testParameter2.is_integer())):
            |            raise ValueError('testParameter2' needs to be an integer, but {} was assigned.'.format(testParameter2))
            |        if not 0.0 <= testParameter2 <= 1.0:
            |            raise ValueError('Valid values of testParameter2 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter2))
            |
            |        self.testParameter3 = testParameter3
            |        self.testParameter2 = testParameter2
            |
            |def __init__(testParameter1, testGroup: TestGroup):
            |    return testModule.__init__(testParameter1, testGroup.testParameter2, testGroup.testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Boundary-, Group- and RequiredAnnotation on function level`() {
        // given
        testParameter2.annotations.add(
            BoundaryAnnotation(
                isDiscrete = true,
                lowerIntervalLimit = 0.0,
                lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                upperIntervalLimit = 1.0,
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
            )
        )
        testParameter2.annotations.add(
            RequiredAnnotation
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3")
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |
            |class TestGroup:
            |    def __init__(self, testParameter2, testParameter3):
            |        if not (isinstance(testParameter2, int) or (isinstance(testParameter2, float) and testParameter2.is_integer())):
            |            raise ValueError('testParameter2' needs to be an integer, but {} was assigned.'.format(testParameter2))
            |        if not 0.0 <= testParameter2 <= 1.0:
            |            raise ValueError('Valid values of testParameter2 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter2))
            |
            |        self.testParameter2 = testParameter2
            |        self.testParameter3 = testParameter3
            |
            |def __init__(testParameter1, testGroup: TestGroup):
            |    return testModule.__init__(testParameter1, testGroup.testParameter2, testGroup.testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Boundary- and OptionalAnnotation on function level`() {
        // given
        testParameter1.annotations.add(
            BoundaryAnnotation(
                isDiscrete = true,
                lowerIntervalLimit = 0.0,
                lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                upperIntervalLimit = 1.0,
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
            )
        )
        testParameter1.annotations.add(
            OptionalAnnotation(
                DefaultNumber(0.5)
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |
            |def __init__(testParameter2, testParameter3, *, testParameter1=0.5):
            |    if not (isinstance(testParameter1, int) or (isinstance(testParameter1, float) and testParameter1.is_integer())):
            |        raise ValueError('testParameter1' needs to be an integer, but {} was assigned.'.format(testParameter1))
            |    if not 0.0 <= testParameter1 <= 1.0:
            |        raise ValueError('Valid values of testParameter1 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter1))
            |
            |    return testModule.__init__(testParameter1, testParameter2, testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Boundary- and RequiredAnnotation on function level`() {
        // given
        testParameter1.annotations.add(
            BoundaryAnnotation(
                isDiscrete = true,
                lowerIntervalLimit = 0.0,
                lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                upperIntervalLimit = 1.0,
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
            )
        )
        testParameter1.annotations.add(
            RequiredAnnotation
        )
        testParameter1.defaultValue = PythonStringifiedExpression("toRemove")
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |
            |def __init__(testParameter1, testParameter2, testParameter3):
            |    if not (isinstance(testParameter1, int) or (isinstance(testParameter1, float) and testParameter1.is_integer())):
            |        raise ValueError('testParameter1' needs to be an integer, but {} was assigned.'.format(testParameter1))
            |    if not 0.0 <= testParameter1 <= 1.0:
            |        raise ValueError('Valid values of testParameter1 must be in [0.0, 1.0], but {} was assigned.'.format(testParameter1))
            |
            |    return testModule.__init__(testParameter1, testParameter2, testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Enum- and GroupAnnotation on function level`() {
        // given
        testParameter1.annotations.add(
            EnumAnnotation(
                "TestEnum",
                listOf(
                    EnumPair("testValue1", "testName1"),
                    EnumPair("testValue2", "testName2")
                )
            )
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter1", "testParameter2")
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |from enum import Enum
            |
            |class TestGroup:
            |    def __init__(self, testParameter1: TestEnum, testParameter2):
            |        self.testParameter1: TestEnum = testParameter1
            |        self.testParameter2 = testParameter2
            |
            |def __init__(testGroup: TestGroup, testParameter3):
            |    return testModule.__init__(testGroup.testParameter1.value, testGroup.testParameter2, testParameter3)
            |
            |class TestEnum(Enum):
            |    testName1 = 'testValue1',
            |    testName2 = 'testValue2'
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Enum-, Required- and GroupAnnotation on function level`() {
        // given
        testParameter1.annotations.add(
            EnumAnnotation(
                enumName = "TestEnum",
                pairs = listOf(
                    EnumPair("testValue1", "testName1"),
                    EnumPair("testValue2", "testName2")
                )
            )
        )
        testParameter1.annotations.add(
            RequiredAnnotation
        )
        testParameter1.defaultValue = PythonStringifiedExpression("toRemove")
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter1", "testParameter2")
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |from enum import Enum
            |
            |class TestGroup:
            |    def __init__(self, testParameter1: TestEnum, testParameter2):
            |        self.testParameter1: TestEnum = testParameter1
            |        self.testParameter2 = testParameter2
            |
            |def __init__(testGroup: TestGroup, testParameter3):
            |    return testModule.__init__(testGroup.testParameter1.value, testGroup.testParameter2, testParameter3)
            |
            |class TestEnum(Enum):
            |    testName1 = 'testValue1',
            |    testName2 = 'testValue2'
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Enum- and RequiredAnnotation on function level`() {
        // given
        testParameter1.annotations.add(
            EnumAnnotation(
                enumName = "TestEnum",
                pairs = listOf(
                    EnumPair("testValue1", "testName1"),
                    EnumPair("testValue2", "testName2")
                )
            )
        )
        testParameter1.annotations.add(
            RequiredAnnotation
        )
        testParameter1.defaultValue = PythonStringifiedExpression("toRemove")
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |from enum import Enum
            |
            |def __init__(testParameter1: TestEnum, testParameter2, testParameter3):
            |    return testModule.__init__(testParameter1.value, testParameter2, testParameter3)
            |
            |class TestEnum(Enum):
            |    testName1 = 'testValue1',
            |    testName2 = 'testValue2'
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Group- and RequiredAnnotation on function level`() {
        // given
        testParameter2.annotations.add(
            RequiredAnnotation
        )
        testParameter2.defaultValue = PythonStringifiedExpression("toRemove")
        testParameter1.defaultValue = PythonStringifiedExpression("defaultValue")
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3")
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |
            |class TestGroup:
            |    def __init__(self, testParameter2, testParameter3):
            |        self.testParameter2 = testParameter2
            |        self.testParameter3 = testParameter3
            |
            |def __init__(testGroup: TestGroup, *, testParameter1=defaultValue):
            |    return testModule.__init__(testParameter1, testGroup.testParameter2, testGroup.testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Group- and OptionalAnnotation on function level`() {
        // given
        testParameter2.annotations.add(
            OptionalAnnotation(
                DefaultBoolean(false)
            )
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3")
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |
            |class TestGroup:
            |    def __init__(self, testParameter3, *, testParameter2=False):
            |        self.testParameter3 = testParameter3
            |        self.testParameter2 = testParameter2
            |
            |def __init__(testParameter1, testGroup: TestGroup):
            |    return testModule.__init__(testParameter1, testGroup.testParameter2, testGroup.testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Group-, Required- and OptionalAnnotation on function level`() {
        // given
        testParameter2.annotations.add(
            OptionalAnnotation(
                DefaultBoolean(false)
            )
        )
        testParameter3.annotations.add(
            RequiredAnnotation
        )
        testParameter3.defaultValue = PythonStringifiedExpression("toRemove")
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3")
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |
            |class TestGroup:
            |    def __init__(self, testParameter3, *, testParameter2=False):
            |        self.testParameter3 = testParameter3
            |        self.testParameter2 = testParameter2
            |
            |def __init__(testParameter1, testGroup: TestGroup):
            |    return testModule.__init__(testParameter1, testGroup.testParameter2, testGroup.testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }
}
