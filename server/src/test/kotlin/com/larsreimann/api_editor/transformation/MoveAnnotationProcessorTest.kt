package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.MoveAnnotation
import com.larsreimann.api_editor.util.createPythonAttribute
import com.larsreimann.api_editor.util.createPythonClass
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonPackage
import com.larsreimann.api_editor.util.createPythonParameter
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

internal class MoveAnnotationProcessorTest {
    @Test
    fun movedGlobalMethodExistsInNewModule() {
        // given
        val pythonParameter = createPythonParameter("testParameter")
        val testFunction = createPythonFunction("testFunction")
        testFunction.parameters.add(pythonParameter)
        testFunction.annotations.add(
            MoveAnnotation("newModule")
        )
        val testModule = createPythonModule("testModule")
        testModule.functions.add(testFunction)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val (_, _, _, modules) = processPackage(testPackage)

        // then
        var newModuleExists = false
        for ((name, _, _, _, functions) in modules) {
            if (name == "newModule") {
                newModuleExists = true
                Assertions.assertEquals(
                    "newModule.testFunction",
                    functions[0].qualifiedName
                )
                Assertions.assertEquals(
                    "newModule.testFunction.testParameter",
                    functions[0]
                        .parameters[0]
                        .qualifiedName
                )
            }
        }
        Assertions.assertTrue(newModuleExists)
    }

    @Test
    fun movedGlobalMethodIsRemovedFromOldModule() {
        // given
        val pythonParameter = createPythonParameter("testParameter")
        val testFunction = createPythonFunction("testFunction")
        testFunction.parameters.add(pythonParameter)
        testFunction.annotations.add(
            MoveAnnotation("newModule")
        )
        val testModule = createPythonModule("testModule")
        testModule.functions.add(testFunction)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val (_, _, _, modules) = processPackage(testPackage)

        // then
        for ((name, _, _, _, functions) in modules) {
            if (name == "testModule") {
                Assertions.assertTrue(functions.isEmpty())
            }
        }
    }

    @Test
    fun movedClassExistsInNewModule() {
        // given
        val pythonParameter = createPythonParameter("testParameter")
        val testFunction = createPythonFunction("testFunction")
        testFunction.parameters.add(pythonParameter)
        val testAttribute = createPythonAttribute("testAttribute")
        val testClass = createPythonClass("testClass")
        testClass.methods.add(testFunction)
        testClass.attributes.add(testAttribute)
        testClass.annotations.add(
            MoveAnnotation("newModule")
        )
        val testModule = createPythonModule("testModule")
        testModule.classes.add(testClass)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val (_, _, _, modules) = processPackage(testPackage)

        // then
        var newModuleExists = false
        for ((name, _, _, classes) in modules) {
            if (name == "newModule") {
                newModuleExists = true
                Assertions.assertEquals(
                    "newModule.testClass",
                    classes[0].qualifiedName
                )
                Assertions.assertEquals(
                    "newModule.testClass.testFunction",
                    classes[0]
                        .methods[0]
                        .qualifiedName
                )
                Assertions.assertEquals(
                    "newModule.testClass.testFunction.testParameter",
                    classes[0]
                        .methods[0]
                        .parameters[0]
                        .qualifiedName
                )
                Assertions.assertEquals(
                    "newModule.testClass.testAttribute",
                    classes[0]
                        .attributes[0]
                        .qualifiedName
                )
            }
        }
        Assertions.assertTrue(newModuleExists)
    }

    @Test
    fun movedClassIsRemovedFromOldModule() {
        // given
        val pythonParameter = createPythonParameter("testParameter")
        val testFunction = createPythonFunction("testFunction")
        testFunction.parameters.add(pythonParameter)
        val testClass = createPythonClass("testClass")
        testClass.methods.add(testFunction)
        testClass.annotations.add(
            MoveAnnotation("newModule")
        )
        val testModule = createPythonModule("testModule")
        testModule.classes.add(testClass)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)

        // when
        val (_, _, _, modules) = processPackage(testPackage)

        // then
        for ((name, _, _, classes) in modules) {
            if (name == "testModule") {
                Assertions.assertTrue(classes.isEmpty())
            }
        }
    }

    @Test
    fun movedClassExistsInExistingModule() {
        // given
        val testClass = createPythonClass("testClass")
        testClass.annotations.add(
            MoveAnnotation("existingModule")
        )
        val testModule = createPythonModule("testModule")
        testModule.classes.add(testClass)
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)
        val classInExistingModule = createPythonClass("existingClass")
        val existingModule = createPythonModule("existingModule")
        existingModule.classes.add(classInExistingModule)
        testPackage.modules.add(existingModule)

        // when
        val (_, _, _, modules) = processPackage(testPackage)

        // then
        var existingModuleStillExists = false
        for ((name, _, _, classes) in modules) {
            if (name == "existingModule") {
                existingModuleStillExists = true
                Assertions.assertEquals(2, classes.size)
            }
        }
        Assertions.assertTrue(existingModuleStillExists)
    }

    @Test
    fun movedGlobalMethodExistsInExistingModule() {
        // given
        val testFunction = createPythonFunction("testFunction")
        testFunction.annotations.add(
            MoveAnnotation("existingModule")
        )
        val testModule = createPythonModule("testModule")
        testModule.functions.add(testFunction)
        val existingModule = createPythonModule("existingModule")
        val testPackage = createPythonPackage("testPackage")
        testPackage.modules.add(testModule)
        testPackage.modules.add(existingModule)

        // when
        val (_, _, _, modules) = processPackage(testPackage)

        // then
        var existingModuleExists = false
        for ((name, _, _, _, functions) in modules) {
            if (name == "existingModule") {
                existingModuleExists = true
                Assertions.assertEquals(1, functions.size)
            }
        }
        Assertions.assertTrue(existingModuleExists)
    }
}
