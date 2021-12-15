package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.util.createAnnotatedPythonFunction
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

internal class FunctionStubContentBuilderTest {
    @Test
    fun buildFunctionReturnsFormattedFunctionWithNoParameters() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"), emptyList(), emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionStubContentBuilder = FunctionStubContentBuilder(testFunction)
        val formattedFunction = functionStubContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |fun test-function()""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOnlyParameter() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            listOf(
                AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "13",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "int",
                    "description", mutableListOf()
                )
            ), emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionStubContentBuilder = FunctionStubContentBuilder(testFunction)
        val formattedFunction = functionStubContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |fun test-function(only-param: Any? or 13)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOrNameParameter() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            listOf(
                AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "'Test'",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "string",
                    "description", mutableListOf()
                )
            ), emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionStubContentBuilder = FunctionStubContentBuilder(testFunction)
        val formattedFunction = functionStubContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String =
            """
            |fun test-function(only-param: Any? or "Test")""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameAndNameOnlyParameter() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            listOf(
                AnnotatedPythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                AnnotatedPythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                AnnotatedPythonParameter(
                    "third-param",
                    "test-module.test-class.test-class-function.third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ), emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionStubContentBuilder = FunctionStubContentBuilder(testFunction)
        val formattedFunction = functionStubContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String = """
            |fun test-function(first-param: Any?, second-param: Any?, third-param: Any?)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithOneResult() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            listOf(
                AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "1.31e+1",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "float",
                    "description", mutableListOf()
                )
            ),
            listOf(
                AnnotatedPythonResult(
                    "firstResult",
                    "float",
                    "float",
                    "description", mutableListOf()
                )
            ),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionStubContentBuilder = FunctionStubContentBuilder(testFunction)
        val formattedFunction = functionStubContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String = """
            |fun test-function(only-param: Any? or 13.1) -> firstResult: float""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithMultipleResults() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            listOf(
                AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "True",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "bool",
                    "description", mutableListOf()
                )
            ),
            listOf(
                AnnotatedPythonResult(
                    "firstResult",
                    "float",
                    "float",
                    "description", mutableListOf()
                ),
                AnnotatedPythonResult(
                    "secondResult",
                    "float",
                    "float",
                    "description", mutableListOf()
                )
            ),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionStubContentBuilder = FunctionStubContentBuilder(testFunction)
        val formattedFunction = functionStubContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String = """
            |fun test-function(only-param: Any? or true) -> [firstResult: float, secondResult: float]""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithInvalidDefaultValue() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            listOf(
                AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "'13'x",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "string",
                    "description", mutableListOf()
                )
            ), emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val functionStubContentBuilder = FunctionStubContentBuilder(testFunction)
        val formattedFunction = functionStubContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String = """
            |fun test-function(only-param: Any? or "###invalid###'13'x###")""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun shouldMarkPureFunctionsWithAnnotation() {
        // given
        val testFunction = createAnnotatedPythonFunction(
            "testFunction"
        )
        testFunction.isPure = true

        // when
        val functionStubContentBuilder = FunctionStubContentBuilder(testFunction)
        val formattedFunction = functionStubContentBuilder.buildFunction()

        // then
        val expectedFormattedFunction: String = """
            |@Pure
            |fun testFunction()""".trimMargin()
            Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }
}
