package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.codegen.FunctionAdapterContentBuilder.buildFunction
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.codegen.FunctionAdapterContentBuilder
import org.junit.jupiter.api.Assertions
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RenameAnnotation
import org.junit.jupiter.api.Test
import java.util.List

internal class FunctionAdapterContentBuilderTest {
    @Test
    fun buildFunctionReturnsFormattedFunctionWithNoParameters() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"), mutableListOf(), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionAdapterContentBuilder = FunctionAdapterContentBuilder(testFunction)
        val formattedFunction = functionAdapterContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function():
            |    test-module.test-function()""".trimMargin()
            Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOnlyParameter() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "13",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "float",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionAdapterContentBuilder = FunctionAdapterContentBuilder(testFunction)
        val formattedFunction = functionAdapterContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(*, only-param=13):
            |    test-module.test-function(only-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOrNameParameter() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "False",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "bool",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionAdapterContentBuilder = FunctionAdapterContentBuilder(testFunction)
        val formattedFunction = functionAdapterContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(*, only-param=False):
            |    test-module.test-function(only-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithNameOnlyParameter() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionAdapterContentBuilder = FunctionAdapterContentBuilder(testFunction)
        val formattedFunction = functionAdapterContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(only-param):
            |    test-module.test-function(only-param=only-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameParameter() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
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
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionAdapterContentBuilder = FunctionAdapterContentBuilder(testFunction)
        val formattedFunction = functionAdapterContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(first-param, second-param):
            |    test-module.test-function(first-param, second-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameAndNameOnlyParameter() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
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
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "third-param",
                    "test-module.test-class.test-class-function.third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionAdapterContentBuilder = FunctionAdapterContentBuilder(testFunction)
        val formattedFunction = functionAdapterContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(first-param, second-param, third-param):
            |    test-module.test-function(first-param, second-param, third-param=third-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndNameOnlyParameter() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionAdapterContentBuilder = FunctionAdapterContentBuilder(testFunction)
        val formattedFunction = functionAdapterContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(first-param, second-param):
            |    test-module.test-function(first-param, second-param=second-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOrNameAndNameOnlyParameter() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionAdapterContentBuilder = FunctionAdapterContentBuilder(testFunction)
        val formattedFunction = functionAdapterContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(first-param, second-param):
            |    test-module.test-function(first-param, second-param=second-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionsReturnsFormattedFunctionBasedOnOriginalDeclaration() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    mutableListOf(
                        RenameAnnotation("newFirstParamName")
                    )
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

        // when
        val functionAdapterContentBuilder = FunctionAdapterContentBuilder(testFunction)
        val formattedFunction = functionAdapterContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(first-param, second-param, third-param):
            |    test-module.test-function(first-param, second-param, third-param=third-param)""".trimMargin()
            Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }
}
