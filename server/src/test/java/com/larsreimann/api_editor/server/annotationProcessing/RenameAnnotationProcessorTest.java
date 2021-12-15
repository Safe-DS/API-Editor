package com.larsreimann.api_editor.server.annotationProcessing;

import com.larsreimann.api_editor.model.AnnotatedPythonClass;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonModule;
import com.larsreimann.api_editor.model.AnnotatedPythonPackage;
import com.larsreimann.api_editor.model.AnnotatedPythonParameter;
import com.larsreimann.api_editor.model.RenameAnnotation;
import com.larsreimann.api_editor.transformation.RenameAnnotationProcessor;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonClass;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonFunction;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonModule;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonPackage;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonParameter;

class RenameAnnotationProcessorTest {
    @Test
    void shouldRenameClass() {
        // given
        RenameAnnotationProcessor renameAnnotationProcessor =
            new RenameAnnotationProcessor();

        AnnotatedPythonClass testClass =
            createAnnotatedPythonClass(
                "testClass",
                "testModule.testClass"
            );
        testClass.getAnnotations().add(
            new RenameAnnotation("renamedTestClass")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(renameAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            renameAnnotationProcessor.getModifiedPackage();

        // then
        AnnotatedPythonClass renamedClass = modifiedPackage
            .getModules().get(0)
            .getClasses().get(0);
        Assertions.assertEquals(
            "renamedTestClass",
            renamedClass.getName()
        );
        Assertions.assertEquals(
            "testModule.renamedTestClass",
            renamedClass.getQualifiedName()
        );
    }

    @Test
    void shouldRenameGlobalFunction() {
        // given
        RenameAnnotationProcessor renameAnnotationProcessor =
            new RenameAnnotationProcessor();

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction(
                "testFunction",
                "testModule.testFunction"
            );
        testFunction.getAnnotations().add(
            new RenameAnnotation("renamedTestFunction")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(renameAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            renameAnnotationProcessor.getModifiedPackage();

        // then
        AnnotatedPythonFunction renamedFunction = modifiedPackage
            .getModules().get(0)
            .getFunctions().get(0);
        Assertions.assertEquals(
            "renamedTestFunction",
            renamedFunction.getName()
        );
        Assertions.assertEquals(
            "testModule.renamedTestFunction",
            renamedFunction.getQualifiedName()
        );
    }

    @Test
    void shouldRenameClassMethod() {
        // given
        RenameAnnotationProcessor renameAnnotationProcessor =
            new RenameAnnotationProcessor();

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction(
                "testFunction",
                "testModule.testClass.testFunction"
            );
        testFunction.getAnnotations().add(
            new RenameAnnotation("renamedTestFunction")
        );

        ArrayList<AnnotatedPythonFunction> classMethods = new ArrayList<>();
        classMethods.add(testFunction);
        AnnotatedPythonClass testClass =
            createAnnotatedPythonClass(
                "testClass",
                "testModule.testClass",
                new ArrayList<>(),
                new ArrayList<>(),
                classMethods
            );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(renameAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            renameAnnotationProcessor.getModifiedPackage();

        // then
        AnnotatedPythonFunction renamedFunction = modifiedPackage
            .getModules().get(0)
            .getClasses().get(0)
            .getMethods().get(0);
        Assertions.assertEquals(
            "renamedTestFunction",
            renamedFunction.getName()
        );
        Assertions.assertEquals(
            "testModule.testClass.renamedTestFunction",
            renamedFunction.getQualifiedName()
        );
    }

    @Test
    void shouldRenameClassMethodAndClass() {
        // given
        RenameAnnotationProcessor renameAnnotationProcessor =
            new RenameAnnotationProcessor();

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction(
                "testFunction",
                "testModule.testClass.testFunction"
            );
        testFunction.getAnnotations().add(
            new RenameAnnotation("renamedTestFunction")
        );

        ArrayList<AnnotatedPythonFunction> classMethods = new ArrayList<>();
        classMethods.add(testFunction);
        AnnotatedPythonClass testClass =
            createAnnotatedPythonClass(
                "testClass",
                "testModule.testClass",
                new ArrayList<>(),
                new ArrayList<>(),
                classMethods
            );
        testClass.getAnnotations().add(
            new RenameAnnotation("renamedTestClass")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(renameAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            renameAnnotationProcessor.getModifiedPackage();

        // then
        AnnotatedPythonClass renamedClass = modifiedPackage
            .getModules().get(0)
            .getClasses().get(0);
        AnnotatedPythonFunction renamedFunction = renamedClass.getMethods().get(0);
        Assertions.assertEquals(
            "testModule.renamedTestClass.renamedTestFunction",
            renamedFunction.getQualifiedName()
        );
        Assertions.assertEquals(
            "testModule.renamedTestClass",
            renamedClass.getQualifiedName()
        );
    }

    @Test
    void shouldRenameClassMethodParameterAndClassMethodAndClass() {
        // given
        RenameAnnotationProcessor renameAnnotationProcessor =
            new RenameAnnotationProcessor();

        AnnotatedPythonParameter pythonParameter =
            createAnnotatedPythonParameter("testParameter");
        pythonParameter.getAnnotations().add(
            new RenameAnnotation("renamedTestParameter")
        );

        ArrayList<AnnotatedPythonParameter> pythonParameters =
            new ArrayList<>();
        pythonParameters.add(pythonParameter);

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction(
                "testFunction",
                "testModule.testClass.testFunction",
                new ArrayList<>(),
                pythonParameters
            );
        testFunction.getAnnotations().add(
            new RenameAnnotation("renamedTestFunction")
        );

        ArrayList<AnnotatedPythonFunction> classMethods = new ArrayList<>();
        classMethods.add(testFunction);
        AnnotatedPythonClass testClass =
            createAnnotatedPythonClass(
                "testClass",
                "testModule.testClass",
                new ArrayList<>(),
                new ArrayList<>(),
                classMethods
            );
        testClass.getAnnotations().add(
            new RenameAnnotation("renamedTestClass")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(renameAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            renameAnnotationProcessor.getModifiedPackage();

        // then
        AnnotatedPythonParameter renamedParameter = modifiedPackage
            .getModules().get(0)
            .getClasses().get(0).
            getMethods().get(0)
            .getParameters().get(0);
        Assertions.assertEquals(
            "renamedTestParameter",
            renamedParameter.getName()
        );
        Assertions.assertEquals(
            "testModule.renamedTestClass.renamedTestFunction.renamedTestParameter",
            renamedParameter.getQualifiedName()
        );
    }

    @Test
    void shouldRenameGlobalFunctionParameterAndGlobalFunction() {
        // given
        RenameAnnotationProcessor renameAnnotationProcessor =
            new RenameAnnotationProcessor();

        AnnotatedPythonParameter pythonParameter =
            createAnnotatedPythonParameter("testParameter");
        pythonParameter.getAnnotations().add(
            new RenameAnnotation("renamedTestParameter")
        );

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction(
                "testFunction",
                "testModule.testFunction"
            );
        testFunction.getParameters().add(pythonParameter);
        testFunction.getAnnotations().add(
            new RenameAnnotation("renamedTestFunction")
        );

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(renameAnnotationProcessor);
        AnnotatedPythonPackage modifiedPackage =
            renameAnnotationProcessor.getModifiedPackage();

        // then
        AnnotatedPythonParameter renamedParameter = modifiedPackage
            .getModules().get(0)
            .getFunctions().get(0)
            .getParameters().get(0);
        Assertions.assertEquals(
            "renamedTestParameter",
            renamedParameter.getName()
        );
        Assertions.assertEquals(
            "testModule.renamedTestFunction.renamedTestParameter",
            renamedParameter.getQualifiedName()
        );
    }
}
