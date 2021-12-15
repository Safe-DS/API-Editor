package com.larsreimann.api_editor.server.annotationProcessing;

import com.larsreimann.api_editor.server.data.AnnotatedPythonClass;
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;
import com.larsreimann.api_editor.server.data.AnnotatedPythonModule;
import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import static com.larsreimann.api_editor.server.util.PackageDataFactoriesKt.*;

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
