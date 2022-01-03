package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.*;

public class BoundaryAnnotationProcessorTest {
    @Test
    void boundaryAnnotationAddsBoundaryToFunctionParameter1() {
        // given
        AnnotatedPythonParameter testParameter1 =
            createPythonParameter(
                "testParameter1",
                "testModule.testFunction.testParameter1",
                null
            );
        testParameter1.getAnnotations().add(
            new BoundaryAnnotation(
                true,
                2,
                ComparisonOperator.LESS_THAN,
                10,
                ComparisonOperator.LESS_THAN
            )
        );

        AnnotatedPythonFunction testFunction =
            createPythonFunction("testFunction");
        testFunction.getParameters().add(testParameter1);

        AnnotatedPythonModule testModule =
            createPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        BoundaryAnnotationProcessor boundaryAnnotationProcessor =
            new BoundaryAnnotationProcessor();
        AnnotatedPythonPackage modifiedPackage = testPackage.accept(boundaryAnnotationProcessor);

        // then
        assert modifiedPackage != null;
        AnnotatedPythonParameter modifiedParameter = modifiedPackage
            .getModules().get(0)
            .getFunctions().get(0)
            .getParameters().get(0);
        Boundary addedBoundary = modifiedParameter.getBoundary();
        Assertions.assertNotNull(addedBoundary);
        boolean expectedIsDiscrete = true;
        double expectedLowerIntervalLimit = 2;
        double expectedUpperIntervalLimit = 10;
        ComparisonOperator expectedUpperLimitType = ComparisonOperator.LESS_THAN;
        ComparisonOperator expectedLowerLimitType = ComparisonOperator.LESS_THAN;
        Assertions.assertEquals(expectedIsDiscrete, addedBoundary.isDiscrete());
        Assertions.assertEquals(expectedLowerIntervalLimit, addedBoundary.getLowerIntervalLimit());
        Assertions.assertEquals(expectedUpperIntervalLimit, addedBoundary.getUpperIntervalLimit());
        Assertions.assertEquals(expectedLowerLimitType, addedBoundary.getLowerLimitType());
        Assertions.assertEquals(expectedUpperLimitType, addedBoundary.getUpperLimitType());
    }

    @Test
    void boundaryAnnotationAddsBoundaryToFunctionParameter2() {
        // given
        AnnotatedPythonParameter testParameter1 =
            createPythonParameter(
                "testParameter1",
                "testModule.testFunction.testParameter1",
                null
            );
        testParameter1.getAnnotations().add(
            new BoundaryAnnotation(
                false,
                2,
                ComparisonOperator.LESS_THAN_OR_EQUALS,
                10,
                ComparisonOperator.LESS_THAN_OR_EQUALS
            )
        );

        AnnotatedPythonFunction testFunction =
            createPythonFunction("testFunction");
        testFunction.getParameters().add(testParameter1);

        AnnotatedPythonModule testModule =
            createPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        BoundaryAnnotationProcessor boundaryAnnotationProcessor =
            new BoundaryAnnotationProcessor();
        AnnotatedPythonPackage modifiedPackage = testPackage.accept(boundaryAnnotationProcessor);

        // then
        assert modifiedPackage != null;
        AnnotatedPythonParameter modifiedParameter = modifiedPackage
            .getModules().get(0)
            .getFunctions().get(0)
            .getParameters().get(0);
        Boundary addedBoundary = modifiedParameter.getBoundary();
        Assertions.assertNotNull(addedBoundary);
        boolean expectedIsDiscrete = false;
        double expectedLowerIntervalLimit = 2;
        double expectedUpperIntervalLimit = 10;
        ComparisonOperator expectedUpperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS;
        ComparisonOperator expectedLowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS;
        Assertions.assertEquals(expectedIsDiscrete, addedBoundary.isDiscrete());
        Assertions.assertEquals(expectedLowerIntervalLimit, addedBoundary.getLowerIntervalLimit());
        Assertions.assertEquals(expectedUpperIntervalLimit, addedBoundary.getUpperIntervalLimit());
        Assertions.assertEquals(expectedLowerLimitType, addedBoundary.getLowerLimitType());
        Assertions.assertEquals(expectedUpperLimitType, addedBoundary.getUpperLimitType());
    }

    @Test
    void boundaryAnnotationAddsBoundaryToAttribute() {
        // given
        AnnotatedPythonAttribute testAttribute =
            createPythonAttribute(
                "testAttribute",
                "testModule.testClass.testAttribute",
                null
            );
        testAttribute.getAnnotations().add(
            new BoundaryAnnotation(
                true,
                0,
                ComparisonOperator.UNRESTRICTED,
                0,
                ComparisonOperator.UNRESTRICTED
            )
        );

        AnnotatedPythonClass testClass =
            createPythonClass("testClass");
        testClass.getAttributes().add(testAttribute);

        AnnotatedPythonModule testModule =
            createPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        BoundaryAnnotationProcessor boundaryAnnotationProcessor =
            new BoundaryAnnotationProcessor();
        AnnotatedPythonPackage modifiedPackage = testPackage.accept(boundaryAnnotationProcessor);

        // then
        assert modifiedPackage != null;
        AnnotatedPythonAttribute modifiedAttribute = modifiedPackage
            .getModules().get(0)
            .getClasses().get(0)
            .getAttributes().get(0);
        Boundary addedBoundary = modifiedAttribute.getBoundary();
        Assertions.assertNotNull(addedBoundary);
        boolean expectedIsDiscrete = true;
        ComparisonOperator expectedUpperLimitType = ComparisonOperator.UNRESTRICTED;
        ComparisonOperator expectedLowerLimitType = ComparisonOperator.UNRESTRICTED;
        Assertions.assertEquals(expectedIsDiscrete, addedBoundary.isDiscrete());
        Assertions.assertEquals(expectedLowerLimitType, addedBoundary.getLowerLimitType());
        Assertions.assertEquals(expectedUpperLimitType, addedBoundary.getUpperLimitType());
    }
}
