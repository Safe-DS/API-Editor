package com.larsreimann.api_editor.transformation

// import com.larsreimann.api_editor.model.Boundary
// import com.larsreimann.api_editor.model.BoundaryAnnotation
// import com.larsreimann.api_editor.model.ComparisonOperator
// import com.larsreimann.api_editor.model.PythonParameterAssignment
// import com.larsreimann.api_editor.mutable_model.MutablePythonClass
// import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
// import com.larsreimann.api_editor.mutable_model.MutablePythonModule
// import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
// import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
// import com.larsreimann.api_editor.mutable_model.convertPackage
// import io.kotest.matchers.collections.shouldBeEmpty
// import io.kotest.matchers.nulls.shouldNotBeNull
// import io.kotest.matchers.shouldBe
// import org.junit.jupiter.api.BeforeEach
// import org.junit.jupiter.api.Test

class PostprocessorTest {
//    private lateinit var implicitParameter: MutablePythonParameter
//    private lateinit var testParameter: MutablePythonParameter
//    private lateinit var testParameter: MutablePythonParameter
//    private lateinit var testParameter: MutablePythonParameter
//    private lateinit var testParameter: MutablePythonParameter
//    private lateinit var testParameter: MutablePythonParameter
//
//    private lateinit var testClass: MutablePythonClass
//    private lateinit var emptyTestModule: MutablePythonModule
//    private lateinit var testPackage: MutablePythonPackage
//
//    @BeforeEach
//    fun reset() {
//        implicitParameter = MutablePythonParameter(
//            name = "implicitParameter",
//            assignedBy = PythonParameterAssignment.IMPLICIT
//        )
//        testParameter = MutablePythonParameter(name = "testParameter")
//        testParameter = MutablePythonParameter(name = "testParameter")
//        testParameter = MutablePythonParameter(name = "testParameter")
//        testParameter = MutablePythonParameter(name = "testParameter")
//        testParameter = MutablePythonParameter(name = "testParameter")
//
//
//
//        testClass = MutablePythonClass(
//
//        )
//        emptyTestModule = MutablePythonModule("emptyTestModule")
//        testPackage = MutablePythonPackage(
//            distribution = "testPackage",
//            name = "testPackage",
//            version = "1.0.0",
//            modules = listOf(
//                emptyTestModule,
//                MutablePythonModule(
//                    name = "testModule",
//                    classes = listOf(),
//                    functions = listOf(
//                        MutablePythonFunction(
//                            name = "testFunction",
//                            parameters = listOf(testParameter)
//                        )
//                    )
//                )
//            )
//        )
//    }
//
//    @Test
//    fun `should remove empty modules`() {
//
//    }
//
//    @Test
//    fun `should create attributes for parameters of constructors`() {
//
//    }
//
//    @Test
//    fun `should reorder parameters`() {
//        val processedPackage = convertPackage(testPackage).accept(Postprocessor)
//        processedPackage.shouldNotBeNull()
//
//        processedPackage.
//
//        testParameter.boundary shouldBe Boundary(
//            isDiscrete = true,
//            lowerIntervalLimit = 0.0,
//            lowerLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS,
//            upperIntervalLimit = 1.0,
//            upperLimitType = ComparisonOperator.LESS_THAN_OR_EQUALS
//        )
//    }
}

/*
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
 */
