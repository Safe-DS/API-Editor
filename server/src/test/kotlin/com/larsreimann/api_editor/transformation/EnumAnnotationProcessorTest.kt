package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.EnumAnnotation
import com.larsreimann.api_editor.model.EnumPair
import com.larsreimann.api_editor.mutable_model.PythonArgument
import com.larsreimann.api_editor.mutable_model.PythonCall
import com.larsreimann.api_editor.mutable_model.PythonDeclaration
import com.larsreimann.api_editor.mutable_model.PythonEnum
import com.larsreimann.api_editor.mutable_model.PythonEnumInstance
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonMemberAccess
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonNamedType
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonReference
import com.larsreimann.api_editor.transformation.processing_exceptions.ConflictingEnumException
import io.kotest.assertions.asClue
import io.kotest.assertions.throwables.shouldThrowExactly
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class EnumAnnotationProcessorTest {
    private lateinit var testParameter: PythonParameter
    private lateinit var testFunction: PythonFunction
    private lateinit var testModule: PythonModule
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        val enumPairs: List<EnumPair> = listOf(
            EnumPair("value1", "name1"),
            EnumPair("value2", "name2"),
        )
        testParameter = PythonParameter(
            name = "testParameter",
            annotations = mutableListOf(
                EnumAnnotation(
                    "TestEnum",
                    enumPairs
                )
            )
        )
        testFunction = PythonFunction(
            name = "testFunction",
            parameters = listOf(testParameter),
            callToOriginalAPI = PythonCall(
                receiver = "testModule.testFunction",
                arguments = listOf(
                    PythonArgument(
                        value = PythonReference(testParameter)
                    )
                )
            )
        )
        testModule = PythonModule(
            name = "testModule",
            functions = listOf(testFunction)
        )
        testPackage = PythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(testModule)
        )
    }

    @Test
    fun `should update the function call when processing EnumAnnotations`() {
        testPackage.processEnumAnnotations()

        val callToOriginalAPI = testFunction.callToOriginalAPI.shouldNotBeNull()
        callToOriginalAPI.arguments.shouldHaveSize(1)

        val argument = callToOriginalAPI.arguments[0]
        argument.name.shouldBeNull()

        val value = argument.value.shouldBeInstanceOf<PythonMemberAccess>()
        value.receiver.asClue {
            it.shouldBeInstanceOf<PythonReference>()
            it.declaration shouldBe testParameter
        }
        value.member.asClue {
            it.shouldNotBeNull()
            it.declaration.shouldBeInstanceOf<PythonDeclaration>()
            it.declaration?.name shouldBe "value"
        }
    }

    @Test
    fun `should process EnumAnnotations on parameter level`() {
        testPackage.processEnumAnnotations()

        val type = testParameter.type
        type.shouldBeInstanceOf<PythonNamedType>()

        val declaration = type.declaration
        declaration.shouldBeInstanceOf<PythonEnum>()
        declaration.name shouldBe "TestEnum"
    }

    @Test
    fun `should process EnumAnnotations on module level`() {
        testPackage.processEnumAnnotations()

        testModule.enums[0].name shouldBe "TestEnum"
        testModule.enums[0].instances shouldContain PythonEnumInstance("name1", "value1")
        testModule.enums[0].instances shouldContain PythonEnumInstance("name2", "value2")
    }

    @Test
    fun `should process EnumAnnotations on parameter level with identical enum on module level`() {
        val mutableEnum = PythonEnum(
            "TestEnum",
            mutableListOf(
                PythonEnumInstance("name1", "value1"),
                PythonEnumInstance("name2", "value2")
            )
        )
        testModule.enums += mutableEnum
        testPackage.processEnumAnnotations()

        val type = testParameter.type
        type.shouldBeInstanceOf<PythonNamedType>()

        val declaration = type.declaration
        declaration.shouldBeInstanceOf<PythonEnum>()
        declaration.name shouldBe "TestEnum"
    }

    @Test
    fun `should process EnumAnnotations on module level with identical enum on module level`() {
        val mutableEnum = PythonEnum(
            "TestEnum",
            mutableListOf(
                PythonEnumInstance("name1", "value1"),
                PythonEnumInstance("name2", "value2")
            )
        )
        testModule.enums.add(mutableEnum)
        testPackage.processEnumAnnotations()

        testModule.enums[0].name shouldBe "TestEnum"
        testModule.enums[0].instances shouldContain PythonEnumInstance("name1", "value1")
        testModule.enums[0].instances shouldContain PythonEnumInstance("name2", "value2")
    }

    @Test
    fun `should not add duplicate enums on module level`() {
        val mutableEnum = PythonEnum(
            "TestEnum",
            mutableListOf(
                PythonEnumInstance("name1", "value1"),
                PythonEnumInstance("name2", "value2")
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
        val mutableEnum = PythonEnum("TestEnum")
        testModule.enums.add(mutableEnum)

        shouldThrowExactly<ConflictingEnumException> {
            testPackage.processEnumAnnotations()
        }
    }

    @Test
    fun `should throw ConflictingEnumException for conflicting enums in module with same number of instances`() {
        val mutableEnum = PythonEnum(
            "TestEnum",
            mutableListOf(
                PythonEnumInstance("name1", "value1"),
                PythonEnumInstance("name3", "value3")
            )
        )
        testModule.enums += mutableEnum

        shouldThrowExactly<ConflictingEnumException> {
            testPackage.processEnumAnnotations()
        }
    }
}
