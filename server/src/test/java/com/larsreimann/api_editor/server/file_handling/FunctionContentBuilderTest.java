package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter;
import com.larsreimann.api_editor.server.data.PythonParameterAssignment;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class FunctionContentBuilderTest {
    @Test
    void buildFunctionReturnsFormattedFunctionWithNoParameters() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            Collections.emptyList(),
            Collections.emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        // when
        String formattedClass = FunctionContentBuilder.buildFunction(testFunction);

        // then
        String expectedFormattedFunction = """
            def test-function():
                test-module.test-function()""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionOnlyParameter() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    Collections.emptyList()
                )
            ),
            Collections.emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        // when
        String formattedClass = FunctionContentBuilder.buildFunction(testFunction);

        // then
        String expectedFormattedFunction = """
            def test-function(only-param, /):
                test-module.test-function(only-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionOrNameParameter() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
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
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        // when
        String formattedClass = FunctionContentBuilder.buildFunction(testFunction);

        // then
        String expectedFormattedFunction = """
            def test-function(only-param):
                test-module.test-function(only-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithNameOnlyParameter() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    Collections.emptyList()
                )
            ),
            Collections.emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        // when
        String formattedClass = FunctionContentBuilder.buildFunction(testFunction);

        // then
        String expectedFormattedFunction = """
            def test-function(*, only-param):
                test-module.test-function(only-param=only-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameParameter() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
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
                    Collections.emptyList()
                ),
                new AnnotatedPythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
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
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        // when
        String formattedClass = FunctionContentBuilder.buildFunction(testFunction);

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, /, second-param):
                test-module.test-function(first-param, second-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameAndNameOnlyParameter() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
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
                    Collections.emptyList()
                ),
                new AnnotatedPythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description",
                    Collections.emptyList()
                ),
                new AnnotatedPythonParameter(
                    "third-param",
                    "test-module.test-class.test-class-function.third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    Collections.emptyList()
                )
            ),
            Collections.emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        // when
        String formattedClass = FunctionContentBuilder.buildFunction(testFunction);

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, /, second-param, *, third-param):
                test-module.test-function(first-param, second-param, third-param=third-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionAndNameOnlyParameter() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
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
                    Collections.emptyList()
                ),
                new AnnotatedPythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    Collections.emptyList()
                )
            ),
            Collections.emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        // when
        String formattedClass = FunctionContentBuilder.buildFunction(testFunction);

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, /, *, second-param):
                test-module.test-function(first-param, second-param=second-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionOrNameAndNameOnlyParameter() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new AnnotatedPythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description",
                    Collections.emptyList()
                ),
                new AnnotatedPythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    Collections.emptyList()
                )
            ),
            Collections.emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        // when
        String formattedClass = FunctionContentBuilder.buildFunction(testFunction);

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, *, second-param):
                test-module.test-function(first-param, second-param=second-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }
}
