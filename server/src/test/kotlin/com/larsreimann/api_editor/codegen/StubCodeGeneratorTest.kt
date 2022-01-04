package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.DefaultString
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult
import com.larsreimann.api_editor.util.createPythonFunction
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
        val testClass = SerializablePythonClass(
            "TestClass",
            "testModule.TestClass",
            listOf("testDecorator"),
            listOf("testSuperclass"),
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
                            "typeInDocs",
                            "description",
                            mutableListOf()
                        )
                    ),
                    mutableListOf(),
                    true,
                    "description",
                    "fullDocstring",
                    mutableListOf()
                ),
                SerializablePythonFunction(
                    "__init__",
                    "testModule.TestClass.__init__",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "onlyParam",
                            "testModule.TestClass.__init__.onlyParam",
                            "'defaultValue'",
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
        val testModule = SerializablePythonModule(
            "testModule", emptyList(), emptyList(),
            mutableListOf(
                testClass
            ),
            mutableListOf(
                SerializablePythonFunction(
                    "functionModule1",
                    "test.module_1.functionModule1",
                    listOf("testDecorator"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "param1",
                            "test.module_1.functionModule1.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "param2",
                            "test.module_1.functionModule1.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "param3",
                            "test.module_1.functionModule1.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    mutableListOf(
                        SerializablePythonResult(
                            "testResult",
                            "str",
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum", mutableListOf()
                ),
                SerializablePythonFunction(
                    "testFunction",
                    "testModule.testFunction",
                    listOf("testDecorator"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "testParameter",
                            "testModule.testFunction.testParameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    mutableListOf(
                        SerializablePythonResult(
                            "testResult",
                            "str",
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum", mutableListOf()
                )
            ),
            mutableListOf()
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
        val testModule = SerializablePythonModule(
            "testModule", emptyList(), emptyList(), mutableListOf(),
            mutableListOf(
                SerializablePythonFunction(
                    "functionModule1",
                    "test.module_1.functionModule1",
                    listOf("testDecorator"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "param1",
                            "test.module_1.functionModule1.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "param2",
                            "test.module_1.functionModule1.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "param3",
                            "test.module_1.functionModule1.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    mutableListOf(
                        SerializablePythonResult(
                            "testResult",
                            "str",
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum", mutableListOf()
                ),
                SerializablePythonFunction(
                    "testFunction",
                    "testModule.testFunction",
                    listOf("testDecorator"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "testParameter",
                            "testModule.testFunction.testParameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    mutableListOf(
                        SerializablePythonResult(
                            "testResult",
                            "str",
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum", mutableListOf()
                )
            ),
            mutableListOf()
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
        val testClass = SerializablePythonClass(
            "TestClass",
            "testModule.TestClass",
            listOf("testDecorator"),
            listOf("testSuperclass"),
            mutableListOf(
                SerializablePythonFunction(
                    "__init__",
                    "testModule.TestClass.__init__",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "onlyParam",
                            "testModule.TestClass.__init__.onlyParam",
                            "'defaultValue'",
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
        val testModule = SerializablePythonModule(
            "testModule",
            listOf(
                PythonImport(
                    "testImport1",
                    "testAlias"
                )
            ),
            listOf(
                PythonFromImport(
                    "testFromImport1",
                    "testDeclaration1",
                    null
                )
            ),
            mutableListOf(
                testClass
            ),
            mutableListOf(), mutableListOf()
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
        val testModule = SerializablePythonModule(
            "testModule", emptyList(), emptyList(), mutableListOf(), mutableListOf(), mutableListOf()
        )

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

    @Test
    fun buildFunctionReturnsFormattedFunctionWithNoParameters() {
        // given
        val testFunction = SerializablePythonFunction(
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
        val testFunction = SerializablePythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                SerializablePythonParameter(
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
        val testFunction = SerializablePythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                SerializablePythonParameter(
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
        val testFunction = SerializablePythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "firstParam",
                    "testModule.testClass.testClassFunction.firstParam",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "secondParam",
                    "testModule.testClass.testClassFunction.secondParam",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
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
        val testFunction = SerializablePythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                SerializablePythonParameter(
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
                SerializablePythonResult(
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
        val testFunction = SerializablePythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                SerializablePythonParameter(
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
                SerializablePythonResult(
                    "firstResult",
                    "float",
                    "float",
                    "description", mutableListOf()
                ),
                SerializablePythonResult(
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
        val testFunction = SerializablePythonFunction(
            "testFunction",
            "testModule.testFunction",
            listOf("testDecorator"),
            mutableListOf(
                SerializablePythonParameter(
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

    @Test
    fun `should convert names to camel case`() {
        // given
        val testClass = SerializablePythonClass(
            "Test_Class",
            "testModule.Test_Class",
            listOf(),
            listOf(),
            mutableListOf(
                SerializablePythonFunction(
                    "__init__",
                    "testModule.Test_Class.__init__",
                    listOf(),
                    mutableListOf(
                        SerializablePythonParameter(
                            "test_parameter",
                            "testModule.Test_Class.__init__.test_parameter",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "",
                            "",
                            mutableListOf()
                        )
                    ),
                    mutableListOf(),
                    true,
                    "",
                    "",
                    mutableListOf()
                ),
                SerializablePythonFunction(
                    "test_function",
                    "testModule.Test_Class.test_function",
                    listOf(),
                    mutableListOf(
                        SerializablePythonParameter(
                            "test_parameter",
                            "testModule.Test_Class.test_function.test_parameter",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "",
                            "",
                            mutableListOf()
                        )
                    ),
                    mutableListOf(),
                    true,
                    "",
                    "",
                    mutableListOf()
                ),
            ),
            true,
            "",
            "",
            mutableListOf()
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
