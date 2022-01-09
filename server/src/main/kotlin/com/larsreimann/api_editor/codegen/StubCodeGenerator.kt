package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.PythonParameterAssignment.IMPLICIT
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonEnum
import com.larsreimann.api_editor.mutable_model.PythonEnumInstance
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonResult
import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.emf.createSmlAnnotationUse
import de.unibonn.simpleml.emf.createSmlArgument
import de.unibonn.simpleml.emf.createSmlAttribute
import de.unibonn.simpleml.emf.createSmlBoolean
import de.unibonn.simpleml.emf.createSmlClass
import de.unibonn.simpleml.emf.createSmlCompilationUnit
import de.unibonn.simpleml.emf.createSmlDummyResource
import de.unibonn.simpleml.emf.createSmlEnum
import de.unibonn.simpleml.emf.createSmlEnumVariant
import de.unibonn.simpleml.emf.createSmlFloat
import de.unibonn.simpleml.emf.createSmlFunction
import de.unibonn.simpleml.emf.createSmlInt
import de.unibonn.simpleml.emf.createSmlNamedType
import de.unibonn.simpleml.emf.createSmlNull
import de.unibonn.simpleml.emf.createSmlParameter
import de.unibonn.simpleml.emf.createSmlResult
import de.unibonn.simpleml.emf.createSmlString
import de.unibonn.simpleml.emf.smlPackage
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.simpleML.SmlAbstractExpression
import de.unibonn.simpleml.simpleML.SmlAbstractType
import de.unibonn.simpleml.simpleML.SmlAnnotationUse
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlEnum
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlResult

/**
 * Create Simple-ML stub code for the Python module.
 */
fun PythonModule.toStubCode(): String {
    val compilationUnit = toSmlCompilationUnit()

    // Required to serialize the compilation unit
    createSmlDummyResource(
        "compilationUnitStub",
        SmlFileExtension.Stub,
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
internal fun PythonModule.toSmlCompilationUnit(): SmlCompilationUnit {
    val classes = classes.map { it.toSmlClass() }
    val functions = functions.map { it.toSmlFunction() }
    val enums = enums.map { it.toSmlEnum() }

    return createSmlCompilationUnit {
        smlPackage(
            name = name,
            members = classes + functions + enums
        )
    }
}

/**
 * Creates a Simple-ML class that corresponds to the Python class.
 */
internal fun PythonClass.toSmlClass(): SmlClass {
    val stubName = name.snakeCaseToUpperCamelCase()

    val attributes = attributes.map { it.toSmlAttribute() }
    val methods = methods.map { it.toSmlFunction() }

    return createSmlClass(
        name = stubName,
        annotations = buildList {
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        },
        parameters = buildConstructor(),
        members = attributes + methods
    )
}

private fun PythonClass.buildConstructor(): List<SmlParameter> {
    return constructor
        ?.parameters
        ?.mapNotNull { it.toSmlParameterOrNull() }
        .orEmpty()
}

/**
 * Creates a Simple-ML attribute that corresponds to the Python attribute.
 */
internal fun PythonAttribute.toSmlAttribute(): SmlAttribute {
    val stubName = name.snakeCaseToLowerCamelCase()

    return createSmlAttribute(
        name = stubName,
        annotations = buildList {
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        },
        type = typeInDocs.toSmlType()
    )
}

internal fun PythonFunction.toSmlFunction(): SmlFunction {
    val stubName = name.snakeCaseToLowerCamelCase()

    return createSmlFunction(
        name = stubName,
        isStatic = isStaticMethod(),
        annotations = buildList {
            if (isPure) {
                add(createSmlAnnotationUse("Pure"))
            }
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        },
        parameters = parameters.mapNotNull { it.toSmlParameterOrNull() },
        results = results.map { it.toSmlResult() }
    )
}

private fun createSmlDescriptionAnnotationUse(description: String): SmlAnnotationUse {
    return createSmlAnnotationUse(
        "Description",
        listOf(createSmlArgument(createSmlString(description)))
    )
}

private fun createSmlPythonNameAnnotationUse(name: String): SmlAnnotationUse {
    return createSmlAnnotationUse(
        "PythonName",
        listOf(createSmlArgument(createSmlString(name)))
    )
}

internal fun PythonParameter.toSmlParameterOrNull(): SmlParameter? {
    if (assignedBy == IMPLICIT) {
        return null
    }

    val stubName = name.snakeCaseToLowerCamelCase()

    return createSmlParameter(
        name = stubName,
        annotations = buildList {
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        },
        type = typeInDocs.toSmlType(),
        defaultValue = defaultValue?.toSmlExpression()
    )
}

internal fun PythonResult.toSmlResult(): SmlResult {
    val stubName = name.snakeCaseToLowerCamelCase()

    return createSmlResult(
        name = stubName,
        annotations = buildList {
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        },
        type = type.toSmlType()
    )
}

/**
 * Creates a Simple-ML enum that corresponds to the Python enum.
 */
internal fun PythonEnum.toSmlEnum(): SmlEnum {
    val stubName = name.snakeCaseToUpperCamelCase()

    return createSmlEnum(
        name = stubName,
        annotations = buildList {
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        },
        variants = instances.map { it.toSmlEnumVariant() },
    )
}

/**
 * Creates a Simple-ML enum variant that corresponds to the Python enum instance.
 */
internal fun PythonEnumInstance.toSmlEnumVariant(): SmlEnumVariant {
    val stubName = name.snakeCaseToUpperCamelCase()

    return createSmlEnumVariant(
        name = stubName,
        annotations = buildList {
            if (name != stubName) {
                add(createSmlPythonNameAnnotationUse(name))
            }
            if (description.isNotBlank()) {
                add(createSmlDescriptionAnnotationUse(description))
            }
        }
    )
}

// Name conversions ----------------------------------------------------------------------------------------------------

internal fun String.snakeCaseToLowerCamelCase(): String {
    return this.snakeCaseToCamelCase().replaceFirstChar { it.lowercase() }
}

internal fun String.snakeCaseToUpperCamelCase(): String {
    return this.snakeCaseToCamelCase().replaceFirstChar { it.uppercase() }
}

private fun String.snakeCaseToCamelCase(): String {
    return this.replace(Regex("_(.)")) { it.groupValues[1].uppercase() }
}

// Type conversions ----------------------------------------------------------------------------------------------------

internal fun String.toSmlType(): SmlAbstractType {
    return when (this) {
        "bool" -> createSmlNamedType(
            declaration = createSmlClass("Boolean")
        )
        "float" -> createSmlNamedType(
            declaration = createSmlClass("Float")
        )
        "int" -> createSmlNamedType(
            declaration = createSmlClass("Int")
        )
        "str" -> createSmlNamedType(
            declaration = createSmlClass("String")
        )
        else -> createSmlNamedType(
            declaration = createSmlClass("Any"),
            isNullable = true
        )
    }
}

// Value conversions ---------------------------------------------------------------------------------------------------

internal fun String.toSmlExpression(): SmlAbstractExpression? {
    return when {
        isBlank() -> null
        this == "False" -> createSmlBoolean(false)
        this == "True" -> createSmlBoolean(true)
        this == "None" -> createSmlNull()
        isIntLiteral() -> createSmlInt(toInt())
        isFloatLiteral() -> createSmlFloat(toDouble())
        isStringLiteral() -> createSmlString(substring(1, length - 1))
        else -> createSmlString("###invalid###$this###")
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
