package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonModule
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import de.unibonn.simpleml.SimpleMLStandaloneSetup
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

internal class ModuleStubContentBuilderTest {

    @BeforeEach
    fun initSimpleML() {
        SimpleMLStandaloneSetup.doSetup()
    }

    @Test
    fun buildModuleContentReturnsFormattedModuleContent() {
        // given
        val testClass = AnnotatedPythonClass(
            "testClass",
            "testModule.testClass",
            listOf("test-decorator"),
            listOf("test-superclass"),
            listOf(
                AnnotatedPythonFunction(
                    "testClassFunction",
                    "testModule.testClass.testClassFunction",
                    listOf("decorators"),
                    listOf(
                        AnnotatedPythonParameter(
                            "onlyParam",
                            "testModule.testClass.testClassFunction.onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description",
                            mutableListOf()
                        )
                    ),
                    emptyList(),
                    true,
                    "description",
                    "fullDocstring",
                    mutableListOf()
                ),
                AnnotatedPythonFunction(
                    "__init__",
                    "testModule.testClass.__init__",
                    listOf("decorators"),
                    listOf(
                        AnnotatedPythonParameter(
                            "onlyParam",
                            "testModule.testClass.__init__.onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ),
                    emptyList(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                )
            ),
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )
        val testModule = AnnotatedPythonModule(
            "testModule", emptyList(), emptyList(),
            listOf(
                testClass
            ),
            listOf(
                AnnotatedPythonFunction(
                    "function_module_1",
                    "test.module_1.function_module_1",
                    listOf("test-decorator"),
                    listOf(
                        AnnotatedPythonParameter(
                            "param1",
                            "test.module_1.function_module_1.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        AnnotatedPythonParameter(
                            "param2",
                            "test.module_1.function_module_1.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        AnnotatedPythonParameter(
                            "param3",
                            "test.module_1.function_module_1.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    listOf(
                        AnnotatedPythonResult(
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
                AnnotatedPythonFunction(
                    "testFunction",
                    "testModule.testFunction",
                    listOf("test-decorator"),
                    listOf(
                        AnnotatedPythonParameter(
                            "testParameter",
                            "testModule.testFunction.testParameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    listOf(
                        AnnotatedPythonResult(
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
        val moduleStubContentBuilder = ModuleStubContentBuilder(testModule)
        val moduleContent = moduleStubContentBuilder.buildModuleContent()

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |
            |class testClass(onlyParam: Any? or "defaultValue") {
            |    attr onlyParam: Any?
            |
            |    fun testClassFunction(onlyParam: Any? or "defaultValue")
            |}
            |
            |fun function_module_1(param1: String, param2: String, param3: String) -> testResult: String
            |
            |fun testFunction(testParameter: Int or 42) -> testResult: String
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithNoClassesReturnsFormattedModuleContent() {
        // given
        val testModule = AnnotatedPythonModule(
            "testModule", emptyList(), emptyList(), emptyList(),
            listOf(
                AnnotatedPythonFunction(
                    "function_module_1",
                    "test.module_1.function_module_1",
                    listOf("test-decorator"),
                    listOf(
                        AnnotatedPythonParameter(
                            "param1",
                            "test.module_1.function_module_1.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        AnnotatedPythonParameter(
                            "param2",
                            "test.module_1.function_module_1.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        AnnotatedPythonParameter(
                            "param3",
                            "test.module_1.function_module_1.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    listOf(
                        AnnotatedPythonResult(
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
                AnnotatedPythonFunction(
                    "testFunction",
                    "testModule.testFunction",
                    listOf("test-decorator"),
                    listOf(
                        AnnotatedPythonParameter(
                            "testParameter",
                            "testModule.testFunction.testParameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    listOf(
                        AnnotatedPythonResult(
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
        val moduleStubContentBuilder = ModuleStubContentBuilder(testModule)
        val moduleContent = moduleStubContentBuilder.buildModuleContent()

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |
            |fun function_module_1(param1: String, param2: String, param3: String) -> testResult: String
            |
            |fun testFunction(testParameter: Int or 42) -> testResult: String
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithOnlyConstructorReturnsFormattedModuleContent() {
        // given
        val testClass = AnnotatedPythonClass(
            "testClass",
            "testModule.testClass",
            listOf("test-decorator"),
            listOf("test-superclass"),
            listOf(
                AnnotatedPythonFunction(
                    "__init__",
                    "testModule.testClass.__init__",
                    listOf("decorators"),
                    listOf(
                        AnnotatedPythonParameter(
                            "onlyParam",
                            "testModule.testClass.__init__.onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ),
                    emptyList(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                )
            ),
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )
        val testModule = AnnotatedPythonModule(
            "testModule",
            listOf(
                PythonImport(
                    "test-import1",
                    "test-alias"
                )
            ),
            listOf(
                PythonFromImport(
                    "test-from-import1",
                    "test-declaration1",
                    null
                )
            ),
            listOf(
                testClass
            ),
            emptyList(), mutableListOf()
        )

        // when
        val moduleStubContentBuilder = ModuleStubContentBuilder(testModule)
        val moduleContent = moduleStubContentBuilder.buildModuleContent()

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |
            |class testClass(onlyParam: Any? or "defaultValue") {
            |    attr onlyParam: Any?
            |}
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithNoFunctionsAndClassesReturnsFormattedModuleContent() {
        // given
        val testModule = AnnotatedPythonModule(
            "testModule", emptyList(), emptyList(), emptyList(), emptyList(), mutableListOf()
        )

        // when
        val moduleStubContentBuilder = ModuleStubContentBuilder(testModule)
        val moduleContent = moduleStubContentBuilder.buildModuleContent()

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }
}
