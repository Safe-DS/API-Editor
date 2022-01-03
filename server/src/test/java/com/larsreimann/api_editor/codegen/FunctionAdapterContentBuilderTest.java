package com.larsreimann.api_editor.codegen;

import com.larsreimann.api_editor.model.SerializablePythonFunction;
import com.larsreimann.api_editor.model.SerializablePythonParameter;
import com.larsreimann.api_editor.model.PythonParameterAssignment;
import com.larsreimann.api_editor.model.RenameAnnotation;
import com.larsreimann.api_editor.transformation.Postprocessor;
import com.larsreimann.api_editor.transformation.Preprocessor;
import com.larsreimann.api_editor.transformation.RenameAnnotationProcessor;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class FunctionAdapterContentBuilderTest {
    @Test
    void buildFunctionReturnsFormattedFunctionWithNoParameters() {
        // given
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
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

        testFunction = testFunction.accept(new Preprocessor());
        assert testFunction != null;
        testFunction = testFunction.accept(Postprocessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function():
                test-module.test-function()""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionOnlyParameter() {
        // given
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new SerializablePythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "13",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "float",
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

        testFunction = testFunction.accept(new Preprocessor());
        assert testFunction != null;
        testFunction = testFunction.accept(Postprocessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(*, only-param=13):
                test-module.test-function(only-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionOrNameParameter() {
        // given
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new SerializablePythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "False",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "bool",
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

        testFunction = testFunction.accept(new Preprocessor());
        assert testFunction != null;
        testFunction = testFunction.accept(Postprocessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(*, only-param=False):
                test-module.test-function(only-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithNameOnlyParameter() {
        // given
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new SerializablePythonParameter(
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

        testFunction = testFunction.accept(new Preprocessor());
        assert testFunction != null;
        testFunction = testFunction.accept(Postprocessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(only-param):
                test-module.test-function(only-param=only-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameParameter() {
        // given
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
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
                    Collections.emptyList()
                )
            ),
            Collections.emptyList(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            Collections.emptyList()
        );

        testFunction = testFunction.accept(new Preprocessor());
        assert testFunction != null;
        testFunction = testFunction.accept(Postprocessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, second-param):
                test-module.test-function(first-param, second-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameAndNameOnlyParameter() {
        // given
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
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
                    Collections.emptyList()
                ),
                new SerializablePythonParameter(
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

        testFunction = testFunction.accept(new Preprocessor());
        assert testFunction != null;
        testFunction = testFunction.accept(Postprocessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, second-param, third-param):
                test-module.test-function(first-param, second-param, third-param=third-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionAndNameOnlyParameter() {
        // given
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    Collections.emptyList()
                ),
                new SerializablePythonParameter(
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

        testFunction = testFunction.accept(new Preprocessor());
        assert testFunction != null;
        testFunction = testFunction.accept(Postprocessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, second-param):
                test-module.test-function(first-param, second-param=second-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }

    @Test
    void buildFunctionReturnsFormattedFunctionWithPositionOrNameAndNameOnlyParameter() {
        // given
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description",
                    Collections.emptyList()
                ),
                new SerializablePythonParameter(
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

        testFunction = testFunction.accept(new Preprocessor());
        assert testFunction != null;
        testFunction = testFunction.accept(Postprocessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, second-param):
                test-module.test-function(first-param, second-param=second-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }

    @Test
    void buildFunctionsReturnsFormattedFunctionBasedOnOriginalDeclaration() {
        // given
        SerializablePythonFunction testFunction = new SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            List.of("test-decorator"),
            List.of(
                new SerializablePythonParameter(
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

        testFunction = testFunction.accept(new Preprocessor());
        assert testFunction != null;
        testFunction = testFunction.accept(new RenameAnnotationProcessor());
        assert testFunction != null;
        testFunction = testFunction.accept(Postprocessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def newFunctionName(newFirstParamName, newSecondParamName, newThirdParamName):
                test-module.test-function(newFirstParamName, newSecondParamName, third-param=newThirdParamName)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }
}
