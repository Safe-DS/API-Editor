package com.larsreimann.apiEditor.validation

import com.larsreimann.apiEditor.model.AnnotationTarget
import com.larsreimann.apiEditor.model.BoundaryAnnotation
import com.larsreimann.apiEditor.model.CalledAfterAnnotation
import com.larsreimann.apiEditor.model.ComparisonOperator
import com.larsreimann.apiEditor.model.ConstantAnnotation
import com.larsreimann.apiEditor.model.DefaultString
import com.larsreimann.apiEditor.model.GroupAnnotation
import com.larsreimann.apiEditor.model.MoveAnnotation
import com.larsreimann.apiEditor.model.OptionalAnnotation
import com.larsreimann.apiEditor.model.PythonFromImport
import com.larsreimann.apiEditor.model.PythonImport
import com.larsreimann.apiEditor.model.PythonParameterAssignment
import com.larsreimann.apiEditor.model.RenameAnnotation
import com.larsreimann.apiEditor.model.RequiredAnnotation
import com.larsreimann.apiEditor.model.SerializablePythonClass
import com.larsreimann.apiEditor.model.SerializablePythonFunction
import com.larsreimann.apiEditor.model.SerializablePythonModule
import com.larsreimann.apiEditor.model.SerializablePythonPackage
import com.larsreimann.apiEditor.model.SerializablePythonParameter
import com.larsreimann.apiEditor.model.SerializablePythonResult
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import org.junit.jupiter.api.Test

// TODO: update

