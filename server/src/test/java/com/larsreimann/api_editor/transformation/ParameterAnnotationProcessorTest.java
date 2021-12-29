package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.larsreimann.api_editor.server.RoutingKt.processPackage;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.*;

class ParameterAnnotationProcessorTest {
    @Test
    void optionalAnnotationChangesDefaultValuesAndAssignedByOfFunctionParameters() {
        // given
        AnnotatedPythonParameter testParameter1 =
            createPythonParameter(
                "testParameter1",
                "testModule.testFunction.testParameter1",
                null
            );
        testParameter1.getAnnotations().add(
            new OptionalAnnotation(
                new DefaultString("string")
            )
        );
        AnnotatedPythonParameter testParameter2 =
            createPythonParameter(
                "testParameter2",
                "testModule.testFunction.testParameter2",
                null
            );
        testParameter2.getAnnotations().add(
            new OptionalAnnotation(
                new DefaultBoolean(false)
            )
        );
        AnnotatedPythonParameter testParameter3 =
            createPythonParameter(
                "testParameter3",
                "testModule.testFunction.testParameter3",
                null
            );

        AnnotatedPythonFunction testFunction =
            createPythonFunction("testFunction");
        testFunction.getParameters().add(testParameter1);
        testFunction.getParameters().add(testParameter2);
        testFunction.getParameters().add(testParameter3);

        AnnotatedPythonModule testModule =
            createPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        OriginalDeclarationProcessor originalDeclarationProcessor =
            OriginalDeclarationProcessor.INSTANCE;
        testPackage.accept(originalDeclarationProcessor);

        // when
        AnnotatedPythonPackage modifiedPackage = processPackage(testPackage);

        // then
        AnnotatedPythonParameter expectedTestParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            "'string'",
            PythonParameterAssignment.NAME_ONLY
        );
        AnnotatedPythonParameter expectedTestParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            "false",
            PythonParameterAssignment.NAME_ONLY
        );
        AnnotatedPythonParameter expectedTestParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            null,
            PythonParameterAssignment.POSITION_OR_NAME
        );
        boolean testParameter1isContained = false;
        boolean testParameter2isContained = false;
        boolean testParameter3isContained = false;
        List<AnnotatedPythonParameter> actualParameters = modifiedPackage
            .getModules().get(0)
            .getFunctions().get(0)
            .getParameters();
        for (AnnotatedPythonParameter actualParameter : actualParameters) {
            if (parameterIsEqual(expectedTestParameter1, actualParameter)) {
                testParameter1isContained = true;
            } else if (parameterIsEqual(expectedTestParameter2, actualParameter)) {
                testParameter2isContained = true;
            } else if (parameterIsEqual(expectedTestParameter3, actualParameter)) {
                testParameter3isContained = true;
            }
        }
        Assertions.assertTrue(testParameter1isContained);
        Assertions.assertTrue(testParameter2isContained);
        Assertions.assertTrue(testParameter3isContained);
    }

    @Test
    void constantAnnotationChangesDefaultValuesAndAssignedByOfFunctionParameters() {
        // given
        AnnotatedPythonParameter testParameter1 =
            createPythonParameter(
                "testParameter1",
                "testModule.testFunction.testParameter1",
                null
            );
        testParameter1.getAnnotations().add(
            new ConstantAnnotation(
                new DefaultString("string")
            )
        );
        AnnotatedPythonParameter testParameter2 =
            createPythonParameter(
                "testParameter2",
                "testModule.testFunction.testParameter2",
                null
            );
        testParameter2.getAnnotations().add(
            new ConstantAnnotation(
                new DefaultBoolean(false)
            )
        );
        AnnotatedPythonParameter testParameter3 =
            createPythonParameter(
                "testParameter3",
                "testModule.testFunction.testParameter3",
                null
            );

        AnnotatedPythonFunction testFunction =
            createPythonFunction("testFunction");
        testFunction.getParameters().add(testParameter1);
        testFunction.getParameters().add(testParameter2);
        testFunction.getParameters().add(testParameter3);

        AnnotatedPythonModule testModule =
            createPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        OriginalDeclarationProcessor originalDeclarationProcessor =
            OriginalDeclarationProcessor.INSTANCE;
        testPackage.accept(originalDeclarationProcessor);

        // when
        AnnotatedPythonPackage modifiedPackage = processPackage(testPackage);

        // then
        AnnotatedPythonParameter expectedTestParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            "'string'",
            PythonParameterAssignment.CONSTANT
        );
        AnnotatedPythonParameter expectedTestParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            "false",
            PythonParameterAssignment.CONSTANT
        );
        AnnotatedPythonParameter expectedTestParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            null,
            PythonParameterAssignment.POSITION_OR_NAME
        );
        boolean testParameter1isContained = false;
        boolean testParameter2isContained = false;
        boolean testParameter3isContained = false;
        List<AnnotatedPythonParameter> actualParameters = modifiedPackage
            .getModules().get(0)
            .getFunctions().get(0)
            .getParameters();
        for (AnnotatedPythonParameter actualParameter : actualParameters) {
            if (parameterIsEqual(expectedTestParameter1, actualParameter)) {
                testParameter1isContained = true;
            } else if (parameterIsEqual(expectedTestParameter2, actualParameter)) {
                testParameter2isContained = true;
            } else if (parameterIsEqual(expectedTestParameter3, actualParameter)) {
                testParameter3isContained = true;
            }
        }
        Assertions.assertTrue(testParameter1isContained);
        Assertions.assertTrue(testParameter2isContained);
        Assertions.assertTrue(testParameter3isContained);
    }

    @Test
    void requiredAnnotationRemovesDefaultValuesAndAssignedByOfFunctionParameters() {
        // given
        AnnotatedPythonParameter testParameter1 =
            createPythonParameter(
                "testParameter1",
                "testModule.testFunction.testParameter1",
                "'oldDefaultValue'"
            );
        testParameter1.getAnnotations().add(
            RequiredAnnotation.INSTANCE
        );
        AnnotatedPythonParameter testParameter2 =
            createPythonParameter(
                "testParameter2",
                "testModule.testFunction.testParameter2",
                "'oldDefaultValue'"
            );
        testParameter2.getAnnotations().add(
            RequiredAnnotation.INSTANCE
        );
        AnnotatedPythonParameter testParameter3 =
            createPythonParameter(
                "testParameter3",
                "testModule.testFunction.testParameter3",
                "'unchanged'"
            );

        AnnotatedPythonFunction testFunction =
            createPythonFunction("testFunction");
        testFunction.getParameters().add(testParameter1);
        testFunction.getParameters().add(testParameter2);
        testFunction.getParameters().add(testParameter3);

        AnnotatedPythonModule testModule =
            createPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        OriginalDeclarationProcessor originalDeclarationProcessor =
            OriginalDeclarationProcessor.INSTANCE;
        testPackage.accept(originalDeclarationProcessor);

        // when
        AnnotatedPythonPackage modifiedPackage = processPackage(testPackage);

        // then
        AnnotatedPythonParameter expectedTestParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            null,
            PythonParameterAssignment.POSITION_OR_NAME
        );
        AnnotatedPythonParameter expectedTestParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            null,
            PythonParameterAssignment.POSITION_OR_NAME
        );
        AnnotatedPythonParameter expectedTestParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            "'unchanged'",
            PythonParameterAssignment.NAME_ONLY
        );
        boolean testParameter1isContained = false;
        boolean testParameter2isContained = false;
        boolean testParameter3isContained = false;
        List<AnnotatedPythonParameter> actualParameters = modifiedPackage
            .getModules().get(0)
            .getFunctions().get(0)
            .getParameters();
        for (AnnotatedPythonParameter actualParameter : actualParameters) {
            if (parameterIsEqual(expectedTestParameter1, actualParameter)) {
                testParameter1isContained = true;
            } else if (parameterIsEqual(expectedTestParameter2, actualParameter)) {
                testParameter2isContained = true;
            } else if (parameterIsEqual(expectedTestParameter3, actualParameter)) {
                testParameter3isContained = true;
            }
        }
        Assertions.assertTrue(testParameter1isContained);
        Assertions.assertTrue(testParameter2isContained);
        Assertions.assertTrue(testParameter3isContained);
    }

    @Test
    void constantAndOptionalAndRequiredAnnotationChangesDefaultValuesAndAssignedByOfFunctionParameters() {
        // given
        ParameterAnnotationProcessor parameterAnnotationProcessor =
            new ParameterAnnotationProcessor();

        AnnotatedPythonParameter testParameter1 =
            createPythonParameter(
                "testParameter1",
                "testModule.testFunction.testParameter1",
                null
            );
        testParameter1.getAnnotations().add(
            new ConstantAnnotation(
                new DefaultString("string")
            )
        );
        AnnotatedPythonParameter testParameter2 =
            createPythonParameter(
                "testParameter2",
                "testModule.testFunction.testParameter2",
                null
            );
        testParameter2.getAnnotations().add(
            new OptionalAnnotation(
                new DefaultString("string")
            )
        );
        AnnotatedPythonParameter testParameter3 =
            createPythonParameter(
                "testParameter3",
                "testModule.testFunction.testParameter3",
                "'toRemove'"
            );
        testParameter3.getAnnotations().add(
            RequiredAnnotation.INSTANCE
        );

        AnnotatedPythonFunction testFunction =
            createPythonFunction("testFunction");
        testFunction.getParameters().add(testParameter1);
        testFunction.getParameters().add(testParameter2);
        testFunction.getParameters().add(testParameter3);

        AnnotatedPythonModule testModule =
            createPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        AnnotatedPythonPackage modifiedPackage = processPackage(testPackage);

        // then
        AnnotatedPythonParameter expectedTestParameter1 = createPythonParameter(
            "testParameter1",
            "testModule.testFunction.testParameter1",
            "'string'",
            PythonParameterAssignment.CONSTANT
        );
        AnnotatedPythonParameter expectedTestParameter2 = createPythonParameter(
            "testParameter2",
            "testModule.testFunction.testParameter2",
            "'string'",
            PythonParameterAssignment.NAME_ONLY
        );
        AnnotatedPythonParameter expectedTestParameter3 = createPythonParameter(
            "testParameter3",
            "testModule.testFunction.testParameter3",
            null,
            PythonParameterAssignment.POSITION_OR_NAME
        );
        boolean testParameter1isContained = false;
        boolean testParameter2isContained = false;
        boolean testParameter3isContained = false;
        List<AnnotatedPythonParameter> actualParameters = modifiedPackage
            .getModules().get(0)
            .getFunctions().get(0)
            .getParameters();
        for (AnnotatedPythonParameter actualParameter : actualParameters) {
            if (parameterIsEqual(expectedTestParameter1, actualParameter)) {
                testParameter1isContained = true;
            } else if (parameterIsEqual(expectedTestParameter2, actualParameter)) {
                testParameter2isContained = true;
            } else if (parameterIsEqual(expectedTestParameter3, actualParameter)) {
                testParameter3isContained = true;
            }
        }
        Assertions.assertTrue(testParameter1isContained);
        Assertions.assertTrue(testParameter2isContained);
        Assertions.assertTrue(testParameter3isContained);
    }

    boolean parameterIsEqual(
        AnnotatedPythonParameter firstParameter,
        AnnotatedPythonParameter secondParameter
    ) {
        if (!firstParameter.getName().equals(secondParameter.getName())) {
            return false;
        }
        if (!firstParameter.getQualifiedName().equals(secondParameter.getQualifiedName())) {
            return false;
        }
        if (firstParameter.getDefaultValue() != null && secondParameter.getDefaultValue() != null) {
            if (!firstParameter.getDefaultValue().equals(secondParameter.getDefaultValue())) {
                return false;
            }
        } else if (
            firstParameter.getDefaultValue() == null
                && secondParameter.getDefaultValue() != null
        ) {
            return false;
        } else if (
            secondParameter.getDefaultValue() == null
                && firstParameter.getDefaultValue() != null
        ) {
            return false;
        }
        if (firstParameter.getAssignedBy() != secondParameter.getAssignedBy()) {
            return false;
        }
        if (firstParameter.isPublic() != secondParameter.isPublic()) {
            return false;
        }
        if (!firstParameter.getTypeInDocs().equals(secondParameter.getTypeInDocs())) {
            return false;
        }
        if (!firstParameter.getDescription().equals(secondParameter.getDescription())) {
            return false;
        }
        if (firstParameter.getAnnotations().size() != secondParameter.getAnnotations().size()) {
            return false;
        }
        if (!firstParameter.getAnnotations().containsAll(secondParameter.getAnnotations())) {
            return false;
        }
        return secondParameter.getAnnotations().containsAll(firstParameter.getAnnotations());
    }
}
