package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonAttribute
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.MutablePythonResult
import de.unibonn.simpleml.SimpleMLStandaloneSetup
import de.unibonn.simpleml.emf.annotationUsesOrEmpty
import de.unibonn.simpleml.emf.argumentsOrEmpty
import de.unibonn.simpleml.emf.constraintsOrEmpty
import de.unibonn.simpleml.emf.membersOrEmpty
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.parentTypesOrEmpty
import de.unibonn.simpleml.emf.typeParametersOrEmpty
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlString
import de.unibonn.simpleml.stdlib.uniqueAnnotationUseOrNull
import io.kotest.assertions.asClue
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.naming.QualifiedName
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

// TODO: test creation of Description annotations
// TODO: test creation of PythonName annotations
// TODO: test conversion of values
// TODO: test conversion of types
// TODO: test conversion of names
// TODO: test toSmlCompilationUnit
// TODO: test toSmlAttribute
// TODO: test toSmlFunction
// TODO: test toSmlParameterOrNull
// TODO: test toSmlResult

class StubCodeGeneratorTest {

    @BeforeEach
    fun initSimpleML() {
        SimpleMLStandaloneSetup.doSetup()
    }

    @Test
    fun buildModuleContentReturnsFormattedModuleContent() { // TODO
        // given
        val testClass = MutablePythonClass(
            name = "TestClass",
            attributes = mutableListOf(
                MutablePythonAttribute(
                    "onlyParam",
                    "'defaultValue'",
                )
            ),
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "testClassFunction",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT,
                        ),
                        MutablePythonParameter(
                            "onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "__init__",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "self",
                            "'defaultValue'",
                            PythonParameterAssignment.IMPLICIT,
                        ),
                        MutablePythonParameter(
                            "onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                        )
                    )
                )
            )
        )
        val testModule = MutablePythonModule(
            name = "testModule",
            classes = mutableListOf(testClass),
            functions = mutableListOf(
                MutablePythonFunction(
                    name = "functionModule1",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            "str",
                        ),
                        MutablePythonParameter(
                            "param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            "str",
                        ),
                        MutablePythonParameter(
                            "param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            "str",
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "testResult",
                            "str",
                            "str",
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "testFunction",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "testParameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            "int",
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "testResult",
                            "str",
                            "str",
                        )
                    )
                )
            )
        )

        // when
        val moduleContent = buildCompilationUnitToString(testModule)

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |
            |class TestClass(onlyParam: Any? or "defaultValue") {
            |    attr onlyParam: Any?
            |
            |    fun testClassFunction(onlyParam: Any? or "defaultValue")
            |}
            |
            |fun functionModule1(param1: String, param2: String, param3: String) -> testResult: String
            |
            |fun testFunction(testParameter: Int or 42) -> testResult: String
            |""".trimMargin()
        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun buildModuleContentWithNoClassesReturnsFormattedModuleContent() { // TODO
        // given
        val testModule = MutablePythonModule(
            name = "testModule",
            functions = mutableListOf(
                MutablePythonFunction(
                    name = "functionModule1",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "param1",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            "str",
                            "Lorem ipsum"
                        ),
                        MutablePythonParameter(
                            "param2",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            "str",
                            "Lorem ipsum"
                        ),
                        MutablePythonParameter(
                            "param3",
                            null,
                            PythonParameterAssignment.NAME_ONLY,
                            "str",
                            "Lorem ipsum"
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "testResult",
                            "str",
                            "str",
                            "Lorem ipsum"
                        )
                    )
                ),
                MutablePythonFunction(
                    name = "testFunction",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "testParameter",
                            "42",
                            PythonParameterAssignment.NAME_ONLY,
                            "int",
                            "Lorem ipsum",
                        )
                    ),
                    results = mutableListOf(
                        MutablePythonResult(
                            "testResult",
                            "str",
                            "str",
                            "Lorem ipsum",
                        )
                    )
                )
            )
        )

        // when
        val moduleContent = buildCompilationUnitToString(testModule)

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |
            |fun functionModule1(@Description("Lorem ipsum") param1: String, @Description("Lorem ipsum") param2: String, @Description("Lorem ipsum") param3: String) -> @Description("Lorem ipsum") testResult: String
            |
            |fun testFunction(@Description("Lorem ipsum") testParameter: Int or 42) -> @Description("Lorem ipsum") testResult: String
            |""".trimMargin()
        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun buildModuleContentWithOnlyConstructorReturnsFormattedModuleContent() { // TODO
        // given
        val testClass = MutablePythonClass(
            name = "TestClass",
            methods = mutableListOf(
                MutablePythonFunction(
                    name = "__init__",
                    parameters = mutableListOf(
                        MutablePythonParameter(
                            "onlyParam",
                            "'defaultValue'",
                            PythonParameterAssignment.POSITION_OR_NAME,
                            "typeInDocs",
                            "description"
                        )
                    )
                )
            )
        )
        val testModule = MutablePythonModule(
            name = "testModule",
            imports = mutableListOf(
                PythonImport(
                    "testImport1",
                    "testAlias"
                )
            ),
            fromImports = mutableListOf(
                PythonFromImport(
                    "testFromImport1",
                    "testDeclaration1",
                    null
                )
            ),
            classes = mutableListOf(testClass)
        )

        // when
        val moduleContent = buildCompilationUnitToString(testModule)

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |
            |class TestClass(@Description("description") onlyParam: Any? or "defaultValue")
            |""".trimMargin()
        moduleContent shouldBe expectedModuleContent
    }

    @Test
    fun buildModuleContentWithNoFunctionsAndClassesReturnsFormattedModuleContent() { // TODO
        // given
        val testModule = MutablePythonModule("testModule")

        // when
        val moduleContent = buildCompilationUnitToString(testModule)

        // then
        val expectedModuleContent: String = """
            |package simpleml.testModule
            |""".trimMargin()
        moduleContent shouldBe expectedModuleContent
    }

    @Nested
    inner class ToSmlClass {

        @Test
        fun `should handle empty classes`() {
            val pythonClass = MutablePythonClass(name = "TestClass")

            pythonClass.toSmlClass().asClue {
                it.name shouldBe "TestClass"
                it.annotationUsesOrEmpty().shouldBeEmpty()
                it.typeParametersOrEmpty().shouldBeEmpty()
                it.parametersOrEmpty().shouldBeEmpty()
                it.parentTypesOrEmpty().shouldBeEmpty()
                it.constraintsOrEmpty().shouldBeEmpty()
                it.membersOrEmpty().shouldBeEmpty()
            }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonClass = MutablePythonClass(name = "test_class")

            val smlClass = pythonClass.toSmlClass()

            smlClass.name shouldBe "TestClass"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonClass = MutablePythonClass(name = "test_class")

            val smlClass = pythonClass.toSmlClass()

            val pythonNameAnnotationUseOrNull = smlClass.uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldNotBeNull()

            val arguments = pythonNameAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SmlString>()
            pythonName.value shouldBe "test_class"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonClass = MutablePythonClass(name = "TestClass")

            val smlClass = pythonClass.toSmlClass()

            val pythonNameAnnotationUseOrNull = smlClass.uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonClass = MutablePythonClass(
                name = "TestClass",
                description = "Lorem ipsum"
            )

            val smlClass = pythonClass.toSmlClass()

            val descriptionAnnotationUseOrNull = smlClass.uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
            descriptionAnnotationUseOrNull.shouldNotBeNull()

            val arguments = descriptionAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SmlString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonClass = MutablePythonClass(
                name = "TestClass",
                description = ""
            )

            val smlClass = pythonClass.toSmlClass()

            val descriptionOrNull = smlClass.uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
            descriptionOrNull.shouldBeNull()
        }

        @Test
        fun `should store parameters of constructor`() {
            val pythonClass = MutablePythonClass(
                name = "TestClass",
                methods = listOf(
                    MutablePythonFunction(
                        name = "__init__",
                        parameters = listOf(
                            MutablePythonParameter(
                                name = "self",
                                assignedBy = PythonParameterAssignment.IMPLICIT
                            ),
                            MutablePythonParameter(
                                name = "positionOnly",
                                assignedBy = PythonParameterAssignment.POSITION_ONLY
                            ),
                            MutablePythonParameter(
                                name = "positionOrName",
                                assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                            ),
                            MutablePythonParameter(
                                name = "nameOnly",
                                assignedBy = PythonParameterAssignment.NAME_ONLY
                            ),
                            MutablePythonParameter(
                                name = "attribute",
                                assignedBy = PythonParameterAssignment.ATTRIBUTE
                            ),
                            MutablePythonParameter(
                                name = "constant",
                                assignedBy = PythonParameterAssignment.CONSTANT
                            )
                        )
                    )
                )
            )

            val smlClass = pythonClass.toSmlClass()
            val constructorParameterNames = smlClass.parametersOrEmpty().map { it.name }

            constructorParameterNames.shouldContainExactly(
                "positionOnly",
                "positionOrName",
                "nameOnly"
            )
        }

        @Test
        fun `should store attributes`() {
            val pythonClass = MutablePythonClass(
                name = "TestClass",
                attributes = listOf(
                    MutablePythonAttribute(name = "testAttribute")
                )
            )

            val smlClass = pythonClass.toSmlClass()
            val attributeNames = smlClass.membersOrEmpty().filterIsInstance<SmlAttribute>().map { it.name }

            attributeNames.shouldContainExactly("testAttribute")
        }

        @Test
        fun `should store methods`() {
            val pythonClass = MutablePythonClass(
                name = "TestClass",
                methods = listOf(
                    MutablePythonFunction(name = "testMethod")
                )
            )

            val smlClass = pythonClass.toSmlClass()
            val methodNames = smlClass.membersOrEmpty().filterIsInstance<SmlFunction>().map { it.name }

            methodNames.shouldContainExactly("testMethod")
        }
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithNoParameters() { // TODO
        // given
        val testFunction = MutablePythonFunction("testFunction")

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String =
            """
            |fun testFunction()""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOnlyParameter() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "onlyParam",
                    "13",
                    PythonParameterAssignment.POSITION_ONLY,
                    "int",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String =
            """
            |fun testFunction(@Description("description") onlyParam: Int or 13)""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionOrNameParameter() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "onlyParam",
                    "'Test'",
                    PythonParameterAssignment.POSITION_OR_NAME,
                    "string",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String =
            """
            |fun testFunction(@Description("description") onlyParam: Any? or "Test")""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithPositionAndPositionOrNameAndNameOnlyParameter() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "firstParam",
                    null,
                    PythonParameterAssignment.POSITION_ONLY,
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "secondParam",
                    null,
                    PythonParameterAssignment.POSITION_OR_NAME,
                    "typeInDocs",
                    "description"
                ),
                MutablePythonParameter(
                    "thirdParam",
                    null,
                    PythonParameterAssignment.NAME_ONLY,
                    "typeInDocs",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |fun testFunction(@Description("description") firstParam: Any?, @Description("description") secondParam: Any?, @Description("description") thirdParam: Any?)""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithOneResult() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "onlyParam",
                    "1.31e+1",
                    PythonParameterAssignment.POSITION_ONLY,
                    "float",
                    "description"
                )
            ),
            results = mutableListOf(
                MutablePythonResult(
                    "firstResult",
                    "float",
                    "float",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |fun testFunction(@Description("description") onlyParam: Float or 13.1) -> @Description("description") firstResult: Float""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithMultipleResults() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "onlyParam",
                    "True",
                    PythonParameterAssignment.POSITION_ONLY,
                    "bool",
                    "description"
                )
            ),
            results = mutableListOf(
                MutablePythonResult(
                    "firstResult",
                    "float",
                    "float",
                    "description"
                ),
                MutablePythonResult(
                    "secondResult",
                    "float",
                    "float",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |fun testFunction(@Description("description") onlyParam: Boolean or true) -> (@Description("description") firstResult: Float, @Description("description") secondResult: Float)""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun buildFunctionReturnsFormattedFunctionWithInvalidDefaultValue() { // TODO
        // given
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            parameters = mutableListOf(
                MutablePythonParameter(
                    "onlyParam",
                    "'13'x",
                    PythonParameterAssignment.POSITION_ONLY,
                    "string",
                    "description"
                )
            )
        )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String = """
            |fun testFunction(@Description("description") onlyParam: Any? or "###invalid###'13'x###")""".trimMargin()
        formattedFunction shouldBe expectedFormattedFunction
    }

    @Test
    fun `should mark pure functions with annotation`() { // TODO
        val testFunction = MutablePythonFunction(
            name = "testFunction",
            isPure = true
        )

        testFunction
            .toSmlFunction()
            .uniqueAnnotationUseOrNull(QualifiedName.create("Pure"))
            .shouldNotBeNull()
    }

    @Test
    fun `should convert names to camel case`() { // TODO
        // given
        val testFunction =
            MutablePythonFunction(
                name = "test_function",
                parameters = mutableListOf(
                    MutablePythonParameter(
                        "test_parameter",
                        null,
                        PythonParameterAssignment.POSITION_OR_NAME
                    )
                )
            )

        // when
        val formattedFunction = buildFunctionToString(testFunction)

        // then
        val expectedFormattedFunction: String =
            """
            |@PythonName("test_function")
            |fun testFunction(@PythonName("test_parameter") testParameter: Any?)
            """.trimMargin()

        formattedFunction shouldBe expectedFormattedFunction
    }
}
