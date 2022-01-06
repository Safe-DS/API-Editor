package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.model.PythonParameterAssignment.NAME_ONLY
import com.larsreimann.api_editor.model.PythonParameterAssignment.POSITION_ONLY
import com.larsreimann.api_editor.model.PythonParameterAssignment.POSITION_OR_NAME
import com.larsreimann.api_editor.mutable_model.MutablePythonAttribute
import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonEnum
import com.larsreimann.api_editor.mutable_model.MutablePythonEnumInstance
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.MutablePythonResult
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
fun MutablePythonModule.toStubCode(): String {
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
internal fun MutablePythonModule.toSmlCompilationUnit(): SmlCompilationUnit {
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
internal fun MutablePythonClass.toSmlClass(): SmlClass {
    val stubName = name.snakeCaseToUpperCamelCase()

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
        members = buildAttributes() + buildMethods()
    )
}

private fun MutablePythonClass.buildConstructor(): List<SmlParameter> {
    return constructorOrNull()
        ?.parameters
        ?.mapNotNull { it.toSmlParameterOrNull() }
        .orEmpty()
}

private fun MutablePythonClass.buildAttributes(): List<SmlAttribute> {
    return attributes.map { it.toSmlAttribute() }
}

/**
 * Creates a Simple-ML attribute that corresponds to the Python attribute.
 */
internal fun MutablePythonAttribute.toSmlAttribute(): SmlAttribute {
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

private fun MutablePythonClass.buildMethods(): List<SmlFunction> {
    return methodsExceptConstructor().map { it.toSmlFunction() }
}

internal fun MutablePythonFunction.toSmlFunction(): SmlFunction {
    val stubName = name.snakeCaseToLowerCamelCase()

    return createSmlFunction(
        name = stubName,
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

internal fun MutablePythonParameter.toSmlParameterOrNull(): SmlParameter? {
    if (assignedBy !in setOf(POSITION_ONLY, POSITION_OR_NAME, NAME_ONLY)) {
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

internal fun MutablePythonResult.toSmlResult(): SmlResult {
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
internal fun MutablePythonEnum.toSmlEnum(): SmlEnum {
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
internal fun MutablePythonEnumInstance.toSmlEnumVariant(): SmlEnumVariant {
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
