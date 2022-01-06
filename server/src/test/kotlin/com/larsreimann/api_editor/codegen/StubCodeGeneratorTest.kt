package com.larsreimann.api_editor.codegen

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
import de.unibonn.simpleml.emf.memberDeclarationsOrEmpty
import de.unibonn.simpleml.emf.membersOrEmpty
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.parentTypesOrEmpty
import de.unibonn.simpleml.emf.resultsOrEmpty
import de.unibonn.simpleml.emf.typeParametersOrEmpty
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlBoolean
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlFloat
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlInt
import de.unibonn.simpleml.simpleML.SmlNamedType
import de.unibonn.simpleml.simpleML.SmlNull
import de.unibonn.simpleml.simpleML.SmlPackage
import de.unibonn.simpleml.simpleML.SmlString
import de.unibonn.simpleml.stdlib.uniqueAnnotationUseOrNull
import io.kotest.assertions.asClue
import io.kotest.matchers.booleans.shouldBeFalse
import io.kotest.matchers.booleans.shouldBeTrue
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
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.junit.jupiter.params.provider.EnumSource

// TODO: test toSmlAttribute
// TODO: test toSmlEnum

class StubCodeGeneratorTest {

    @BeforeEach
    fun initSimpleML() {
        SimpleMLStandaloneSetup.doSetup()
    }

