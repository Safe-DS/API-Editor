package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonConstructor
import com.larsreimann.api_editor.mutable_model.PythonEnum
import com.larsreimann.api_editor.mutable_model.PythonEnumInstance
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonNamedType
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonResult
import com.larsreimann.api_editor.mutable_model.PythonString
import com.larsreimann.api_editor.mutable_model.PythonStringifiedExpression
import com.larsreimann.api_editor.mutable_model.PythonStringifiedType
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
import de.unibonn.simpleml.emf.variantsOrEmpty
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlBoolean
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlEnum
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

class StubCodeGeneratorTest {

    @BeforeEach
    fun initSimpleML() {
        SimpleMLStandaloneSetup.doSetup()
    }

    @Nested
    inner class ToStubCode {

        @Test
        fun `should create valid Simple-ML stubs`() {
            val pythonModule = PythonModule(
                name = "testModule",
                classes = listOf(
                    PythonClass(
                        name = "Test_Class",
                        attributes = listOf(
                            PythonAttribute(name = "testAttribute")
                        ),
                        methods = listOf(
                            PythonFunction(
                                name = "testMethod",
                                isPure = true
                            )
                        ),
                        description = "Lorem ipsum"
                    )
                ),
                functions = listOf(
                    PythonFunction(
                        name = "testFunction",
                        parameters = listOf(
                            PythonParameter(
                                name = "testParameter"
                            ),
                            PythonParameter(
                                name = "testParameter",
                                type = PythonStringifiedType("int"),
                                defaultValue = PythonStringifiedExpression("10")
                            )
                        ),
                        results = listOf(
                            PythonResult(
                                name = "testParameter",
                                type = PythonStringifiedType("str")
                            )
                        )
                    )
                ),
                enums = listOf(
                    PythonEnum(
                        name = "TestEnum",
                        instances = listOf(
                            PythonEnumInstance(name = "TestEnumInstance")
                        )
                    )
                )
            )

            pythonModule.toStubCode() shouldBe """
                |package testModule
                |
                |@PythonName("Test_Class")
                |@Description("Lorem ipsum")
                |class TestClass() {
                |    attr testAttribute: Any?
                |
                |    @Pure
                |    fun testMethod()
                |}
                |
                |fun testFunction(testParameter: Any?, testParameter: Int or 10) -> testParameter: String
                |
                |enum TestEnum {
                |    TestEnumInstance
                |}
                |
            """.trimMargin()
        }
    }

