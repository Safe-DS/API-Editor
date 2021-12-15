package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.AnnotatedPythonClass;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonModule;
import com.larsreimann.api_editor.model.AnnotatedPythonPackage;
import com.larsreimann.api_editor.model.UnusedAnnotation;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class UnusedAnnotationProcessorTest {
    @Test
    void shouldRemoveAnnotatedClass() {
        // given
        UnusedAnnotationProcessor unusedAnnotationProcessor =
            new UnusedAnnotationProcessor();

        AnnotatedPythonClass annotatedTestClass =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonClass("annotatedTestClass");
        annotatedTestClass.getAnnotations().add(UnusedAnnotation.INSTANCE);

        AnnotatedPythonClass testClass =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonClass("testClass");

        AnnotatedPythonModule testModule =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(unusedAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            unusedAnnotationProcessor.getModifiedPackage();

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
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonFunction("annotatedTestFunction");
        annotatedTestFunction.getAnnotations().add(UnusedAnnotation.INSTANCE);

        AnnotatedPythonFunction testFunction =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonFunction("testFunction");

        AnnotatedPythonModule testModule =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonModule("testModule");
        testModule.getFunctions().add(testFunction);
        testModule.getFunctions().add(annotatedTestFunction);

        AnnotatedPythonPackage testPackage =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(unusedAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            unusedAnnotationProcessor.getModifiedPackage();

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
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonFunction("annotatedTestMethod");
        annotatedTestMethod.getAnnotations().add(UnusedAnnotation.INSTANCE);

        AnnotatedPythonFunction testMethod =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonFunction("testMethod");

        AnnotatedPythonClass testClass =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonClass("testClass");
        testClass.getMethods().add(annotatedTestMethod);
        testClass.getMethods().add(testMethod);

        AnnotatedPythonModule testModule =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(unusedAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            unusedAnnotationProcessor.getModifiedPackage();

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

    @Test
    void shouldRemoveEmptyModule() {
        // given
        UnusedAnnotationProcessor unusedAnnotationProcessor =
            new UnusedAnnotationProcessor();

        AnnotatedPythonClass testClass =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonClass("testClass");
        testClass.getAnnotations().add(UnusedAnnotation.INSTANCE);

        AnnotatedPythonModule testModule =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(unusedAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            unusedAnnotationProcessor.getModifiedPackage();

        // then
        Assertions.assertTrue(
            modifiedPackage
                .getModules().isEmpty()
        );
    }
}
