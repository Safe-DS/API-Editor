package com.larsreimann.api_editor.validation;

import com.larsreimann.api_editor.model.AnnotatedPythonClass;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonModule;
import com.larsreimann.api_editor.model.AnnotatedPythonPackage;
import com.larsreimann.api_editor.model.AnnotatedPythonParameter;
import com.larsreimann.api_editor.model.AnnotatedPythonResult;
import com.larsreimann.api_editor.model.AnnotationTarget;
import com.larsreimann.api_editor.model.AttributeAnnotation;
import com.larsreimann.api_editor.model.BoundaryAnnotation;
import com.larsreimann.api_editor.model.CalledAfterAnnotation;
import com.larsreimann.api_editor.model.ComparisonOperator;
import com.larsreimann.api_editor.model.ConstantAnnotation;
import com.larsreimann.api_editor.model.DefaultString;
import com.larsreimann.api_editor.model.GroupAnnotation;
import com.larsreimann.api_editor.model.MoveAnnotation;
import com.larsreimann.api_editor.model.OptionalAnnotation;
import com.larsreimann.api_editor.model.PythonFromImport;
import com.larsreimann.api_editor.model.PythonImport;
import com.larsreimann.api_editor.model.PythonParameterAssignment;
import com.larsreimann.api_editor.model.RenameAnnotation;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

