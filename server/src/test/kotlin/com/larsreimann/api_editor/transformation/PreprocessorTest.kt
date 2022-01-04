package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.OriginalPythonClass
import com.larsreimann.api_editor.mutable_model.OriginalPythonFunction
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

// TODO: test original declaration
// TODO: test updateParameterAssignment
// TODO: test rename all modules to simpleml.something

class PreprocessorTest {
    private lateinit var testParameter: MutablePythonParameter
    private lateinit var testGlobalFunction: MutablePythonFunction
    private lateinit var testMethod: MutablePythonFunction
    private lateinit var testClass: MutablePythonClass
    private lateinit var testPackage: MutablePythonPackage

    @BeforeEach
    fun reset() {
        testParameter = MutablePythonParameter(
            name = "testParameter"
        )
        testGlobalFunction = MutablePythonFunction(
            name = "testGlobalFunction",
            parameters = listOf(testParameter)
        )
        testMethod = MutablePythonFunction(
            name = "testMethod",
            parameters = listOf(
                MutablePythonParameter(
                    name = "testMethodParameter",
                    assignedBy = PythonParameterAssignment.POSITION_ONLY
                )
            )
        )
        testClass = MutablePythonClass(
            name = "testClass",
            methods = listOf(testMethod)
        )
        testPackage = MutablePythonPackage(
            distribution = "testPackage",
            name = "testPackage",
            version = "1.0.0",
            modules = listOf(
                MutablePythonModule(
                    "testModule",
                    classes = listOf(testClass),
                    functions = listOf(testGlobalFunction)
                )
            )
        )
    }

    @Test
    fun `should add original declaration to classes`() {
        testPackage.addOriginalDeclarations()

        testClass.originalClass shouldBe OriginalPythonClass("testModule.testClass")
    }

    @Test
    fun `should add original declaration to global functions`() {
        testPackage.addOriginalDeclarations()

        testGlobalFunction.originalFunction shouldBe OriginalPythonFunction(
            qualifiedName = "testModule.testGlobalFunction",
            parameters = listOf(
                OriginalPythonParameter(
                    name = "testParameter",
                    assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                )
            )
        )
    }

    @Test
    fun `should add original declaration to class methods`() {
        testPackage.addOriginalDeclarations()

        testMethod.originalFunction shouldBe OriginalPythonFunction(
            qualifiedName = "testModule.testClass.testMethod",
            parameters = listOf(
                OriginalPythonParameter(
                    name = "testMethodParameter",
                    assignedBy = PythonParameterAssignment.POSITION_ONLY
                )
            )
        )
    }

    @Test
    fun `should add original declaration to parameters`() {
        testPackage.addOriginalDeclarations()

        testParameter.originalParameter shouldBe OriginalPythonParameter(
            name = "testParameter",
            assignedBy = PythonParameterAssignment.POSITION_OR_NAME
        )
    }
}
