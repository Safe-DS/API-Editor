package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonParameter
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
        val testClass = SerializablePythonClass(
            "Test_Class",
            "testModule.Test_Class",
            listOf(),
            listOf(),
            mutableListOf(
                SerializablePythonFunction(
                    "__init__",
                    "testModule.Test_Class.__init__",
                    listOf(),
                    mutableListOf(
                        SerializablePythonParameter(
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
                    mutableListOf(),
                    true,
                    "",
                    "",
                    mutableListOf()
                ),
                SerializablePythonFunction(
                    "test_function",
                    "testModule.Test_Class.test_function",
                    listOf(),
                    mutableListOf(
                        SerializablePythonParameter(
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
                    mutableListOf(),
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
