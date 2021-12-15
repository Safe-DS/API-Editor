package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.annotationProcessing.OriginalDeclarationProcessor;
import com.larsreimann.api_editor.server.annotationProcessing.RenameAnnotationProcessor;
import com.larsreimann.api_editor.server.data.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class ClassAdapterContentBuilderTest {
    @Test
    void buildClassReturnsFormattedClassWithNoFunctions() {
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
                    "str",
                    "description",
                    List.of(new AttributeAnnotation(
                        new DefaultString("test")
                    ))
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
        testClass.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        ClassAdapterContentBuilder classAdapterContentBuilder =
            new ClassAdapterContentBuilder(testClass);
        String formattedClass = classAdapterContentBuilder.buildClass();

        // then
        String expectedFormattedClass = """
            class test-class:
                def test-class-function(only-param='defaultValue'):
                    test-module.test-class.test-class-function(only-param)""";
        Assertions.assertEquals(expectedFormattedClass, formattedClass);
    }

    @Test
    void buildClassReturnsFormattedClassWithTwoFunctions() {
        // given
        AnnotatedPythonClass testClass = new AnnotatedPythonClass(
            "test-class",
            "test-module.test-class",
            List.of("test-decorator"),
            List.of("test-superclass"),
            List.of(
                new AnnotatedPythonFunction(
                    "test-class-function1",
                    "test-module.test-class.test-class-function1",
                    List.of("decorators"),
                    List.of(new AnnotatedPythonParameter(
                        "only-param",
                        "test-module.test-class.test-class-function.only-param",
                        null,
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
                ),
                new AnnotatedPythonFunction(
                    "test-class-function2",
                    "test-module.test-class.test-class-function2",
                    List.of("decorators"),
                    List.of(new AnnotatedPythonParameter(
                        "only-param",
                        "test-module.test-class.test-class-function.only-param",
                        null,
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
                )
            ),
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
                def test-class-function1(only-param):
                    test-module.test-class.test-class-function1(only-param)

                def test-class-function2(only-param):
                    test-module.test-class.test-class-function2(only-param)""";
        Assertions.assertEquals(expectedFormattedClass, formattedClass);
    }

    @Test
    void buildClassReturnsFormattedClassBasedOnOriginalDeclaration() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-class.test-function",
            List.of("test-decorator"),
            List.of(
                new AnnotatedPythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    List.of(
                        new RenameAnnotation("newFirstParamName")
                    )
                ),
                new AnnotatedPythonParameter(
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
                new AnnotatedPythonParameter(
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

        AnnotatedPythonClass testClass = new AnnotatedPythonClass(
            "test-class",
            "test-module.test-class",
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(testFunction),
            "",
            "",
            List.of(
                new RenameAnnotation("newClassName")
            )
        );

        testClass.accept(OriginalDeclarationProcessor.INSTANCE);
        RenameAnnotationProcessor renameAnnotationProcessor =
            new RenameAnnotationProcessor();
        testClass.accept(renameAnnotationProcessor);
        testClass = renameAnnotationProcessor.getCurrentClass();

        // when
        ClassAdapterContentBuilder classAdapterContentBuilder =
            new ClassAdapterContentBuilder(testClass);
        String formattedClass = classAdapterContentBuilder.buildClass();

        // then
        String expectedFormattedClass = """
            class newClassName:
                def newFunctionName(newFirstParamName, /, newSecondParamName, *, newThirdParamName):
                    test-module.test-class.test-function(newFirstParamName, newSecondParamName, third-param=newThirdParamName)""";
        Assertions.assertEquals(expectedFormattedClass, formattedClass);
    }
}
