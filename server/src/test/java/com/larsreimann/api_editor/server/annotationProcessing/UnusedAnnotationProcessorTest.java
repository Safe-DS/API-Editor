package com.larsreimann.api_editor.server.annotationProcessing;

import com.larsreimann.api_editor.server.data.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import static com.larsreimann.api_editor.server.test.util.PackageDataFactoriesKt.*;

class UnusedAnnotationProcessorTest {
    @Test
    void shouldRemoveAnnotatedClass() {
        // given
        UnusedAnnotationProcessor unusedAnnotationProcessor =
            new UnusedAnnotationProcessor();

        AnnotatedPythonClass annotatedTestClass =
            createAnnotatedPythonClass("annotatedTestClass");
        annotatedTestClass.getAnnotations().add(UnusedAnnotation.INSTANCE);

        AnnotatedPythonClass testClass =
            createAnnotatedPythonClass("testClass");

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(unusedAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            unusedAnnotationProcessor.modifiedPackage;

        // then
        Assertions.assertTrue(
            modifiedPackage
                .getModules().get(0)
                .getClasses()
                .size() == 1
                &&
                modifiedPackage
                    .getModules().get(0)
                    .getClasses().get(0)
                    .getName()
                    .equals("testClass")
        );
    }

    @Test
    void shouldRemoveAnnotatedFunction() {
        // given
        UnusedAnnotationProcessor unusedAnnotationProcessor =
            new UnusedAnnotationProcessor();

        AnnotatedPythonFunction annotatedTestFunction =
            createAnnotatedPythonFunction("annotatedTestFunction");
        annotatedTestFunction.getAnnotations().add(UnusedAnnotation.INSTANCE);

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction("testFunction");

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getFunctions().add(testFunction);
        testModule.getFunctions().add(annotatedTestFunction);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(unusedAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            unusedAnnotationProcessor.modifiedPackage;

        // then
        Assertions.assertTrue(
            modifiedPackage
                .getModules().get(0)
                .getFunctions()
                .size() == 1
                &&
                modifiedPackage.getModules().get(0)
                    .getFunctions().get(0)
                    .getName()
                    .equals("testFunction")
        );
    }

    @Test
    void shouldRemoveMethod() {
        // given
        UnusedAnnotationProcessor unusedAnnotationProcessor =
            new UnusedAnnotationProcessor();

        AnnotatedPythonFunction annotatedTestMethod =
            createAnnotatedPythonFunction("annotatedTestMethod");
        annotatedTestMethod.getAnnotations().add(UnusedAnnotation.INSTANCE);

        AnnotatedPythonFunction testMethod =
            createAnnotatedPythonFunction("testMethod");

        AnnotatedPythonClass testClass =
            createAnnotatedPythonClass("testClass");
        testClass.getMethods().add(annotatedTestMethod);
        testClass.getMethods().add(testMethod);

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(unusedAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            unusedAnnotationProcessor.modifiedPackage;

        // then
        Assertions.assertTrue(
            modifiedPackage
                .getModules().get(0)
                .getClasses().get(0)
                .getMethods()
                .size() == 1
                &&
                modifiedPackage
                    .getModules().get(0)
                    .getClasses().get(0)
                    .getMethods().get(0)
                    .getName()
                    .equals("testMethod")
        );
    }
}
