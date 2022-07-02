package com.larsreimann.apiEditor.codegen

import com.larsreimann.apiEditor.model.PythonParameterAssignment.IMPLICIT
import com.larsreimann.apiEditor.mutableModel.PythonAttribute
import com.larsreimann.apiEditor.mutableModel.PythonClass
import com.larsreimann.apiEditor.mutableModel.PythonEnum
import com.larsreimann.apiEditor.mutableModel.PythonEnumInstance
import com.larsreimann.apiEditor.mutableModel.PythonExpression
import com.larsreimann.apiEditor.mutableModel.PythonFunction
import com.larsreimann.apiEditor.mutableModel.PythonModule
import com.larsreimann.apiEditor.mutableModel.PythonNamedType
import com.larsreimann.apiEditor.mutableModel.PythonParameter
import com.larsreimann.apiEditor.mutableModel.PythonResult
import com.larsreimann.apiEditor.mutableModel.PythonStringifiedExpression
import com.larsreimann.apiEditor.mutableModel.PythonStringifiedType
import com.larsreimann.apiEditor.mutableModel.PythonType
import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.emf.createSdsAnnotationCall
import com.larsreimann.safeds.emf.createSdsArgument
import com.larsreimann.safeds.emf.createSdsAttribute
import com.larsreimann.safeds.emf.createSdsBoolean
import com.larsreimann.safeds.emf.createSdsClass
import com.larsreimann.safeds.emf.createSdsCompilationUnit
import com.larsreimann.safeds.emf.createSdsDummyResource
import com.larsreimann.safeds.emf.createSdsEnum
import com.larsreimann.safeds.emf.createSdsEnumVariant
import com.larsreimann.safeds.emf.createSdsFloat
import com.larsreimann.safeds.emf.createSdsFunction
import com.larsreimann.safeds.emf.createSdsInt
import com.larsreimann.safeds.emf.createSdsNamedType
import com.larsreimann.safeds.emf.createSdsNull
import com.larsreimann.safeds.emf.createSdsParameter
import com.larsreimann.safeds.emf.createSdsResult
import com.larsreimann.safeds.emf.createSdsString
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsAbstractType
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.serializer.SerializationResult
import com.larsreimann.safeds.serializer.serializeToFormattedString

/**
 * Create Simple-ML stub code for the Python module.
 */
fun PythonModule.toStubCode(): String {
    val compilationUnit = toSdsCompilationUnit()

    // Required to serialize the compilation unit
    createSdsDummyResource(
        "compilationUnitStub",
        SdsFileExtension.Stub,
        compilationUnit
    )

    return when (val result = compilationUnit.serializeToFormattedString()) {
        is SerializationResult.Success -> result.code + "\n"
        is SerializationResult.Failure -> throw IllegalStateException(result.message)
    }
}

/**
 * Creates a Simple-ML compilation unit that corresponds to the Python module.
 */
fun PythonModule.toSdsCompilationUnit(): SdsCompilationUnit {
    val classes = classes.map { it.toSdsClass() }
    val functions = functions.map { it.toSdsFunction() }
    val enums = enums.map { it.toSdsEnum() }

    return createSdsCompilationUnit(
        packageName = name,
        members = classes + functions + enums
    )
}

/**
 * Creates a Simple-ML class that corresponds to the Python class.
 */
fun PythonClass.toSdsClass(): SdsClass {
    val stubName = name.snakeCaseToUpperCamelCase()

    val attributes = attributes.map { it.toSdsAttribute() }
    val methods = methods.map { it.toSdsFunction() }

    return createSdsClass(
        name = stubName,
        annotationCalls = buildList {
            if (name != stubName) {
                add(createSdsPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSdsDescriptionAnnotationUse(description))
            }
        },
        parameters = buildConstructor(),
        members = attributes + methods
    )
}

private fun PythonClass.buildConstructor(): List<SdsParameter> {
    return constructor
        ?.parameters
        ?.mapNotNull { it.toSdsParameterOrNull() }
        .orEmpty()
}

/**
 * Creates a Simple-ML attribute that corresponds to the Python attribute.
 */
fun PythonAttribute.toSdsAttribute(): SdsAttribute {
    val stubName = name.snakeCaseToLowerCamelCase()

    return createSdsAttribute(
        name = stubName,
        annotationCalls = buildList {
            if (name != stubName) {
                add(createSdsPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSdsDescriptionAnnotationUse(description))
            }
        },
        type = type.toSdsType()
    )
}

fun PythonFunction.toSdsFunction(): SdsFunction {
    val stubName = name.snakeCaseToLowerCamelCase()

    return createSdsFunction(
        name = stubName,
        isStatic = isStaticMethod(),
        annotationCalls = buildList {
            if (isPure) {
                add(createSdsAnnotationCall("Pure"))
            }
            if (name != stubName) {
                add(createSdsPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSdsDescriptionAnnotationUse(description))
            }
        },
        parameters = parameters.mapNotNull { it.toSdsParameterOrNull() },
        results = results.map { it.toSdsResult() }
    )
}

