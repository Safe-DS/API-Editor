package com.safeds.apiEditor.codegen

import com.safeds.apiEditor.model.BoundaryAnnotation
import com.safeds.apiEditor.model.ComparisonOperator
import com.safeds.apiEditor.model.DefaultBoolean
import com.safeds.apiEditor.model.DefaultNumber
import com.safeds.apiEditor.model.DefaultString
import com.safeds.apiEditor.model.EnumAnnotation
import com.safeds.apiEditor.model.EnumPair
import com.safeds.apiEditor.model.GroupAnnotation
import com.safeds.apiEditor.model.MoveAnnotation
import com.safeds.apiEditor.model.OptionalAnnotation
import com.safeds.apiEditor.model.RenameAnnotation
import com.safeds.apiEditor.model.RequiredAnnotation
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonModule
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter
import com.safeds.apiEditor.mutableModel.PythonStringifiedExpression
import com.safeds.apiEditor.transformation.transform
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class FunctionPythonCodeGeneratorFullPipelineTest {
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
            name = "testFunction",
            parameters = mutableListOf(
                testParameter1,
                testParameter2,
                testParameter3,
            ),
        )
        testModule = PythonModule(
            name = "testModule",
            functions = mutableListOf(testFunction),
        )
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = mutableListOf(testModule),
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
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
            ),
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter1", "testParameter3"),
            ),
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
            |            raise ValueError(f'testParameter1 needs to be an integer, but {testParameter1} was assigned.')
            |        if not 0.0 <= testParameter1 <= 1.0:
            |            raise ValueError(f'Valid values of testParameter1 must be in [0.0, 1.0], but {testParameter1} was assigned.')
            |
            |        self.testParameter1 = testParameter1
            |        self.testParameter3 = testParameter3
            |
            |def testFunction(testGroup: TestGroup, testParameter2):
            |    return testModule.testFunction(testGroup.testParameter1, testParameter2, testGroup.testParameter3)
            |
            """.trimMargin()

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
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
            ),
        )
        testParameter2.annotations.add(
            OptionalAnnotation(
                DefaultNumber(0.5),
            ),
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3"),
            ),
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
            |            raise ValueError(f'testParameter2 needs to be an integer, but {testParameter2} was assigned.')
            |        if not 0.0 <= testParameter2 <= 1.0:
            |            raise ValueError(f'Valid values of testParameter2 must be in [0.0, 1.0], but {testParameter2} was assigned.')
            |
            |        self.testParameter3 = testParameter3
            |        self.testParameter2 = testParameter2
            |
            |def testFunction(testParameter1, testGroup: TestGroup):
            |    return testModule.testFunction(testParameter1, testGroup.testParameter2, testGroup.testParameter3)
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
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
            ),
        )
        testParameter2.annotations.add(
            RequiredAnnotation,
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3"),
            ),
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
            |            raise ValueError(f'testParameter2 needs to be an integer, but {testParameter2} was assigned.')
            |        if not 0.0 <= testParameter2 <= 1.0:
            |            raise ValueError(f'Valid values of testParameter2 must be in [0.0, 1.0], but {testParameter2} was assigned.')
            |
            |        self.testParameter2 = testParameter2
            |        self.testParameter3 = testParameter3
            |
            |def testFunction(testParameter1, testGroup: TestGroup):
            |    return testModule.testFunction(testParameter1, testGroup.testParameter2, testGroup.testParameter3)
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
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
            ),
        )
        testParameter1.annotations.add(
            OptionalAnnotation(
                DefaultNumber(0.5),
            ),
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
            |def testFunction(testParameter2, testParameter3, *, testParameter1=0.5):
            |    if not (isinstance(testParameter1, int) or (isinstance(testParameter1, float) and testParameter1.is_integer())):
            |        raise ValueError(f'testParameter1 needs to be an integer, but {testParameter1} was assigned.')
            |    if not 0.0 <= testParameter1 <= 1.0:
            |        raise ValueError(f'Valid values of testParameter1 must be in [0.0, 1.0], but {testParameter1} was assigned.')
            |
            |    return testModule.testFunction(testParameter1, testParameter2, testParameter3)
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
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
            ),
        )
        testParameter1.annotations.add(
            RequiredAnnotation,
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
            |def testFunction(testParameter1, testParameter2, testParameter3):
            |    if not (isinstance(testParameter1, int) or (isinstance(testParameter1, float) and testParameter1.is_integer())):
            |        raise ValueError(f'testParameter1 needs to be an integer, but {testParameter1} was assigned.')
            |    if not 0.0 <= testParameter1 <= 1.0:
            |        raise ValueError(f'Valid values of testParameter1 must be in [0.0, 1.0], but {testParameter1} was assigned.')
            |
            |    return testModule.testFunction(testParameter1, testParameter2, testParameter3)
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
                    EnumPair("testValue2", "testName2"),
                ),
            ),
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter1", "testParameter2"),
            ),
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
            |from abc import ABC
            |from dataclasses import dataclass
            |
            |class TestGroup:
            |    def __init__(self, testParameter1: TestEnum, testParameter2):
            |        self.testParameter1: TestEnum = testParameter1
            |        self.testParameter2 = testParameter2
            |
            |def testFunction(testGroup: TestGroup, testParameter3):
            |    return testModule.testFunction(testGroup.testParameter1.value, testGroup.testParameter2, testParameter3)
            |
            |class TestEnum(ABC):
            |    value: str
            |
            |@dataclass
            |class _testName1(TestEnum):
            |    value = 'testValue1'
            |TestEnum.testName1 = _testName1
            |
            |@dataclass
            |class _testName2(TestEnum):
            |    value = 'testValue2'
            |TestEnum.testName2 = _testName2
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
                    EnumPair("testValue2", "testName2"),
                ),
            ),
        )
        testParameter1.annotations.add(
            RequiredAnnotation,
        )
        testParameter1.defaultValue = PythonStringifiedExpression("toRemove")
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter1", "testParameter2"),
            ),
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
            |from abc import ABC
            |from dataclasses import dataclass
            |
            |class TestGroup:
            |    def __init__(self, testParameter1: TestEnum, testParameter2):
            |        self.testParameter1: TestEnum = testParameter1
            |        self.testParameter2 = testParameter2
            |
            |def testFunction(testGroup: TestGroup, testParameter3):
            |    return testModule.testFunction(testGroup.testParameter1.value, testGroup.testParameter2, testParameter3)
            |
            |class TestEnum(ABC):
            |    value: str
            |
            |@dataclass
            |class _testName1(TestEnum):
            |    value = 'testValue1'
            |TestEnum.testName1 = _testName1
            |
            |@dataclass
            |class _testName2(TestEnum):
            |    value = 'testValue2'
            |TestEnum.testName2 = _testName2
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
                    EnumPair("testValue2", "testName2"),
                ),
            ),
        )
        testParameter1.annotations.add(
            RequiredAnnotation,
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
            |from abc import ABC
            |from dataclasses import dataclass
            |
            |def testFunction(testParameter1: TestEnum, testParameter2, testParameter3):
            |    return testModule.testFunction(testParameter1.value, testParameter2, testParameter3)
            |
            |class TestEnum(ABC):
            |    value: str
            |
            |@dataclass
            |class _testName1(TestEnum):
            |    value = 'testValue1'
            |TestEnum.testName1 = _testName1
            |
            |@dataclass
            |class _testName2(TestEnum):
            |    value = 'testValue2'
            |TestEnum.testName2 = _testName2
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Group- and RequiredAnnotation on function level`() {
        // given
        testParameter2.annotations.add(
            RequiredAnnotation,
        )
        testParameter2.defaultValue = PythonStringifiedExpression("toRemove")
        testParameter1.defaultValue = PythonStringifiedExpression("defaultValue")
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3"),
            ),
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
            |def testFunction(testGroup: TestGroup, *, testParameter1=defaultValue):
            |    return testModule.testFunction(testParameter1, testGroup.testParameter2, testGroup.testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Group- and OptionalAnnotation on function level`() {
        // given
        testParameter2.annotations.add(
            OptionalAnnotation(
                DefaultString("string"),
            ),
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3"),
            ),
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
            |    def __init__(self, testParameter3, *, testParameter2='string'):
            |        self.testParameter3 = testParameter3
            |        self.testParameter2 = testParameter2
            |
            |def testFunction(testParameter1, testGroup: TestGroup):
            |    return testModule.testFunction(testParameter1, testGroup.testParameter2, testGroup.testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Group-, Required- and OptionalAnnotation on function level`() {
        // given
        testParameter2.annotations.add(
            OptionalAnnotation(
                DefaultBoolean(false),
            ),
        )
        testParameter3.annotations.add(
            RequiredAnnotation,
        )
        testParameter3.defaultValue = PythonStringifiedExpression("toRemove")
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3"),
            ),
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
            |def testFunction(testParameter1, testGroup: TestGroup):
            |    return testModule.testFunction(testParameter1, testGroup.testParameter2, testGroup.testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Boundary- and RenameAnnotation on parameter on a function with RenameAnnotation`() {
        // given
        testParameter1.annotations.add(
            BoundaryAnnotation(
                isDiscrete = true,
                lowerIntervalLimit = 0.0,
                lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                upperIntervalLimit = 1.0,
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
            ),
        )
        testParameter1.annotations.add(
            RenameAnnotation("renamedTestParameter1"),
        )
        testFunction.annotations.add(
            RenameAnnotation("renamedTestFunction"),
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
            |def renamedTestFunction(renamedTestParameter1, testParameter2, testParameter3):
            |    if not (isinstance(renamedTestParameter1, int) or (isinstance(renamedTestParameter1, float) and renamedTestParameter1.is_integer())):
            |        raise ValueError(f'renamedTestParameter1 needs to be an integer, but {renamedTestParameter1} was assigned.')
            |    if not 0.0 <= renamedTestParameter1 <= 1.0:
            |        raise ValueError(f'Valid values of renamedTestParameter1 must be in [0.0, 1.0], but {renamedTestParameter1} was assigned.')
            |
            |    return testModule.testFunction(renamedTestParameter1, testParameter2, testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Enum- and GroupAnnotation on function with MoveAnnotation`() {
        // given
        testParameter1.annotations.add(
            EnumAnnotation(
                "TestEnum",
                listOf(
                    EnumPair("testValue1", "testName1"),
                    EnumPair("testValue2", "testName2"),
                ),
            ),
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter1", "testParameter2"),
            ),
        )
        testFunction.annotations.add(
            MoveAnnotation("testModule.movedTestModule"),
        )
        // when
        testPackage.transform("newTestModule")
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import testModule
            |
            |from __future__ import annotations
            |from abc import ABC
            |from dataclasses import dataclass
            |
            |class TestGroup:
            |    def __init__(self, testParameter1: TestEnum, testParameter2):
            |        self.testParameter1: TestEnum = testParameter1
            |        self.testParameter2 = testParameter2
            |
            |def testFunction(testGroup: TestGroup, testParameter3):
            |    return testModule.testFunction(testGroup.testParameter1.value, testGroup.testParameter2, testParameter3)
            |
            |class TestEnum(ABC):
            |    value: str
            |
            |@dataclass
            |class _testName1(TestEnum):
            |    value = 'testValue1'
            |TestEnum.testName1 = _testName1
            |
            |@dataclass
            |class _testName2(TestEnum):
            |    value = 'testValue2'
            |TestEnum.testName2 = _testName2
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
        testPackage.modules[0].name shouldBe "newTestModule.movedTestModule"
    }

    @Test
    fun `should process Rename-, Boundary-, Group- and OptionalAnnotation on function level`() {
        // given
        testParameter2.annotations.add(
            BoundaryAnnotation(
                isDiscrete = true,
                lowerIntervalLimit = 0.0,
                lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
                upperIntervalLimit = 1.0,
                upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
            ),
        )
        testParameter2.annotations.add(
            OptionalAnnotation(
                DefaultNumber(0.5),
            ),
        )
        testParameter2.annotations.add(
            RenameAnnotation("renamedTestParameter2"),
        )
        testFunction.annotations.add(
            GroupAnnotation(
                groupName = "TestGroup",
                parameters = mutableListOf("testParameter2", "testParameter3"),
            ),
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
            |    def __init__(self, testParameter3, *, renamedTestParameter2=0.5):
            |        if not (isinstance(renamedTestParameter2, int) or (isinstance(renamedTestParameter2, float) and renamedTestParameter2.is_integer())):
            |            raise ValueError(f'renamedTestParameter2 needs to be an integer, but {renamedTestParameter2} was assigned.')
            |        if not 0.0 <= renamedTestParameter2 <= 1.0:
            |            raise ValueError(f'Valid values of renamedTestParameter2 must be in [0.0, 1.0], but {renamedTestParameter2} was assigned.')
            |
            |        self.testParameter3 = testParameter3
            |        self.renamedTestParameter2 = renamedTestParameter2
            |
            |def testFunction(testParameter1, testGroup: TestGroup):
            |    return testModule.testFunction(testParameter1, testGroup.renamedTestParameter2, testGroup.testParameter3)
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }
}
