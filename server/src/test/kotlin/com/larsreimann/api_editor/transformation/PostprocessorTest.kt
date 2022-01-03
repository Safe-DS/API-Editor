package com.larsreimann.api_editor.transformation

//import com.larsreimann.api_editor.model.Boundary
//import com.larsreimann.api_editor.model.BoundaryAnnotation
//import com.larsreimann.api_editor.model.ComparisonOperator
//import com.larsreimann.api_editor.model.PythonParameterAssignment
//import com.larsreimann.api_editor.mutable_model.MutablePythonClass
//import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
//import com.larsreimann.api_editor.mutable_model.MutablePythonModule
//import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
//import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
//import com.larsreimann.api_editor.mutable_model.convertPackage
//import io.kotest.matchers.collections.shouldBeEmpty
//import io.kotest.matchers.nulls.shouldNotBeNull
//import io.kotest.matchers.shouldBe
//import org.junit.jupiter.api.BeforeEach
//import org.junit.jupiter.api.Test

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
