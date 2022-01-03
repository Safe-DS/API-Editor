package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.DefaultString
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonParameter
import de.unibonn.simpleml.SimpleMLStandaloneSetup
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

internal class ClassStubContentBuilderTest {

    @BeforeEach
    fun initSimpleML() {
        SimpleMLStandaloneSetup.doSetup()
    }

    @Test
    fun buildClassReturnsFormattedClassWithNoConstructorAndFunctions() {
        // given
        val testClass = SerializablePythonClass(
            "TestClass",
            "testModule.TestClass",
            listOf("TestDecorator"),
            listOf("TestSuperclass"), mutableListOf(),
            true,
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )

        // when
        val formattedClass = buildClassToString(testClass)

        // then
        val expectedFormattedClass = """
            |@Description("Lorem ipsum")
            |class TestClass()
        """.trimMargin()
        Assertions.assertEquals(expectedFormattedClass, formattedClass)
    }

    @Test
    fun buildClassReturnsFormattedClassWithOneFunctionAndNoConstructor() {
        // given
        val testClass = SerializablePythonClass(
            "TestClass",
            "testModule.TestClass",
            listOf("TestDecorator"),
            listOf("TestSuperclass"),
            mutableListOf(
                SerializablePythonFunction(
                    "testClassFunction",
                    "testModule.TestClass.testClassFunction",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "onlyParam",
                            "testModule.TestClass.testClassFunction.onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "str",
                            "description",
                            mutableListOf(
                                AttributeAnnotation(
                                    DefaultString("test")
                                )
                            )
                        )
                    ),
                    mutableListOf(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                )
            ),
            true,
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )

        // when
        val formattedClass = buildClassToString(testClass)

        // then
        val expectedFormattedClass: String = """
            |@Description("Lorem ipsum")
            |class TestClass() {
            |    @Description("description")
            |    fun testClassFunction(@Description("description") onlyParam: String or "defaultValue")
            |}""".trimMargin()

        formattedClass shouldBe expectedFormattedClass
    }

    @Test
    fun buildClassReturnsFormattedClassWithConstructorAndOneFunction() {
        // given
        val testClass = SerializablePythonClass(
            "TestClass",
            "testModule.TestClass",
            listOf("TestDecorator"),
            listOf("TestSuperclass"),
            mutableListOf(
                SerializablePythonFunction(
                    "testClassFunction1",
                    "testModule.TestClass.testClassFunction1",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "onlyParam",
                            "testModule.TestClass.testClassFunction.onlyParam",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ),
                    mutableListOf(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                ),
                SerializablePythonFunction(
                    "__init__",
                    "testModule.TestClass.__init__",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "onlyParam",
                            "testModule.TestClass.__init__.onlyParam",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ),
                    mutableListOf(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                )
            ),
            true,
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )

        // when
        val formattedClass = buildClassToString(testClass)

        // then
        val expectedFormattedClass: String =
            """
            |@Description("Lorem ipsum")
            |class TestClass(@Description("description") onlyParam: Any?) {
            |    @Description("description")
            |    attr onlyParam: Any?
            |
            |    @Description("description")
            |    fun testClassFunction1(@Description("description") onlyParam: Any?)
            |}""".trimMargin()

        formattedClass shouldBe expectedFormattedClass
    }
}
