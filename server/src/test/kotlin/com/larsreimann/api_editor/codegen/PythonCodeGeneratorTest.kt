package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonConstructor
import com.larsreimann.api_editor.mutable_model.PythonEnum
import com.larsreimann.api_editor.mutable_model.PythonEnumInstance
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonResult
import com.larsreimann.api_editor.mutable_model.OriginalPythonClass
import com.larsreimann.api_editor.mutable_model.OriginalPythonFunction
import com.larsreimann.api_editor.mutable_model.OriginalPythonParameter
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PythonCodeGeneratorTest {
    @Test
    fun buildModuleContentReturnsFormattedModuleContent() { // TODO
        // given
        val testClass = PythonClass(
            name = "test-class",
            methods = listOf(
                PythonFunction(
                    name = "test-class-function",
                    parameters = listOf(
                        PythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT,
                            originalParameter = OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT,
                            )
                        ),
                        PythonParameter(
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
        val testModule = PythonModule(
            name = "test-module",
            classes = mutableListOf(testClass),
            functions = listOf(
                PythonFunction(
                    name = "function_module",
                    parameters = listOf(
                        PythonParameter(
                            name = "param1",
                            originalParameter = OriginalPythonParameter(
                                name = "param1",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            )
                        ),
                        PythonParameter(
                            name = "param2",
                            originalParameter = OriginalPythonParameter(
                                name = "param2",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            )
                        ),
                        PythonParameter(
                            name = "param3",
                            originalParameter = OriginalPythonParameter(
                                name = "param3",
                                assignedBy = PythonParameterAssignment.NAME_ONLY,
                            )
                        )
                    ),
                    results = listOf(
                        PythonResult(
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
                PythonFunction(
                    name = "test-function",
                    parameters = mutableListOf(
                        PythonParameter(
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
                        PythonResult(
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

        // then
        val expectedModuleContent: String =
            """
            |import test-module
            |
            |class test-class:
            |    def test-class-function(self, *, only-param='defaultValue'):
            |        self.instance.test-class-function(only-param)
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
        val testModule = PythonModule(
            name = "test-module",
            functions = mutableListOf(
                PythonFunction(
                    name = "function_module",
                    parameters = mutableListOf(
                        PythonParameter(
                            name = "param1",
                            originalParameter = OriginalPythonParameter(
                                name = "param1",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            )
                        ),
                        PythonParameter(
                            name = "param2",
                            originalParameter = OriginalPythonParameter(
                                name = "param2",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            )
                        ),
                        PythonParameter(
                            name = "param3",
                            originalParameter = OriginalPythonParameter(
                                name = "param3",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            )
                        )
                    ),
                    results = mutableListOf(
                        PythonResult(
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
                PythonFunction(
                    name = "test-function",
                    parameters = mutableListOf(
                        PythonParameter(
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
                        PythonResult(
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
        val testClass = PythonClass(
            name = "test-class",
            constructor = PythonConstructor(
                callToOriginalAPI = OriginalPythonFunction(qualifiedName = "test-class")
            ),
            originalClass = OriginalPythonClass("test-module.test-class")
        )
        val testModule = PythonModule(
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

        // then
        val expectedModuleContent: String =
            """
            |import test-module
            |
            |class test-class:
            |    def __init__():
            |        self.instance = test-class()
            |
            """.trimMargin()

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun buildModuleContentWithEmptyModuleReturnsEmptyString() { // TODO
        // given
        val testModule = PythonModule(
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

        // then
        val expectedModuleContent = ""

        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun buildModuleContentWithBoundaryAnnotationReturnsFormattedModuleContent1() { // TODO
        // given
        val testParameter1 = PythonParameter(
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
        val testParameter2 = PythonParameter(
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
        val testParameter3 = PythonParameter(
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
        val testFunction = PythonFunction(
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
        val testModule = PythonModule(
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
        val testParameter = PythonParameter(
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
        val testFunction = PythonFunction(
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
        val testModule = PythonModule(
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
        val testClass = PythonClass(
            name = "TestClass",
            constructor = PythonConstructor(
                callToOriginalAPI = OriginalPythonFunction(
                    qualifiedName = "TestClass"
                )
            )
        )

        testClass.toPythonCode() shouldBe """
            |class TestClass:
            |    def __init__():
            |        self.instance = TestClass()
        """.trimMargin()
    }

    @Test
    fun buildClassReturnsFormattedClassWithOneFunction() { // TODO
        // given
        val testClass = PythonClass(
            name = "test-class",
            constructor = PythonConstructor(
                parameters = mutableListOf(
                    PythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT,
                        originalParameter = OriginalPythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT
                        )
                    ),
                    PythonParameter(
                        name = "only-param",
                        defaultValue = "'defaultValue'",
                        assignedBy = PythonParameterAssignment.NAME_ONLY,
                        originalParameter = OriginalPythonParameter(
                            name = "only-param",
                            assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                        )
                    )
                ),
                callToOriginalAPI = OriginalPythonFunction(
                    qualifiedName = "test-module.test-class",
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
            |        self.instance = test-module.test-class(only-param)
            """.trimMargin()
        formattedClass shouldBe expectedFormattedClass
    }

    @Test
    fun buildClassReturnsFormattedClassWithTwoFunctions() { // TODO
        // given
        val testClass = PythonClass(
            name = "test-class",
            methods = mutableListOf(
                PythonFunction(
                    name = "test-class-function1",
                    parameters = mutableListOf(
                        PythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT,
                            originalParameter = OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT
                            )
                        ),
                        PythonParameter(
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
                PythonFunction(
                    name = "test-class-function2",
                    parameters = mutableListOf(
                        PythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT,
                            originalParameter = OriginalPythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT
                            )
                        ),
                        PythonParameter(
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
            |        self.instance.test-class-function1(only-param)
            |
            |    def test-class-function2(self, only-param):
            |        self.instance.test-class-function2(only-param)""".trimMargin()

        formattedClass shouldBe expectedFormattedClass
    }

    @Test
    fun buildClassReturnsFormattedClassBasedOnOriginalDeclaration() { // TODO
        // given
        val testFunction = PythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                PythonParameter(
                    name = "self",
                    assignedBy = PythonParameterAssignment.IMPLICIT,
                    originalParameter = OriginalPythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    )
                ),
                PythonParameter(
                    name = "second-param",
                    originalParameter = OriginalPythonParameter(name = "second-param")
                ),
                PythonParameter(
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
        val testClass = PythonClass(
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
            |        self.instance.test-function(second-param, third-param=third-param)""".trimMargin()
        formattedClass shouldBe expectedFormattedClass
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithNoParameters() { // TODO
        // given
        val testFunction = PythonFunction(
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
        val testFunction = PythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                PythonParameter(
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
        val testFunction = PythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                PythonParameter(
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
        val testFunction = PythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                PythonParameter(
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
        val testFunction = PythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                PythonParameter(
                    name = "first-param",
                    originalParameter = OriginalPythonParameter(name = "first-param")
                ),
                PythonParameter(
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
        val testFunction = PythonFunction(
            name = "test-function",
            parameters = listOf(
                PythonParameter(
                    name = "first-param",
                    originalParameter = OriginalPythonParameter(name = "first-param")
                ),
                PythonParameter(
                    name = "second-param",
                    originalParameter = OriginalPythonParameter(name = "second-param")
                ),
                PythonParameter(
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
        val testFunction = PythonFunction(
            name = "test-function",
            parameters = listOf(
                PythonParameter(
                    name = "first-param",
                    originalParameter = OriginalPythonParameter(name = "first-param")
                ),
                PythonParameter(
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
        val testFunction = PythonFunction(
            name = "test-function",
            parameters = listOf(
                PythonParameter(
                    name = "first-param",
                    originalParameter = OriginalPythonParameter(name = "first-param")
                ),
                PythonParameter(
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
        val testFunction = PythonFunction(
            name = "test-function",
            parameters = mutableListOf(
                PythonParameter(
                    name = "first-param",
                    originalParameter = OriginalPythonParameter(name = "first-param")
                ),
                PythonParameter(
                    name = "second-param",
                    originalParameter = OriginalPythonParameter(name = "second-param")
                ),
                PythonParameter(
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
    fun buildClassReturnsFormattedClassWithStaticMethodDecorator() {
        // given
        val testClass = PythonClass(
            name = "test-class",
            methods = listOf(
                PythonFunction(
                    name = "test-class-function1",
                    decorators = mutableListOf("staticmethod"),
                    parameters = listOf(
                        PythonParameter(
                            name = "only-param",
                            originalParameter = OriginalPythonParameter(name = "only-param")
                        )
                    ),
                    originalFunction = OriginalPythonFunction(
                        qualifiedName = "test-module.test-class.test-class-function1",
                        parameters = listOf(
                            OriginalPythonParameter(name = "only-param")
                        )
                    )
                )
            )
        )

        // when
        val formattedClass: String = testClass.toPythonCode()

        // then
        val expectedFormattedClass: String =
            """
           |class test-class:
           |    @staticmethod
           |    def test-class-function1(only-param):
           |        test-module.test-class.test-class-function1(only-param)""".trimMargin()

        formattedClass shouldBe expectedFormattedClass
    }

    @Nested
    inner class ModuleToPythonCode {

        @Test
        fun `should import Enum if the module contains enums`() {
            val testModule = PythonModule(
                name = "testModule",
                enums = listOf(
                    PythonEnum(name = "TestEnum")
                )
            )

            testModule.toPythonCode() shouldBe """
                |from enum import Enum
                |
                |class TestEnum(Enum):
                |    pass
                |
            """.trimMargin()
        }

        @Test
        fun `should not import Enum if the module does not contain enums`() {
            val testModule = PythonModule(name = "testModule")

            testModule.toPythonCode() shouldBe ""
        }
    }

    @Nested
    inner class FunctionToPythonCode {

        @Test
        fun `should access value of enum parameters`() {
            val testFunction = PythonFunction(
                name = "testFunction",
                parameters = listOf(
                    PythonParameter(
                        name = "testParameter",
                        assignedBy = PythonParameterAssignment.ENUM,
                        originalParameter = OriginalPythonParameter(name = "testParameter")
                    )
                ),
                originalFunction = OriginalPythonFunction(
                    qualifiedName = "testModule.testFunction",
                    parameters = listOf(
                        OriginalPythonParameter(name = "testParameter")
                    )
                )
            )

            testFunction.toPythonCode() shouldBe """
                |def testFunction(testParameter):
                |    testModule.testFunction(testParameter.value)
            """.trimMargin()
        }

        @Test
        fun `should access attribute of parameter objects`() {
            val testFunction = PythonFunction(
                name = "testFunction",
                parameters = listOf(
                    PythonParameter(
                        name = "testGroup",
                        assignedBy = PythonParameterAssignment.GROUP,
                        groupedParametersOldToNewName = mutableMapOf(
                            "oldParameter1" to "newParameter1",
                            "oldParameter2" to "newParameter2"
                        )
                    )
                ),
                originalFunction = OriginalPythonFunction(
                    qualifiedName = "testModule.testFunction",
                    parameters = listOf(
                        OriginalPythonParameter(
                            name = "oldParameter1",
                            assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                        ),
                        OriginalPythonParameter(
                            name = "oldParameter2",
                            assignedBy = PythonParameterAssignment.NAME_ONLY
                        )
                    )
                )
            )

            testFunction.toPythonCode() shouldBe """
                |def testFunction(testGroup):
                |    testModule.testFunction(testGroup.newParameter1, oldParameter2=testGroup.newParameter2)
            """.trimMargin()
        }
    }

    @Nested
    inner class EnumToPythonCode {

        @Test
        fun `should create valid Python code for enums without instances`() {
            val testEnum = PythonEnum(name = "TestEnum")

            testEnum.toPythonCode() shouldBe """
                |class TestEnum(Enum):
                |    pass
            """.trimMargin()
        }

        @Test
        fun `should create valid Python code for enums with instances`() {
            val testEnum = PythonEnum(
                name = "TestEnum",
                instances = listOf(
                    PythonEnumInstance(
                        name = "TestEnumInstance1",
                        value = "inst1"
                    ),
                    PythonEnumInstance(
                        name = "TestEnumInstance2",
                        value = "inst2"
                    )
                )
            )

            testEnum.toPythonCode() shouldBe """
                |class TestEnum(Enum):
                |    TestEnumInstance1 = "inst1",
                |    TestEnumInstance2 = "inst2"
            """.trimMargin()
        }
    }
}