    @Nested
    inner class ToSmlCompilationUnit {

        @Test
        fun `should handle empty modules`() {
            val pythonModule = MutablePythonModule(name = "testModule")

            val smlCompilationUnit = pythonModule.toSmlCompilationUnit()
            smlCompilationUnit.members.shouldHaveSize(1)

            smlCompilationUnit.members[0].asClue {
                it.shouldBeInstanceOf<SmlPackage>()
                it.name shouldBe "testModule"
                it.annotationUsesOrEmpty().shouldBeEmpty()
                it.imports.shouldBeEmpty()
                it.memberDeclarationsOrEmpty().shouldBeEmpty()
            }
        }

        @Test
        fun `should store classes`() {
            val pythonModule = MutablePythonModule(
                name = "testModule",
                classes = listOf(
                    MutablePythonClass(name = "TestClass")
                )
            )

            val smlCompilationUnit = pythonModule.toSmlCompilationUnit()
            smlCompilationUnit.members.shouldHaveSize(1)

            smlCompilationUnit.members[0]
                .shouldBeInstanceOf<SmlPackage>()
                .memberDeclarationsOrEmpty()
                .filterIsInstance<SmlClass>()
                .map { it.name }
                .shouldContainExactly("TestClass")
        }

        @Test
        fun `should store functions`() {
            val pythonModule = MutablePythonModule(
                name = "testModule",
                functions = listOf(
                    MutablePythonFunction(name = "testFunction")
                )
            )

            val smlCompilationUnit = pythonModule.toSmlCompilationUnit()
            smlCompilationUnit.members.shouldHaveSize(1)

            smlCompilationUnit.members[0]
                .shouldBeInstanceOf<SmlPackage>()
                .memberDeclarationsOrEmpty()
                .filterIsInstance<SmlFunction>()
                .map { it.name }
                .shouldContainExactly("testFunction")
        }
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
            smlClass.membersOrEmpty()
                .filterIsInstance<SmlAttribute>()
                .map { it.name }
                .shouldContainExactly("testAttribute")
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
            smlClass.membersOrEmpty()
                .filterIsInstance<SmlFunction>()
                .map { it.name }
                .shouldContainExactly("testMethod")
        }
    }

    @Nested
    inner class ToSmlFunction {

        @Test
        fun `should handle empty functions`() {
            val pythonFunction = MutablePythonFunction(name = "testFunction")

            pythonFunction.toSmlFunction().asClue {
                it.name shouldBe "testFunction"
                it.annotationUsesOrEmpty().shouldBeEmpty()
                it.typeParametersOrEmpty().shouldBeEmpty()
                it.parametersOrEmpty().shouldBeEmpty()
                it.resultsOrEmpty().shouldBeEmpty()
                it.constraintsOrEmpty().shouldBeEmpty()
            }
        }

        @Test
        fun `should mark pure functions with annotation`() {
            val pythonFunction = MutablePythonFunction(
                name = "testFunction",
                isPure = true
            )

            pythonFunction
                .toSmlFunction()
                .uniqueAnnotationUseOrNull(QualifiedName.create("Pure"))
                .shouldNotBeNull()
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonFunction = MutablePythonFunction(name = "Test_function")

            val smlFunction = pythonFunction.toSmlFunction()
            smlFunction.name shouldBe "testFunction"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonFunction = MutablePythonFunction(name = "Test_function")

            val smlFunction = pythonFunction.toSmlFunction()

            val pythonNameAnnotationUseOrNull =
                smlFunction.uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldNotBeNull()

            val arguments = pythonNameAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SmlString>()
            pythonName.value shouldBe "Test_function"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonFunction = MutablePythonFunction(name = "testFunction")

            val smlFunction = pythonFunction.toSmlFunction()

            val pythonNameAnnotationUseOrNull =
                smlFunction.uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonFunction = MutablePythonFunction(
                name = "testFunction",
                description = "Lorem ipsum"
            )

            val smlFunction = pythonFunction.toSmlFunction()

            val descriptionAnnotationUseOrNull =
                smlFunction.uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
            descriptionAnnotationUseOrNull.shouldNotBeNull()

            val arguments = descriptionAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SmlString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonFunction = MutablePythonFunction(
                name = "testFunction",
                description = ""
            )

            val smlFunction = pythonFunction.toSmlFunction()

            val descriptionOrNull = smlFunction.uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
            descriptionOrNull.shouldBeNull()
        }

        @Test
        fun `should store parameters`() {
            val pythonFunction = MutablePythonFunction(
                name = "testFunction",
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

            pythonFunction.toSmlFunction()
                .parametersOrEmpty().map { it.name }
                .shouldContainExactly(
                    "positionOnly",
                    "positionOrName",
                    "nameOnly"
                )
        }

        @Test
        fun `should store results`() {
            val pythonFunction = MutablePythonFunction(
                name = "testFunction",
                results = listOf(
                    MutablePythonResult(name = "testResult")
                )
            )

            pythonFunction.toSmlFunction()
                .resultsOrEmpty().map { it.name }
                .shouldContainExactly(
                    "testResult"
                )
        }
    }

    @Nested
    inner class ToSmlParameter {

        @ParameterizedTest
        @EnumSource(PythonParameterAssignment::class, names = ["IMPLICIT", "ATTRIBUTE", "CONSTANT"])
        fun `should return null for invisible parameters`(assignedBy: PythonParameterAssignment) {
            val pythonParameter = MutablePythonParameter(
                name = "testParameter",
                assignedBy = assignedBy
            )

            pythonParameter.toSmlParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should handle simple parameters`() {
            val pythonParameter = MutablePythonParameter(name = "testParameter")
            pythonParameter.toSmlParameterOrNull()
                .shouldNotBeNull()
                .asClue {
                    it.name shouldBe "testParameter"
                    it.annotationUsesOrEmpty().shouldBeEmpty()

                    val type = it.type
                    type.shouldBeInstanceOf<SmlNamedType>()
                    type.declaration.name shouldBe "Any"
                    type.isNullable.shouldBeTrue()

                    it.defaultValue.shouldBeNull()
                }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonParameter = MutablePythonParameter(name = "Test_parameter")

            val smlParameter = pythonParameter
                .toSmlParameterOrNull()
                .shouldNotBeNull()
            smlParameter.name shouldBe "testParameter"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonParameter = MutablePythonParameter(name = "Test_parameter")

            val arguments = pythonParameter
                .toSmlParameterOrNull()
                .shouldNotBeNull()
                .uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SmlString>()
            pythonName.value shouldBe "Test_parameter"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonParameter = MutablePythonParameter(name = "testParameter")

            pythonParameter.toSmlParameterOrNull()
                .shouldNotBeNull()
                .uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
                .shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonParameter = MutablePythonParameter(
                name = "testParameter",
                description = "Lorem ipsum"
            )

            val arguments = pythonParameter
                .toSmlParameterOrNull()
                .shouldNotBeNull()
                .uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SmlString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonParameter = MutablePythonParameter(
                name = "testParameter",
                description = ""
            )

            pythonParameter
                .toSmlParameterOrNull()
                .shouldNotBeNull()
                .uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
                .shouldBeNull()
        }

        @Test
        fun `should store type`() {
            val pythonParameter = MutablePythonParameter(
                name = "testParameter",
                typeInDocs = "str"
            )

            pythonParameter
                .toSmlParameterOrNull()
                .shouldNotBeNull()
                .type
                .shouldBeInstanceOf<SmlNamedType>()
                .asClue {
                    it.declaration.name shouldBe "String"
                    it.isNullable.shouldBeFalse()
                }
        }

        @Test
        fun `should store default value`() {
            val pythonParameter = MutablePythonParameter(
                name = "testParameter",
                defaultValue = "None"
            )

            pythonParameter
                .toSmlParameterOrNull()
                .shouldNotBeNull()
                .defaultValue
                .shouldBeInstanceOf<SmlNull>()
        }
    }

    @Nested
    inner class ToSmlResult {

        @Test
        fun `should handle simple results`() {
            val pythonResult = MutablePythonResult(name = "testResult")

            pythonResult.toSmlResult().asClue {
                it.name shouldBe "testResult"
                it.annotationUsesOrEmpty().shouldBeEmpty()

                val type = it.type
                type.shouldBeInstanceOf<SmlNamedType>()
                type.declaration.name shouldBe "Any"
                type.isNullable.shouldBeTrue()
            }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonResult = MutablePythonResult(name = "Test_result")

            val smlResult = pythonResult.toSmlResult()
            smlResult.name shouldBe "testResult"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonResult = MutablePythonResult(name = "Test_result")

            val smlFunction = pythonResult.toSmlResult()

            val pythonNameAnnotationUseOrNull = smlFunction
                .uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
                .shouldNotBeNull()

            val arguments = pythonNameAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SmlString>()
            pythonName.value shouldBe "Test_result"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonResult = MutablePythonResult(name = "testResult")

            pythonResult.toSmlResult()
                .uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
                .shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonResult = MutablePythonResult(
                name = "testResult",
                description = "Lorem ipsum"
            )

            val smlResult = pythonResult.toSmlResult()

            val arguments = smlResult
                .uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SmlString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonResult = MutablePythonResult(
                name = "testResult",
                description = ""
            )

            val smlFunction = pythonResult.toSmlResult()

            val descriptionOrNull = smlFunction.uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
            descriptionOrNull.shouldBeNull()
        }

        @Test
        fun `should store type`() {
            val pythonResult = MutablePythonResult(
                name = "testResult",
                type = "str"
            )

            val type = pythonResult.toSmlResult().type.shouldBeInstanceOf<SmlNamedType>()
            type.declaration.name shouldBe "String"
            type.isNullable.shouldBeFalse()
        }
    }

    @Nested
    inner class NameConversions {

        @ParameterizedTest
        @CsvSource(
            delimiter = '|',
            textBlock = """
            ''        | ''
            name      | name
            Name      | name
            _name     | name
            _Name     | name
            two_words | twoWords
            Two_words | twoWords"""
        )
        fun `snakeCaseToLowerCamelCase should convert snake case to lower camel case`(input: String, expected: String) {
            input.snakeCaseToLowerCamelCase() shouldBe expected
        }

        @ParameterizedTest
        @CsvSource(
            delimiter = '|',
            textBlock = """
            ''        | ''
            name      | Name
            Name      | Name
            _name     | Name
            _Name     | Name
            two_words | TwoWords
            Two_words | TwoWords"""
        )
        fun `snakeCaseToUpperCamelCase should convert snake case to upper camel case`(input: String, expected: String) {
            input.snakeCaseToUpperCamelCase() shouldBe expected
        }
    }

    @Nested
    inner class TypeConversions {

        @Test
        fun `should convert bool to Boolean`() {
            val smlType = "bool".toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "Boolean"
            smlType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert float to Float`() {
            val smlType = "float".toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "Float"
            smlType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert int to Int`() {
            val smlType = "int".toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "Int"
            smlType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert str to String`() {
            val smlType = "str".toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "String"
            smlType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert other types to nullable Any`() {
            val smlType = "other".toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "Any"
            smlType.isNullable.shouldBeTrue()
        }
    }

    @Nested
    inner class ValueConversions {

        @Test
        fun `should convert blank strings to null`() {
            " ".toSmlExpression().shouldBeNull()
        }

        @Test
        fun `should convert False to a false boolean literal`() {
            val smlBoolean = "False".toSmlExpression().shouldBeInstanceOf<SmlBoolean>()
            smlBoolean.isTrue.shouldBeFalse()
        }

        @Test
        fun `should convert True to a true boolean literal`() {
            val smlBoolean = "True".toSmlExpression().shouldBeInstanceOf<SmlBoolean>()
            smlBoolean.isTrue.shouldBeTrue()
        }

        @Test
        fun `should convert None to a null literal`() {
            "None".toSmlExpression().shouldBeInstanceOf<SmlNull>()
        }

        @Test
        fun `should convert ints to integer literals`() {
            val smlInt = "123".toSmlExpression().shouldBeInstanceOf<SmlInt>()
            smlInt.value shouldBe 123
        }

        @Test
        fun `should convert floats to float literals`() {
            val smlFloat = "123.45".toSmlExpression().shouldBeInstanceOf<SmlFloat>()
            smlFloat.value shouldBe 123.45
        }

        @Test
        fun `should convert single-quoted strings to string literals`() {
            val smlString = "'string'".toSmlExpression().shouldBeInstanceOf<SmlString>()
            smlString.value shouldBe "string"
        }

        @Test
        fun `should convert double-quoted strings to string literals`() {
            val smlString = "\"string\"".toSmlExpression().shouldBeInstanceOf<SmlString>()
            smlString.value shouldBe "string"
        }

        @Test
        fun `should convert other values to '###invalid###' strings`() {
            val smlString = "unknown".toSmlExpression().shouldBeInstanceOf<SmlString>()
            smlString.value shouldBe "###invalid###unknown###"
        }
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
