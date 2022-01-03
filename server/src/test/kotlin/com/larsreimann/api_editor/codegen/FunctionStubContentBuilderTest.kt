package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.util.createPythonFunction
import de.unibonn.simpleml.SimpleMLStandaloneSetup
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

internal class FunctionStubContentBuilderTest {

    @BeforeEach
    fun initSimpleML() {
        SimpleMLStandaloneSetup.doSetup()
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithNoParameters() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"), mutableListOf(), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String =
            """
            |@Description("Lorem ipsum")
            |fun testFunction()""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOnlyParameter() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                AnnotatedPythonParameter(
                    "onlyParam",
                    "testModule.testClass.testClassFunction.onlyParam",
                    "13",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "int",
                    "description", mutableListOf()
                )
            ),
            mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String =
            """
            |@Description("Lorem ipsum")
            |fun testFunction(@Description("description") onlyParam: Int or 13)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOrNameParameter() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                AnnotatedPythonParameter(
                    "onlyParam",
                    "testModule.testClass.testClassFunction.onlyParam",
                    "'Test'",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "string",
                    "description", mutableListOf()
                )
            ),
            mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String =
            """
            |@Description("Lorem ipsum")
            |fun testFunction(@Description("description") onlyParam: Any? or "Test")""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameAndNameOnlyParameter() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                AnnotatedPythonParameter(
                    "firstParam",
                    "testModule.testClass.testClassFunction.firstParam",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                AnnotatedPythonParameter(
                    "secondParam",
                    "testModule.testClass.testClassFunction.secondParam",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                AnnotatedPythonParameter(
                    "thirdParam",
                    "testModule.testClass.testClassFunction.thirdParam",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ),
            mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |@Description("Lorem ipsum")
            |fun testFunction(@Description("description") firstParam: Any?, @Description("description") secondParam: Any?, @Description("description") thirdParam: Any?)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithOneResult() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                AnnotatedPythonParameter(
                    "onlyParam",
                    "testModule.testClass.testClassFunction.onlyParam",
                    "1.31e+1",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "float",
                    "description", mutableListOf()
                )
            ),
            mutableListOf(
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
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |@Description("Lorem ipsum")
            |fun testFunction(@Description("description") onlyParam: Float or 13.1) -> @Description("description") firstResult: Float""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithMultipleResults() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                AnnotatedPythonParameter(
                    "onlyParam",
                    "testModule.testClass.testClassFunction.onlyParam",
                    "True",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "bool",
                    "description", mutableListOf()
                )
            ),
            mutableListOf(
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
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |@Description("Lorem ipsum")
            |fun testFunction(@Description("description") onlyParam: Boolean or true) -> (@Description("description") firstResult: Float, @Description("description") secondResult: Float)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithInvalidDefaultValue() {
        // given
        val testFunction = AnnotatedPythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                AnnotatedPythonParameter(
                    "onlyParam",
                    "testModule.testClass.testClassFunction.onlyParam",
                    "'13'x",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "string",
                    "description", mutableListOf()
                )
            ),
            mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |@Description("Lorem ipsum")
            |fun testFunction(@Description("description") onlyParam: Any? or "###invalid###'13'x###")""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun shouldMarkPureFunctionsWithAnnotation() {
        // given
        val testFunction = createPythonFunction(
            "testFunction"
        )
        testFunction.isPure = true

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |@Pure
            |fun testFunction()""".trimMargin()

        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }
}
