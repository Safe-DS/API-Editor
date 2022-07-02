package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.EnumAnnotation
import com.larsreimann.apiEditor.model.EnumPair
import com.larsreimann.apiEditor.mutable_model.PythonArgument
import com.larsreimann.apiEditor.mutable_model.PythonCall
import com.larsreimann.apiEditor.mutable_model.PythonDeclaration
import com.larsreimann.apiEditor.mutable_model.PythonEnum
import com.larsreimann.apiEditor.mutable_model.PythonEnumInstance
import com.larsreimann.apiEditor.mutable_model.PythonFunction
import com.larsreimann.apiEditor.mutable_model.PythonMemberAccess
import com.larsreimann.apiEditor.mutable_model.PythonModule
import com.larsreimann.apiEditor.mutable_model.PythonNamedType
import com.larsreimann.apiEditor.mutable_model.PythonPackage
import com.larsreimann.apiEditor.mutable_model.PythonParameter
import com.larsreimann.apiEditor.mutable_model.PythonReference
import com.larsreimann.apiEditor.mutable_model.PythonString
import com.larsreimann.apiEditor.mutable_model.PythonStringifiedExpression
import com.larsreimann.apiEditor.transformation.processing_exceptions.ConflictingEnumException
import io.kotest.assertions.asClue
import io.kotest.assertions.throwables.shouldThrowExactly
import io.kotest.matchers.collections.shouldBeEmpty
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
                receiver = PythonStringifiedExpression("testModule.testFunction"),
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

        val enum = testModule.enums[0]
        enum.name shouldBe "TestEnum"

        val instances = enum.instances
        instances.shouldHaveSize(2)

        instances[0].asClue {
            it.name shouldBe "name1"
            it.value shouldBe PythonString("value1")
        }
        instances[1].asClue {
            it.name shouldBe "name2"
            it.value shouldBe PythonString("value2")
        }
    }

    @Test
    fun `should process EnumAnnotations on parameter level with identical enum on module level`() {
        val mutableEnum = PythonEnum(
            "TestEnum",
            mutableListOf(
                PythonEnumInstance(
                    name = "name1",
                    value = PythonString("value1")
                ),
                PythonEnumInstance(
                    name = "name2",
                    value = PythonString("value2")
                )
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
                PythonEnumInstance(
                    name = "name1",
                    value = PythonString("value1")
                ),
                PythonEnumInstance(
                    name = "name2",
                    value = PythonString("value2")
                )
            )
        )
        testModule.enums.add(mutableEnum)
        testPackage.processEnumAnnotations()

        testModule.enums.shouldHaveSize(1)

        val enum = testModule.enums[0]
        enum.name shouldBe "TestEnum"

        val instances = enum.instances
        instances.shouldHaveSize(2)

        instances[0].asClue {
            it.name shouldBe "name1"
            it.value shouldBe PythonString("value1")
        }
        instances[1].asClue {
            it.name shouldBe "name2"
            it.value shouldBe PythonString("value2")
        }
    }

    @Test
    fun `should not add duplicate enums on module level`() {
        val mutableEnum = PythonEnum(
            "TestEnum",
            mutableListOf(
                PythonEnumInstance(
                    name = "name1",
                    value = PythonString("value1")
                ),
                PythonEnumInstance(
                    name = "name2",
                    value = PythonString("value2")
                )
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
                PythonEnumInstance(
                    name = "name1",
                    value = PythonString("value1")
                ),
                PythonEnumInstance(
                    name = "name3",
                    value = PythonString("value3")
                )
            )
        )
        testModule.enums += mutableEnum

        shouldThrowExactly<ConflictingEnumException> {
            testPackage.processEnumAnnotations()
        }
    }
}
