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
import com.larsreimann.api_editor.mutable_model.OriginalPythonClass
import com.larsreimann.api_editor.mutable_model.OriginalPythonFunction
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test

class PythonCodeGeneratorTest {
    @Test
    fun buildModuleContentReturnsFormattedModuleContent() { // TODO
        // given
        val testClass = MutablePythonClass(
            name = "test-class",
            methods = listOf(
                MutablePythonFunction(
                    name = "test-class-function",
                    parameters = listOf(
                        MutablePythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT,
                            originalParameter = OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT,
                            )
                        ),
                        MutablePythonParameter(
                            name = "only-param",
                            defaultValue = "'defaultValue'",
                            assignedBy = PythonParameterAssignment.NAME_ONLY,
                            originalParameter = OriginalPythonParameter(name = "only-param")
                        )
                    ),
                    originalFunction = OriginalPythonFunction(
                        qualifiedName = "test-module.test-class.test-class-function",
                        parameters = listOf(
                            OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT,
                            ),
                            OriginalPythonParameter(name = "only-param")
                        )
                    )
                )
            ),
            originalClass = OriginalPythonClass(qualifiedName = "test-module.test-class")
        )
        val testModule = MutablePythonModule(
            name = "test-module",
            classes = mutableListOf(testClass),
            functions = listOf(
                MutablePythonFunction(
                    name = "function_module",
                    parameters = listOf(
                        MutablePythonParameter(
                            name = "param1",
                            originalParameter = OriginalPythonParameter(
                                name = "param1",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            )
                        ),
                        MutablePythonParameter(
                            name = "param2",
                            originalParameter = OriginalPythonParameter(
                                name = "param2",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            )
                        ),
                        MutablePythonParameter(
                            name = "param3",
                            originalParameter = OriginalPythonParameter(
                                name = "param3",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            )
                        )
                    ),
                    results = listOf(
                        MutablePythonResult(
                            name = "test-result",
                            type = "str"
                        )
                    ),
                    originalFunction = OriginalPythonFunction(
                        qualifiedName = "test-module.function_module",
                        parameters = listOf(
                            OriginalPythonParameter(
                                name = "param1",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            ),
                            OriginalPythonParameter(
                                name = "param2",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            ),
                            OriginalPythonParameter(
                                name = "param3",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            )
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "test-function",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            name = "test-parameter",
                            defaultValue = "42",
                            assignedBy = PythonParameterAssignment.NAME_ONLY,
                            originalParameter = OriginalPythonParameter(
                                name = "test-parameter",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            )
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "test-result",
                            "str",
                            "str"
                        )
                    ),
                    originalFunction = OriginalPythonFunction(
                        qualifiedName = "test-module.test-function",
                        parameters = listOf(
                            OriginalPythonParameter(
                                name = "test-parameter",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            )
                        )
                    )
                )
            )
        )

        // when
        val moduleContent = testModule.toPythonCode()

        //then
        val expectedModuleContent: String =
            """
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
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun buildModuleContentWithNoClassesReturnsFormattedModuleContent() { // TODO
        // given
        val testModule = MutablePythonModule(
            name = "test-module",
            functions = mutableListOf(
                MutablePythonFunction(
                    name = "function_module",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            name = "param1",
                            originalParameter = OriginalPythonParameter(
                                name = "param1",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            )
                        ),
                        MutablePythonParameter(
                            name = "param2",
                            originalParameter = OriginalPythonParameter(
                                name = "param2",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            )
                        ),
                        MutablePythonParameter(
                            name = "param3",
                            originalParameter = OriginalPythonParameter(
                                name = "param3",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            )
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum"
                        )
                    ),
                    originalFunction = OriginalPythonFunction(
                        qualifiedName = "test-module.function_module",
                        parameters = listOf(
                            OriginalPythonParameter(
                                name = "param1",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            ),
                            OriginalPythonParameter(
                                name = "param2",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            ),
                            OriginalPythonParameter(
                                name = "param3",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            )
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
                            originalParameter = OriginalPythonParameter(
                                name = "test-parameter",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            )
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum"
                        )
                    ),
                    originalFunction = OriginalPythonFunction(
                        qualifiedName = "test-module.test-function",
                        parameters = listOf(
                            OriginalPythonParameter(
                                name = "test-parameter",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            )
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
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun buildModuleContentWithNoFunctionsReturnsFormattedModuleContent() { // TODO
        // given
        val testClass = MutablePythonClass(
            name = "test-class",
            originalClass = OriginalPythonClass("test-module.test-class")
        )
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
            |    pass
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun buildModuleContentWithEmptyModuleReturnsEmptyString() { // TODO
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

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun buildModuleContentWithBoundaryAnnotationReturnsFormattedModuleContent1() { // TODO
        // given
        val testParameter1 = MutablePythonParameter(
            name = "param1",
            defaultValue = "5",
            assignedBy = PythonParameterAssignment.NAME_ONLY,
            originalParameter = OriginalPythonParameter(
                name = "param1",
                assignedBy = PythonParameterAssignment.NAME_ONLY
            )
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
            originalParameter = OriginalPythonParameter(
                name = "param2",
                assignedBy = PythonParameterAssignment.NAME_ONLY
            )
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
            originalParameter = OriginalPythonParameter(
                name = "param3",
                assignedBy = PythonParameterAssignment.NAME_ONLY
            )
        )
        testParameter3.boundary = Boundary(
            false,
            0.0,
            ComparisonOperator.UNRESTRICTED,
            10.0,
            ComparisonOperator.LESS_THAN
        )
        val testFunction = MutablePythonFunction(
            name = "function_module",
            parameters = mutableListOf(testParameter1, testParameter2, testParameter3),
            originalFunction = OriginalPythonFunction(
                qualifiedName = "test-module.function_module",
                parameters = listOf(
                    OriginalPythonParameter(
                        name = "param1",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    ),
                    OriginalPythonParameter(
                        name = "param2",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    ),
                    OriginalPythonParameter(
                        name = "param3",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    )
                )
            )
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
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun buildModuleContentWithBoundaryAnnotationReturnsFormattedModuleContent2() { // TODO
        // given
        val testParameter = MutablePythonParameter(
            name = "param1",
            defaultValue = "5",
            assignedBy = PythonParameterAssignment.NAME_ONLY,
            originalParameter = OriginalPythonParameter(
                name = "param1",
                assignedBy = PythonParameterAssignment.NAME_ONLY
            )
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
            originalFunction = OriginalPythonFunction(
                qualifiedName = "test-module.function_module",
                parameters = listOf(
                    OriginalPythonParameter(
                        name = "param1",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    )
                )
            )
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
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun `should create valid code for empty classes`() { // TODO
        val testClass = MutablePythonClass("TestClass")

        testClass.toPythonCode() shouldBe """
            |class TestClass:
            |    pass
        """.trimMargin()
    }

    @Test
    fun buildClassReturnsFormattedClassWithOneFunction() { // TODO
        // given
        val testClass = MutablePythonClass(
            name = "test-class",
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "__init__",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT,
                            originalParameter = OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT
                            )
                        ),
                        MutablePythonParameter(
                            name = "only-param",
                            defaultValue = "'defaultValue'",
                            assignedBy = PythonParameterAssignment.NAME_ONLY,
                            originalParameter = OriginalPythonParameter(
                                name = "only-param",
                                assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                            )
                        )
                    ),
                    originalFunction = OriginalPythonFunction(
                        qualifiedName = "test-module.test-class.__init__",
                        parameters = listOf(
                            OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT
                            ),
                            OriginalPythonParameter(
                                name = "only-param",
                                assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                            )
                        )
                    )
                )
            ),
            originalClass = OriginalPythonClass(qualifiedName = "test-module.test-class")
        )

        // when
        val formattedClass = testClass.toPythonCode()

        // then
        val expectedFormattedClass: String =
            """
            |class test-class:
            |    def __init__(self, *, only-param='defaultValue'):
            |        test-module.test-class.__init__(only-param)""".trimMargin()
        formattedClass shouldBe expectedFormattedClass
    }

    @Test
    fun buildClassReturnsFormattedClassWithTwoFunctions() { // TODO
        // given
        val testClass = MutablePythonClass(
            name = "test-class",
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "test-class-function1",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT,
                            originalParameter = OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT
                            )
                        ),
                        MutablePythonParameter(
                            name = "only-param",
                            assignedBy = PythonParameterAssignment.POSITION_OR_NAME,
                            originalParameter = OriginalPythonParameter(name = "only-param")
                        )
                    ),
                    originalFunction = OriginalPythonFunction(
                        qualifiedName = "test-module.test-class.test-class-function1",
                        parameters = listOf(
                            OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT
                            ),
                            OriginalPythonParameter(name = "only-param")
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "test-class-function2",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT,
                            originalParameter = OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT
                            )
                        ),
                        MutablePythonParameter(
                            name = "only-param",
                            assignedBy = PythonParameterAssignment.POSITION_OR_NAME,
                            originalParameter = OriginalPythonParameter(name = "only-param")
                        )
                    ),
                    originalFunction = OriginalPythonFunction(
                        qualifiedName = "test-module.test-class.test-class-function2",
                        parameters = listOf(
                            OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT
                            ),
                            OriginalPythonParameter(name = "only-param")
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

        formattedClass shouldBe expectedFormattedClass
    }

    @Test
    fun buildClassReturnsFormattedClassBasedOnOriginalDeclaration() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    name = "self",
                    assignedBy = PythonParameterAssignment.IMPLICIT,
                    originalParameter = OriginalPythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    )
                ),
                MutablePythonParameter(
                    name = "second-param",
                    originalParameter = OriginalPythonParameter(name = "second-param")
                ),
                MutablePythonParameter(
                    name = "third-param",
                    originalParameter = OriginalPythonParameter(
                        name = "third-param",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    )
                )
            ),
            originalFunction = OriginalPythonFunction(
                qualifiedName = "test-module.test-class.test-function",
                parameters = listOf(
                    OriginalPythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    OriginalPythonParameter(name = "second-param"),
                    OriginalPythonParameter(
                        name = "third-param",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    )
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
        formattedClass shouldBe expectedFormattedClass
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithNoParameters() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            originalFunction = OriginalPythonFunction(qualifiedName = "test-module.test-function")
        )

        // when
        val formattedFunction = testFunction.toPythonCode()

        // then
        val expectedFormattedFunction: String =
            """
            |def test-function():
            |    test-module.test-function()""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOnlyParameter() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    name = "only-param",
                    defaultValue = "13",
                    assignedBy = PythonParameterAssignment.NAME_ONLY,
                    originalParameter = OriginalPythonParameter(name = "only-param")
                )
            ),
            originalFunction = OriginalPythonFunction(
                qualifiedName = "test-module.test-function",
                parameters = listOf(
                    OriginalPythonParameter(name = "only-param")
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
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOrNameParameter() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    name = "only-param",
                    defaultValue = "False",
                    assignedBy = PythonParameterAssignment.NAME_ONLY,
                    originalParameter = OriginalPythonParameter("only-param")
                )
            ),
            originalFunction = OriginalPythonFunction(
                qualifiedName = "test-module.test-function",
                parameters = listOf(
                    OriginalPythonParameter("only-param")
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
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithNameOnlyParameter() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    name = "only-param",
                    originalParameter = OriginalPythonParameter(
                        name = "only-param",
                        PythonParameterAssignment.NAME_ONLY
                    )
                )
            ),
            originalFunction = OriginalPythonFunction(
                qualifiedName = "test-module.test-function",
                parameters = listOf(
                    OriginalPythonParameter(
                        name = "only-param",
                        PythonParameterAssignment.NAME_ONLY
                    )
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
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameParameter() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    name = "first-param",
                    originalParameter = OriginalPythonParameter(name = "first-param")
                ),
                MutablePythonParameter(
                    name = "second-param",
                    originalParameter = OriginalPythonParameter(name = "second-param")
                )
            ),
            originalFunction = OriginalPythonFunction(
                qualifiedName = "test-module.test-function",
                parameters = listOf(
                    OriginalPythonParameter(name = "first-param"),
                    OriginalPythonParameter(name = "second-param")
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
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameAndNameOnlyParameter() { // TODO
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
                    originalParameter = OriginalPythonParameter(name = "second-param")
                ),
                MutablePythonParameter(
                    name = "third-param",
                    originalParameter = OriginalPythonParameter(
                        name = "third-param",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    )
                )
            ),
            originalFunction = OriginalPythonFunction(
                qualifiedName = "test-module.test-function",
                parameters = listOf(
                    OriginalPythonParameter(name = "first-param"),
                    OriginalPythonParameter(name = "second-param"),
                    OriginalPythonParameter(
                        name = "third-param",
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
            |def test-function(first-param, second-param, third-param):
            |    test-module.test-function(first-param, second-param, third-param=third-param)""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndNameOnlyParameter() { // TODO
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
                    OriginalPythonParameter(name = "first-param"),
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
            |    test-module.test-function(first-param, second-param=second-param)""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOrNameAndNameOnlyParameter() { // TODO
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
    fun buildFunctionsReturnsFormattedFunctionBasedOnOriginalDeclaration() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                MutablePythonParameter(
                    name = "first-param",
                    originalParameter = OriginalPythonParameter(name = "first-param")
                ),
                MutablePythonParameter(
                    name = "second-param",
                    originalParameter = OriginalPythonParameter(name = "second-param")
                ),
                MutablePythonParameter(
                    name = "third-param",
                    originalParameter = OriginalPythonParameter(
                        name = "third-param",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
                    )
                )
            ),
            originalFunction = OriginalPythonFunction(
                qualifiedName = "test-module.test-function",
                parameters = listOf(
                    OriginalPythonParameter(name = "first-param"),
                    OriginalPythonParameter(name = "second-param"),
                    OriginalPythonParameter(
                        name = "third-param",
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
            |def test-function(first-param, second-param, third-param):
            |    test-module.test-function(first-param, second-param, third-param=third-param)""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }
}
