package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.AnnotatedPythonClass;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonModule;
import com.larsreimann.api_editor.model.AnnotatedPythonPackage;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import static com.larsreimann.api_editor.server.RoutingKt.processPackage;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.*;

class CleanupModulesProcessorTest {
    @Test
    void cleanupModulesProcessorShouldRemoveEmptyModules() {
        // given
        AnnotatedPythonModule testModule =
            createPythonModule("testModule");

        AnnotatedPythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        AnnotatedPythonPackage modifiedPackage = processPackage(testPackage);

        // then
        Assertions.assertTrue(modifiedPackage.getModules().isEmpty());
    }

    @Test
    void shouldNotRemoveModulesWithClasses() {
        // given
        AnnotatedPythonClass testClass =
            createPythonClass("testClass");

        AnnotatedPythonModule testModule =
            createPythonModule("testModule");
        testModule.getClasses().add(testClass);

        AnnotatedPythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        AnnotatedPythonPackage modifiedPackage = processPackage(testPackage);

        // then
        Assertions.assertEquals(1, modifiedPackage.getModules().size());
    }

    @Test
    void shouldNotRemoveModulesWithFunctions() {
        // given
        AnnotatedPythonFunction testFunction =
            createPythonFunction("testFunction");

        AnnotatedPythonModule testModule =
            createPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        AnnotatedPythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        AnnotatedPythonPackage modifiedPackage = processPackage(testPackage);

        // then
        Assertions.assertEquals(1, modifiedPackage.getModules().size());
    }
}
