package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonConstructor
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
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
    private lateinit var testParameter1: MutablePythonParameter
    private lateinit var testParameter2: MutablePythonParameter
    private lateinit var testParameter3: MutablePythonParameter
    private lateinit var testFunction: MutablePythonFunction
    private lateinit var testModule: MutablePythonModule
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        testParameter1 = MutablePythonParameter(
            name = "testParameter1",
            originalParameter = OriginalPythonParameter(name = "testParameter1")
        )
        testParameter2 = MutablePythonParameter(
            name = "testParameter2",
            originalParameter = OriginalPythonParameter(name = "testParameter2")
        )
        testParameter3 = MutablePythonParameter(
            name = "testParameter3",
            originalParameter = OriginalPythonParameter(name = "testParameter3")
        )
        testFunction = MutablePythonFunction(
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
        testModule = MutablePythonModule(
            name = "testModule",
            functions = mutableListOf(testFunction)
        )
        testPackage = MutablePythonPackage(
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
        testModule.classes += MutablePythonClass(
            name = "TestGroup",
            constructor = MutablePythonConstructor(
                mutableListOf(
                    MutablePythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    MutablePythonParameter(name = "testParameter2"),
                    MutablePythonParameter(name = "testParameter3")
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
        testModule.classes += MutablePythonClass(
            name = "TestGroup",
            constructor = MutablePythonConstructor(
                mutableListOf(
                    MutablePythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    MutablePythonParameter(name = "testParameter2"),
                    MutablePythonParameter(name = "testParameter3")
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
        testModule.classes += MutablePythonClass(
            name = "TestGroup",
            constructor = MutablePythonConstructor(
                mutableListOf(
                    MutablePythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    MutablePythonParameter(name = "testParameter2"),
                    MutablePythonParameter(name = "testParameter3")
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
        testModule.classes += MutablePythonClass(
            name = "TestGroup",
            constructor = MutablePythonConstructor(
                mutableListOf(
                    MutablePythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    MutablePythonParameter(name = "otherParameter")
                )
            )
        )

        shouldThrowExactly<ConflictingGroupException> {
            testPackage.processGroupAnnotations()
        }
    }
}
