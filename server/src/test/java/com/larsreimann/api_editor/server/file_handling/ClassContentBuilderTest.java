package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class ClassContentBuilderTest {
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

        // when
        String formattedClass = ClassContentBuilder.buildClass(testClass);

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
                    "defaultValue",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
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
        String formattedClass = ClassContentBuilder.buildClass(testClass);

        // then
        String expectedFormattedClass = """
            class test-class:
                def test-class-function(only-param):
                    test-module.test-class.test-class-function(only-param)""";
        Assertions.assertEquals(formattedClass, expectedFormattedClass);
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

        // when
        String formattedClass = ClassContentBuilder.buildClass(testClass);

        // then
        String expectedFormattedClass = """
            class test-class:
                def test-class-function1(only-param):
                    test-module.test-class.test-class-function1(only-param)

                def test-class-function2(only-param):
                    test-module.test-class.test-class-function2(only-param)""";
        Assertions.assertEquals(formattedClass, expectedFormattedClass);
    }
}
