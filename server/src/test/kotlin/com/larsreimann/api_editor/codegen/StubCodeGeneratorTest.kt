package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.MutablePythonResult
import de.unibonn.simpleml.SimpleMLStandaloneSetup
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

internal class StubCodeGeneratorTest {

    @BeforeEach
    fun initSimpleML() {
        SimpleMLStandaloneSetup.doSetup()
    }

    @Test
    fun buildModuleContentReturnsFormattedModuleContent() {
        // given
        val testClass = MutablePythonClass(
            name = "TestClass",
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "testClassFunction",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description",
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "__init__",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description"
                        )
                    )
                )
            )
        )
        val testModule = MutablePythonModule(
            name = "testModule",
            classes = mutableListOf(testClass),
            functions = mutableListOf(
                MutablePythonFunction(
                    name = "functionModule1",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum"
                        ),
                        MutablePythonParameter(
                            "param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum"
                        ),
                        MutablePythonParameter(
                            "param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum"
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "testResult",
                            "str",
                            "str",
                            "Lorem ipsum"
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "testFunction",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "testParameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum"
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "testResult",
                            "str",
                            "str",
                            "Lorem ipsum"
                        )
                    )
                )
            )
        )

        // when
        val moduleContent = buildCompilationUnitToString(testModule)

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |
            |@Description("Lorem ipsum")
            |class TestClass(@Description("description") onlyParam: Any? or "defaultValue") {
            |    @Description("description")
            |    attr onlyParam: Any?
            |
            |    @Description("description")
            |    fun testClassFunction(@Description("description") onlyParam: Any? or "defaultValue")
            |}
            |
            |@Description("Lorem ipsum")
            |fun functionModule1(@Description("Lorem ipsum") param1: String, @Description("Lorem ipsum") param2: String, @Description("Lorem ipsum") param3: String) -> @Description("Lorem ipsum") testResult: String
            |
            |@Description("Lorem ipsum")
            |fun testFunction(@Description("Lorem ipsum") testParameter: Int or 42) -> @Description("Lorem ipsum") testResult: String
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithNoClassesReturnsFormattedModuleContent() {
        // given
        val testModule = MutablePythonModule(
            name = "testModule",
            functions = mutableListOf(
                MutablePythonFunction(
                    name = "functionModule1",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum"
                        ),
                        MutablePythonParameter(
                            "param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum"
                        ),
                        MutablePythonParameter(
                            "param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum"
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "testResult",
                            "str",
                            "str",
                            "Lorem ipsum"
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "testFunction",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "testParameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum",
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "testResult",
                            "str",
                            "str",
                            "Lorem ipsum",
                        )
                    )
                )
            )
        )

        // when
        val moduleContent = buildCompilationUnitToString(testModule)

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |
            |@Description("Lorem ipsum")
            |fun functionModule1(@Description("Lorem ipsum") param1: String, @Description("Lorem ipsum") param2: String, @Description("Lorem ipsum") param3: String) -> @Description("Lorem ipsum") testResult: String
            |
            |@Description("Lorem ipsum")
            |fun testFunction(@Description("Lorem ipsum") testParameter: Int or 42) -> @Description("Lorem ipsum") testResult: String
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithOnlyConstructorReturnsFormattedModuleContent() {
        // given
        val testClass = MutablePythonClass(
            name = "TestClass",
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "__init__",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description"
                        )
                    )
                )
            )
        )
        val testModule = MutablePythonModule(
            name = "testModule",
            imports = mutableListOf(
                PythonImport(
                    "testImport1",
                    "testAlias"
                )
            ),
            fromImports = mutableListOf(
                PythonFromImport(
                    "testFromImport1",
                    "testDeclaration1",
                    null
                )
            ),
            classes = mutableListOf(testClass)
        )

        // when
        val moduleContent = buildCompilationUnitToString(testModule)

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |
            |@Description("Lorem ipsum")
            |class TestClass(@Description("description") onlyParam: Any? or "defaultValue") {
            |    @Description("description")
            |    attr onlyParam: Any?
            |}
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithNoFunctionsAndClassesReturnsFormattedModuleContent() {
        // given
        val testModule = MutablePythonModule("testModule")

        // when
        val moduleContent = buildCompilationUnitToString(testModule)

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildClassReturnsFormattedClassWithNoConstructorAndFunctions() {
        // given
        val testClass = MutablePythonClass("TestClass")

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
        val testClass = MutablePythonClass(
            name = "TestClass",
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "testClassFunction",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "str",
                            "description",
                        )
                    )
                )
            )
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
        val testClass = MutablePythonClass(
            name = "TestClass",
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "testClassFunction1",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "onlyParam",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description"
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "__init__",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "onlyParam",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description"
                        )
                    )
                )
            )
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

    @Test
    fun buildFunctionReturnsFormattedFunctionWithNoParameters() {
        // given
        val testFunction = MutablePythonFunction("testFunction")

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
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "onlyParam",
                    "13",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "int",
                    "description"
                )
            )
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
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "onlyParam",
                    "'Test'",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "string",
                    "description"
                )
            )
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
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "firstParam",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "secondParam",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "thirdParam",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description"
                )
            )
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
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "onlyParam",
                    "1.31e+1",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "float",
                    "description"
                )
            ),
            results = mutableListOf(
                MutablePythonResult(
                    "firstResult",
                    "float",
                    "float",
                    "description"
                )
            )
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
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "onlyParam",
                    "True",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "bool",
                    "description"
                )
            ),
            results = mutableListOf(
                MutablePythonResult(
                    "firstResult",
                    "float",
                    "float",
                    "description"
                ),
                MutablePythonResult(
                    "secondResult",
                    "float",
                    "float",
                    "description"
                )
            )
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
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "onlyParam",
                    "'13'x",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "string",
                    "description"
                )
            )
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
        val testFunction = MutablePythonFunction("testFunction")
        testFunction.isPure = true

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |@Pure
            |fun testFunction()""".trimMargin()

        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun `should convert names to camel case`() {
        // given
        val testClass = MutablePythonClass(
            name = "Test_Class",
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "__init__",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "test_parameter",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "",
                            "",
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "test_function",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "test_parameter",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "",
                            "",
                        )
                    )
                ),
            )
        )

        // when
        val formattedClass = buildClassToString(testClass)

        // then
        val expectedFormattedClass: String =
            """
            |@PythonName("Test_Class")
            |class TestClass(@PythonName("test_parameter") testParameter: Any?) {
            |    @PythonName("test_parameter")
            |    attr testParameter: Any?
            |
            |    @PythonName("test_function")
            |    fun testFunction(@PythonName("test_parameter") testParameter: Any?)
            |}""".trimMargin()

        formattedClass shouldBe expectedFormattedClass
    }
}
