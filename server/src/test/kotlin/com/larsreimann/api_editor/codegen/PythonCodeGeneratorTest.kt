package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.ComparisonOperator
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.RenameAnnotation
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class PythonCodeGeneratorTest {
    @Test
    fun buildModuleContentReturnsFormattedModuleContent() {
        // given
        val testClass = SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"),
            mutableListOf(
                SerializablePythonFunction(
                    "test-class-function",
                    "test-module.test-class.test-class-function",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "self",
                            "test-module.test-class.test-class-function.self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "only-param",
                            "test-module.test-class.test-class-function.only-param",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ), mutableListOf(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                )
            ),
            true,
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )
        val testModule = SerializablePythonModule(
            "test-module", emptyList(), emptyList(),
            mutableListOf(
                testClass
            ),
            mutableListOf(
                SerializablePythonFunction(
                    "function_module",
                    "test-module.function_module",
                    listOf("test-decorator"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "param1",
                            "test-module.function_module.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "param2",
                            "test-module.function_module.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "param3",
                            "test-module.function_module.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    mutableListOf(
                        SerializablePythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum", mutableListOf()
                ),
                SerializablePythonFunction(
                    "test-function",
                    "test-module.test-function",
                    listOf("test-decorator"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "test-parameter",
                            "test-module.test-function.test-parameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    mutableListOf(
                        SerializablePythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum", mutableListOf()
                )
            ), mutableListOf()
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
        val testModule = SerializablePythonModule(
            "test-module", emptyList(), emptyList(), mutableListOf(),
            mutableListOf(
                SerializablePythonFunction(
                    "function_module",
                    "test-module.function_module",
                    listOf("test-decorator"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "param1",
                            "test-module.function_module_1.param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "param2",
                            "test-module.function_module_1.param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "param3",
                            "test-module.function_module_1.param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    mutableListOf(
                        SerializablePythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum", mutableListOf()
                ),
                SerializablePythonFunction(
                    "test-function",
                    "test-module.test-function",
                    listOf("test-decorator"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "test-parameter",
                            "test-module.test-function.test-parameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            true,
                            "int",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    mutableListOf(
                        SerializablePythonResult(
                            "test-result",
                            "str",
                            "str",
                            "Lorem ipsum", mutableListOf()
                        )
                    ),
                    true,
                    "Lorem ipsum",
                    "Lorem ipsum", mutableListOf()
                )
            ), mutableListOf()
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
        val testClass = SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"), mutableListOf(),
            true,
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )
        val testModule = SerializablePythonModule(
            "test-module",
            listOf(
                PythonImport(
                    "test-import1",
                    "test-alias"
                )
            ),
            listOf(
                PythonFromImport(
                    "test-from-import1",
                    "test-declaration1",
                    null
                )
            ),
            mutableListOf(
                testClass
            ), mutableListOf(), mutableListOf()
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
        val testModule = SerializablePythonModule(
            "test-module",
            listOf(
                PythonImport(
                    "test-import1",
                    "test-alias"
                )
            ),
            listOf(
                PythonFromImport(
                    "test-from-import1",
                    "test-declaration1",
                    null
                )
            ),
            mutableListOf(),
            mutableListOf(),
            mutableListOf()
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
        val testParameter1 = SerializablePythonParameter(
            "param1",
            "test-module.function_module.param1",
            "5",
            PythonParameterAssignment.NAME_ONLY,
            true,
            "str",
            "Lorem ipsum",
            mutableListOf()
        )
        testParameter1.boundary = Boundary(
            true,
            2.0,
            ComparisonOperator.LESS_THAN,
            10.0,
            ComparisonOperator.LESS_THAN_OR_EQUALS
        )
        val testParameter2 = SerializablePythonParameter(
            "param2",
            "test-module.function_module.param2",
            "5",
            PythonParameterAssignment.NAME_ONLY,
            true,
            "str",
            "Lorem ipsum",
            mutableListOf()
        )
        testParameter2.boundary = Boundary(
            false,
            5.0,
            ComparisonOperator.LESS_THAN_OR_EQUALS,
            0.0,
            ComparisonOperator.UNRESTRICTED
        )
        val testParameter3 = SerializablePythonParameter(
            "param3",
            "test-module.function_module.param3",
            "5",
            PythonParameterAssignment.NAME_ONLY,
            true,
            "str",
            "Lorem ipsum",
            mutableListOf()
        )
        testParameter3.boundary = Boundary(
            false,
            0.0,
            ComparisonOperator.UNRESTRICTED,
            10.0,
            ComparisonOperator.LESS_THAN
        )
        val testFunction = SerializablePythonFunction(
            "function_module",
            "test-module.function_module",
            listOf("test-decorator"),
            mutableListOf(testParameter1, testParameter2, testParameter3),
            mutableListOf(),
            true,
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )
        val testModule = SerializablePythonModule(
            "test-module", emptyList(), emptyList(), mutableListOf(),
            mutableListOf(testFunction), mutableListOf()
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
        val testParameter = SerializablePythonParameter(
            "param1",
            "test-module.function_module.param1",
            "5",
            PythonParameterAssignment.NAME_ONLY,
            true,
            "str",
            "Lorem ipsum",
            mutableListOf()
        )
        testParameter.boundary = Boundary(
            false,
            2.0,
            ComparisonOperator.LESS_THAN_OR_EQUALS,
            0.0,
            ComparisonOperator.UNRESTRICTED
        )
        val testFunction = SerializablePythonFunction(
            "function_module",
            "test-module.function_module",
            listOf("test-decorator"),
            mutableListOf(testParameter),
            mutableListOf(),
            true,
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
        )
        val testModule = SerializablePythonModule(
            "test-module", emptyList(), emptyList(), mutableListOf(),
            mutableListOf(testFunction), mutableListOf()
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
        val testClass = SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"),
            mutableListOf(
                SerializablePythonFunction(
                    "__init__",
                    "test-module.test-class.__init__",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "self",
                            "test-module.test-class.__init__.self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "only-param",
                            "test-module.test-class.__init__.only-param",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "str",
                            "description",
                            mutableListOf()
                        )
                    ), mutableListOf(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                )
            ),
            true,
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
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
        val testClass = SerializablePythonClass(
            "test-class",
            "test-module.test-class",
            listOf("test-decorator"),
            listOf("test-superclass"),
            mutableListOf(
                SerializablePythonFunction(
                    "test-class-function1",
                    "test-module.test-class.test-class-function1",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "self",
                            "test-module.test-class.test-class-function1.self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "only-param",
                            "test-module.test-class.test-class-function1.only-param",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ), mutableListOf(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                ),
                SerializablePythonFunction(
                    "test-class-function2",
                    "test-module.test-class.test-class-function2",
                    listOf("decorators"),
                    mutableListOf(
                        SerializablePythonParameter(
                            "self",
                            "test-module.test-class.test-class-function2.self",
                            null,
                            PythonParameterAssignment.IMPLICIT,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        ),
                        SerializablePythonParameter(
                            "only-param",
                            "test-module.test-class.test-class-function2.only-param",
                            null,
                            PythonParameterAssignment.POSITION_OR_NAME,
                            true,
                            "typeInDocs",
                            "description", mutableListOf()
                        )
                    ), mutableListOf(),
                    true,
                    "description",
                    "fullDocstring", mutableListOf()
                )
            ),
            true,
            "Lorem ipsum",
            "Lorem ipsum", mutableListOf()
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
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-class.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "self",
                    "test-module.test-class.test-class-function.self",
                    null,
                    PythonParameterAssignment.IMPLICIT,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description",
                    mutableListOf(
                        RenameAnnotation("newSecondParamName")
                    )
                ),
                SerializablePythonParameter(
                    "third-param",
                    "test-module.test-class.test-class-function.third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    mutableListOf(
                        RenameAnnotation("newThirdParamName")
                    )
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            mutableListOf(
                RenameAnnotation("newFunctionName")
            )
        )
        val testClass = SerializablePythonClass(
            "test-class",
            "test-module.test-class", emptyList(), emptyList(),
            mutableListOf(testFunction),
            true,
            "",
            "",
            mutableListOf(
                RenameAnnotation("newClassName")
            )
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
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"), mutableListOf(), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
        )

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
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "13",
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "float",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
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
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    "False",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "bool",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
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
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "only-param",
                    "test-module.test-class.test-class-function.only-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
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
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
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
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "third-param",
                    "test-module.test-class.test-class-function.third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
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
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
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
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                ),
                SerializablePythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description", mutableListOf()
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring", mutableListOf()
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
    fun buildFunctionsReturnsFormattedFunctionBasedOnOriginalDeclaration() {
        // given
        val testFunction = SerializablePythonFunction(
            "test-function",
            "test-module.test-function",
            listOf("test-decorator"),
            mutableListOf(
                SerializablePythonParameter(
                    "first-param",
                    "test-module.test-class.test-class-function.first-param",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    mutableListOf(
                        RenameAnnotation("newFirstParamName")
                    )
                ),
                SerializablePythonParameter(
                    "second-param",
                    "test-module.test-class.test-class-function.second-param",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    true,
                    "typeInDocs",
                    "description",
                    mutableListOf(
                        RenameAnnotation("newSecondParamName")
                    )
                ),
                SerializablePythonParameter(
                    "third-param",
                    "test-module.test-class.test-class-function.third-param",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    true,
                    "typeInDocs",
                    "description",
                    mutableListOf(
                        RenameAnnotation("newThirdParamName")
                    )
                )
            ), mutableListOf(),
            true,
            "Lorem ipsum",
            "fullDocstring",
            mutableListOf(
                RenameAnnotation("newFunctionName")
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
