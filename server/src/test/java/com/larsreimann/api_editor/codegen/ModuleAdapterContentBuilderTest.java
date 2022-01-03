package com.larsreimann.api_editor.codegen;

import com.larsreimann.api_editor.model.*;
import com.larsreimann.api_editor.transformation.OriginalDeclarationProcessor;
import com.larsreimann.api_editor.transformation.ParameterAnnotationProcessor;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class ModuleAdapterContentBuilderTest {
    @Test
    void buildModuleContentReturnsFormattedModuleContent() {
        // given
        SerializablePythonClass testClass = new SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            List.of("test-decorator"),
            List.of("test-superclass"),
            List.of(new SerializablePythonFunction(
                "test-class-function",
                "test-module.test-class.test-class-function",
                List.of("decorators"),
                List.of(
                    new SerializablePythonParameter(
                        "self",
                        "test-module.test-class.test-class-function.self",
                        null,
                        PythonParameterAssignment.IMPLICIT,
                        true,
                        "typeInDocs",
                        "description",
                        Collections.emptyList()
                    ),
                    new SerializablePythonParameter(
                        "only-param",
                        "test-module.test-class.test-class-function.only-param",
                        "'defaultValue'",
                        PythonParameterAssignment.POSITION_OR_NAME,
                        true,
                        "typeInDocs",
                        "description",
                        Collections.emptyList()
                    )
                ),
                Collections.emptyList(),
                true,
                "description",
                "fullDocstring",
                Collections.emptyList()
            )),
            true,
            "Lorem ipsum",
            "Lorem ipsum",
            Collections.emptyList()
        );

        SerializablePythonModule testModule = new SerializablePythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(
                testClass
            ),
            List.of(
                new SerializablePythonFunction(
                    "function_module",
                    "test-module.function_module",
                    List.of("test-decorator"),
                    List.of(
                        new SerializablePythonParameter(
                            "param1",
                            "test-module.function_module.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new SerializablePythonParameter(
                            "param2",
                            "test-module.function_module.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new SerializablePythonParameter(
                            "param3",
                            "test-module.function_module.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    List.of(
                        new SerializablePythonResult(
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
                new SerializablePythonFunction(
                    "test-function",
                    "test-module.test-function",
                    List.of("test-decorator"),
                    List.of(
                        new SerializablePythonParameter(
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
                        new SerializablePythonResult(
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
                def test-class-function(self, only-param='defaultValue'):
                    test-module.test-class.test-class-function(only-param)

            def function_module(*, param1, param2, param3):
                test-module.function_module(param1=param1, param2=param2, param3=param3)

            def test-function(*, test-parameter=42):
                test-module.test-function(test-parameter=test-parameter)
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithNoClassesReturnsFormattedModuleContent() {
        // given
        SerializablePythonModule testModule = new SerializablePythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(
                new SerializablePythonFunction(
                    "function_module",
                    "test-module.function_module",
                    List.of("test-decorator"),
                    List.of(
                        new SerializablePythonParameter(
                            "param1",
                            "test-module.function_module_1.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new SerializablePythonParameter(
                            "param2",
                            "test-module.function_module_1.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new SerializablePythonParameter(
                            "param3",
                            "test-module.function_module_1.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    List.of(
                        new SerializablePythonResult(
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
                new SerializablePythonFunction(
                    "test-function",
                    "test-module.test-function",
                    List.of("test-decorator"),
                    List.of(
                        new SerializablePythonParameter(
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
                        new SerializablePythonResult(
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

        // then
        String expectedModuleContent = """
            import test-module

            def function_module(*, param1, param2, param3):
                test-module.function_module(param1=param1, param2=param2, param3=param3)

            def test-function(*, test-parameter=42):
                test-module.test-function(test-parameter=test-parameter)
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithNoFunctionsReturnsFormattedModuleContent() {
        // given
        SerializablePythonClass testClass = new SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            List.of("test-decorator"),
            List.of("test-superclass"),
            Collections.emptyList(),
            true,
            "Lorem ipsum",
            "Lorem ipsum",
            Collections.emptyList()
        );

        SerializablePythonModule testModule = new SerializablePythonModule(
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
    void buildModuleContentWithEmptyModuleReturnsEmptyString() {
        // given
        SerializablePythonModule testModule = new SerializablePythonModule(
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
        String expectedModuleContent = "";

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithAttributeAnnotationsReturnsFormattedModuleContent() {
        // given
        SerializablePythonClass testClass = new SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            List.of("test-decorator"),
            List.of("test-superclass"),
            List.of(new SerializablePythonFunction(
                "__init__",
                "test-module.test-class.__init__",
                List.of("decorators"),
                List.of(
                    new SerializablePythonParameter(
                        "self",
                        "test-module.test-class.__init__.self",
                        null,
                        PythonParameterAssignment.IMPLICIT,
                        true,
                        "typeInDocs",
                        "description",
                        Collections.emptyList()
                    ),
                    new SerializablePythonParameter(
                        "only-param",
                        "test-module.test-class.__init__.only-param",
                        "'defaultValue'",
                        PythonParameterAssignment.POSITION_OR_NAME,
                        true,
                        "typeInDocs",
                        "description",
                        List.of(
                            new AttributeAnnotation(
                                new DefaultString(
                                    "newDefaultValue"
                                )
                            )
                        )
                    )
                ),
                Collections.emptyList(),
                true,
                "description",
                "fullDocstring",
                Collections.emptyList()
            )),
            true,
            "Lorem ipsum",
            "Lorem ipsum",
            Collections.emptyList()
        );

        SerializablePythonModule testModule = new SerializablePythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(
                testClass
            ),
            Collections.emptyList(),
            Collections.emptyList()
        );
        testModule.accept(OriginalDeclarationProcessor.INSTANCE);
        testModule = testModule.accept(new ParameterAnnotationProcessor());

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        //then
        String expectedModuleContent = """
            import test-module

            class test-class:
                def __init__(self):
                    test-module.test-class.__init__('newDefaultValue')
                    self.only-param = 'newDefaultValue'
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithConstantAnnotationReturnsFormattedModuleContent() {
        // given
        SerializablePythonModule testModule = new SerializablePythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(
                new SerializablePythonFunction(
                    "function_module",
                    "test-module.function_module",
                    List.of("test-decorator"),
                    List.of(
                        new SerializablePythonParameter(
                            "param1",
                            "test-module.function_module.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            List.of(
                                new ConstantAnnotation(
                                    new DefaultString(
                                        "newDefaultValue"
                                    )
                                )
                            )
                        ),
                        new SerializablePythonParameter(
                            "param2",
                            "test-module.function_module.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new SerializablePythonParameter(
                            "param3",
                            "test-module.function_module.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            List.of(
                                new ConstantAnnotation(
                                    new DefaultString(
                                        "newDefaultValue"
                                    )
                                )
                            )
                        )
                    ),
                    List.of(
                        new SerializablePythonResult(
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
        testModule = testModule.accept(new ParameterAnnotationProcessor());

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        // then
        String expectedModuleContent = """
            import test-module

            def function_module(param2):
                test-module.function_module(param1='newDefaultValue', param2=param2, param3='newDefaultValue')
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithOptionalAnnotationsReturnsFormattedModuleContent() {
        // given
        SerializablePythonModule testModule = new SerializablePythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(
                new SerializablePythonFunction(
                    "function_module",
                    "test-module.function_module",
                    List.of("test-decorator"),
                    List.of(
                        new SerializablePythonParameter(
                            "param1",
                            "test-module.function_module.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            List.of(
                                new OptionalAnnotation(
                                    new DefaultString(
                                        "newDefaultValue"
                                    )
                                )
                            )
                        ),
                        new SerializablePythonParameter(
                            "param2",
                            "test-module.function_module.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new SerializablePythonParameter(
                            "param3",
                            "test-module.function_module.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            List.of(
                                new OptionalAnnotation(
                                    new DefaultString(
                                        "newDefaultValue"
                                    )
                                )
                            )
                        )
                    ),
                    List.of(
                        new SerializablePythonResult(
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
        testModule = testModule.accept(new ParameterAnnotationProcessor());

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        // then
        String expectedModuleContent = """
            import test-module

            def function_module(param2, *, param1='newDefaultValue', param3='newDefaultValue'):
                test-module.function_module(param1=param1, param2=param2, param3=param3)
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithRequiredAnnotationReturnsFormattedModuleContent() {
        // given
        SerializablePythonModule testModule = new SerializablePythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(
                new SerializablePythonFunction(
                    "function_module",
                    "test-module.function_module",
                    List.of("test-decorator"),
                    List.of(
                        new SerializablePythonParameter(
                            "param1",
                            "test-module.function_module.param1",
                            "'defaultValue'",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            List.of(
                                RequiredAnnotation.INSTANCE
                            )
                        ),
                        new SerializablePythonParameter(
                            "param2",
                            "test-module.function_module.param2",
                            "'defaultValue'",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            Collections.emptyList()
                        ),
                        new SerializablePythonParameter(
                            "param3",
                            "test-module.function_module.param3",
                            "'defaultValue'",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            List.of(
                                RequiredAnnotation.INSTANCE
                            )
                        )
                    ),
                    List.of(
                        new SerializablePythonResult(
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
        testModule = testModule.accept(new ParameterAnnotationProcessor());

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        // then
        String expectedModuleContent = """
            import test-module

            def function_module(param1, param3, *, param2='defaultValue'):
                test-module.function_module(param1=param1, param2=param2, param3=param3)
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithMultipleParameterAnnotationReturnsFormattedModuleContent() {
        // given
        SerializablePythonModule testModule = new SerializablePythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(
                new SerializablePythonFunction(
                    "function_module",
                    "test-module.function_module",
                    List.of("test-decorator"),
                    List.of(
                        new SerializablePythonParameter(
                            "param1",
                            "test-module.function_module.param1",
                            "'defaultValue'",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            List.of(
                                RequiredAnnotation.INSTANCE
                            )
                        ),
                        new SerializablePythonParameter(
                            "param2",
                            "test-module.function_module.param2",
                            "'defaultValue'",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            List.of(
                                new ConstantAnnotation(
                                    new DefaultString("newDefaultValue")
                                )
                            )
                        ),
                        new SerializablePythonParameter(
                            "param3",
                            "test-module.function_module.param3",
                            "'defaultValue'",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                            List.of(
                                new OptionalAnnotation(
                                    new DefaultString("newDefaultValue")
                                )
                            )
                        )
                    ),
                    List.of(
                        new SerializablePythonResult(
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
        testModule = testModule.accept(new ParameterAnnotationProcessor());

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        // then
        String expectedModuleContent = """
            import test-module

            def function_module(param1, *, param3='newDefaultValue'):
                test-module.function_module(param1=param1, param2='newDefaultValue', param3=param3)
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }

    @Test
    void buildModuleContentWithBoundaryAnnotationReturnsFormattedModuleContent1() {
        // given
        SerializablePythonParameter testParameter1 =
            new SerializablePythonParameter(
                "param1",
                "test-module.function_module.param1",
                "5",
                PythonParameterAssignment.NAME_ONLY,
                true,
                "str",
                "Lorem ipsum",
                List.of()
            );
        testParameter1.setBoundary(
            new Boundary(
                true,
                2,
                ComparisonOperator.LESS_THAN,
                10,
                ComparisonOperator.LESS_THAN_OR_EQUALS
            )
        );
        SerializablePythonParameter testParameter2 =
            new SerializablePythonParameter(
                "param2",
                "test-module.function_module.param2",
                "5",
                PythonParameterAssignment.NAME_ONLY,
                true,
                "str",
                "Lorem ipsum",
                List.of()
            );
        testParameter2.setBoundary(
            new Boundary(
                false,
                5.0,
                ComparisonOperator.LESS_THAN_OR_EQUALS,
                0,
                ComparisonOperator.UNRESTRICTED
            )
        );
        SerializablePythonParameter testParameter3 =
            new SerializablePythonParameter(
                "param3",
                "test-module.function_module.param3",
                "5",
                PythonParameterAssignment.NAME_ONLY,
                true,
                "str",
                "Lorem ipsum",
                List.of()
            );
        testParameter3.setBoundary(
            new Boundary(
                false,
                0,
                ComparisonOperator.UNRESTRICTED,
                10.0,
                ComparisonOperator.LESS_THAN
            )
        );
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "function_module",
            "test-module.function_module",
            List.of("test-decorator"),
            List.of(testParameter1, testParameter2, testParameter3),
            List.of(),
            true,
            "Lorem ipsum",
            "Lorem ipsum",
            Collections.emptyList()
        );
        SerializablePythonModule testModule = new SerializablePythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(testFunction),
            Collections.emptyList()
        );

        testModule.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        // then
        String expectedModuleContent = """
            import test-module

            def function_module(*, param1=5, param2=5, param3=5):
                if not (isinstance(param1, int) or (isinstance(param1, float) and param1.is_integer())):
                    raise ValueError('param1 needs to be an integer, but {} was assigned.'.format(param1))
                if not 2.0 < param1 <= 10.0:
                    raise ValueError('Valid values of param1 must be in (2.0, 10.0], but {} was assigned.'.format(param1))
                if not 5.0 <= param2:
                    raise ValueError('Valid values of param2 must be greater than or equal to 5.0, but {} was assigned.'.format(param2))
                if not param3 < 10.0:
                    raise ValueError('Valid values of param3 must be less than 10.0, but {} was assigned.'.format(param3))
                test-module.function_module(param1=param1, param2=param2, param3=param3)
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }
    @Test
    void buildModuleContentWithBoundaryAnnotationReturnsFormattedModuleContent2() {
        // given
        SerializablePythonParameter testParameter =
            new SerializablePythonParameter(
                "param1",
                "test-module.function_module.param1",
                "5",
                PythonParameterAssignment.NAME_ONLY,
                true,
                "str",
                "Lorem ipsum",
                List.of()
            );
        testParameter.setBoundary(
            new Boundary(
                false,
                2,
                ComparisonOperator.LESS_THAN_OR_EQUALS,
                0,
                ComparisonOperator.UNRESTRICTED
            )
        );
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "function_module",
            "test-module.function_module",
            List.of("test-decorator"),
            List.of(testParameter),
            List.of(),
            true,
            "Lorem ipsum",
            "Lorem ipsum",
            Collections.emptyList()
        );
        SerializablePythonModule testModule = new SerializablePythonModule(
            "test-module",
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(testFunction),
            Collections.emptyList()
        );
        testModule.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(testModule);
        String moduleContent = moduleAdapterContentBuilder.buildModuleContent();

        // then
        String expectedModuleContent = """
            import test-module

            def function_module(*, param1=5):
                if not 2.0 <= param1:
                    raise ValueError('Valid values of param1 must be greater than or equal to 2.0, but {} was assigned.'.format(param1))
                test-module.function_module(param1=param1)
            """;

        Assertions.assertEquals(expectedModuleContent, moduleContent);
    }
}
