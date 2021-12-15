package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.DefaultString
import com.larsreimann.api_editor.model.PythonParameterAssignment
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

internal class ClassStubContentBuilderTest {
    @Test
    fun buildClassReturnsFormattedClassWithNoConstructorAndFunctions() {
        // given
        val testClass = AnnotatedPythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"), emptyList(),
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )

        // when
        val classStubContentBuilder = ClassStubContentBuilder(testClass)
        val formattedClass = classStubContentBuilder.buildClass()

        // then
        val expectedFormattedClass = "class test-class() {}"
        Assertions.assertEquals(expectedFormattedClass, formattedClass)
    }

    @Test
    fun buildClassReturnsFormattedClassWithOneFunctionAndNoConstructor() {
        // given
        val testClass = AnnotatedPythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"),
            listOf(
                AnnotatedPythonFunction(
                    "test-class-function",
                    "test-module.test-class.test-class-function",
                    listOf("decorators"),
                    listOf(
                        AnnotatedPythonParameter(
                            "only-param",
                            "test-module.test-class.test-class-function.only-param",
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
                    ), emptyList(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                )
            ),
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )

        // when
        val classStubContentBuilder = ClassStubContentBuilder(testClass)
        val formattedClass = classStubContentBuilder.buildClass()

        // then
        val expectedFormattedClass: String = """
            |class test-class() {
            |    fun test-class-function(only-param: Any? or "defaultValue")
            |}""".trimMargin()
        Assertions.assertEquals(expectedFormattedClass, formattedClass)
    }

    @Test
    fun buildClassReturnsFormattedClassWithConstructorAndOneFunction() {
        // given
        val testClass = AnnotatedPythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"),
            listOf(
                AnnotatedPythonFunction(
                    "test-class-function1",
                    "test-module.test-class.test-class-function1",
                    listOf("decorators"),
                    listOf(
                        AnnotatedPythonParameter(
                            "only-param",
                            "test-module.test-class.test-class-function.only-param",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ), emptyList(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                ),
                AnnotatedPythonFunction(
                    "__init__",
                    "test-module.test-class.__init__",
                    listOf("decorators"),
                    listOf(
                        AnnotatedPythonParameter(
                            "only-param",
                            "test-module.test-class.__init__.only-param",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ), emptyList(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                )
            ),
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )

        // when
        val classStubContentBuilder = ClassStubContentBuilder(testClass)
        val formattedClass = classStubContentBuilder.buildClass()

        // then
        val expectedFormattedClass: String =
            """
            |class test-class(only-param: Any?) {
            |    attr only-param: Any?
            |
            |    fun test-class-function1(only-param: Any?)
            |}""".trimMargin()

        Assertions.assertEquals(formattedClass, expectedFormattedClass)
    }
}