private fun createSdsDescriptionAnnotationUse(description: String): SdsAnnotationCall {
    return createSdsAnnotationCall(
        "Description",
        listOf(createSdsArgument(createSdsString(description)))
    )
}

private fun createSdsPythonNameAnnotationUse(name: String): SdsAnnotationCall {
    return createSdsAnnotationCall(
        "PythonName",
        listOf(createSdsArgument(createSdsString(name)))
    )
}

fun PythonParameter.toSdsParameterOrNull(): SdsParameter? {
    if (assignedBy == IMPLICIT) {
        return null
    }

    val stubName = name.snakeCaseToLowerCamelCase()

    return createSdsParameter(
        name = stubName,
        annotationCalls = buildList {
            if (name != stubName) {
                add(createSdsPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSdsDescriptionAnnotationUse(description))
            }
        },
        type = type.toSdsType(),
        defaultValue = defaultValue?.toSdsExpression()
    )
}

fun PythonResult.toSdsResult(): SdsResult {
    val stubName = name.snakeCaseToLowerCamelCase()

    return createSdsResult(
        name = stubName,
        annotationCalls = buildList {
            if (name != stubName) {
                add(createSdsPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSdsDescriptionAnnotationUse(description))
            }
        },
        type = type.toSdsType()
    )
}

/**
 * Creates a Simple-ML enum that corresponds to the Python enum.
 */
fun PythonEnum.toSdsEnum(): SdsEnum {
    val stubName = name.snakeCaseToUpperCamelCase()

    return createSdsEnum(
        name = stubName,
        annotationCalls = buildList {
            if (name != stubName) {
                add(createSdsPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSdsDescriptionAnnotationUse(description))
            }
        },
        variants = instances.map { it.toSdsEnumVariant() }
    )
}

/**
 * Creates a Simple-ML enum variant that corresponds to the Python enum instance.
 */
fun PythonEnumInstance.toSdsEnumVariant(): SdsEnumVariant {
    val stubName = name.snakeCaseToUpperCamelCase()

    return createSdsEnumVariant(
        name = stubName,
        annotationCalls = buildList {
            if (name != stubName) {
                add(createSdsPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSdsDescriptionAnnotationUse(description))
            }
        }
    )
}

// Name conversions ----------------------------------------------------------------------------------------------------

fun String.snakeCaseToLowerCamelCase(): String {
    return this.snakeCaseToCamelCase().replaceFirstChar { it.lowercase() }
}

fun String.snakeCaseToUpperCamelCase(): String {
    return this.snakeCaseToCamelCase().replaceFirstChar { it.uppercase() }
}

private fun String.snakeCaseToCamelCase(): String {
    return this.replace(Regex("_(.)")) { it.groupValues[1].uppercase() }
}

// Type conversions ----------------------------------------------------------------------------------------------------

fun PythonType?.toSdsType(): SdsAbstractType {
    return when (this) {
        is PythonNamedType -> {
            createSdsNamedType(
                declaration = createSdsClass(this.declaration!!.name)
            )
        }
        is PythonStringifiedType -> {
            when (this.string) {
                "bool" -> createSdsNamedType(
                    declaration = createSdsClass("Boolean")
                )
                "float" -> createSdsNamedType(
                    declaration = createSdsClass("Float")
                )
                "int" -> createSdsNamedType(
                    declaration = createSdsClass("Int")
                )
                "str" -> createSdsNamedType(
                    declaration = createSdsClass("String")
                )
                else -> createSdsNamedType(
                    declaration = createSdsClass("Any"),
                    isNullable = true
                )
            }
        }
        null -> createSdsNamedType(
            declaration = createSdsClass("Any"),
            isNullable = true
        )
    }
}

// Value conversions ---------------------------------------------------------------------------------------------------

fun PythonExpression.toSdsExpression(): SdsAbstractExpression? {
    if (this !is PythonStringifiedExpression) {
        return createSdsString("###invalid###$this###")
    }

    return when {
        string.isBlank() -> null
        string == "False" -> createSdsBoolean(false)
        string == "True" -> createSdsBoolean(true)
        string == "None" -> createSdsNull()
        string.isIntLiteral() -> createSdsInt(string.toInt())
        string.isFloatLiteral() -> createSdsFloat(string.toDouble())
        string.isStringLiteral() -> createSdsString(string.substring(1, string.length - 1))
        else -> createSdsString("###invalid###$string###")
    }
}

private fun String.isIntLiteral(): Boolean {
    return this.toIntOrNull() != null
}

private fun String.isFloatLiteral(): Boolean {
    return this.toDoubleOrNull() != null
}

private fun String.isStringLiteral(): Boolean {
    return length >= 2 && this[0] == this[length - 1] && this[0] in setOf('\'', '"')
}
