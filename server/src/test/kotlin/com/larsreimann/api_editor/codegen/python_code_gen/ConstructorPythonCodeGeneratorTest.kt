package com.larsreimann.api_editor.codegen.python_code_gen

import com.larsreimann.api_editor.codegen.toPythonCode
import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.DefaultBoolean
import com.larsreimann.api_editor.model.DefaultNumber
import com.larsreimann.api_editor.model.DefaultString
import com.larsreimann.api_editor.model.EnumAnnotation
import com.larsreimann.api_editor.model.EnumPair
import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.RenameAnnotation
import com.larsreimann.api_editor.model.RequiredAnnotation
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonStringifiedExpression
import com.larsreimann.api_editor.transformation.transform
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class ConstructorPythonCodeGeneratorTest {
    private lateinit var testParameter1: PythonParameter
    private lateinit var testParameter2: PythonParameter
    private lateinit var testParameter3: PythonParameter
    private lateinit var testClass: PythonClass
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
        testClass = PythonClass(name = "testClass", methods = mutableListOf(testFunction))
        testModule = PythonModule(
            name = "testModule",
            classes = mutableListOf(testClass)
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
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
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
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
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
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Boundary- and AttributeAnnotation on function level`() {
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
            AttributeAnnotation(
                DefaultNumber(0.5)
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
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
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
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
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
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
                    EnumPair("testValue1", "testName1")
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
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
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
                    EnumPair("testValue1", "testName1")
                )
            )
        )
        testParameter1.annotations.add(
            RenameAnnotation("newName")
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
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
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
                    EnumPair("testValue1", "testName1")
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
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should process Enum- and AttributeAnnotation on function level`() {
        // given
        testParameter3.annotations.add(
            EnumAnnotation(
                enumName = "TestEnum",
                pairs = listOf(
                    EnumPair("testValue1", "testName1"),
                    EnumPair("testValue1", "testName1")
                )
            )
        )
        testParameter3.annotations.add(
            AttributeAnnotation(
                DefaultString("testString")
            )
        )
        // when
        testPackage.transform()
        val moduleContent = testPackage.modules[0].toPythonCode()

        // then
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
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
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
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
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
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
        // TODO
        val expectedModuleContent: String =
            """
            |TODO
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }
}
