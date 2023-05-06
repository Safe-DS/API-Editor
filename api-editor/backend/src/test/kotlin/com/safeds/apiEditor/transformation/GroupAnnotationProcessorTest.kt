package com.safeds.apiEditor.transformation

import com.safeds.apiEditor.model.GroupAnnotation
import com.safeds.apiEditor.model.PythonParameterAssignment
import com.safeds.apiEditor.mutableModel.PythonArgument
import com.safeds.apiEditor.mutableModel.PythonCall
import com.safeds.apiEditor.mutableModel.PythonClass
import com.safeds.apiEditor.mutableModel.PythonConstructor
import com.safeds.apiEditor.mutableModel.PythonFunction
import com.safeds.apiEditor.mutableModel.PythonMemberAccess
import com.safeds.apiEditor.mutableModel.PythonModule
import com.safeds.apiEditor.mutableModel.PythonNamedType
import com.safeds.apiEditor.mutableModel.PythonPackage
import com.safeds.apiEditor.mutableModel.PythonParameter
import com.safeds.apiEditor.mutableModel.PythonReference
import com.safeds.apiEditor.mutableModel.PythonStringifiedExpression
import com.safeds.apiEditor.transformation.processingExceptions.ConflictingGroupException
import io.kotest.assertions.asClue
import io.kotest.assertions.throwables.shouldThrowExactly
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class GroupAnnotationProcessorTest {
    private lateinit var testParameter1: PythonParameter
    private lateinit var testParameter2: PythonParameter
    private lateinit var testParameter3: PythonParameter
    private lateinit var testFunction: PythonFunction
    private lateinit var testModule: PythonModule
    private lateinit var testPackage: PythonPackage

    @BeforeEach
    fun reset() {
        testParameter1 = PythonParameter(name = "testParameter1")
        testParameter2 = PythonParameter(name = "testParameter2")
        testParameter3 = PythonParameter(name = "testParameter3")
        testFunction = PythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                testParameter1,
                testParameter2,
                testParameter3,
            ),
            annotations = mutableListOf(
                GroupAnnotation(
                    groupName = "TestGroup",
                    parameters = mutableListOf("testParameter2", "testParameter3"),
                ),
            ),
            callToOriginalAPI = PythonCall(
                receiver = PythonStringifiedExpression("testModule.testFunction"),
                arguments = listOf(
                    PythonArgument(value = PythonReference(testParameter1)),
                    PythonArgument(value = PythonReference(testParameter2)),
                    PythonArgument(value = PythonReference(testParameter3)),
                ),
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
    fun `should update the function call when processing GroupAnnotations`() {
        testPackage.processGroupAnnotations()

        val callToOriginalAPI = testFunction.callToOriginalAPI.shouldNotBeNull()
        callToOriginalAPI.arguments.shouldHaveSize(3)

        val firstArgument = callToOriginalAPI.arguments[0]
        firstArgument.name.shouldBeNull()
        firstArgument.value.asClue {
            it.shouldBeInstanceOf<PythonReference>()
            it.declaration shouldBe testParameter1
        }

        val secondArgument = callToOriginalAPI.arguments[1]
        val secondArgumentValue = secondArgument.value.shouldBeInstanceOf<PythonMemberAccess>()
        secondArgumentValue.receiver.asClue {
            it.shouldBeInstanceOf<PythonReference>()
            it.declaration?.name shouldBe "testGroup"
        }
        secondArgumentValue.member.asClue {
            it.shouldNotBeNull()
            it.declaration.shouldNotBeNull()
            it.declaration?.name shouldBe "testParameter2"
        }

        val thirdArgument = callToOriginalAPI.arguments[2]
        val thirdArgumentValue = thirdArgument.value.shouldBeInstanceOf<PythonMemberAccess>()
        thirdArgumentValue.receiver.asClue {
            it.shouldBeInstanceOf<PythonReference>()
            it.declaration?.name shouldBe "testGroup"
        }
        thirdArgumentValue.member.asClue {
            it.shouldNotBeNull()
            it.declaration.shouldNotBeNull()
            it.declaration?.name shouldBe "testParameter3"
        }
    }

    @Test
    fun `should process GroupAnnotations on function level`() {
        testPackage.processGroupAnnotations()

        val parameters = testFunction.parameters
        parameters.shouldHaveSize(2)
        parameters[0] shouldBe testParameter1
        parameters[1].asClue {
            it.name shouldBe "testGroup"

            val type = it.type
            type.shouldBeInstanceOf<PythonNamedType>()
            type.declaration?.name shouldBe "TestGroup"
        }
    }

    @Test
    fun `should process GroupAnnotations on module level`() {
        testPackage.processGroupAnnotations()

        val testGroup = testModule.classes[0]
        testGroup.name shouldBe "TestGroup"

        testGroup.constructor
            .shouldNotBeNull()
            .parameters
            .map { it.name }
            .shouldContainExactly("self", "testParameter2", "testParameter3")
    }

    @Test
    fun `should process GroupAnnotations on function level with identical class on module level`() {
        testModule.classes += PythonClass(
            name = "TestGroup",
            constructor = PythonConstructor(
                mutableListOf(
                    PythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT,
                    ),
                    PythonParameter(name = "testParameter2"),
                    PythonParameter(name = "testParameter3"),
                ),
            ),
        )

        testPackage.processGroupAnnotations()

        val parameters = testFunction.parameters
        parameters.shouldHaveSize(2)
        parameters[0] shouldBe testParameter1
        parameters[1].asClue {
            it.name shouldBe "testGroup"

            val type = it.type
            type.shouldBeInstanceOf<PythonNamedType>()
            type.declaration?.name shouldBe "TestGroup"
        }
    }

    @Test
    fun `should process GroupAnnotations on module level with identical class on module level`() {
        testModule.classes += PythonClass(
            name = "TestGroup",
            constructor = PythonConstructor(
                mutableListOf(
                    PythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT,
                    ),
                    PythonParameter(name = "testParameter2"),
                    PythonParameter(name = "testParameter3"),
                ),
            ),
        )

        testPackage.processGroupAnnotations()

        val testGroup = testModule.classes[0]
        testGroup.name shouldBe "TestGroup"

        testGroup.constructor
            .shouldNotBeNull()
            .parameters
            .map { it.name }
            .shouldContainExactly("self", "testParameter2", "testParameter3")
    }

    @Test
    fun `should not add duplicate class on module level`() {
        testModule.classes += PythonClass(
            name = "TestGroup",
            constructor = PythonConstructor(
                mutableListOf(
                    PythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT,
                    ),
                    PythonParameter(name = "testParameter2"),
                    PythonParameter(name = "testParameter3"),
                ),
            ),
        )

        testPackage.processGroupAnnotations()

        testModule.classes.size shouldBe 1
    }

    @Test
    fun `should remove GroupAnnotations`() {
        testPackage.processGroupAnnotations()

        testFunction.annotations
            .filterIsInstance<GroupAnnotation>()
            .shouldBeEmpty()
    }

    @Test
    fun `should throw ConflictingGroupException for conflicting class in module`() {
        testModule.classes += PythonClass(
            name = "TestGroup",
            constructor = PythonConstructor(
                mutableListOf(
                    PythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT,
                    ),
                    PythonParameter(name = "otherParameter"),
                ),
            ),
        )

        shouldThrowExactly<ConflictingGroupException> {
            testPackage.processGroupAnnotations()
        }
    }
}
