package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.EnumAnnotation
import com.larsreimann.api_editor.model.EnumPair
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonEnum
import com.larsreimann.api_editor.mutable_model.MutablePythonEnumInstance
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.transformation.processing_exceptions.ConflictingEnumException
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class EnumAnnotationProcessorTest {
    private lateinit var testParameter: MutablePythonParameter
    private lateinit var testModule: MutablePythonModule
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        val enumPairs: List<EnumPair> = listOf(
            EnumPair("value1", "name1"),
            EnumPair("value2", "name2"),
        )
        testParameter = MutablePythonParameter(
            name = "testParameter",
            annotations = mutableListOf(
                EnumAnnotation(
                    "TestEnum",
                    enumPairs
                )
            )
        )
        testModule = MutablePythonModule(
            name = "testModule",
            functions = mutableListOf(
                MutablePythonFunction(
                    name = "testFunction",
                    parameters = mutableListOf(testParameter)
                )
            )
        )
        testPackage = MutablePythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = mutableListOf(
                testModule
            )
        )
    }

    @Test
    fun `should process EnumAnnotations on parameter level`() {
        testPackage.processEnumAnnotations()

        testParameter.assignedBy shouldBe PythonParameterAssignment.ENUM
        testParameter.typeInDocs shouldBe "TestEnum"
    }

    @Test
    fun `should process EnumAnnotations on module level`() {
        testPackage.processEnumAnnotations()

        testModule.enums[0].name shouldBe "TestEnum"
        testModule.enums[0].instances shouldContain
            MutablePythonEnumInstance("name1", "value1")
        testModule.enums[0].instances shouldContain
            MutablePythonEnumInstance("name2", "value2")
    }

    @Test
    fun `should process EnumAnnotations on parameter level with identical enum on module level`() {
        val mutableEnum = MutablePythonEnum(
            "TestEnum",
            mutableListOf(
                MutablePythonEnumInstance("name1", "value1"),
                MutablePythonEnumInstance("name2", "value2")
            )
        )
        testModule.enums.add(mutableEnum)
        testPackage.processEnumAnnotations()

        testParameter.assignedBy shouldBe PythonParameterAssignment.ENUM
        testParameter.typeInDocs shouldBe "TestEnum"
    }

    @Test
    fun `should process EnumAnnotations on module level with identical enum on module level`() {
        val mutableEnum = MutablePythonEnum(
            "TestEnum",
            mutableListOf(
                MutablePythonEnumInstance("name1", "value1"),
                MutablePythonEnumInstance("name2", "value2")
            )
        )
        testModule.enums.add(mutableEnum)
        testPackage.processEnumAnnotations()

        testModule.enums[0].name shouldBe "TestEnum"
        testModule.enums[0].instances shouldContain
            MutablePythonEnumInstance("name1", "value1")
        testModule.enums[0].instances shouldContain
            MutablePythonEnumInstance("name2", "value2")
    }

    @Test
    fun `should not add duplicate enums on module level`() {
        val mutableEnum = MutablePythonEnum(
            "TestEnum",
            mutableListOf(
                MutablePythonEnumInstance("name1", "value1"),
                MutablePythonEnumInstance("name2", "value2")
            )
        )
        testModule.enums.add(mutableEnum)
        testPackage.processEnumAnnotations()

        testModule.enums.size shouldBe 1
    }

    @Test
    fun `should remove EnumAnnotations`() {
        testPackage.processEnumAnnotations()

        testParameter.annotations
            .filterIsInstance<EnumAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should throw ConflictingEnumException for conflicting enums in module`() {
        val mutableEnum = MutablePythonEnum("TestEnum")
        testModule.enums.add(mutableEnum)

        assertThrows<ConflictingEnumException> {
            testPackage.processEnumAnnotations()
        }
    }

    @Test
    fun `should throw ConflictingEnumException for conflicting enums in module with same number of instances`() {
        val mutableEnum = MutablePythonEnum(
            "TestEnum",
            mutableListOf(
                MutablePythonEnumInstance("name1", "value1"),
                MutablePythonEnumInstance("name3", "value3")
            )
        )
        testModule.enums.add(mutableEnum)

        assertThrows<ConflictingEnumException> {
            testPackage.processEnumAnnotations()
        }
    }
}
