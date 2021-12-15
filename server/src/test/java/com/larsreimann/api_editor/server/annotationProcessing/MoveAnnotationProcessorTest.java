package com.larsreimann.api_editor.server.annotationProcessing;

import com.larsreimann.api_editor.server.data.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import static com.larsreimann.api_editor.server.util.PackageDataFactoriesKt.*;

class MoveAnnotationProcessorTest {
    @Test
    void movedGlobalMethodExistsInNewModule() {
        // given
        MoveAnnotationProcessor moveAnnotationProcessor =
            new MoveAnnotationProcessor();

        AnnotatedPythonParameter pythonParameter =
            createAnnotatedPythonParameter("testParameter");

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction("testFunction");
        testFunction.getParameters().add(pythonParameter);
        testFunction.getAnnotations().add(
            new MoveAnnotation("newModule")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(moveAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            moveAnnotationProcessor.getModifiedPackage();

        // then
        boolean newModuleExists = false;
        for (AnnotatedPythonModule pythonModule : modifiedPackage.getModules()) {
            if (pythonModule.getName().equals("newModule")) {
                newModuleExists = true;
                Assertions.assertEquals(
                    "newModule.testFunction",
                    pythonModule.getFunctions().get(0).getQualifiedName()
                );
                Assertions.assertEquals(
                    "newModule.testFunction.testParameter",
                    pythonModule
                        .getFunctions().get(0)
                        .getParameters().get(0)
                        .getQualifiedName()
                );
            }
        }
        Assertions.assertTrue(newModuleExists);
    }

    @Test
    void movedGlobalMethodIsRemovedFromOldModule() {
        // given
        MoveAnnotationProcessor moveAnnotationProcessor =
            new MoveAnnotationProcessor();

        AnnotatedPythonParameter pythonParameter =
            createAnnotatedPythonParameter("testParameter");

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction("testFunction");
        testFunction.getParameters().add(pythonParameter);
        testFunction.getAnnotations().add(
            new MoveAnnotation("newModule")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(moveAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            moveAnnotationProcessor.getModifiedPackage();

        // then
        for (AnnotatedPythonModule pythonModule : modifiedPackage.getModules()) {
            if (pythonModule.getName().equals("testModule")) {
                Assertions.assertTrue(pythonModule.getFunctions().isEmpty());
            }
        }
    }

    @Test
    void movedClassExistsInNewModule() {
        // given
        MoveAnnotationProcessor moveAnnotationProcessor =
            new MoveAnnotationProcessor();

        AnnotatedPythonParameter pythonParameter =
            createAnnotatedPythonParameter("testParameter");

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction("testFunction");
        testFunction.getParameters().add(pythonParameter);

        AnnotatedPythonClass testClass =
            createAnnotatedPythonClass("testClass");
        testClass.getMethods().add(testFunction);
        testClass.getAnnotations().add(
            new MoveAnnotation("newModule")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(moveAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            moveAnnotationProcessor.getModifiedPackage();

        // then
        boolean newModuleExists = false;
        for (AnnotatedPythonModule pythonModule : modifiedPackage.getModules()) {
            if (pythonModule.getName().equals("newModule")) {
                newModuleExists = true;
                Assertions.assertEquals(
                    "newModule.testClass",
                    pythonModule.getClasses().get(0).getQualifiedName()
                );
                Assertions.assertEquals(
                    "newModule.testClass.testFunction",
                    pythonModule
                        .getClasses().get(0)
                        .getMethods().get(0)
                        .getQualifiedName()
                );
                Assertions.assertEquals(
                    "newModule.testClass.testFunction.testParameter",
                    pythonModule
                        .getClasses().get(0)
                        .getMethods().get(0)
                        .getParameters().get(0)
                        .getQualifiedName()
                );
            }
        }
        Assertions.assertTrue(newModuleExists);
    }

    @Test
    void movedClassIsRemovedFromOldModule() {
        // given
        MoveAnnotationProcessor moveAnnotationProcessor =
            new MoveAnnotationProcessor();

        AnnotatedPythonParameter pythonParameter =
            createAnnotatedPythonParameter("testParameter");

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction("testFunction");
        testFunction.getParameters().add(pythonParameter);

        AnnotatedPythonClass testClass =
            createAnnotatedPythonClass("testClass");
        testClass.getMethods().add(testFunction);
        testClass.getAnnotations().add(
            new MoveAnnotation("newModule")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(moveAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            moveAnnotationProcessor.getModifiedPackage();

        // then
        for (AnnotatedPythonModule pythonModule : modifiedPackage.getModules()) {
            if (pythonModule.getName().equals("testModule")) {
                Assertions.assertTrue(pythonModule.getClasses().isEmpty());
            }
        }
    }

    @Test
    void movedClassExistsInExistingModule() {
        // given
        MoveAnnotationProcessor moveAnnotationProcessor =
            new MoveAnnotationProcessor();

        AnnotatedPythonClass testClass =
            createAnnotatedPythonClass("testClass");
        testClass.getAnnotations().add(
            new MoveAnnotation("existingModule")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        AnnotatedPythonClass classInExistingModule =
            createAnnotatedPythonClass("existingClass");
        AnnotatedPythonModule existingModule =
            createAnnotatedPythonModule("existingModule");
        existingModule.getClasses().add(classInExistingModule);

        testPackage.getModules().add(existingModule);

        // when
        testPackage.accept(moveAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            moveAnnotationProcessor.getModifiedPackage();

        // then
        boolean existingModuleStillExists = false;
        for (AnnotatedPythonModule pythonModule : modifiedPackage.getModules()) {
            if (pythonModule.getName().equals("existingModule")) {
                existingModuleStillExists = true;
                Assertions.assertEquals(2, pythonModule.getClasses().size());
            }
        }
        Assertions.assertTrue(existingModuleStillExists);
    }

    @Test
    void movedGlobalMethodExistsInExistingModule() {
        // given
        MoveAnnotationProcessor moveAnnotationProcessor =
            new MoveAnnotationProcessor();

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction("testFunction");
        testFunction.getAnnotations().add(
            new MoveAnnotation("existingModule")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonModule existingModule =
            createAnnotatedPythonModule("existingModule");

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);
        testPackage.getModules().add(existingModule);

        // when
        testPackage.accept(moveAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            moveAnnotationProcessor.getModifiedPackage();

        // then
        boolean existingModuleExists = false;
        for (AnnotatedPythonModule pythonModule : modifiedPackage.getModules()) {
            if (pythonModule.getName().equals("existingModule")) {
                existingModuleExists = true;
                Assertions.assertEquals(1, pythonModule.getFunctions().size());
            }
        }
        Assertions.assertTrue(existingModuleExists);
    }
}
