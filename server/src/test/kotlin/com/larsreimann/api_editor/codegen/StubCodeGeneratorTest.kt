package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonAttribute
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.MutablePythonResult
import de.unibonn.simpleml.SimpleMLStandaloneSetup
import de.unibonn.simpleml.stdlib.uniqueAnnotationUseOrNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import org.eclipse.xtext.naming.QualifiedName
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

// TODO: test creation of Description annotations
// TODO: test creation of PythonName annotations
// TODO: test conversion of values
// TODO: test conversion of types

class StubCodeGeneratorTest {

    @BeforeEach
    fun initSimpleML() {
        SimpleMLStandaloneSetup.doSetup()
    }

    @Test
    fun buildModuleContentReturnsFormattedModuleContent() {
        // given
        val testClass = MutablePythonClass(
            name = "TestClass",
            attributes = mutableListOf(
                MutablePythonAttribute(
                    "onlyParam",
                    "'defaultValue'",
                )
            ),
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "testClassFunction",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT,
                        ),
                        MutablePythonParameter(
                            "onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "__init__",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "self",
                            "'defaultValue'",
                            PythonParameterAssignment.IMPLICIT,
                        ),
                        MutablePythonParameter(
                            "onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
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
                            "str",
                        ),
                        MutablePythonParameter(
                            "param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            "str",
                        ),
                        MutablePythonParameter(
                            "param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            "str",
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "testResult",
                            "str",
                            "str",
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
                            "int",
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "testResult",
                            "str",
                            "str",
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
            |class TestClass(onlyParam: Any? or "defaultValue") {
            |    attr onlyParam: Any?
            |
            |    fun testClassFunction(onlyParam: Any? or "defaultValue")
            |}
            |
            |fun functionModule1(param1: String, param2: String, param3: String) -> testResult: String
            |
            |fun testFunction(testParameter: Int or 42) -> testResult: String
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
                            "str",
                            "Lorem ipsum"
                        ),
                        MutablePythonParameter(
                            "param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            "str",
                            "Lorem ipsum"
                        ),
                        MutablePythonParameter(
                            "param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
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
            |fun functionModule1(@Description("Lorem ipsum") param1: String, @Description("Lorem ipsum") param2: String, @Description("Lorem ipsum") param3: String) -> @Description("Lorem ipsum") testResult: String
            |
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
            |class TestClass(@Description("description") onlyParam: Any? or "defaultValue")
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
            |class TestClass() {
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
            |class TestClass(@Description("description") onlyParam: Any?) {
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
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "secondParam",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "thirdParam",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    "typeInDocs",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
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
                    "string",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |fun testFunction(@Description("description") onlyParam: Any? or "###invalid###'13'x###")""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun `should mark pure functions with annotation`() {
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            isPure = true
        )

        testFunction
            .toSimpleMLStub()
            .uniqueAnnotationUseOrNull(QualifiedName.create("Pure"))
            .shouldNotBeNull()
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
                            PythonParameterAssignment.POSITION_OR_NAME
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "test_function",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "test_parameter",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME
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
            |    @PythonName("test_function")
            |    fun testFunction(@PythonName("test_parameter") testParameter: Any?)
            |}""".trimMargin()

        formattedClass shouldBe expectedFormattedClass
    }
}
