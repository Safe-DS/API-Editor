package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.SerializablePythonClass;
import com.larsreimann.api_editor.model.SerializablePythonFunction;
import com.larsreimann.api_editor.model.SerializablePythonModule;
import com.larsreimann.api_editor.model.SerializablePythonPackage;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import static com.larsreimann.api_editor.transformation.TransformationPlanKt.processPackage;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPythonClass;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPythonFunction;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPythonModule;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPythonPackage;

class CleanupModulesProcessorTest {
    @Test
    void cleanupModulesProcessorShouldRemoveEmptyModules() {
        // given
        SerializablePythonModule testModule =
            createPythonModule("testModule");

        SerializablePythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        SerializablePythonPackage modifiedPackage = processPackage(testPackage);

        // then
        Assertions.assertTrue(modifiedPackage.getModules().isEmpty());
    }

    @Test
    void shouldNotRemoveModulesWithClasses() {
        // given
        SerializablePythonClass testClass =
            createPythonClass("testClass");

        SerializablePythonModule testModule =
            createPythonModule("testModule");
        testModule.getClasses().add(testClass);

        SerializablePythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        SerializablePythonPackage modifiedPackage = processPackage(testPackage);

        // then
        Assertions.assertEquals(1, modifiedPackage.getModules().size());
    }

    @Test
    void shouldNotRemoveModulesWithFunctions() {
        // given
        SerializablePythonFunction testFunction =
            createPythonFunction("testFunction");

        SerializablePythonModule testModule =
            createPythonModule("testModule");
        testModule.getFunctions().add(testFunction);

        SerializablePythonPackage testPackage =
            createPythonPackage("testPackage");
        testPackage.getModules().add(testModule);

        // when
        SerializablePythonPackage modifiedPackage = processPackage(testPackage);

        // then
        Assertions.assertEquals(1, modifiedPackage.getModules().size());
    }
}