internal class AnnotationValidatorTest {
    @Test
    fun returnAnnotationTargetErrorsForIncorrectlyPlacedOptionalAnnotations() {
        // given
        val testPythonPackage = SerializablePythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            mutableListOf(
                SerializablePythonModule(
                    "test-module",
                    listOf(
                        PythonImport(
                            "test-import",
                            "test-alias",
                        ),
                    ),
                    listOf(
                        PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null,
                        ),
                    ),
                    mutableListOf(
                        SerializablePythonClass(
                            "test-class",
                            "test-module.test-class",
                            listOf("test-decorator"),
                            listOf("test-superclass"),
                            mutableListOf(
                                SerializablePythonFunction(
                                    "test-class-function",
                                    "test-module.test-class.test-class-function",
                                    listOf("decorators"),
                                    mutableListOf(
                                        SerializablePythonParameter(
                                            "only-param",
                                            "test-module.test-class.test-class-function.only-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                OptionalAnnotation(
                                                    DefaultString("test"),
                                                ),
                                            ),
                                        ),
                                    ),
                                    mutableListOf(),
                                    true,
                                    "description",
                                    "fullDocstring",
                                    mutableListOf(
                                        OptionalAnnotation(
                                            DefaultString("test"),
                                        ),
                                    ),
                                ),
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            mutableListOf(
                                OptionalAnnotation(
                                    DefaultString("test"),
                                ),
                            ),
                        ),
                    ),
                    mutableListOf(
                        SerializablePythonFunction(
                            "test-function",
                            "test-module.test-function",
                            listOf("test-decorator"),
                            mutableListOf(
                                SerializablePythonParameter(
                                    "test-parameter",
                                    "test-module.test-function.test-parameter",
                                    "42",
                                    PythonParameterAssignment.NAME_ONLY,
                                    true,
                                    "str",
                                    "Lorem ipsum",
                                    mutableListOf(
                                        OptionalAnnotation(
                                            DefaultString("test"),
                                        ),
                                    ),
                                ),
                            ),
                            mutableListOf(
                                SerializablePythonResult(
                                    "test-result",
                                    "str",
                                    "str",
                                    "Lorem ipsum",
                                    mutableListOf(),
                                ),
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            mutableListOf(
                                OptionalAnnotation(
                                    DefaultString("test"),
                                ),
                            ),
                        ),
                    ),
                    mutableListOf(),
                ),
            ),
            mutableListOf(),
        )

        // when
        val annotationValidator = AnnotationValidator(testPythonPackage)
        val annotationErrors = annotationValidator.validate()

        // then
        val expectedErrors = listOf<AnnotationError>(
            AnnotationTargetError(
                "test-module.test-class",
                "Optional",
                AnnotationTarget.CLASS,
            ),
            AnnotationTargetError(
                "test-module.test-class.test-class-function",
                "Optional",
                AnnotationTarget.METHOD,
            ),
            AnnotationTargetError(
                "test-module.test-function",
                "Optional",
                AnnotationTarget.GLOBAL_FUNCTION,
            ),
        )

        annotationErrors.shouldContainExactlyInAnyOrder(expectedErrors)
    }

    @Test
    fun returnNoAnnotationErrorsOnValidlyPlacedAnnotations() {
        // given
        val testPythonPackage = SerializablePythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            mutableListOf(
                SerializablePythonModule(
                    "test-module",
                    listOf(
                        PythonImport(
                            "test-import",
                            "test-alias",
                        ),
                    ),
                    listOf(
                        PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null,
                        ),
                    ),
                    mutableListOf(
                        SerializablePythonClass(
                            "test-class",
                            "test-module.test-class",
                            listOf("test-decorator"),
                            listOf("test-superclass"),
                            mutableListOf(
                                SerializablePythonFunction(
                                    "__init__",
                                    "test-module.test-class.__init__",
                                    listOf("decorators"),
                                    mutableListOf(
                                        SerializablePythonParameter(
                                            "only-param",
                                            "test-module.test-class.__init__.only-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                RenameAnnotation("newName"),
                                                RequiredAnnotation,
                                                BoundaryAnnotation(
                                                    false,
                                                    1.0,
                                                    ComparisonOperator.LESS_THAN,
                                                    4.0,
                                                    ComparisonOperator.LESS_THAN,
                                                ),
                                            ),
                                        ),
                                    ),
                                    mutableListOf(),
                                    true,
                                    "description",
                                    "fullDocstring",
                                    mutableListOf(
                                        CalledAfterAnnotation("calledAfterName1"),
                                        CalledAfterAnnotation("calledAfterName2"),
                                        RenameAnnotation("newName"),
                                    ),
                                ),
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            mutableListOf(
                                MoveAnnotation("destination"),
                                RenameAnnotation("rename"),
                            ),
                        ),
                    ),
                    mutableListOf(
                        SerializablePythonFunction(
                            "test-function",
                            "test-module.test-function",
                            listOf("test-decorator"),
                            mutableListOf(
                                SerializablePythonParameter(
                                    "test-parameter",
                                    "test-module.test-function.test-parameter",
                                    "42",
                                    PythonParameterAssignment.NAME_ONLY,
                                    true,
                                    "str",
                                    "Lorem ipsum",
                                    mutableListOf(
                                        OptionalAnnotation(
                                            DefaultString("test"),
                                        ),
                                        RenameAnnotation("newName"),
                                        BoundaryAnnotation(
                                            false,
                                            1.0,
                                            ComparisonOperator.LESS_THAN,
                                            4.0,
                                            ComparisonOperator.LESS_THAN,
                                        ),
                                    ),
                                ),
                            ),
                            mutableListOf(
                                SerializablePythonResult(
                                    "test-result",
                                    "str",
                                    "str",
                                    "Lorem ipsum",
                                    mutableListOf(),
                                ),
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            mutableListOf(
                                CalledAfterAnnotation("calledAfterName1"),
                                CalledAfterAnnotation("calledAfterName2"),
                                GroupAnnotation(
                                    "groupName",
                                    mutableListOf("test-module.test-function.test-parameter"),
                                ),
                                RenameAnnotation("newName"),
                            ),
                        ),
                    ),
                    mutableListOf(
                        MoveAnnotation("destination"),
                        RenameAnnotation("rename"),
                    ),
                ),
            ),
            mutableListOf(),
        )

        // when
        val annotationValidator = AnnotationValidator(testPythonPackage)
        val annotationErrors = annotationValidator.validate()

        // then
        annotationErrors.shouldBeEmpty()
    }

    @Test
    fun returnAnnotationCombinationsErrorsForConflictingAnnotations() {
        // given
        val testPythonPackage = SerializablePythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            mutableListOf(
                SerializablePythonModule(
                    "test-module",
                    listOf(
                        PythonImport(
                            "test-import",
                            "test-alias",
                        ),
                    ),
                    listOf(
                        PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null,
                        ),
                    ),
                    mutableListOf(
                        SerializablePythonClass(
                            "test-class",
                            "test-module.test-class",
                            listOf("test-decorator"),
                            listOf("test-superclass"),
                            mutableListOf(
                                SerializablePythonFunction(
                                    "__init__",
                                    "test-module.test-class.__init__",
                                    listOf("decorators"),
                                    mutableListOf(
                                        SerializablePythonParameter(
                                            "only-param",
                                            "test-module.test-class.__init__.only-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                OptionalAnnotation(
                                                    DefaultString("test"),
                                                ),
                                                ConstantAnnotation(
                                                    DefaultString("test"),
                                                ),
                                            ),
                                        ),
                                    ),
                                    mutableListOf(),
                                    true,
                                    "description",
                                    "fullDocstring", mutableListOf(),
                                ),
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum", mutableListOf(),
                        ),
                    ),
                    mutableListOf(
                        SerializablePythonFunction(
                            "test-function",
                            "test-module.test-function",
                            listOf("test-decorator"),
                            mutableListOf(
                                SerializablePythonParameter(
                                    "test-parameter",
                                    "test-module.test-function.test-parameter",
                                    "42",
                                    PythonParameterAssignment.NAME_ONLY,
                                    true,
                                    "str",
                                    "Lorem ipsum",
                                    mutableListOf(
                                        OptionalAnnotation(
                                            DefaultString("test1"),
                                        ),
                                        OptionalAnnotation(
                                            DefaultString("test2"),
                                        ),
                                        ConstantAnnotation(
                                            DefaultString("test3"),
                                        ),
                                    ),
                                ),
                            ),
                            mutableListOf(
                                SerializablePythonResult(
                                    "test-result",
                                    "str",
                                    "str",
                                    "Lorem ipsum",
                                    mutableListOf(),
                                ),
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum", mutableListOf(),
                        ),
                    ),
                    mutableListOf(),
                ),
            ),
            mutableListOf(),
        )

        // when
        val annotationValidator = AnnotationValidator(testPythonPackage)
        val annotationErrors = annotationValidator.validate()

        // then
        val expectedErrors = listOf<AnnotationError>(
            AnnotationCombinationError(
                "test-module.test-class.__init__.only-param",
                "Optional",
                "Constant",
            ),
            AnnotationCombinationError(
                "test-module.test-function.test-parameter",
                "Optional",
                "Optional",
            ),
            AnnotationCombinationError(
                "test-module.test-function.test-parameter",
                "Optional",
                "Constant",
            ),
            AnnotationCombinationError(
                "test-module.test-function.test-parameter",
                "Optional",
                "Constant",
            ),
        )

        annotationErrors.shouldContainExactlyInAnyOrder(expectedErrors)
    }

    @Test
    fun returnGroupAnnotationCombinationsErrorsForConflictingAnnotation() {
        // given
        val testPythonPackage = SerializablePythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            mutableListOf(
                SerializablePythonModule(
                    "test-module",
                    listOf(
                        PythonImport(
                            "test-import",
                            "test-alias",
                        ),
                    ),
                    listOf(
                        PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null,
                        ),
                    ),
                    mutableListOf(
                        SerializablePythonClass(
                            "test-class",
                            "test-module.test-class",
                            listOf("test-decorator"),
                            listOf("test-superclass"),
                            mutableListOf(
                                SerializablePythonFunction(
                                    "__init__",
                                    "test-module.test-class.__init__",
                                    listOf("decorators"),
                                    mutableListOf(
                                        SerializablePythonParameter(
                                            "first-param",
                                            "test-module.test-class.__init__.first-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                OptionalAnnotation(
                                                    DefaultString("test"),
                                                ),
                                            ),
                                        ),
                                        SerializablePythonParameter(
                                            "second-param",
                                            "test-module.test-class.__init__.second-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                ConstantAnnotation(
                                                    DefaultString("test"),
                                                ),
                                            ),
                                        ),
                                        SerializablePythonParameter(
                                            "third-param",
                                            "test-module.test-class.__init__.third-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                RenameAnnotation("newName"),
                                            ),
                                        ),
                                    ),
                                    mutableListOf(),
                                    true,
                                    "description",
                                    "fullDocstring",
                                    mutableListOf(
                                        GroupAnnotation(
                                            "paramGroup",
                                            mutableListOf("first-param", "second-param"),
                                        ),
                                    ),
                                ),
                                SerializablePythonFunction(
                                    "class-function",
                                    "test-module.test-class.class-function",
                                    listOf("decorators"),
                                    mutableListOf(
                                        SerializablePythonParameter(
                                            "first-param",
                                            "test-module.test-class.class-function.first-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                RenameAnnotation("newName"),
                                            ),
                                        ),
                                        SerializablePythonParameter(
                                            "second-param",
                                            "test-module.test-class.class-function.second-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                ConstantAnnotation(
                                                    DefaultString("test"),
                                                ),
                                            ),
                                        ),
                                    ),
                                    mutableListOf(),
                                    true,
                                    "description",
                                    "fullDocstring",
                                    mutableListOf(
                                        GroupAnnotation(
                                            "paramGroup",
                                            mutableListOf("second-param"),
                                        ),
                                    ),
                                ),
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum", mutableListOf(),
                        ),
                    ),
                    mutableListOf(
                        SerializablePythonFunction(
                            "class-function",
                            "test-module.module-function",
                            listOf("decorators"),
                            mutableListOf(
                                SerializablePythonParameter(
                                    "first-param",
                                    "test-module.module-function.first-param",
                                    "defaultValue",
                                    PythonParameterAssignment.POSITION_OR_NAME,
                                    true,
                                    "typeInDocs",
                                    "description",
                                    mutableListOf(
                                        RenameAnnotation("newName"),
                                    ),
                                ),
                                SerializablePythonParameter(
                                    "second-param",
                                    "test-module.module-function.second-param",
                                    "defaultValue",
                                    PythonParameterAssignment.POSITION_OR_NAME,
                                    true,
                                    "typeInDocs",
                                    "description",
                                    mutableListOf(
                                        ConstantAnnotation(
                                            DefaultString("test"),
                                        ),
                                    ),
                                ),
                            ),
                            mutableListOf(),
                            true,
                            "description",
                            "fullDocstring",
                            mutableListOf(
                                GroupAnnotation(
                                    "paramGroup",
                                    mutableListOf("second-param"),
                                ),
                            ),
                        ),
                    ),
                    mutableListOf(),
                ),
            ),
            mutableListOf(),
        )

        // when
        val annotationValidator = AnnotationValidator(testPythonPackage)
        val annotationErrors = annotationValidator.validate()

        // then
        val expectedErrors = listOf<AnnotationError>(
            GroupAnnotationCombinationError(
                "test-module.test-class.__init__.second-param",
                "Constant",
            ),
            GroupAnnotationCombinationError(
                "test-module.test-class.class-function.second-param",
                "Constant",
            ),
            GroupAnnotationCombinationError(
                "test-module.module-function.second-param",
                "Constant",
            ),
        )

        annotationErrors.shouldContainExactlyInAnyOrder(expectedErrors)
    }
}
