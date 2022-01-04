package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.MutablePythonResult
import com.larsreimann.api_editor.mutable_model.OriginalPythonFunction
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class PythonCodeGeneratorTest {
    @Test
    fun buildModuleContentReturnsFormattedModuleContent() {
        // given
        val testClass = MutablePythonClass(
            name = "test-class",
            methods = listOf(
                MutablePythonFunction(
                    name = "test-class-function",
                    parameters = listOf(
                        MutablePythonParameter(
                            name = "self",
                            defaultValue = null,
                            assignedBy = PythonParameterAssignment.IMPLICIT
                        ),
                        MutablePythonParameter(
                            name = "only-param",
                            defaultValue = "'defaultValue'",
                            assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                        )
                    )
                )
            )
        )
        val testModule = MutablePythonModule(
            name = "test-module",
            classes = mutableListOf(testClass),
            functions = listOf(
                MutablePythonFunction(
                    name = "function_module",
                    parameters = listOf(
                        MutablePythonParameter(
                            "param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                        ),
                        MutablePythonParameter(
                            "param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                        ),
                        MutablePythonParameter(
                            "param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                        )
                    ),
                    results = listOf(
                        MutablePythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum",
                        )
                    ),
                ),
                MutablePythonFunction(
                    name = "test-function",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "test-parameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum",
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum",
                        )
                    )
                )
            )
        )

        // when
        val moduleContent = testModule.toPythonCode()

        //then
        val expectedModuleContent: String = """
            |import test-module
            |
            |class test-class:
            |    def test-class-function(self, *, only-param='defaultValue'):
            |        test-module.test-class.test-class-function(only-param)
            |
            |def function_module(param1, param2, param3):
            |    test-module.function_module(param1=param1, param2=param2, param3=param3)
            |
            |def test-function(*, test-parameter=42):
            |    test-module.test-function(test-parameter=test-parameter)
            """.trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithNoClassesReturnsFormattedModuleContent() {
        // given
        val testModule = MutablePythonModule(
            name = "test-module",
            functions = mutableListOf(
                MutablePythonFunction(
                    name = "function_module",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum",
                        ),
                        MutablePythonParameter(
                            "param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum"
                        ),
                        MutablePythonParameter(
                            "param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum"
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum"
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "test-function",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "test-parameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum"
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum"
                        )
                    )
                )
            )
        )

        // when
        val moduleContent = testModule.toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import test-module
            |
            |def function_module(param1, param2, param3):
            |    test-module.function_module(param1=param1, param2=param2, param3=param3)
            |
            |def test-function(*, test-parameter=42):
            |    test-module.test-function(test-parameter=test-parameter)
            """.trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithNoFunctionsReturnsFormattedModuleContent() {
        // given
        val testClass = MutablePythonClass(name = "test-class")
        val testModule = MutablePythonModule(
            name = "test-module",
            imports = mutableListOf(
                PythonImport(
                    "test-import1",
                    "test-alias"
                )
            ),
            fromImports = mutableListOf(
                PythonFromImport(
                    "test-from-import1",
                    "test-declaration1",
                    null
                )
            ),
            classes = mutableListOf(testClass)
        )

        // when
        val moduleContent = testModule.toPythonCode()

        //then
        val expectedModuleContent: String =
            """
            |import test-module
            |
            |class test-class:
            """.trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithEmptyModuleReturnsEmptyString() {
        // given
        val testModule = MutablePythonModule(
            name = "test-module",
            imports = mutableListOf(
                PythonImport(
                    "test-import1",
                    "test-alias"
                )
            ),
            fromImports = mutableListOf(
                PythonFromImport(
                    "test-from-import1",
                    "test-declaration1",
                    null
                )
            ),
            classes = mutableListOf(),
            enums = mutableListOf(),
            functions = mutableListOf()
        )

        // when
        val moduleContent = testModule.toPythonCode()

        //then
        val expectedModuleContent = ""
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithBoundaryAnnotationReturnsFormattedModuleContent1() {
        // given
        val testParameter1 = MutablePythonParameter(
            name = "param1",
            defaultValue = "5",
            assignedBy = PythonParameterAssignment.NAME_ONLY,
            isPublic = true,
            typeInDocs = "str",
            description = "Lorem ipsum",
        )
        testParameter1.boundary = Boundary(
            true,
            2.0,
            ComparisonOperator.LESS_THAN,
            10.0,
            ComparisonOperator.LESS_THAN_OR_EQUALS
        )
        val testParameter2 = MutablePythonParameter(
            "param2",
            "5",
            PythonParameterAssignment.NAME_ONLY,
            true,
            "str",
            "Lorem ipsum",
        )
        testParameter2.boundary = Boundary(
            false,
            5.0,
            ComparisonOperator.LESS_THAN_OR_EQUALS,
            0.0,
            ComparisonOperator.UNRESTRICTED
        )
        val testParameter3 = MutablePythonParameter(
            "param3",
            "5",
            PythonParameterAssignment.NAME_ONLY,
            true,
            "str",
            "Lorem ipsum",
        )
        testParameter3.boundary = Boundary(
            false,
            0.0,
            ComparisonOperator.UNRESTRICTED,
            10.0,
            ComparisonOperator.LESS_THAN
        )
        val testFunction = MutablePythonFunction(
            "function_module",
            mutableListOf("test-decorator"),
            mutableListOf(testParameter1, testParameter2, testParameter3),
            mutableListOf(),
            true,
            "Lorem ipsum",
            "Lorem ipsum",
        )
        val testModule = MutablePythonModule(
            name = "test-module",
            functions = mutableListOf(testFunction),
        )

        // when
        val moduleContent = testModule.toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import test-module
            |
            |def function_module(*, param1=5, param2=5, param3=5):
            |    if not (isinstance(param1, int) or (isinstance(param1, float) and param1.is_integer())):
            |        raise ValueError('param1 needs to be an integer, but {} was assigned.'.format(param1))
            |    if not 2.0 < param1 <= 10.0:
            |        raise ValueError('Valid values of param1 must be in (2.0, 10.0], but {} was assigned.'.format(param1))
            |    if not 5.0 <= param2:
            |        raise ValueError('Valid values of param2 must be greater than or equal to 5.0, but {} was assigned.'.format(param2))
            |    if not param3 < 10.0:
            |        raise ValueError('Valid values of param3 must be less than 10.0, but {} was assigned.'.format(param3))
            |    test-module.function_module(param1=param1, param2=param2, param3=param3)
            """.trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun buildModuleContentWithBoundaryAnnotationReturnsFormattedModuleContent2() {
        // given
        val testParameter = MutablePythonParameter(
            "param1",
            "5",
            PythonParameterAssignment.NAME_ONLY,
            true,
            "str",
            "Lorem ipsum",
        )
        testParameter.boundary = Boundary(
            false,
            2.0,
            ComparisonOperator.LESS_THAN_OR_EQUALS,
            0.0,
            ComparisonOperator.UNRESTRICTED
        )
        val testFunction = MutablePythonFunction(
            name = "function_module",
            parameters = listOf(testParameter),
        )
        val testModule = MutablePythonModule(
            name = "test-module",
            functions = listOf(testFunction),
        )

        // when
        val moduleContent = testModule.toPythonCode()

        // then
        val expectedModuleContent: String =
            """
            |import test-module
            |
            |def function_module(*, param1=5):
            |    if not 2.0 <= param1:
            |        raise ValueError('Valid values of param1 must be greater than or equal to 2.0, but {} was assigned.'.format(param1))
            |    test-module.function_module(param1=param1)
            """.trimMargin()
        Assertions.assertEquals(expectedModuleContent, moduleContent)
    }

    @Test
    fun `should create valid code for empty classes`() {
        val testClass = MutablePythonClass("TestClass")

        testClass.toPythonCode() shouldBe """
            |class TestClass:
            |    pass
        """.trimMargin()
    }

    @Test
    fun buildClassReturnsFormattedClassWithOneFunction() {
        // given
        val testClass = MutablePythonClass(
            name = "test-class",
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "__init__",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description",
                        ),
                        MutablePythonParameter(
                            "only-param",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "str",
                            "description",
                        )
                    )
                )
            )
        )

        // when
        val formattedClass = testClass.toPythonCode()

        // then
        val expectedFormattedClass: String =
            """
            |class test-class:
            |    def __init__(self, *, only-param='defaultValue'):
            |        test-module.test-class.__init__(only-param)""".trimMargin()
        Assertions.assertEquals(expectedFormattedClass, formattedClass)
    }

    @Test
    fun buildClassReturnsFormattedClassWithTwoFunctions() {
        // given
        val testClass = MutablePythonClass(
            name = "test-class",
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "test-class-function1",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description",
                        ),
                        MutablePythonParameter(
                            "only-param",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description",
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "test-class-function2",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description",
                        ),
                        MutablePythonParameter(
                            "only-param",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description",
                        )
                    )
                )
            )
        )

        // when
        val formattedClass = testClass.toPythonCode()

        // then
        val expectedFormattedClass: String =
            """
            |class test-class:
            |    def test-class-function1(self, only-param):
            |        test-module.test-class.test-class-function1(only-param)
            |
            |    def test-class-function2(self, only-param):
            |        test-module.test-class.test-class-function2(only-param)""".trimMargin()
        Assertions.assertEquals(expectedFormattedClass, formattedClass)
    }

    @Test
    fun buildClassReturnsFormattedClassBasedOnOriginalDeclaration() {
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "self",
                    null,
                    PythonParameterAssignment.IMPLICIT,
                    true,
                    "typeInDocs",
                    "description",
                ),
                MutablePythonParameter(
                    "second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description"
                )
            )
        )
        val testClass = MutablePythonClass(
            name = "test-class",
            methods = mutableListOf(testFunction)
        )

        // when
        val formattedClass = testClass.toPythonCode()

        // then
        val expectedFormattedClass: String =
            """
            |class test-class:
            |    def test-function(self, second-param, third-param):
            |        test-module.test-class.test-function(second-param, third-param=third-param)""".trimMargin()
        Assertions.assertEquals(expectedFormattedClass, formattedClass)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithNoParameters() {
        // given
        val testFunction = MutablePythonFunction(name = "test-function")

        // when
        val formattedFunction = testFunction.toPythonCode()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function():
            |    test-module.test-function()""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOnlyParameter() {
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "only-param",
                    "13",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "float",
                    "description",
                )
            )
        )

        // when
        val formattedFunction = testFunction.toPythonCode()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(*, only-param=13):
            |    test-module.test-function(only-param)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOrNameParameter() {
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "only-param",
                    "False",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "bool",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = testFunction.toPythonCode()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(*, only-param=False):
            |    test-module.test-function(only-param)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithNameOnlyParameter() {
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "only-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = testFunction.toPythonCode()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(only-param):
            |    test-module.test-function(only-param=only-param)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameParameter() {
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = testFunction.toPythonCode()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(first-param, second-param):
            |    test-module.test-function(first-param, second-param)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameAndNameOnlyParameter() {
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = testFunction.toPythonCode()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(first-param, second-param, third-param):
            |    test-module.test-function(first-param, second-param, third-param=third-param)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndNameOnlyParameter() {
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "second-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = testFunction.toPythonCode()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(first-param, second-param):
            |    test-module.test-function(first-param, second-param=second-param)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOrNameAndNameOnlyParameter() {
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = listOf(
                MutablePythonParameter(
                    name = "first-param",
                    originalParameter = OriginalPythonParameter(name = "first-param")
                ),
                MutablePythonParameter(
                    name = "second-param",
                    originalParameter = OriginalPythonParameter(
                        name = "second-param",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    )
                )
            ),
            originalFunction = OriginalPythonFunction(
                qualifiedName = "test-module.test-function",
                parameters = listOf(
                    OriginalPythonParameter(
                        name = "first-param"
                    ),
                    OriginalPythonParameter(
                        name = "second-param",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    )
                )
            )
        )

        // when
        val formattedFunction = testFunction.toPythonCode()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(first-param, second-param):
            |    test-module.test-function(first-param, second-param=second-param)
            """.trimMargin()

        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionsReturnsFormattedFunctionBasedOnOriginalDeclaration() {
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY
                ),
                MutablePythonParameter(
                    "second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME
                ),
                MutablePythonParameter(
                    "third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY
                )
            )
        )

        // when
        val formattedFunction = testFunction.toPythonCode()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function(first-param, second-param, third-param):
            |    test-module.test-function(first-param, second-param, third-param=third-param)""".trimMargin()
        Assertions.assertEquals(expectedFormattedFunction, formattedFunction)
    }
}
