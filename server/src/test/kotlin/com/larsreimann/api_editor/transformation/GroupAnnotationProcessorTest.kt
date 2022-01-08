package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonConstructor
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.transformation.processing_exceptions.ConflictingGroupException
import io.kotest.assertions.throwables.shouldThrowExactly
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldBeIn
import io.kotest.matchers.shouldBe
import org.junit.Assert.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class GroupAnnotationProcessorTest {
    private lateinit var testFunction: MutablePythonFunction
    private lateinit var testModule: MutablePythonModule
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        val testParameter1 = MutablePythonParameter(
            name = "testParameter1",
        )
        val testParameter2 = MutablePythonParameter(
            name = "testParameter2",
        )
        val testParameter3 = MutablePythonParameter(
            name = "testParameter3",
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
                    "TestGroup",
                    mutableListOf("testParameter2", "testParameter3")
                )
            )
        )
        testModule = MutablePythonModule(
            name = "testModule",
            functions = mutableListOf(
                testFunction
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
    fun `should process GroupAnnotations on function level`() {
        testPackage.processGroupAnnotations()

        testFunction.parameters.size shouldBe 2
        testFunction.parameters[0].name shouldBe "testParameter1"
        testFunction.parameters[1].assignedBy shouldBe PythonParameterAssignment.GROUP
        testFunction.parameters[1].name shouldBe "testGroup"
        testFunction.parameters[1].typeInDocs shouldBe "TestGroup"
        "testParameter2" shouldBeIn testFunction.parameters[1].groupedParameterNames
        "testParameter3" shouldBeIn testFunction.parameters[1].groupedParameterNames
    }

    @Test
    fun `should process GroupAnnotations on module level`() {
        testPackage.processGroupAnnotations()

        testModule.classes[0].name shouldBe "TestGroup"
        assertNotNull(testModule.classes[0].constructor)
        testModule.classes[0].constructor!!.parameters.size shouldBe 3
        "testParameter2" shouldBeIn testModule.classes[0].constructor!!.parameters.map { parameter -> parameter.name }
        "testParameter3" shouldBeIn testModule.classes[0].constructor!!.parameters.map { parameter -> parameter.name }
    }

    @Test
    fun `should process GroupAnnotations on function level with identical class on module level`() {
        val groupedClass = MutablePythonClass(
            "TestGroup",
            constructor = MutablePythonConstructor(
                mutableListOf(
                    MutablePythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    MutablePythonParameter("testParameter2"),
                    MutablePythonParameter("testParameter3")
                )
            )
        )
        println("TestGroup")
        println(groupedClass.constructor?.parameters?.toList().toString())
        testModule.classes.add(groupedClass)
        testPackage.processGroupAnnotations()

        testFunction.parameters.size shouldBe 2
        testFunction.parameters[0].name shouldBe "testParameter1"
        testFunction.parameters[1].assignedBy shouldBe PythonParameterAssignment.GROUP
        testFunction.parameters[1].name shouldBe "testGroup"
        testFunction.parameters[1].typeInDocs shouldBe "TestGroup"
        "testParameter2" shouldBeIn testFunction.parameters[1].groupedParameterNames
        "testParameter3" shouldBeIn testFunction.parameters[1].groupedParameterNames
    }

    @Test
    fun `should process GroupAnnotations on module level with identical class on module level`() {
        val groupedClass = MutablePythonClass(
            "TestGroup",
            constructor = MutablePythonConstructor(
                mutableListOf(
                    MutablePythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    MutablePythonParameter("testParameter2"),
                    MutablePythonParameter("testParameter3")
                )
            )
        )
        testModule.classes.add(groupedClass)
        testPackage.processGroupAnnotations()

        testModule.classes[0].name shouldBe "TestGroup"
        assertNotNull(testModule.classes[0].constructor)
        testModule.classes[0].constructor!!.parameters.size shouldBe 3
        "testParameter2" shouldBeIn testModule.classes[0].constructor!!.parameters.map { parameter -> parameter.name }
        "testParameter3" shouldBeIn testModule.classes[0].constructor!!.parameters.map { parameter -> parameter.name }
    }

    @Test
    fun `should not add duplicate class on module level`() {
        val groupedClass = MutablePythonClass(
            "TestGroup",
            constructor = MutablePythonConstructor(
                mutableListOf(
                    MutablePythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    MutablePythonParameter("testParameter2"),
                    MutablePythonParameter("testParameter3")
                )
            )
        )
        testModule.classes.add(groupedClass)
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
        val groupedClass = MutablePythonClass(
            "TestGroup",
            constructor = MutablePythonConstructor(
                mutableListOf(
                    MutablePythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    MutablePythonParameter("otherParameter")
                )
            )
        )
        testModule.classes.add(groupedClass)

        shouldThrowExactly<ConflictingGroupException> {
            testPackage.processGroupAnnotations()
        }
    }
}
