package com.larsreimann.api_editor.codegen;

import com.larsreimann.api_editor.model.*;
import com.larsreimann.api_editor.transformation.OriginalDeclarationProcessor;
import com.larsreimann.api_editor.transformation.RenameAnnotationProcessor;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class ClassAdapterContentBuilderTest {
    @Test
    void buildClassReturnsFormattedClassWithNoFunctions() {
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
        testClass.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        ClassAdapterContentBuilder classAdapterContentBuilder =
            new ClassAdapterContentBuilder(testClass);
        String formattedClass = classAdapterContentBuilder.buildClass();

        // then
        String expectedFormattedClass = "class test-class:";
        Assertions.assertEquals(expectedFormattedClass, formattedClass);
    }

    @Test
    void buildClassReturnsFormattedClassWithOneFunction() {
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
                        "str",
                        "description",
                        List.of()
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
        testClass.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        ClassAdapterContentBuilder classAdapterContentBuilder =
            new ClassAdapterContentBuilder(testClass);
        String formattedClass = classAdapterContentBuilder.buildClass();

        // then
        String expectedFormattedClass = """
            class test-class:
                def __init__(self, only-param='defaultValue'):
                    test-module.test-class.__init__(only-param)""";
        Assertions.assertEquals(expectedFormattedClass, formattedClass);
    }

    @Test
    void buildClassReturnsFormattedClassWithTwoFunctions() {
        // given
        SerializablePythonClass testClass = new SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            List.of("test-decorator"),
            List.of("test-superclass"),
            List.of(
                new SerializablePythonFunction(
                    "test-class-function1",
                    "test-module.test-class.test-class-function1",
                    List.of("decorators"),
                    List.of(
                        new SerializablePythonParameter(
                            "self",
                            "test-module.test-class.test-class-function1.self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description",
                            Collections.emptyList()
                        ),
                        new SerializablePythonParameter(
                            "only-param",
                            "test-module.test-class.test-class-function1.only-param",
                            null,
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
                ),
                new SerializablePythonFunction(
                    "test-class-function2",
                    "test-module.test-class.test-class-function2",
                    List.of("decorators"),
                    List.of(
                        new SerializablePythonParameter(
                            "self",
                            "test-module.test-class.test-class-function2.self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description",
                            Collections.emptyList()
                        ),
                        new SerializablePythonParameter(
                            "only-param",
                            "test-module.test-class.test-class-function2.only-param",
                            null,
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
                )
            ),
            true,
            "Lorem ipsum",
            "Lorem ipsum",
            Collections.emptyList()
        );
        testClass.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        ClassAdapterContentBuilder classAdapterContentBuilder =
            new ClassAdapterContentBuilder(testClass);
        String formattedClass = classAdapterContentBuilder.buildClass();

        // then
        String expectedFormattedClass = """
            class test-class:
                def test-class-function1(self, only-param):
                    test-module.test-class.test-class-function1(only-param)

                def test-class-function2(self, only-param):
                    test-module.test-class.test-class-function2(only-param)""";
        Assertions.assertEquals(expectedFormattedClass, formattedClass);
    }

    @Test
    void buildClassReturnsFormattedClassBasedOnOriginalDeclaration() {
        // given
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "test-function",
            "test-module.test-class.test-function",
            List.of("test-decorator"),
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
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description",
                    List.of(
                        new RenameAnnotation("newSecondParamName")
                    )
                ),
                new SerializablePythonParameter(
                    "third-param",
                    "test-module.test-class.test-class-function.third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    List.of(
                        new RenameAnnotation("newThirdParamName")
                    )
                )
            ),
            Collections.emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            List.of(
                new RenameAnnotation("newFunctionName")
            )
        );

        SerializablePythonClass testClass = new SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(testFunction),
            true,
            "",
            "",
            List.of(
                new RenameAnnotation("newClassName")
            )
        );

        testClass.accept(OriginalDeclarationProcessor.INSTANCE);
        RenameAnnotationProcessor renameAnnotationProcessor =
            new RenameAnnotationProcessor();
        testClass = testClass.accept(renameAnnotationProcessor);

        // when
        ClassAdapterContentBuilder classAdapterContentBuilder =
            new ClassAdapterContentBuilder(testClass);
        String formattedClass = classAdapterContentBuilder.buildClass();

        // then
        String expectedFormattedClass = """
            class newClassName:
                def newFunctionName(self, newSecondParamName, *, newThirdParamName):
                    test-module.test-class.test-function(newSecondParamName, third-param=newThirdParamName)""";
        Assertions.assertEquals(expectedFormattedClass, formattedClass);
    }
}
