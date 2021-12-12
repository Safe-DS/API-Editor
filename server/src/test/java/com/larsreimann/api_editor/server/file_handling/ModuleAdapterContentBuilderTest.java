package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.annotationProcessing.OriginalDeclarationProcessor;
import com.larsreimann.api_editor.server.data.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class ModuleAdapterContentBuilderTest {
    @Test
    void buildModuleContentReturnsFormattedModuleContent() {
        // given
        AnnotatedPythonClass testClass = new AnnotatedPythonClass(
            "test-class",
            "test-module.test-class",
            List.of("test-decorator"),
            List.of("test-superclass"),
            List.of(new AnnotatedPythonFunction(
                "test-class-function",
                "test-module.test-class.test-class-function",
                List.of("decorators"),
                List.of(new AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "'defaultValue'",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description",
                    Collections.emptyList()
                )),
                Collections.emptyList(),
                true,
                "description",
                "fullDocstring",
                Collections.emptyList()
            )),
            "Lorem ipsum",
            "Lorem ipsum",
            Collections.emptyList()
        );

        AnnotatedPythonModule testModule = new AnnotatedPythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(
                testClass
            ),
            List.of(
                new AnnotatedPythonFunction(
                    "function_module_1",
                    "test.module_1.function_module_1",
                    List.of("test-decorator"),
                    List.of(
                        new AnnotatedPythonParameter(
                            "param1",
                            "test.module_1.function_module_1.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new AnnotatedPythonParameter(
                            "param2",
                            "test.module_1.function_module_1.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new AnnotatedPythonParameter(
                            "param3",
                            "test.module_1.function_module_1.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    List.of(
                        new AnnotatedPythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum",
                    Collections.emptyList()
                ),
                new AnnotatedPythonFunction(
                    "test-function",
                    "test-module.test-function",
                    List.of("test-decorator"),
                    List.of(
                        new AnnotatedPythonParameter(
                            "test-parameter",
                            "test-module.test-function.test-parameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    List.of(
                        new AnnotatedPythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum",
                    Collections.emptyList()
                )
            ),
            Collections.emptyList()
        );
        testModule.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        //then
        String expectedModuleContent = """
            import test-module

            class test-class:
                def test-class-function(only-param='defaultValue'):
                    test-module.test-class.test-class-function(only-param)

            def function_module_1(*, param1, param2, param3):
                test.module_1.function_module_1(param1=param1, param2=param2, param3=param3)

            def test-function(*, test-parameter=42):
                test-module.test-function(test-parameter=test-parameter)
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithNoClassesReturnsFormattedModuleContent() {
        // given
        AnnotatedPythonModule testModule = new AnnotatedPythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(
                new AnnotatedPythonFunction(
                    "function_module_1",
                    "test.module_1.function_module_1",
                    List.of("test-decorator"),
                    List.of(
                        new AnnotatedPythonParameter(
                            "param1",
                            "test.module_1.function_module_1.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new AnnotatedPythonParameter(
                            "param2",
                            "test.module_1.function_module_1.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new AnnotatedPythonParameter(
                            "param3",
                            "test.module_1.function_module_1.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    List.of(
                        new AnnotatedPythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum",
                    Collections.emptyList()
                ),
                new AnnotatedPythonFunction(
                    "test-function",
                    "test-module.test-function",
                    List.of("test-decorator"),
                    List.of(
                        new AnnotatedPythonParameter(
                            "test-parameter",
                            "test-module.test-function.test-parameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    List.of(
                        new AnnotatedPythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum",
                    Collections.emptyList()
                )
            ),
            Collections.emptyList()
        );
        testModule.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        //then
        String expectedModuleContent = """
            import test-module

            def function_module_1(*, param1, param2, param3):
                test.module_1.function_module_1(param1=param1, param2=param2, param3=param3)

            def test-function(*, test-parameter=42):
                test-module.test-function(test-parameter=test-parameter)
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithNoFunctionsReturnsFormattedModuleContent() {
        // given
        AnnotatedPythonClass testClass = new AnnotatedPythonClass(
            "test-class",
            "test-module.test-class",
            List.of("test-decorator"),
            List.of("test-superclass"),
            Collections.emptyList(),
            "Lorem ipsum",
            "Lorem ipsum",
            Collections.emptyList()
        );

        AnnotatedPythonModule testModule = new AnnotatedPythonModule(
            "test-module",
            List.of(
                new PythonImport(
                    "test-import1",
                    "test-alias"
                )
            ),
            List.of(
                new PythonFromImport(
                    "test-from-import1",
                    "test-declaration1",
                    null
                )
            ),
            List.of(
                testClass
            ),
            Collections.emptyList(),
            Collections.emptyList()
        );
        testModule.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        //then
        String expectedModuleContent = """
            import test-module

            class test-class:
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithNoFunctionsAndClassesReturnsFormattedModuleContent() {
        // given
        AnnotatedPythonModule testModule = new AnnotatedPythonModule(
            "test-module",
            List.of(
                new PythonImport(
                    "test-import1",
                    "test-alias"
                )
            ),
            List.of(
                new PythonFromImport(
                    "test-from-import1",
                    "test-declaration1",
                    null
                )
            ),
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList()
        );
        testModule.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        //then
        String expectedModuleContent = """
            import test-module
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }
}
