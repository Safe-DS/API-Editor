package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonModule
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

internal class ModuleStubContentBuilderTest {
    @Test
    fun buildModuleContentReturnsFormattedModuleContent() {
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
                            "typeInDocs",
                            "description",
                            mutableListOf()
                        )
                    ), emptyList(),
                    true,
                    "description",
                    "fullDocstring",
                    mutableListOf()
                ),
                AnnotatedPythonFunction(
                    "__init__",
                    "test-module.test-class.__init__",
                    listOf("decorators"),
                    listOf(
                        AnnotatedPythonParameter(
                            "only-param",
                            "test-module.test-class.__init__.only-param",
                            "'defaultValue'",
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
        val testModule = AnnotatedPythonModule(
            "test-module", emptyList(), emptyList(),
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
                            "test-result",
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
                    "test-function",
                    "test-module.test-function",
                    listOf("test-decorator"),
                    listOf(
                        AnnotatedPythonParameter(
                            "test-parameter",
                            "test-module.test-function.test-parameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    listOf(
                        AnnotatedPythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum", mutableListOf()
                )
            ), mutableListOf()
        )

        // when
        val moduleStubContentBuilder = ModuleStubContentBuilder(testModule)
        val moduleContent = moduleStubContentBuilder.buildModuleContent()

        //then
        val expectedModuleContent: String = """
            |package simpleml.test-module
            |
            |class test-class(only-param: Any? or "defaultValue") {
            |    attr only-param: Any?
            |
            |    fun test-class-function(only-param: Any? or "defaultValue")
            |}
            |
            |fun function_module_1(param1: Any?, param2: Any?, param3: Any?) -> test-result: str
            |
            |fun test-function(test-parameter: Any? or 42) -> test-result: str
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithNoClassesReturnsFormattedModuleContent() {
        // given
        val testModule = AnnotatedPythonModule(
            "test-module", emptyList(), emptyList(), emptyList(),
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
                            "test-result",
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
                    "test-function",
                    "test-module.test-function",
                    listOf("test-decorator"),
                    listOf(
                        AnnotatedPythonParameter(
                            "test-parameter",
                            "test-module.test-function.test-parameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    listOf(
                        AnnotatedPythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum", mutableListOf()
                )
            ), mutableListOf()
        )

        // when
        val moduleStubContentBuilder = ModuleStubContentBuilder(testModule)
        val moduleContent = moduleStubContentBuilder.buildModuleContent()

        //then
        val expectedModuleContent: String = """
            |package simpleml.test-module
            |
            |fun function_module_1(param1: Any?, param2: Any?, param3: Any?) -> test-result: str
            |
            |fun test-function(test-parameter: Any? or 42) -> test-result: str
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithOnlyConstructorReturnsFormattedModuleContent() {
        // given
        val testClass = AnnotatedPythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"),
            listOf(
                AnnotatedPythonFunction(
                    "__init__",
                    "test-module.test-class.__init__",
                    listOf("decorators"),
                    listOf(
                        AnnotatedPythonParameter(
                            "only-param",
                            "test-module.test-class.__init__.only-param",
                            "'defaultValue'",
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
        val testModule = AnnotatedPythonModule(
            "test-module",
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
            ), emptyList(), mutableListOf()
        )

        // when
        val moduleStubContentBuilder = ModuleStubContentBuilder(testModule)
        val moduleContent = moduleStubContentBuilder.buildModuleContent()

        //then
        val expectedModuleContent: String = """
            |package simpleml.test-module
            |
            |class test-class(only-param: Any? or "defaultValue") {
            |    attr only-param: Any?
            |}
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithNoFunctionsAndClassesReturnsFormattedModuleContent() {
        // given
        val testModule = AnnotatedPythonModule(
            "test-module", emptyList(), emptyList(), emptyList(), emptyList(), mutableListOf()
        )

        // when
        val moduleStubContentBuilder = ModuleStubContentBuilder(testModule)
        val moduleContent = moduleStubContentBuilder.buildModuleContent()

        //then
        val expectedModuleContent: String = """
            |package simpleml.test-module
            |""".trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }
}
