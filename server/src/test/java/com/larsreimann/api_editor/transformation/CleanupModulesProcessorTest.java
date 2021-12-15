package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.AnnotatedPythonClass;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonModule;
import com.larsreimann.api_editor.model.AnnotatedPythonPackage;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonClass;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonFunction;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonModule;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createAnnotatedPythonPackage;

class CleanupModulesProcessorTest {
    @Test
    void cleanupModulesProcessorShouldRemoveEmptyModules() {
        // given
        CleanupModulesProcessor cleanupModulesProcessor =
            new CleanupModulesProcessor();

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(cleanupModulesProcessor);
        AnnotatedPythonPackage modifiedPackage =
            cleanupModulesProcessor.getModifiedPackage();

        // then
        Assertions.assertTrue(modifiedPackage.getModules().isEmpty());
    }

    @Test
    void shouldNotRemoveModulesWithClasses() {
        // given
        CleanupModulesProcessor cleanupModulesProcessor =
            new CleanupModulesProcessor();

        AnnotatedPythonClass testClass =
            createAnnotatedPythonClass("testClass");

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(cleanupModulesProcessor);
        AnnotatedPythonPackage modifiedPackage =
            cleanupModulesProcessor.getModifiedPackage();

        // then
        Assertions.assertEquals(1, modifiedPackage.getModules().size());
    }

    @Test
    void shouldNotRemoveModulesWithFunctions() {
        // given
        CleanupModulesProcessor cleanupModulesProcessor =
            new CleanupModulesProcessor();

        AnnotatedPythonFunction testFunction =
            createAnnotatedPythonFunction("testFunction");

        AnnotatedPythonModule testModule =
            createAnnotatedPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createAnnotatedPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        testPackage.accept(cleanupModulesProcessor);
        AnnotatedPythonPackage modifiedPackage =
            cleanupModulesProcessor.getModifiedPackage();

        // then
        Assertions.assertEquals(1, modifiedPackage.getModules().size());
    }
}
