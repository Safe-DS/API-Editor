package com.larsreimann.api_editor.codegen;

import com.larsreimann.api_editor.codegen.FunctionAdapterContentBuilder;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonParameter;
import com.larsreimann.api_editor.model.PythonParameterAssignment;
import com.larsreimann.api_editor.model.RenameAnnotation;
import com.larsreimann.api_editor.transformation.OriginalDeclarationProcessor;
import com.larsreimann.api_editor.transformation.RenameAnnotationProcessor;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class FunctionAdapterContentBuilderTest {
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
        testFunction.accept(OriginalDeclarationProcessor.INSTANCE);

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
        testFunction.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(only-param=13, /):
                test-module.test-function(only-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
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
        testFunction.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(only-param=False):
                test-module.test-function(only-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
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
        testFunction.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(*, only-param):
                test-module.test-function(only-param=only-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
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
        testFunction.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, /, second-param):
                test-module.test-function(first-param, second-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
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
        testFunction.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, /, second-param, *, third-param):
                test-module.test-function(first-param, second-param, third-param=third-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
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
        testFunction.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, /, *, second-param):
                test-module.test-function(first-param, second-param=second-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
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
        testFunction.accept(OriginalDeclarationProcessor.INSTANCE);

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def test-function(first-param, *, second-param):
                test-module.test-function(first-param, second-param=second-param)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }

    @Test
    void buildFunctionsReturnsFormattedFunctionBasedOnOriginalDeclaration() {
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
        testFunction.accept(OriginalDeclarationProcessor.INSTANCE);
        RenameAnnotationProcessor renameAnnotationProcessor =
            new RenameAnnotationProcessor();
        testFunction.accept(renameAnnotationProcessor);
        testFunction = renameAnnotationProcessor.getCurrentFunction();

        // when
        FunctionAdapterContentBuilder functionAdapterContentBuilder =
            new FunctionAdapterContentBuilder(testFunction);
        String formattedFunction = functionAdapterContentBuilder.buildFunction();

        // then
        String expectedFormattedFunction = """
            def newFunctionName(newFirstParamName, /, newSecondParamName, *, newThirdParamName):
                test-module.test-function(newFirstParamName, newSecondParamName, third-param=newThirdParamName)""";
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction);
    }
}