class AnnotationValidationTest {
    @Test
    void returnAnnotationTargetErrorsForIncorrectlyPlacedAttributeAnnotations() {
        // given
        AnnotatedPythonPackage testPythonPackage = new AnnotatedPythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            List.of(
                new AnnotatedPythonModule(
                    "test-module",
                    List.of(
                        new PythonImport(
                            "test-import",
                            "test-alias"
                        )
                    ),
                    List.of(
                        new PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null
                        )
                    ),
                    List.of(
                        new AnnotatedPythonClass(
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
                                List.of(new AttributeAnnotation(
                                    new DefaultString("test")
                                ))
                            )),
                            "Lorem ipsum",
                            "Lorem ipsum",
                            List.of(
                                new AttributeAnnotation(
                                    new DefaultString("test")
                                )
                            )
                        )
                    ),
                    List.of(
                        new AnnotatedPythonFunction(
                            "test-function",
                            "test-module.test-function",
                            List.of("test-decorator"),
                            List.of(
                                new AnnotatedPythonParameter(
                                    "test-parameter",
                                    "test-module.test-function.test-parameter",
                                    "42",
                                    PythonParameterAssignment.NAME_ONLY,
                                    true,
                                    "str",
                                    "Lorem ipsum",
                                    List.of(new AttributeAnnotation(
                                        new DefaultString("test")
                                    ))
                                )
                            ),
                            List.of(
                                new AnnotatedPythonResult(
                                    "test-result",
                                    "str",
                                    "str",
                                    "Lorem ipsum",
                                    Collections.emptyList()
                                )
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            List.of(new AttributeAnnotation(
                                new DefaultString("test")
                            ))
                        )
                    ),
                    Collections.emptyList()
                )
            ),
            Collections.emptyList()
        );

        // when
        AnnotationValidator annotationValidator = new AnnotationValidator(testPythonPackage);
        List<AnnotationError> annotationErrors = annotationValidator.validate();

        // then
        List<AnnotationError> expectedErrors = List.of(
            new AnnotationTargetError(
                "test-module.test-class",
                "Attribute",
                AnnotationTarget.CLASS
            ),
            new AnnotationTargetError(
                "test-module.test-class.test-class-function",
                "Attribute",
                AnnotationTarget.METHOD
            ),
            new AnnotationTargetError(
                "test-module.test-function",
                "Attribute",
                AnnotationTarget.GLOBAL_FUNCTION
            ),
            new AnnotationTargetError(
                "test-module.test-function.test-parameter",
                "Attribute",
                AnnotationTarget.FUNCTION_PARAMETER
            ),
            new AnnotationTargetError(
                "test-module.test-class.test-class-function.only-param",
                "Attribute",
                AnnotationTarget.FUNCTION_PARAMETER
            )
        );

        expectedErrors.forEach(expectedError -> Assertions.assertTrue(
            annotationErrors.contains(expectedError)
        ));
        Assertions.assertEquals(annotationErrors.size(), expectedErrors.size());
    }

    @Test
    void returnNoAnnotationErrorsOnValidlyPlacedAnnotations() {
        // given
        AnnotatedPythonPackage testPythonPackage = new AnnotatedPythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            List.of(
                new AnnotatedPythonModule(
                    "test-module",
                    List.of(
                        new PythonImport(
                            "test-import",
                            "test-alias"
                        )
                    ),
                    List.of(
                        new PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null
                        )
                    ),
                    List.of(
                        new AnnotatedPythonClass(
                            "test-class",
                            "test-module.test-class",
                            List.of("test-decorator"),
                            List.of("test-superclass"),
                            List.of(new AnnotatedPythonFunction(
                                "__init__",
                                "test-module.test-class.__init__",
                                List.of("decorators"),
                                List.of(new AnnotatedPythonParameter(
                                    "only-param",
                                    "test-module.test-class.__init__.only-param",
                                    "defaultValue",
                                    PythonParameterAssignment.POSITION_OR_NAME,
                                    true,
                                    "typeInDocs",
                                    "description",
                                    List.of(
                                        new AttributeAnnotation(
                                            new DefaultString("test")
                                        ),
                                        new RenameAnnotation("newName"),
                                        new BoundaryAnnotation(
                                            false,
                                            1,
                                            ComparisonOperator.LESS_THAN,
                                            4,
                                            ComparisonOperator.LESS_THAN
                                        )
                                    )
                                )),
                                Collections.emptyList(),
                                true,
                                "description",
                                "fullDocstring",
                                List.of(
                                    new CalledAfterAnnotation("calledAfterName1"),
                                    new CalledAfterAnnotation("calledAfterName2"),
                                    new RenameAnnotation("newName")
                                )
                            )),
                            "Lorem ipsum",
                            "Lorem ipsum",
                            List.of(
                                new MoveAnnotation("destination"),
                                new RenameAnnotation("rename")
                            )
                        )
                    ),
                    List.of(
                        new AnnotatedPythonFunction(
                            "test-function",
                            "test-module.test-function",
                            List.of("test-decorator"),
                            List.of(
                                new AnnotatedPythonParameter(
                                    "test-parameter",
                                    "test-module.test-function.test-parameter",
                                    "42",
                                    PythonParameterAssignment.NAME_ONLY,
                                    true,
                                    "str",
                                    "Lorem ipsum",
                                    List.of(
                                        new OptionalAnnotation(
                                            new DefaultString("test")
                                        ),
                                        new RenameAnnotation("newName"),
                                        new BoundaryAnnotation(
                                            false,
                                            1,
                                            ComparisonOperator.LESS_THAN,
                                            4,
                                            ComparisonOperator.LESS_THAN
                                        )
                                    )
                                )
                            ),
                            List.of(
                                new AnnotatedPythonResult(
                                    "test-result",
                                    "str",
                                    "str",
                                    "Lorem ipsum",
                                    Collections.emptyList()
                                )
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            List.of(
                                new CalledAfterAnnotation("calledAfterName1"),
                                new CalledAfterAnnotation("calledAfterName2"),
                                new GroupAnnotation("groupName",
                                    List.of("test-module.test-function.test-parameter")
                                ),
                                new RenameAnnotation("newName")
                            )
                        )
                    ),
                    List.of(
                        new MoveAnnotation("destination"),
                        new RenameAnnotation("rename")
                    )
                )
            ),
            Collections.emptyList()
        );

        // when
        AnnotationValidator annotationValidator = new AnnotationValidator(testPythonPackage);
        List<AnnotationError> annotationErrors = annotationValidator.validate();

        // then
        Assertions.assertTrue(annotationErrors.isEmpty());
    }

    @Test
    void returnAnnotationCombinationsErrorsForConflictingAnnotations() {
        // given
        AnnotatedPythonPackage testPythonPackage = new AnnotatedPythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            List.of(
                new AnnotatedPythonModule(
                    "test-module",
                    List.of(
                        new PythonImport(
                            "test-import",
                            "test-alias"
                        )
                    ),
                    List.of(
                        new PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null
                        )
                    ),
                    List.of(
                        new AnnotatedPythonClass(
                            "test-class",
                            "test-module.test-class",
                            List.of("test-decorator"),
                            List.of("test-superclass"),
                            List.of(new AnnotatedPythonFunction(
                                "__init__",
                                "test-module.test-class.__init__",
                                List.of("decorators"),
                                List.of(new AnnotatedPythonParameter(
                                    "only-param",
                                    "test-module.test-class.__init__.only-param",
                                    "defaultValue",
                                    PythonParameterAssignment.POSITION_OR_NAME,
                                    true,
                                    "typeInDocs",
                                    "description",
                                    List.of(
                                        new AttributeAnnotation(
                                            new DefaultString("test")
                                        ),
                                        new ConstantAnnotation(
                                            new DefaultString("test")
                                        )
                                    )
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
                        )
                    ),
                    List.of(
                        new AnnotatedPythonFunction(
                            "test-function",
                            "test-module.test-function",
                            List.of("test-decorator"),
                            List.of(
                                new AnnotatedPythonParameter(
                                    "test-parameter",
                                    "test-module.test-function.test-parameter",
                                    "42",
                                    PythonParameterAssignment.NAME_ONLY,
                                    true,
                                    "str",
                                    "Lorem ipsum",
                                    List.of(
                                        new OptionalAnnotation(
                                            new DefaultString("test1")
                                        ),
                                        new OptionalAnnotation(
                                            new DefaultString("test2")
                                        ),
                                        new ConstantAnnotation(
                                            new DefaultString("test3")
                                        )
                                    )
                                )
                            ),
                            List.of(
                                new AnnotatedPythonResult(
                                    "test-result",
                                    "str",
                                    "str",
                                    "Lorem ipsum",
                                    Collections.emptyList()
                                )
                            ),
                            true,
                            "Lorem ipsum",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    Collections.emptyList()
                )
            ),
            Collections.emptyList()
        );

        // when
        AnnotationValidator annotationValidator = new AnnotationValidator(testPythonPackage);
        List<AnnotationError> annotationErrors = annotationValidator.validate();

        // then
        List<AnnotationError> expectedErrors = List.of(
            new AnnotationCombinationError(
                "test-module.test-class.__init__.only-param",
                "Attribute",
                "Constant"
            ),
            new AnnotationCombinationError(
                "test-module.test-function.test-parameter",
                "Optional",
                "Optional"
            ),
            new AnnotationCombinationError(
                "test-module.test-function.test-parameter",
                "Optional",
                "Constant"
            ),
            new AnnotationCombinationError(
                "test-module.test-function.test-parameter",
                "Optional",
                "Constant"
            )
        );

        expectedErrors.forEach(expectedError -> Assertions.assertTrue(
            annotationErrors.contains(expectedError)
        ));

        Assertions.assertEquals(annotationErrors.size(), expectedErrors.size());
    }

    @Test
    void returnGroupAnnotationCombinationsErrorsForConflictingAnnotation() {
        // given
        AnnotatedPythonPackage testPythonPackage = new AnnotatedPythonPackage(
            "test-distribution",
            "test-package",
            "1.0.0",
            List.of(
                new AnnotatedPythonModule(
                    "test-module",
                    List.of(
                        new PythonImport(
                            "test-import",
                            "test-alias"
                        )
                    ),
                    List.of(
                        new PythonFromImport(
                            "test-from-import",
                            "test-declaration",
                            null
                        )
                    ),
                    List.of(
                        new AnnotatedPythonClass(
                            "test-class",
                            "test-module.test-class",
                            List.of("test-decorator"),
                            List.of("test-superclass"),
                            List.of(new AnnotatedPythonFunction(
                                "__init__",
                                "test-module.test-class.__init__",
                                List.of("decorators"),
                                List.of(
                                    new AnnotatedPythonParameter(
                                        "first-param",
                                        "test-module.test-class.__init__.first-param",
                                        "defaultValue",
                                        PythonParameterAssignment.POSITION_OR_NAME,
                                        true,
                                        "typeInDocs",
                                        "description",
                                        List.of(
                                            new AttributeAnnotation(
                                                new DefaultString("test")
                                            )
                                        )
                                    ),
                                    new AnnotatedPythonParameter(
                                        "second-param",
                                        "test-module.test-class.__init__.second-param",
                                        "defaultValue",
                                        PythonParameterAssignment.POSITION_OR_NAME,
                                        true,
                                        "typeInDocs",
                                        "description",
                                        List.of(
                                            new ConstantAnnotation(
                                                new DefaultString("test")
                                            )
                                        )
                                    ),
                                    new AnnotatedPythonParameter(
                                        "third-param",
                                        "test-module.test-class.__init__.third-param",
                                        "defaultValue",
                                        PythonParameterAssignment.POSITION_OR_NAME,
                                        true,
                                        "typeInDocs",
                                        "description",
                                        List.of(
                                            new RenameAnnotation("newName")
                                        )
                                    )
                                ),
                                Collections.emptyList(),
                                true,
                                "description",
                                "fullDocstring",
                                List.of(
                                    new GroupAnnotation(
                                        "paramGroup",
                                        List.of("first-param", "second-param")
                                    )
                                )
                            ), new AnnotatedPythonFunction(
                                "class-function",
                                "test-module.test-class.class-function",
                                List.of("decorators"),
                                List.of(
                                    new AnnotatedPythonParameter(
                                        "first-param",
                                        "test-module.test-class.class-function.first-param",
                                        "defaultValue",
                                        PythonParameterAssignment.POSITION_OR_NAME,
                                        true,
                                        "typeInDocs",
                                        "description",
                                        List.of(
                                            new RenameAnnotation("newName")
                                        )
                                    ),
                                    new AnnotatedPythonParameter(
                                        "second-param",
                                        "test-module.test-class.class-function.second-param",
                                        "defaultValue",
                                        PythonParameterAssignment.POSITION_OR_NAME,
                                        true,
                                        "typeInDocs",
                                        "description",
                                        List.of(
                                            new ConstantAnnotation(
                                                new DefaultString("test")
                                            )
                                        )
                                    )
                                ),
                                Collections.emptyList(),
                                true,
                                "description",
                                "fullDocstring",
                                List.of(
                                    new GroupAnnotation(
                                        "paramGroup",
                                        List.of("second-param")
                                    )
                                )
                            )),
                            "Lorem ipsum",
                            "Lorem ipsum",
                            Collections.emptyList()
                        )
                    ),
                    List.of(
                        new AnnotatedPythonFunction(
                            "class-function",
                            "test-module.module-function",
                            List.of("decorators"),
                            List.of(
                                new AnnotatedPythonParameter(
                                    "first-param",
                                    "test-module.module-function.first-param",
                                    "defaultValue",
                                    PythonParameterAssignment.POSITION_OR_NAME,
                                    true,
                                    "typeInDocs",
                                    "description",
                                    List.of(
                                        new RenameAnnotation("newName")
                                    )
                                ),
                                new AnnotatedPythonParameter(
                                    "second-param",
                                    "test-module.module-function.second-param",
                                    "defaultValue",
                                    PythonParameterAssignment.POSITION_OR_NAME,
                                    true,
                                    "typeInDocs",
                                    "description",
                                    List.of(
                                        new ConstantAnnotation(
                                            new DefaultString("test")
                                        )
                                    )
                                )
                            ),
                            Collections.emptyList(),
                            true,
                            "description",
                            "fullDocstring",
                            List.of(
                                new GroupAnnotation(
                                    "paramGroup",
                                    List.of("second-param")
                                )
                            )
                        )),
                    Collections.emptyList()
                )
            ),
            Collections.emptyList()
        );

        // when
        AnnotationValidator annotationValidator = new AnnotationValidator(testPythonPackage);
        List<AnnotationError> annotationErrors = annotationValidator.validate();

        // then
        List<AnnotationError> expectedErrors = List.of(
            new GroupAnnotationCombinationError(
                "test-module.test-class.__init__.first-param",
                "Attribute"
            ),
            new GroupAnnotationCombinationError(
                "test-module.test-class.__init__.second-param",
                "Constant"
            ),
            new GroupAnnotationCombinationError(
                "test-module.test-class.class-function.second-param",
                "Constant"
            ),
            new GroupAnnotationCombinationError(
                "test-module.module-function.second-param",
                "Constant"
            )
        );

        expectedErrors.forEach(expectedError -> Assertions.assertTrue(
            annotationErrors.contains(expectedError)
        ));

        Assertions.assertEquals(annotationErrors.size(), expectedErrors.size());
    }
}
