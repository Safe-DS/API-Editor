package com.larsreimann.api_editor.validation

import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonModule
import com.larsreimann.api_editor.model.AnnotatedPythonPackage
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import com.larsreimann.api_editor.model.AnnotationTarget
import com.larsreimann.api_editor.model.AttributeAnnotation
import com.larsreimann.api_editor.model.BoundaryAnnotation
import com.larsreimann.api_editor.model.CalledAfterAnnotation
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.ConstantAnnotation
import com.larsreimann.api_editor.model.DefaultString
import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.MoveAnnotation
import com.larsreimann.api_editor.model.OptionalAnnotation
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RenameAnnotation
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import org.junit.jupiter.api.Test

internal class AnnotationValidatorTest {
    @Test
    fun returnAnnotationTargetErrorsForIncorrectlyPlacedAttributeAnnotations() {
        // given
        val testPythonPackage = AnnotatedPythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            listOf(
                AnnotatedPythonModule(
                    "test-module",
                    listOf(
                        PythonImport(
                            "test-import",
                            "test-alias"
                        )
                    ),
                    listOf(
                        PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null
                        )
                    ),
                    listOf(
                        AnnotatedPythonClass(
                            "test-class",
                            "test-module.test-class",
                            listOf("test-decorator"),
                            listOf("test-superclass"),
                            listOf(
                                AnnotatedPythonFunction(
                                    "test-class-function",
                                    "test-module.test-class.test-class-function",
                                    listOf("decorators"),
                                    listOf(
                                        AnnotatedPythonParameter(
                                            "only-param",
                                            "test-module.test-class.test-class-function.only-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                AttributeAnnotation(
                                                    DefaultString("test")
                                                )
                                            )
                                        )
                                    ), emptyList(),
                                    true,
                                    "description",
                                    "fullDocstring",
                                    mutableListOf(
                                        AttributeAnnotation(
                                            DefaultString("test")
                                        )
                                    )
                                )
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            mutableListOf(
                                AttributeAnnotation(
                                    DefaultString("test")
                                )
                            )
                        )
                    ),
                    listOf(
                        AnnotatedPythonFunction(
                            "test-function",
                            "test-module.test-function",
                            listOf("test-decorator"),
                            listOf(
                                AnnotatedPythonParameter(
                                    "test-parameter",
                                    "test-module.test-function.test-parameter",
                                    "42",
                                    PythonParameterAssignment.NAME_ONLY,
                                    true,
                                    "str",
                                    "Lorem ipsum",
                                    mutableListOf(
                                        AttributeAnnotation(
                                            DefaultString("test")
                                        )
                                    )
                                )
                            ),
                            listOf(
                                AnnotatedPythonResult(
                                    "test-result",
                                    "str",
                                    "str",
                                    "Lorem ipsum", mutableListOf()
                                )
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            mutableListOf(
                                AttributeAnnotation(
                                    DefaultString("test")
                                )
                            )
                        )
                    ), mutableListOf()
                )
            ), mutableListOf()
        )

        // when
        val annotationValidator = AnnotationValidator(testPythonPackage)
        val annotationErrors = annotationValidator.validate()

        // then
        val expectedErrors = listOf<AnnotationError>(
            AnnotationTargetError(
                "test-module.test-class",
                "Attribute",
                AnnotationTarget.CLASS
            ),
            AnnotationTargetError(
                "test-module.test-class.test-class-function",
                "Attribute",
                AnnotationTarget.METHOD
            ),
            AnnotationTargetError(
                "test-module.test-function",
                "Attribute",
                AnnotationTarget.GLOBAL_FUNCTION
            ),
            AnnotationTargetError(
                "test-module.test-function.test-parameter",
                "Attribute",
                AnnotationTarget.FUNCTION_PARAMETER
            ),
            AnnotationTargetError(
                "test-module.test-class.test-class-function.only-param",
                "Attribute",
                AnnotationTarget.FUNCTION_PARAMETER
            )
        )

        annotationErrors.shouldContainExactlyInAnyOrder(expectedErrors)
    }

    @Test
    fun returnNoAnnotationErrorsOnValidlyPlacedAnnotations() {
        // given
        val testPythonPackage = AnnotatedPythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            listOf(
                AnnotatedPythonModule(
                    "test-module",
                    listOf(
                        PythonImport(
                            "test-import",
                            "test-alias"
                        )
                    ),
                    listOf(
                        PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null
                        )
                    ),
                    listOf(
                        AnnotatedPythonClass(
                            "test-class",
                            "test-module.test-class",
                            listOf("test-decorator"),
                            listOf("test-superclass"),
                            listOf(
                                AnnotatedPythonFunction(
                                    "__init__",
                                    "test-module.test-class.__init__",
                                    listOf("decorators"),
                                    listOf(
                                        AnnotatedPythonParameter(
                                            "only-param",
                                            "test-module.test-class.__init__.only-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                AttributeAnnotation(
                                                    DefaultString("test")
                                                ),
                                                RenameAnnotation("newName"),
                                                BoundaryAnnotation(
                                                    false,
                                                    1.0,
                                                    ComparisonOperator.LESS_THAN,
                                                    4.0,
                                                    ComparisonOperator.LESS_THAN
                                                )
                                            )
                                        )
                                    ), emptyList(),
                                    true,
                                    "description",
                                    "fullDocstring",
                                    mutableListOf(
                                        CalledAfterAnnotation("calledAfterName1"),
                                        CalledAfterAnnotation("calledAfterName2"),
                                        RenameAnnotation("newName")
                                    )
                                )
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            mutableListOf(
                                MoveAnnotation("destination"),
                                RenameAnnotation("rename")
                            )
                        )
                    ),
                    listOf(
                        AnnotatedPythonFunction(
                            "test-function",
                            "test-module.test-function",
                            listOf("test-decorator"),
                            listOf(
                                AnnotatedPythonParameter(
                                    "test-parameter",
                                    "test-module.test-function.test-parameter",
                                    "42",
                                    PythonParameterAssignment.NAME_ONLY,
                                    true,
                                    "str",
                                    "Lorem ipsum",
                                    mutableListOf(
                                        OptionalAnnotation(
                                            DefaultString("test")
                                        ),
                                        RenameAnnotation("newName"),
                                        BoundaryAnnotation(
                                            false,
                                            1.0,
                                            ComparisonOperator.LESS_THAN,
                                            4.0,
                                            ComparisonOperator.LESS_THAN
                                        )
                                    )
                                )
                            ),
                            listOf(
                                AnnotatedPythonResult(
                                    "test-result",
                                    "str",
                                    "str",
                                    "Lorem ipsum", mutableListOf()
                                )
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            mutableListOf(
                                CalledAfterAnnotation("calledAfterName1"),
                                CalledAfterAnnotation("calledAfterName2"),
                                GroupAnnotation(
                                    "groupName",
                                    listOf("test-module.test-function.test-parameter")
                                ),
                                RenameAnnotation("newName")
                            )
                        )
                    ),
                    mutableListOf(
                        MoveAnnotation("destination"),
                        RenameAnnotation("rename")
                    )
                )
            ), mutableListOf()
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
        val testPythonPackage = AnnotatedPythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            listOf(
                AnnotatedPythonModule(
                    "test-module",
                    listOf(
                        PythonImport(
                            "test-import",
                            "test-alias"
                        )
                    ),
                    listOf(
                        PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null
                        )
                    ),
                    listOf(
                        AnnotatedPythonClass(
                            "test-class",
                            "test-module.test-class",
                            listOf("test-decorator"),
                            listOf("test-superclass"),
                            listOf(
                                AnnotatedPythonFunction(
                                    "__init__",
                                    "test-module.test-class.__init__",
                                    listOf("decorators"),
                                    listOf(
                                        AnnotatedPythonParameter(
                                            "only-param",
                                            "test-module.test-class.__init__.only-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                AttributeAnnotation(
                                                    DefaultString("test")
                                                ),
                                                ConstantAnnotation(
                                                    DefaultString("test")
                                                )
                                            )
                                        )
                                    ), emptyList(),
                                    true,
                                    "description",
                                    "fullDocstring", mutableListOf()
                                )
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    listOf(
                        AnnotatedPythonFunction(
                            "test-function",
                            "test-module.test-function",
                            listOf("test-decorator"),
                            listOf(
                                AnnotatedPythonParameter(
                                    "test-parameter",
                                    "test-module.test-function.test-parameter",
                                    "42",
                                    PythonParameterAssignment.NAME_ONLY,
                                    true,
                                    "str",
                                    "Lorem ipsum",
                                    mutableListOf(
                                        OptionalAnnotation(
                                            DefaultString("test1")
                                        ),
                                        OptionalAnnotation(
                                            DefaultString("test2")
                                        ),
                                        ConstantAnnotation(
                                            DefaultString("test3")
                                        )
                                    )
                                )
                            ),
                            listOf(
                                AnnotatedPythonResult(
                                    "test-result",
                                    "str",
                                    "str",
                                    "Lorem ipsum", mutableListOf()
                                )
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum", mutableListOf()
                        )
                    ), mutableListOf()
                )
            ), mutableListOf()
        )

        // when
        val annotationValidator = AnnotationValidator(testPythonPackage)
        val annotationErrors = annotationValidator.validate()

        // then
        val expectedErrors = listOf<AnnotationError>(
            AnnotationCombinationError(
                "test-module.test-class.__init__.only-param",
                "Attribute",
                "Constant"
            ),
            AnnotationCombinationError(
                "test-module.test-function.test-parameter",
                "Optional",
                "Optional"
            ),
            AnnotationCombinationError(
                "test-module.test-function.test-parameter",
                "Optional",
                "Constant"
            ),
            AnnotationCombinationError(
                "test-module.test-function.test-parameter",
                "Optional",
                "Constant"
            )
        )

        annotationErrors.shouldContainExactlyInAnyOrder(expectedErrors)
    }

    @Test
    fun returnGroupAnnotationCombinationsErrorsForConflictingAnnotation() {
        // given
        val testPythonPackage = AnnotatedPythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            listOf(
                AnnotatedPythonModule(
                    "test-module",
                    listOf(
                        PythonImport(
                            "test-import",
                            "test-alias"
                        )
                    ),
                    listOf(
                        PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null
                        )
                    ),
                    listOf(
                        AnnotatedPythonClass(
                            "test-class",
                            "test-module.test-class",
                            listOf("test-decorator"),
                            listOf("test-superclass"),
                            listOf(
                                AnnotatedPythonFunction(
                                    "__init__",
                                    "test-module.test-class.__init__",
                                    listOf("decorators"),
                                    listOf(
                                        AnnotatedPythonParameter(
                                            "first-param",
                                            "test-module.test-class.__init__.first-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                AttributeAnnotation(
                                                    DefaultString("test")
                                                )
                                            )
                                        ),
                                        AnnotatedPythonParameter(
                                            "second-param",
                                            "test-module.test-class.__init__.second-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                ConstantAnnotation(
                                                    DefaultString("test")
                                                )
                                            )
                                        ),
                                        AnnotatedPythonParameter(
                                            "third-param",
                                            "test-module.test-class.__init__.third-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                RenameAnnotation("newName")
                                            )
                                        )
                                    ), emptyList(),
                                    true,
                                    "description",
                                    "fullDocstring",
                                    mutableListOf(
                                        GroupAnnotation(
                                            "paramGroup",
                                            listOf("first-param", "second-param")
                                        )
                                    )
                                ), AnnotatedPythonFunction(
                                    "class-function",
                                    "test-module.test-class.class-function",
                                    listOf("decorators"),
                                    listOf(
                                        AnnotatedPythonParameter(
                                            "first-param",
                                            "test-module.test-class.class-function.first-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                RenameAnnotation("newName")
                                            )
                                        ),
                                        AnnotatedPythonParameter(
                                            "second-param",
                                            "test-module.test-class.class-function.second-param",
                                            "defaultValue",
                                            PythonParameterAssignment.POSITION_OR_NAME,
                                            true,
                                            "typeInDocs",
                                            "description",
                                            mutableListOf(
                                                ConstantAnnotation(
                                                    DefaultString("test")
                                                )
                                            )
                                        )
                                    ), emptyList(),
                                    true,
                                    "description",
                                    "fullDocstring",
                                    mutableListOf(
                                        GroupAnnotation(
                                            "paramGroup",
                                            listOf("second-param")
                                        )
                                    )
                                )
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    listOf(
                        AnnotatedPythonFunction(
                            "class-function",
                            "test-module.module-function",
                            listOf("decorators"),
                            listOf(
                                AnnotatedPythonParameter(
                                    "first-param",
                                    "test-module.module-function.first-param",
                                    "defaultValue",
                                    PythonParameterAssignment.POSITION_OR_NAME,
                                    true,
                                    "typeInDocs",
                                    "description",
                                    mutableListOf(
                                        RenameAnnotation("newName")
                                    )
                                ),
                                AnnotatedPythonParameter(
                                    "second-param",
                                    "test-module.module-function.second-param",
                                    "defaultValue",
                                    PythonParameterAssignment.POSITION_OR_NAME,
                                    true,
                                    "typeInDocs",
                                    "description",
                                    mutableListOf(
                                        ConstantAnnotation(
                                            DefaultString("test")
                                        )
                                    )
                                )
                            ), emptyList(),
                            true,
                            "description",
                            "fullDocstring",
                            mutableListOf(
                                GroupAnnotation(
                                    "paramGroup",
                                    listOf("second-param")
                                )
                            )
                        )
                    ), mutableListOf()
                )
            ), mutableListOf()
        )

        // when
        val annotationValidator = AnnotationValidator(testPythonPackage)
        val annotationErrors = annotationValidator.validate()

        // then
        val expectedErrors = listOf<AnnotationError>(
            GroupAnnotationCombinationError(
                "test-module.test-class.__init__.first-param",
                "Attribute"
            ),
            GroupAnnotationCombinationError(
                "test-module.test-class.__init__.second-param",
                "Constant"
            ),
            GroupAnnotationCombinationError(
                "test-module.test-class.class-function.second-param",
                "Constant"
            ),
            GroupAnnotationCombinationError(
                "test-module.module-function.second-param",
                "Constant"
            )
        )

        annotationErrors.shouldContainExactlyInAnyOrder(expectedErrors)
    }
}
