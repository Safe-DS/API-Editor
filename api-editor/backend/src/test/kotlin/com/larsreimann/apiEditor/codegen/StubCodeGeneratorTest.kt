package com.larsreimann.apiEditor.codegen

import com.larsreimann.apiEditor.model.PythonParameterAssignment
import com.larsreimann.apiEditor.mutableModel.PythonAttribute
import com.larsreimann.apiEditor.mutableModel.PythonClass
import com.larsreimann.apiEditor.mutableModel.PythonConstructor
import com.larsreimann.apiEditor.mutableModel.PythonEnum
import com.larsreimann.apiEditor.mutableModel.PythonEnumInstance
import com.larsreimann.apiEditor.mutableModel.PythonFunction
import com.larsreimann.apiEditor.mutableModel.PythonModule
import com.larsreimann.apiEditor.mutableModel.PythonNamedType
import com.larsreimann.apiEditor.mutableModel.PythonParameter
import com.larsreimann.apiEditor.mutableModel.PythonResult
import com.larsreimann.apiEditor.mutableModel.PythonString
import com.larsreimann.apiEditor.mutableModel.PythonStringifiedExpression
import com.larsreimann.apiEditor.mutableModel.PythonStringifiedType
import com.larsreimann.safeds.SafeDSStandaloneSetup
import com.larsreimann.safeds.emf.annotationCallsOrEmpty
import com.larsreimann.safeds.emf.argumentsOrEmpty
import com.larsreimann.safeds.emf.classMembersOrEmpty
import com.larsreimann.safeds.emf.compilationUnitMembersOrEmpty
import com.larsreimann.safeds.emf.constraintsOrEmpty
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.parentTypesOrEmpty
import com.larsreimann.safeds.emf.resultsOrEmpty
import com.larsreimann.safeds.emf.typeParametersOrEmpty
import com.larsreimann.safeds.emf.variantsOrEmpty
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsBoolean
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsFloat
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsInt
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsNull
import com.larsreimann.safeds.safeDS.SdsString
import com.larsreimann.safeds.stdlibAccess.uniqueAnnotationCallOrNull
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
    fun initSafeDS() {
        SafeDSStandaloneSetup.doSetup()
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
                            PythonAttribute(name = "testAttribute"),
                        ),
                        methods = listOf(
                            PythonFunction(
                                name = "testMethod",
                                isPure = true,
                            ),
                        ),
                        description = "Lorem ipsum",
                    ),
                ),
                functions = listOf(
                    PythonFunction(
                        name = "testFunction",
                        parameters = listOf(
                            PythonParameter(
                                name = "testParameter",
                            ),
                            PythonParameter(
                                name = "testParameter",
                                type = PythonStringifiedType("int"),
                                defaultValue = PythonStringifiedExpression("10"),
                            ),
                        ),
                        results = listOf(
                            PythonResult(
                                name = "testParameter",
                                type = PythonStringifiedType("str"),
                            ),
                        ),
                    ),
                ),
                enums = listOf(
                    PythonEnum(
                        name = "TestEnum",
                        instances = listOf(
                            PythonEnumInstance(name = "TestEnumInstance"),
                        ),
                    ),
                ),
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
                |fun testFunction(testParameter: Any?, testParameter: Int = 10) -> testParameter: String
                |
                |enum TestEnum {
                |    TestEnumInstance
                |}
                |
            """.trimMargin()
        }
    }

    @Nested
    inner class ToSdsCompilationUnit {

        @Test
        fun `should handle empty modules`() {
            val pythonModule = PythonModule(name = "testModule")

            val SdsCompilationUnit = pythonModule.toSdsCompilationUnit()
            SdsCompilationUnit.asClue {
                it.annotationCallsOrEmpty().shouldBeEmpty()
                it.name shouldBe "testModule"
                it.imports.shouldBeEmpty()
                it.compilationUnitMembersOrEmpty().shouldBeEmpty()
            }
        }

        @Test
        fun `should store classes`() {
            val pythonModule = PythonModule(
                name = "testModule",
                classes = listOf(
                    PythonClass(name = "TestClass"),
                ),
            )

            val SdsCompilationUnit = pythonModule.toSdsCompilationUnit()
            SdsCompilationUnit.members.shouldHaveSize(1)

            SdsCompilationUnit.members[0]
                .shouldBeInstanceOf<SdsClass>()
                .name
                .shouldBe("TestClass")
        }

        @Test
        fun `should store functions`() {
            val pythonModule = PythonModule(
                name = "testModule",
                functions = listOf(
                    PythonFunction(name = "testFunction"),
                ),
            )

            val SdsCompilationUnit = pythonModule.toSdsCompilationUnit()
            SdsCompilationUnit.members.shouldHaveSize(1)

            SdsCompilationUnit.members[0]
                .shouldBeInstanceOf<SdsFunction>()
                .name
                .shouldBe("testFunction")
        }

        @Test
        fun `should store enums`() {
            val pythonModule = PythonModule(
                name = "testModule",
                enums = listOf(
                    PythonEnum(name = "TestEnum"),
                ),
            )

            val SdsCompilationUnit = pythonModule.toSdsCompilationUnit()
            SdsCompilationUnit.members.shouldHaveSize(1)

            SdsCompilationUnit.members[0]
                .shouldBeInstanceOf<SdsEnum>()
                .name
                .shouldBe("TestEnum")
        }
    }

    @Nested
    inner class ToSdsClass {

        @Test
        fun `should handle empty classes`() {
            val pythonClass = PythonClass(name = "TestClass")

            pythonClass.toSdsClass().asClue {
                it.name shouldBe "TestClass"
                it.annotationCallsOrEmpty().shouldBeEmpty()
                it.typeParametersOrEmpty().shouldBeEmpty()
                it.parametersOrEmpty().shouldBeEmpty()
                it.parentTypesOrEmpty().shouldBeEmpty()
                it.constraintsOrEmpty().shouldBeEmpty()
                it.classMembersOrEmpty().shouldBeEmpty()
            }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonClass = PythonClass(name = "test_class")

            val SdsClass = pythonClass.toSdsClass()

            SdsClass.name shouldBe "TestClass"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonClass = PythonClass(name = "test_class")

            val SdsClass = pythonClass.toSdsClass()

            val pythonNameAnnotationUseOrNull = SdsClass.uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldNotBeNull()

            val arguments = pythonNameAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SdsString>()
            pythonName.value shouldBe "test_class"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonClass = PythonClass(name = "TestClass")

            val SdsClass = pythonClass.toSdsClass()

            val pythonNameAnnotationUseOrNull = SdsClass.uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonClass = PythonClass(
                name = "TestClass",
                description = "Lorem ipsum",
            )

            val SdsClass = pythonClass.toSdsClass()

            val descriptionAnnotationUseOrNull = SdsClass.uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
            descriptionAnnotationUseOrNull.shouldNotBeNull()

            val arguments = descriptionAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SdsString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonClass = PythonClass(
                name = "TestClass",
                description = "",
            )

            val SdsClass = pythonClass.toSdsClass()

            val descriptionOrNull = SdsClass.uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
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
                            assignedBy = PythonParameterAssignment.IMPLICIT,
                        ),
                        PythonParameter(
                            name = "positionOnly",
                            assignedBy = PythonParameterAssignment.POSITION_ONLY,
                        ),
                        PythonParameter(
                            name = "positionOrName",
                            assignedBy = PythonParameterAssignment.POSITION_OR_NAME,
                        ),
                        PythonParameter(
                            name = "nameOnly",
                            assignedBy = PythonParameterAssignment.NAME_ONLY,
                        ),
                    ),
                ),
            )

            val SdsClass = pythonClass.toSdsClass()
            val constructorParameterNames = SdsClass.parametersOrEmpty().map { it.name }

            constructorParameterNames.shouldContainExactly(
                "positionOnly",
                "positionOrName",
                "nameOnly",
            )
        }

        @Test
        fun `should store attributes`() {
            val pythonClass = PythonClass(
                name = "TestClass",
                attributes = listOf(
                    PythonAttribute(name = "testAttribute"),
                ),
            )

            val SdsClass = pythonClass.toSdsClass()
            SdsClass.classMembersOrEmpty()
                .filterIsInstance<SdsAttribute>()
                .map { it.name }
                .shouldContainExactly("testAttribute")
        }

        @Test
        fun `should store methods`() {
            val pythonClass = PythonClass(
                name = "TestClass",
                methods = listOf(
                    PythonFunction(name = "testMethod"),
                ),
            )

            val SdsClass = pythonClass.toSdsClass()
            SdsClass.classMembersOrEmpty()
                .filterIsInstance<SdsFunction>()
                .map { it.name }
                .shouldContainExactly("testMethod")
        }
    }

    @Nested
    inner class ToSdsAttribute {

        @Test
        fun `should handle simple attributes`() {
            val pythonAttribute = PythonAttribute(name = "testAttribute")
            pythonAttribute.toSdsAttribute().asClue {
                it.name shouldBe "testAttribute"
                it.annotationCallsOrEmpty().shouldBeEmpty()

                val type = it.type
                type.shouldBeInstanceOf<SdsNamedType>()
                type.declaration.name shouldBe "Any"
                type.isNullable.shouldBeTrue()
            }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonAttribute = PythonAttribute(name = "Test_attribute")

            val SdsParameter = pythonAttribute.toSdsAttribute()
            SdsParameter.name shouldBe "testAttribute"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonAttribute = PythonAttribute(name = "Test_attribute")

            val arguments = pythonAttribute
                .toSdsAttribute()
                .uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SdsString>()
            pythonName.value shouldBe "Test_attribute"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonAttribute = PythonAttribute(name = "testAttribute")
            pythonAttribute.toSdsAttribute()
                .uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
                .shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonAttribute = PythonAttribute(
                name = "testAttribute",
                description = "Lorem ipsum",
            )

            val arguments = pythonAttribute
                .toSdsAttribute()
                .uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SdsString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonAttribute = PythonAttribute(
                name = "testAttribute",
                description = "",
            )

            pythonAttribute
                .toSdsAttribute()
                .uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
                .shouldBeNull()
        }

        @Test
        fun `should store type`() {
            val pythonAttribute = PythonAttribute(
                name = "testAttribute",
                type = PythonStringifiedType("str"),
            )

            pythonAttribute
                .toSdsAttribute()
                .type
                .shouldBeInstanceOf<SdsNamedType>()
                .asClue {
                    it.declaration.name shouldBe "String"
                    it.isNullable.shouldBeFalse()
                }
        }
    }

    @Nested
    inner class ToSdsFunction {

        @Test
        fun `should handle empty functions`() {
            val pythonFunction = PythonFunction(name = "testFunction")

            pythonFunction.toSdsFunction().asClue {
                it.name shouldBe "testFunction"
                it.isStatic.shouldBeFalse()
                it.annotationCallsOrEmpty().shouldBeEmpty()
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
                decorators = mutableListOf("staticmethod"),
            )
            PythonClass(
                name = "TestClass",
                methods = listOf(pythonFunction),
            )

            pythonFunction.toSdsFunction().asClue {
                it.isStatic.shouldBeTrue()
            }
        }

        @Test
        fun `should mark pure functions with annotation`() {
            val pythonFunction = PythonFunction(
                name = "testFunction",
                isPure = true,
            )

            pythonFunction
                .toSdsFunction()
                .uniqueAnnotationCallOrNull(QualifiedName.create("Pure"))
                .shouldNotBeNull()
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonFunction = PythonFunction(name = "Test_function")

            val SdsFunction = pythonFunction.toSdsFunction()
            SdsFunction.name shouldBe "testFunction"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonFunction = PythonFunction(name = "Test_function")

            val SdsFunction = pythonFunction.toSdsFunction()

            val pythonNameAnnotationUseOrNull =
                SdsFunction.uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldNotBeNull()

            val arguments = pythonNameAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SdsString>()
            pythonName.value shouldBe "Test_function"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonFunction = PythonFunction(name = "testFunction")

            val SdsFunction = pythonFunction.toSdsFunction()

            val pythonNameAnnotationUseOrNull =
                SdsFunction.uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonFunction = PythonFunction(
                name = "testFunction",
                description = "Lorem ipsum",
            )

            val SdsFunction = pythonFunction.toSdsFunction()

            val descriptionAnnotationUseOrNull =
                SdsFunction.uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
            descriptionAnnotationUseOrNull.shouldNotBeNull()

            val arguments = descriptionAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SdsString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonFunction = PythonFunction(
                name = "testFunction",
                description = "",
            )

            val SdsFunction = pythonFunction.toSdsFunction()

            val descriptionOrNull = SdsFunction.uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
            descriptionOrNull.shouldBeNull()
        }

        @Test
        fun `should store parameters`() {
            val pythonFunction = PythonFunction(
                name = "testFunction",
                parameters = listOf(
                    PythonParameter(
                        name = "self",
                        assignedBy = PythonParameterAssignment.IMPLICIT,
                    ),
                    PythonParameter(
                        name = "positionOnly",
                        assignedBy = PythonParameterAssignment.POSITION_ONLY,
                    ),
                    PythonParameter(
                        name = "positionOrName",
                        assignedBy = PythonParameterAssignment.POSITION_OR_NAME,
                    ),
                    PythonParameter(
                        name = "nameOnly",
                        assignedBy = PythonParameterAssignment.NAME_ONLY,
                    ),
                ),
            )

            pythonFunction.toSdsFunction()
                .parametersOrEmpty().map { it.name }
                .shouldContainExactly(
                    "positionOnly",
                    "positionOrName",
                    "nameOnly",
                )
        }

        @Test
        fun `should store results`() {
            val pythonFunction = PythonFunction(
                name = "testFunction",
                results = listOf(
                    PythonResult(name = "testResult"),
                ),
            )

            pythonFunction.toSdsFunction()
                .resultsOrEmpty().map { it.name }
                .shouldContainExactly(
                    "testResult",
                )
        }
    }

    @Nested
    inner class ToSdsParameter {

        @Test
        fun `should return null for implicit parameters`() {
            val pythonParameter = PythonParameter(
                name = "testParameter",
                assignedBy = PythonParameterAssignment.IMPLICIT,
            )

            pythonParameter.toSdsParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should handle simple parameters`() {
            val pythonParameter = PythonParameter(name = "testParameter")
            pythonParameter.toSdsParameterOrNull()
                .shouldNotBeNull()
                .asClue {
                    it.name shouldBe "testParameter"
                    it.annotationCallsOrEmpty().shouldBeEmpty()

                    val type = it.type
                    type.shouldBeInstanceOf<SdsNamedType>()
                    type.declaration.name shouldBe "Any"
                    type.isNullable.shouldBeTrue()

                    it.defaultValue.shouldBeNull()
                }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonParameter = PythonParameter(name = "Test_parameter")

            val SdsParameter = pythonParameter
                .toSdsParameterOrNull()
                .shouldNotBeNull()
            SdsParameter.name shouldBe "testParameter"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonParameter = PythonParameter(name = "Test_parameter")

            val arguments = pythonParameter
                .toSdsParameterOrNull()
                .shouldNotBeNull()
                .uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SdsString>()
            pythonName.value shouldBe "Test_parameter"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonParameter = PythonParameter(name = "testParameter")

            pythonParameter.toSdsParameterOrNull()
                .shouldNotBeNull()
                .uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
                .shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonParameter = PythonParameter(
                name = "testParameter",
                description = "Lorem ipsum",
            )

            val arguments = pythonParameter
                .toSdsParameterOrNull()
                .shouldNotBeNull()
                .uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SdsString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonParameter = PythonParameter(
                name = "testParameter",
                description = "",
            )

            pythonParameter
                .toSdsParameterOrNull()
                .shouldNotBeNull()
                .uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
                .shouldBeNull()
        }

        @Test
        fun `should store type`() {
            val pythonParameter = PythonParameter(
                name = "testParameter",
                type = PythonStringifiedType("str"),
            )

            pythonParameter
                .toSdsParameterOrNull()
                .shouldNotBeNull()
                .type
                .shouldBeInstanceOf<SdsNamedType>()
                .asClue {
                    it.declaration.name shouldBe "String"
                    it.isNullable.shouldBeFalse()
                }
        }

        @Test
        fun `should store default value`() {
            val pythonParameter = PythonParameter(
                name = "testParameter",
                defaultValue = PythonStringifiedExpression("None"),
            )

            pythonParameter
                .toSdsParameterOrNull()
                .shouldNotBeNull()
                .defaultValue
                .shouldBeInstanceOf<SdsNull>()
        }
    }

    @Nested
    inner class ToSdsResult {

        @Test
        fun `should handle simple results`() {
            val pythonResult = PythonResult(name = "testResult")

            pythonResult.toSdsResult().asClue {
                it.name shouldBe "testResult"
                it.annotationCallsOrEmpty().shouldBeEmpty()

                val type = it.type
                type.shouldBeInstanceOf<SdsNamedType>()
                type.declaration.name shouldBe "Any"
                type.isNullable.shouldBeTrue()
            }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonResult = PythonResult(name = "Test_result")

            val SdsResult = pythonResult.toSdsResult()
            SdsResult.name shouldBe "testResult"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonResult = PythonResult(name = "Test_result")

            val SdsFunction = pythonResult.toSdsResult()

            val pythonNameAnnotationUseOrNull = SdsFunction
                .uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
                .shouldNotBeNull()

            val arguments = pythonNameAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SdsString>()
            pythonName.value shouldBe "Test_result"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonResult = PythonResult(name = "testResult")

            pythonResult.toSdsResult()
                .uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
                .shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonResult = PythonResult(
                name = "testResult",
                description = "Lorem ipsum",
            )

            val SdsResult = pythonResult.toSdsResult()

            val arguments = SdsResult
                .uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SdsString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonResult = PythonResult(
                name = "testResult",
                description = "",
            )

            val SdsFunction = pythonResult.toSdsResult()

            val descriptionOrNull = SdsFunction.uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
            descriptionOrNull.shouldBeNull()
        }

        @Test
        fun `should store type`() {
            val pythonResult = PythonResult(
                name = "testResult",
                type = PythonStringifiedType("str"),
            )

            val type = pythonResult.toSdsResult().type.shouldBeInstanceOf<SdsNamedType>()
            type.declaration.name shouldBe "String"
            type.isNullable.shouldBeFalse()
        }
    }

    @Nested
    inner class ToSdsEnum {

        @Test
        fun `should handle empty enums`() {
            val pythonEnum = PythonEnum(name = "TestEnum")

            pythonEnum.toSdsEnum().asClue {
                it.name shouldBe "TestEnum"
                it.annotationCallsOrEmpty().shouldBeEmpty()
                it.variantsOrEmpty().shouldBeEmpty()
            }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonEnum = PythonEnum(name = "test_enum")

            val SdsEnum = pythonEnum.toSdsEnum()
            SdsEnum.name shouldBe "TestEnum"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonEnum = PythonEnum(name = "test_enum")

            val SdsEnum = pythonEnum.toSdsEnum()

            val pythonNameAnnotationUseOrNull = SdsEnum.uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldNotBeNull()

            val arguments = pythonNameAnnotationUseOrNull.argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SdsString>()
            pythonName.value shouldBe "test_enum"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonEnum = PythonEnum(name = "TestEnum")

            val SdsEnum = pythonEnum.toSdsEnum()

            val pythonNameAnnotationUseOrNull = SdsEnum.uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
            pythonNameAnnotationUseOrNull.shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonEnum = PythonEnum(
                name = "TestEnum",
                description = "Lorem ipsum",
            )

            val arguments = pythonEnum.toSdsEnum()
                .uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
                .shouldNotBeNull().argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SdsString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonEnum = PythonEnum(
                name = "TestEnum",
                description = "",
            )

            pythonEnum
                .toSdsEnum()
                .uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
                .shouldBeNull()
        }

        @Test
        fun `should store variants`() {
            val pythonEnum = PythonEnum(
                name = "TestEnum",
                instances = listOf(
                    PythonEnumInstance(name = "TestEnumInstance"),
                ),
            )

            pythonEnum.toSdsEnum()
                .variantsOrEmpty()
                .map { it.name }
                .shouldContainExactly("TestEnumInstance")
        }
    }

    @Nested
    inner class ToSdsEnumVariant {

        @Test
        fun `should handle empty enum variant`() {
            val pythonEnumInstance = PythonEnumInstance(name = "TestEnumInstance")

            pythonEnumInstance.toSdsEnumVariant().asClue {
                it.name shouldBe "TestEnumInstance"
                it.annotationCallsOrEmpty().shouldBeEmpty()
                it.typeParametersOrEmpty().shouldBeEmpty()
                it.parametersOrEmpty().shouldBeEmpty()
                it.constraintsOrEmpty().shouldBeEmpty()
            }
        }

        @Test
        fun `should convert name to camel case`() {
            val pythonEnumInstance = PythonEnumInstance(name = "test_enum_instance")

            val SdsEnumVariant = pythonEnumInstance.toSdsEnumVariant()
            SdsEnumVariant.name shouldBe "TestEnumInstance"
        }

        @Test
        fun `should store python name if it differs from stub name`() {
            val pythonEnumInstance = PythonEnumInstance(name = "test_enum_instance")

            val arguments = pythonEnumInstance.toSdsEnumVariant()
                .uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val pythonName = arguments[0].value
            pythonName.shouldBeInstanceOf<SdsString>()
            pythonName.value shouldBe "test_enum_instance"
        }

        @Test
        fun `should not store python name if it is identical to stub name`() {
            val pythonEnumInstance = PythonEnumInstance(name = "TestEnumInstance")

            pythonEnumInstance.toSdsEnumVariant()
                .uniqueAnnotationCallOrNull(QualifiedName.create("PythonName"))
                .shouldBeNull()
        }

        @Test
        fun `should store description if it is not blank`() {
            val pythonEnumInstance = PythonEnumInstance(
                name = "TestEnumInstance",
                description = "Lorem ipsum",
            )

            val arguments = pythonEnumInstance.toSdsEnumVariant()
                .uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
                .shouldNotBeNull()
                .argumentsOrEmpty()
            arguments.shouldHaveSize(1)

            val description = arguments[0].value
            description.shouldBeInstanceOf<SdsString>()
            description.value shouldBe "Lorem ipsum"
        }

        @Test
        fun `should not store description if it is blank`() {
            val pythonEnumInstance = PythonEnumInstance(
                name = "TestEnumInstance",
                description = "",
            )

            pythonEnumInstance.toSdsEnumVariant()
                .uniqueAnnotationCallOrNull(QualifiedName.create("Description"))
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
            Two_words | twoWords""",
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
            Two_words | TwoWords""",
        )
        fun `snakeCaseToUpperCamelCase should convert snake case to upper camel case`(input: String, expected: String) {
            input.snakeCaseToUpperCamelCase() shouldBe expected
        }
    }

    @Nested
    inner class TypeConversions {

        @Test
        fun `should convert named types`() {
            val SdsType = PythonNamedType(PythonEnum(name = "MyEnum")).toSdsType().shouldBeInstanceOf<SdsNamedType>()
            SdsType.declaration.name shouldBe "MyEnum"
            SdsType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert stringified type 'bool' to Boolean`() {
            val SdsType = PythonStringifiedType("bool").toSdsType().shouldBeInstanceOf<SdsNamedType>()
            SdsType.declaration.name shouldBe "Boolean"
            SdsType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert stringified type 'float' to Float`() {
            val SdsType = PythonStringifiedType("float").toSdsType().shouldBeInstanceOf<SdsNamedType>()
            SdsType.declaration.name shouldBe "Float"
            SdsType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert stringified type 'int' to Int`() {
            val SdsType = PythonStringifiedType("int").toSdsType().shouldBeInstanceOf<SdsNamedType>()
            SdsType.declaration.name shouldBe "Int"
            SdsType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert stringified type 'str' to String`() {
            val SdsType = PythonStringifiedType("str").toSdsType().shouldBeInstanceOf<SdsNamedType>()
            SdsType.declaration.name shouldBe "String"
            SdsType.isNullable.shouldBeFalse()
        }

        @Test
        fun `should convert other types to nullable Any`() {
            val SdsType = PythonStringifiedType("other").toSdsType().shouldBeInstanceOf<SdsNamedType>()
            SdsType.declaration.name shouldBe "Any"
            SdsType.isNullable.shouldBeTrue()
        }

        @Test
        fun `should convert null to nullable Any`() {
            val SdsType = null.toSdsType().shouldBeInstanceOf<SdsNamedType>()
            SdsType.declaration.name shouldBe "Any"
            SdsType.isNullable.shouldBeTrue()
        }
    }

    @Nested
    inner class ValueConversions {

        @Test
        fun `should convert blank strings to null`() {
            PythonStringifiedExpression(" ")
                .toSdsExpression()
                .shouldBeNull()
        }

        @Test
        fun `should convert False to a false boolean literal`() {
            val SdsBoolean = PythonStringifiedExpression("False")
                .toSdsExpression()
                .shouldBeInstanceOf<SdsBoolean>()
            SdsBoolean.isTrue.shouldBeFalse()
        }

        @Test
        fun `should convert True to a true boolean literal`() {
            val SdsBoolean = PythonStringifiedExpression("True")
                .toSdsExpression()
                .shouldBeInstanceOf<SdsBoolean>()
            SdsBoolean.isTrue.shouldBeTrue()
        }

        @Test
        fun `should convert None to a null literal`() {
            PythonStringifiedExpression("None")
                .toSdsExpression()
                .shouldBeInstanceOf<SdsNull>()
        }

        @Test
        fun `should convert ints to integer literals`() {
            val SdsInt = PythonStringifiedExpression("123")
                .toSdsExpression()
                .shouldBeInstanceOf<SdsInt>()
            SdsInt.value shouldBe 123
        }

        @Test
        fun `should convert floats to float literals`() {
            val SdsFloat = PythonStringifiedExpression("123.45")
                .toSdsExpression()
                .shouldBeInstanceOf<SdsFloat>()
            SdsFloat.value shouldBe 123.45
        }

        @Test
        fun `should convert single-quoted strings to string literals`() {
            val SdsString = PythonStringifiedExpression("'string'")
                .toSdsExpression()
                .shouldBeInstanceOf<SdsString>()
            SdsString.value shouldBe "string"
        }

        @Test
        fun `should convert double-quoted strings to string literals`() {
            val SdsString = PythonStringifiedExpression("\"string\"")
                .toSdsExpression()
                .shouldBeInstanceOf<SdsString>()
            SdsString.value shouldBe "string"
        }

        @Test
        fun `should convert other stringified expressions to '###invalid###' strings`() {
            val SdsString = PythonStringifiedExpression("unknown")
                .toSdsExpression()
                .shouldBeInstanceOf<SdsString>()
            SdsString.value shouldBe "###invalid###unknown###"
        }

        @Test
        fun `should convert other expressions to '###invalid###' strings`() {
            val SdsString = PythonString("unknown")
                .toSdsExpression()
                .shouldBeInstanceOf<SdsString>()
            SdsString.value shouldBe "###invalid###PythonString(value=unknown)###"
        }
    }
}
