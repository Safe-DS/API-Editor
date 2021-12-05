package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter;
import com.larsreimann.api_editor.server.data.AnnotatedPythonResult;
import com.larsreimann.api_editor.server.data.PythonParameterAssignment;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class FunctionStubContentBuilderTest {
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
        FunctionStubContentBuilder functionStubContentBuilder =
            new FunctionStubContentBuilder(testFunction);
        String formattedClass = functionStubContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            fun test-function()""";
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
                    "13",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "int",
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
        FunctionStubContentBuilder functionStubContentBuilder =
            new FunctionStubContentBuilder(testFunction);
        String formattedClass = functionStubContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            fun test-function(only-param: Any? or 13)""";
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
                    "'Test'",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "string",
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
        FunctionStubContentBuilder functionStubContentBuilder =
            new FunctionStubContentBuilder(testFunction);
        String formattedClass = functionStubContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            fun test-function(only-param: Any? or "Test")""";
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
        FunctionStubContentBuilder functionStubContentBuilder =
            new FunctionStubContentBuilder(testFunction);
        String formattedClass = functionStubContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            fun test-function(first-param: Any?, second-param: Any?, third-param: Any?)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithOneResult() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "1.31e+1",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "float",
                    "description",
                    Collections.emptyList()
                )
            ),
            List.of(
                new AnnotatedPythonResult(
                    "firstResult",
                    "float",
                    "float",
                    "description",
                    Collections.emptyList()
                )
            ),
            true,
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        // when
        FunctionStubContentBuilder functionStubContentBuilder =
            new FunctionStubContentBuilder(testFunction);
        String formattedClass = functionStubContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            fun test-function(only-param: Any? or 13.1) -> firstResult: float""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithMultipleResults() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "True",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "bool",
                    "description",
                    Collections.emptyList()
                )
            ),
            List.of(
                new AnnotatedPythonResult(
                    "firstResult",
                    "float",
                    "float",
                    "description",
                    Collections.emptyList()
                ),
                new AnnotatedPythonResult(
                    "secondResult",
                    "float",
                    "float",
                    "description",
                    Collections.emptyList()
                )
            ),
            true,
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        // when
        FunctionStubContentBuilder functionStubContentBuilder =
            new FunctionStubContentBuilder(testFunction);
        String formattedClass = functionStubContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            fun test-function(only-param: Any? or true) -> [firstResult: float, secondResult: float]""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithInvalidDefaultValue() {
        // given
        AnnotatedPythonFunction testFunction = new AnnotatedPythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new AnnotatedPythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "'13'x",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "string",
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
        FunctionStubContentBuilder functionStubContentBuilder =
            new FunctionStubContentBuilder(testFunction);
        String formattedClass = functionStubContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            fun test-function(only-param: Any? or "###invalid###'13'x###")""";
        Assertions.assertEquals(expectedFormattedFunction, formattedClass);
    }
}
