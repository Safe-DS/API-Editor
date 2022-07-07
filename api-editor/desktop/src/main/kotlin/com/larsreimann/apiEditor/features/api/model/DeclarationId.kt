package com.larsreimann.apiEditor.features.api.model

sealed interface DeclarationId

@JvmInline
value class ModuleId(private val value: String): DeclarationId {
    override fun toString(): String = value
}

fun String.asModuleId(): ModuleId = ModuleId(this)

@JvmInline
value class ClassId(private val value: String): DeclarationId {
    override fun toString(): String = value
}

fun String.asClassId(): ClassId = ClassId(this)

@JvmInline
value class FunctionId(private val value: String): DeclarationId {
    override fun toString(): String = value
}

fun String.asFunctionId(): FunctionId = FunctionId(this)

@JvmInline
value class ParameterId(private val value: String): DeclarationId {
    override fun toString(): String = value
}

fun String.asParameterId(): ParameterId = ParameterId(this)
