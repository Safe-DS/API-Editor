package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import de.unibonn.simpleml.SimpleMLStandaloneSetup
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

internal class CompilationUnitStubContentBuilderTest {

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
}
