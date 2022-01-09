package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonConstructor
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter
import com.larsreimann.api_editor.transformation.processing_exceptions.ConflictingGroupException
import io.kotest.assertions.throwables.shouldThrowExactly
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
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
        testParameter1 = PythonParameter(
            name = "testParameter1",
            originalParameter = OriginalPythonParameter(name = "testParameter1")
        )
        testParameter2 = PythonParameter(
            name = "testParameter2",
            originalParameter = OriginalPythonParameter(name = "testParameter2")
        )
        testParameter3 = PythonParameter(
            name = "testParameter3",
            originalParameter = OriginalPythonParameter(name = "testParameter3")
        )
        testFunction = PythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                testParameter1,
                testParameter2,
                testParameter3
            ),
            annotations = mutableListOf(
                GroupAnnotation(
                    groupName = "TestGroup",
                    parameters = mutableListOf("testParameter2", "testParameter3")
                )
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
    fun `should process GroupAnnotations on function level`() {
        testPackage.processGroupAnnotations()

        val parameters = testFunction.parameters
        parameters.shouldHaveSize(2)
        parameters[0] shouldBe testParameter1
        parameters[1] shouldBe parameters[1].copy(
            name = "testGroup",
            assignedBy = PythonParameterAssignment.GROUP,
            typeInDocs = "TestGroup",
            groupedParametersOldToNewName = mutableMapOf(
                "testParameter2" to "testParameter2",
                "testParameter3" to "testParameter3"
            )
        )
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
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    PythonParameter(name = "testParameter2"),
                    PythonParameter(name = "testParameter3")
                )
            )
        )

        testPackage.processGroupAnnotations()

        val parameters = testFunction.parameters
        parameters.shouldHaveSize(2)
        parameters[0] shouldBe testParameter1
        parameters[1] shouldBe parameters[1].copy(
            name = "testGroup",
            assignedBy = PythonParameterAssignment.GROUP,
            typeInDocs = "TestGroup",
            groupedParametersOldToNewName = mutableMapOf(
                "testParameter2" to "testParameter2",
                "testParameter3" to "testParameter3"
            )
        )
    }

    @Test
    fun `should process GroupAnnotations on module level with identical class on module level`() {
        testModule.classes += PythonClass(
            name = "TestGroup",
            constructor = PythonConstructor(
                mutableListOf(
                    PythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    PythonParameter(name = "testParameter2"),
                    PythonParameter(name = "testParameter3")
                )
            )
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
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    PythonParameter(name = "testParameter2"),
                    PythonParameter(name = "testParameter3")
                )
            )
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
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    PythonParameter(name = "otherParameter")
                )
            )
        )

        shouldThrowExactly<ConflictingGroupException> {
            testPackage.processGroupAnnotations()
        }
    }
}
