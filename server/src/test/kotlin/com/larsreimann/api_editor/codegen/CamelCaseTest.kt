package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.PythonParameterAssignment
import de.unibonn.simpleml.SimpleMLStandaloneSetup
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class CamelCaseTest {

    @BeforeEach
    fun initSimpleML() {
        SimpleMLStandaloneSetup.doSetup()
    }

    @Test
    fun `should convert names to camel case`() {
        // given
        val testClass = AnnotatedPythonClass(
            "Test_Class",
            "testModule.Test_Class",
            listOf(),
            listOf(),
            listOf(
                AnnotatedPythonFunction(
                    "__init__",
                    "testModule.Test_Class.__init__",
                    listOf(),
                    listOf(
                        AnnotatedPythonParameter(
                            "test_parameter",
                            "testModule.Test_Class.__init__.test_parameter",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "",
                            "",
                            mutableListOf()
                        )
                    ),
                    emptyList(),
                    true,
                    "",
                    "",
                    mutableListOf()
                ),
                AnnotatedPythonFunction(
                    "test_function",
                    "testModule.Test_Class.test_function",
                    listOf(),
                    listOf(
                        AnnotatedPythonParameter(
                            "test_parameter",
                            "testModule.Test_Class.test_function.test_parameter",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "",
                            "",
                            mutableListOf()
                        )
                    ),
                    emptyList(),
                    true,
                    "",
                    "",
                    mutableListOf()
                ),
            ),
            true,
            "",
            "",
            mutableListOf()
        )

        // when
        val formattedClass = buildClassToString(testClass)

        // then
        val expectedFormattedClass: String =
            """
            |@PythonName("Test_Class")
            |class TestClass(@PythonName("test_parameter") testParameter: Any?) {
            |    @PythonName("test_parameter")
            |    attr testParameter: Any?
            |
            |    @PythonName("test_function")
            |    fun testFunction(@PythonName("test_parameter") testParameter: Any?)
            |}""".trimMargin()

        formattedClass shouldBe expectedFormattedClass
    }
}
