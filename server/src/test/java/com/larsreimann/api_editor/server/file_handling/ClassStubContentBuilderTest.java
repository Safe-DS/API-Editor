package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class ClassStubContentBuilderTest {
    @Test
    void buildClassReturnsFormattedClassWithNoConstructorAndFunctions() {
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

        // when
        ClassStubContentBuilder classStubContentBuilder =
            new ClassStubContentBuilder(testClass);
        String formattedClass = classStubContentBuilder.buildClass();

        // then
        String expectedFormattedClass = "open class test-class() {}";
        Assertions.assertEquals(expectedFormattedClass, formattedClass);
    }

    @Test
    void buildClassReturnsFormattedClassWithOneFunctionAndNoConstructor() {
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

        // when
        ClassStubContentBuilder classStubContentBuilder =
            new ClassStubContentBuilder(testClass);
        String formattedClass = classStubContentBuilder.buildClass();

        // then
        String expectedFormattedClass = """
            open class test-class() {
                fun test-class-function(only-param: Any? or "defaultValue")
            }""";
        Assertions.assertEquals(expectedFormattedClass, formattedClass);
    }

    @Test
    void buildClassReturnsFormattedClassWithConstructorAndOneFunction() {
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
                    "__init__",
                    "test-module.test-class.__init__",
                    List.of("decorators"),
                    List.of(new AnnotatedPythonParameter(
                        "only-param",
                        "test-module.test-class.__init__.only-param",
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

        // when
        ClassStubContentBuilder classStubContentBuilder =
            new ClassStubContentBuilder(testClass);
        String formattedClass = classStubContentBuilder.buildClass();

        // then
        String expectedFormattedClass = """
            open class test-class(only-param: Any?) {
                attr only-param: Any?

                fun test-class-function1(only-param: Any?)
            }""";
        Assertions.assertEquals(formattedClass, expectedFormattedClass);
    }
}