    @Nested
    inner class ToSmlCompilationUnit {

        @Test
        fun `should handle empty modules`() {
            val pythonModule = PythonModule(name = "testModule")

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
            val pythonModule = PythonModule(
                name = "testModule",
                classes = listOf(
                    PythonClass(name = "TestClass")
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
            val pythonModule = PythonModule(
                name = "testModule",
                functions = listOf(
                    PythonFunction(name = "testFunction")
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

        @Test
        fun `should store enums`() {
            val pythonModule = PythonModule(
                name = "testModule",
                enums = listOf(
                    PythonEnum(name = "TestEnum")
                )
            )

            val smlCompilationUnit = pythonModule.toSmlCompilationUnit()
            smlCompilationUnit.members.shouldHaveSize(1)

            smlCompilationUnit.members[0]
                .shouldBeInstanceOf<SmlPackage>()
                .memberDeclarationsOrEmpty()
                .filterIsInstance<SmlEnum>()
                .map { it.name }
                .shouldContainExactly("TestEnum")
        }
    }

    @Nested
    inner class ToSmlClass {

        @Test
        fun `should handle empty classes`() {
            val pythonClass = PythonClass(name = "TestClass")

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
            val pythonClass = PythonClass(name = "test_class")

            val smlClass = pythonClass.toSmlClass()

            smlClass.name shouldBe "TestClass"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonClass = PythonClass(name = "test_class")

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
            val pythonClass = PythonClass(name = "TestClass")

            val smlClass = pythonClass.toSmlClass()

            val pythonNameAnnotationUseOrNull = smlClass.uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonClass = PythonClass(
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
            val pythonClass = PythonClass(
                name = "TestClass",
                description = ""
            )

            val smlClass = pythonClass.toSmlClass()

            val descriptionOrNull = smlClass.uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
            descriptionOrNull.shouldBeNull()
        }

        @Test
        fun `should store parameters of constructor`() {
            val pythonClass = PythonClass(
                name = "TestClass",
                constructor = PythonConstructor(
                    parameters = listOf(
                        PythonParameter(
                            name = "self",
                            assignedBy = PythonParameterAssignment.IMPLICIT
                        ),
                        PythonParameter(
                            name = "positionOnly",
                            assignedBy = PythonParameterAssignment.POSITION_ONLY
                        ),
                        PythonParameter(
                            name = "positionOrName",
                            assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                        ),
                        PythonParameter(
                            name = "nameOnly",
                            assignedBy = PythonParameterAssignment.NAME_ONLY
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
            val pythonClass = PythonClass(
                name = "TestClass",
                attributes = listOf(
                    PythonAttribute(name = "testAttribute")
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
            val pythonClass = PythonClass(
                name = "TestClass",
                methods = listOf(
                    PythonFunction(name = "testMethod")
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
    inner class ToSmlAttribute {

        @Test
        fun `should handle simple attributes`() {
            val pythonAttribute = PythonAttribute(name = "testAttribute")
            pythonAttribute.toSmlAttribute().asClue {
                it.name shouldBe "testAttribute"
                it.annotationUsesOrEmpty().shouldBeEmpty()

                val type = it.type
                type.shouldBeInstanceOf<SmlNamedType>()
                type.declaration.name shouldBe "Any"
                type.isNullable.shouldBeTrue()
            }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonAttribute = PythonAttribute(name = "Test_attribute")

            val smlParameter = pythonAttribute.toSmlAttribute()
            smlParameter.name shouldBe "testAttribute"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonAttribute = PythonAttribute(name = "Test_attribute")

            val arguments = pythonAttribute
                .toSmlAttribute()
                .uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SmlString>()
            pythonName.value shouldBe "Test_attribute"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonAttribute = PythonAttribute(name = "testAttribute")
            pythonAttribute.toSmlAttribute()
                .uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
                .shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonAttribute = PythonAttribute(
                name = "testAttribute",
                description = "Lorem ipsum"
            )

            val arguments = pythonAttribute
                .toSmlAttribute()
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
            val pythonAttribute = PythonAttribute(
                name = "testAttribute",
                description = ""
            )

            pythonAttribute
                .toSmlAttribute()
                .uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
                .shouldBeNull()
        }

        @Test
        fun `should store type`() {
            val pythonAttribute = PythonAttribute(
                name = "testAttribute",
                type = PythonStringifiedType("str")
            )

            pythonAttribute
                .toSmlAttribute()
                .type
                .shouldBeInstanceOf<SmlNamedType>()
                .asClue {
                    it.declaration.name shouldBe "String"
                    it.isNullable.shouldBeFalse()
                }
        }
    }

    @Nested
    inner class ToSmlFunction {

        @Test
        fun `should handle empty functions`() {
            val pythonFunction = PythonFunction(name = "testFunction")

            pythonFunction.toSmlFunction().asClue {
                it.name shouldBe "testFunction"
                it.isStatic.shouldBeFalse()
                it.annotationUsesOrEmpty().shouldBeEmpty()
                it.typeParametersOrEmpty().shouldBeEmpty()
                it.parametersOrEmpty().shouldBeEmpty()
                it.resultsOrEmpty().shouldBeEmpty()
                it.constraintsOrEmpty().shouldBeEmpty()
            }
        }

        @Test
        fun `should mark static methods with modifier`() {
            val pythonFunction = PythonFunction(
                name = "testFunction",
                decorators = mutableListOf("staticmethod")
            )
            PythonClass(
                name = "TestClass",
                methods = listOf(pythonFunction)
            )

            pythonFunction.toSmlFunction().asClue {
                it.isStatic.shouldBeTrue()
            }
        }

        @Test
        fun `should mark pure functions with annotation`() {
            val pythonFunction = PythonFunction(
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
            val pythonFunction = PythonFunction(name = "Test_function")

            val smlFunction = pythonFunction.toSmlFunction()
            smlFunction.name shouldBe "testFunction"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonFunction = PythonFunction(name = "Test_function")

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
            val pythonFunction = PythonFunction(name = "testFunction")

            val smlFunction = pythonFunction.toSmlFunction()

            val pythonNameAnnotationUseOrNull =
                smlFunction.uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonFunction = PythonFunction(
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
            val pythonFunction = PythonFunction(
                name = "testFunction",
                description = ""
            )

            val smlFunction = pythonFunction.toSmlFunction()

            val descriptionOrNull = smlFunction.uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
            descriptionOrNull.shouldBeNull()
        }

        @Test
        fun `should store parameters`() {
            val pythonFunction = PythonFunction(
                name = "testFunction",
                parameters = listOf(
                    PythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT
                    ),
                    PythonParameter(
                        name = "positionOnly",
                        assignedBy = PythonParameterAssignment.POSITION_ONLY
                    ),
                    PythonParameter(
                        name = "positionOrName",
                        assignedBy = PythonParameterAssignment.POSITION_OR_NAME
                    ),
                    PythonParameter(
                        name = "nameOnly",
                        assignedBy = PythonParameterAssignment.NAME_ONLY
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
            val pythonFunction = PythonFunction(
                name = "testFunction",
                results = listOf(
                    PythonResult(name = "testResult")
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

        @Test
        fun `should return null for implicit parameters`() {
            val pythonParameter = PythonParameter(
                name = "testParameter",
                assignedBy = PythonParameterAssignment.IMPLICIT
            )

            pythonParameter.toSmlParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should handle simple parameters`() {
            val pythonParameter = PythonParameter(name = "testParameter")
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
            val pythonParameter = PythonParameter(name = "Test_parameter")

            val smlParameter = pythonParameter
                .toSmlParameterOrNull()
                .shouldNotBeNull()
            smlParameter.name shouldBe "testParameter"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonParameter = PythonParameter(name = "Test_parameter")

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
            val pythonParameter = PythonParameter(name = "testParameter")

            pythonParameter.toSmlParameterOrNull()
                .shouldNotBeNull()
                .uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
                .shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonParameter = PythonParameter(
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
            val pythonParameter = PythonParameter(
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
            val pythonParameter = PythonParameter(
                name = "testParameter",
                type = PythonStringifiedType("str")
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
            val pythonParameter = PythonParameter(
                name = "testParameter",
                defaultValue = PythonStringifiedExpression("None")
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
            val pythonResult = PythonResult(name = "testResult")

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
            val pythonResult = PythonResult(name = "Test_result")

            val smlResult = pythonResult.toSmlResult()
            smlResult.name shouldBe "testResult"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonResult = PythonResult(name = "Test_result")

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
            val pythonResult = PythonResult(name = "testResult")

            pythonResult.toSmlResult()
                .uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
                .shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonResult = PythonResult(
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
            val pythonResult = PythonResult(
                name = "testResult",
                description = ""
            )

            val smlFunction = pythonResult.toSmlResult()

            val descriptionOrNull = smlFunction.uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
            descriptionOrNull.shouldBeNull()
        }

        @Test
        fun `should store type`() {
            val pythonResult = PythonResult(
                name = "testResult",
                type = PythonStringifiedType("str")
            )

            val type = pythonResult.toSmlResult().type.shouldBeInstanceOf<SmlNamedType>()
            type.declaration.name shouldBe "String"
            type.isNullable.shouldBeFalse()
        }
    }

    @Nested
    inner class ToSmlEnum {

        @Test
        fun `should handle empty enums`() {
            val pythonEnum = PythonEnum(name = "TestEnum")

            pythonEnum.toSmlEnum().asClue {
                it.name shouldBe "TestEnum"
                it.annotationUsesOrEmpty().shouldBeEmpty()
                it.variantsOrEmpty().shouldBeEmpty()
            }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonEnum = PythonEnum(name = "test_enum")

            val smlEnum = pythonEnum.toSmlEnum()
            smlEnum.name shouldBe "TestEnum"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonEnum = PythonEnum(name = "test_enum")

            val smlEnum = pythonEnum.toSmlEnum()

            val pythonNameAnnotationUseOrNull = smlEnum.uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldNotBeNull()

            val arguments = pythonNameAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SmlString>()
            pythonName.value shouldBe "test_enum"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonEnum = PythonEnum(name = "TestEnum")

            val smlEnum = pythonEnum.toSmlEnum()

            val pythonNameAnnotationUseOrNull = smlEnum.uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonEnum = PythonEnum(
                name = "TestEnum",
                description = "Lorem ipsum"
            )

            val arguments = pythonEnum.toSmlEnum()
                .uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
                .shouldNotBeNull().argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SmlString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonEnum = PythonEnum(
                name = "TestEnum",
                description = ""
            )

            pythonEnum
                .toSmlEnum()
                .uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
                .shouldBeNull()
        }

        @Test
        fun `should store variants`() {
            val pythonEnum = PythonEnum(
                name = "TestEnum",
                instances = listOf(
                    PythonEnumInstance(name = "TestEnumInstance")
                )
            )

            pythonEnum.toSmlEnum()
                .variantsOrEmpty()
                .map { it.name }
                .shouldContainExactly("TestEnumInstance")
        }
    }

    @Nested
    inner class ToSmlEnumVariant {

        @Test
        fun `should handle empty enum variant`() {
            val pythonEnumInstance = PythonEnumInstance(name = "TestEnumInstance")

            pythonEnumInstance.toSmlEnumVariant().asClue {
                it.name shouldBe "TestEnumInstance"
                it.annotationUsesOrEmpty().shouldBeEmpty()
                it.typeParametersOrEmpty().shouldBeEmpty()
                it.parametersOrEmpty().shouldBeEmpty()
                it.constraintsOrEmpty().shouldBeEmpty()
            }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonEnumInstance = PythonEnumInstance(name = "test_enum_instance")

            val smlEnumVariant = pythonEnumInstance.toSmlEnumVariant()
            smlEnumVariant.name shouldBe "TestEnumInstance"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonEnumInstance = PythonEnumInstance(name = "test_enum_instance")

            val arguments = pythonEnumInstance.toSmlEnumVariant()
                .uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SmlString>()
            pythonName.value shouldBe "test_enum_instance"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonEnumInstance = PythonEnumInstance(name = "TestEnumInstance")

            pythonEnumInstance.toSmlEnumVariant()
                .uniqueAnnotationUseOrNull(QualifiedName.create("PythonName"))
                .shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonEnumInstance = PythonEnumInstance(
                name = "TestEnumInstance",
                description = "Lorem ipsum"
            )

            val arguments = pythonEnumInstance.toSmlEnumVariant()
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
            val pythonEnumInstance = PythonEnumInstance(
                name = "TestEnumInstance",
                description = ""
            )

            pythonEnumInstance.toSmlEnumVariant()
                .uniqueAnnotationUseOrNull(QualifiedName.create("Description"))
                .shouldBeNull()
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
        fun `should convert named types`() {
            val smlType = PythonNamedType(PythonEnum(name = "MyEnum")).toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "MyEnum"
            smlType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert stringified type 'bool' to Boolean`() {
            val smlType = PythonStringifiedType("bool").toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "Boolean"
            smlType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert stringified type 'float' to Float`() {
            val smlType = PythonStringifiedType("float").toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "Float"
            smlType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert stringified type 'int' to Int`() {
            val smlType = PythonStringifiedType("int").toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "Int"
            smlType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert stringified type 'str' to String`() {
            val smlType = PythonStringifiedType("str").toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "String"
            smlType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert other types to nullable Any`() {
            val smlType = PythonStringifiedType("other").toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "Any"
            smlType.isNullable.shouldBeTrue()
        }

        @Test
        fun `should convert null to nullable Any`() {
            val smlType = null.toSmlType().shouldBeInstanceOf<SmlNamedType>()
            smlType.declaration.name shouldBe "Any"
            smlType.isNullable.shouldBeTrue()
        }
    }

    @Nested
    inner class ValueConversions {

        @Test
        fun `should convert blank strings to null`() {
            PythonStringifiedExpression(" ")
                .toSmlExpression()
                .shouldBeNull()
        }

        @Test
        fun `should convert False to a false boolean literal`() {
            val smlBoolean = PythonStringifiedExpression("False")
                .toSmlExpression()
                .shouldBeInstanceOf<SmlBoolean>()
            smlBoolean.isTrue.shouldBeFalse()
        }

        @Test
        fun `should convert True to a true boolean literal`() {
            val smlBoolean = PythonStringifiedExpression("True")
                .toSmlExpression()
                .shouldBeInstanceOf<SmlBoolean>()
            smlBoolean.isTrue.shouldBeTrue()
        }

        @Test
        fun `should convert None to a null literal`() {
            PythonStringifiedExpression("None")
                .toSmlExpression()
                .shouldBeInstanceOf<SmlNull>()
        }

        @Test
        fun `should convert ints to integer literals`() {
            val smlInt = PythonStringifiedExpression("123")
                .toSmlExpression()
                .shouldBeInstanceOf<SmlInt>()
            smlInt.value shouldBe 123
        }

        @Test
        fun `should convert floats to float literals`() {
            val smlFloat = PythonStringifiedExpression("123.45")
                .toSmlExpression()
                .shouldBeInstanceOf<SmlFloat>()
            smlFloat.value shouldBe 123.45
        }

        @Test
        fun `should convert single-quoted strings to string literals`() {
            val smlString = PythonStringifiedExpression("'string'")
                .toSmlExpression()
                .shouldBeInstanceOf<SmlString>()
            smlString.value shouldBe "string"
        }

        @Test
        fun `should convert double-quoted strings to string literals`() {
            val smlString = PythonStringifiedExpression("\"string\"")
                .toSmlExpression()
                .shouldBeInstanceOf<SmlString>()
            smlString.value shouldBe "string"
        }

        @Test
        fun `should convert other stringified expressions to '###invalid###' strings`() {
            val smlString = PythonStringifiedExpression("unknown")
                .toSmlExpression()
                .shouldBeInstanceOf<SmlString>()
            smlString.value shouldBe "###invalid###unknown###"
        }

        @Test
        fun `should convert other expressions to '###invalid###' strings`() {
            val smlString = PythonString("unknown")
                .toSmlExpression()
                .shouldBeInstanceOf<SmlString>()
            smlString.value shouldBe "###invalid###PythonString(value=unknown)###"
        }
    }
}
