package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.codegen.ClassAdapterContentBuilder.buildClass
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.codegen.ClassAdapterContentBuilder
import org.junit.jupiter.api.Assertions
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.SerializablePythonResult
import com.larsreimann.api_editor.model.RenameAnnotation
import org.junit.jupiter.api.Test
import java.util.List

internal class ClassAdapterContentBuilderTest {
    @Test
    fun buildClassReturnsFormattedClassWithNoFunctions() {
        // given
        val testClass = SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"), mutableListOf(),
            true,
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )

        // when
        val classAdapterContentBuilder = ClassAdapterContentBuilder(testClass)
        val formattedClass = classAdapterContentBuilder.buildClass()

        // then
        val expectedFormattedClass = "class test-class:"
        Assertions.assertEquals(expectedFormattedClass, formattedClass)
    }

    @Test
    fun buildClassReturnsFormattedClassWithOneFunction() {
        // given
        val testClass = SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"),
            mutableListOf(
                SerializablePythonFunction(
                    "__init__",
                    "test-module.test-class.__init__",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "self",
                            "test-module.test-class.__init__.self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "only-param",
                            "test-module.test-class.__init__.only-param",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "str",
                            "description",
                            mutableListOf()
                        )
                    ), mutableListOf(),
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
        val classAdapterContentBuilder = ClassAdapterContentBuilder(testClass)
        val formattedClass = classAdapterContentBuilder.buildClass()

        // then
        val expectedFormattedClass: String =
            """
            |class test-class:
            |    def __init__(self, *, only-param='defaultValue'):
            |        test-module.test-class.__init__(only-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedClass, formattedClass)
    }

    @Test
    fun buildClassReturnsFormattedClassWithTwoFunctions() {
        // given
        val testClass = SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"),
            mutableListOf(
                SerializablePythonFunction(
                    "test-class-function1",
                    "test-module.test-class.test-class-function1",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "self",
                            "test-module.test-class.test-class-function1.self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "only-param",
                            "test-module.test-class.test-class-function1.only-param",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ), mutableListOf(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                ),
                SerializablePythonFunction(
                    "test-class-function2",
                    "test-module.test-class.test-class-function2",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "self",
                            "test-module.test-class.test-class-function2.self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "only-param",
                            "test-module.test-class.test-class-function2.only-param",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ), mutableListOf(),
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
        val classAdapterContentBuilder = ClassAdapterContentBuilder(testClass)
        val formattedClass = classAdapterContentBuilder.buildClass()

        // then
        val expectedFormattedClass: String =
            """
            |class test-class:
            |    def test-class-function1(self, only-param):
            |        test-module.test-class.test-class-function1(only-param)
            |
            |    def test-class-function2(self, only-param):
            |        test-module.test-class.test-class-function2(only-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedClass, formattedClass)
    }

    @Test
    fun buildClassReturnsFormattedClassBasedOnOriginalDeclaration() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-class.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "self",
                    "test-module.test-class.test-class-function.self",
                    null,
                    PythonParameterAssignment.IMPLICIT,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description",
                    mutableListOf(
                        RenameAnnotation("newSecondParamName")
                    )
                ),
                SerializablePythonParameter(
                    "third-param",
                    "test-module.test-class.test-class-function.third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    mutableListOf(
                        RenameAnnotation("newThirdParamName")
                    )
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            mutableListOf(
                RenameAnnotation("newFunctionName")
            )
        )
        val testClass = SerializablePythonClass(
            "test-class",
            "test-module.test-class", emptyList(), emptyList(),
            mutableListOf(testFunction),
            true,
            "",
            "",
            mutableListOf(
                RenameAnnotation("newClassName")
            )
        )

        // when
        val classAdapterContentBuilder = ClassAdapterContentBuilder(testClass)
        val formattedClass = classAdapterContentBuilder.buildClass()

        // then
        val expectedFormattedClass: String =
            """
            |class test-class:
            |    def test-function(self, second-param, third-param):
            |        test-module.test-class.test-function(second-param, third-param=third-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedClass, formattedClass)
    }
}
