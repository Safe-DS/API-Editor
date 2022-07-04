package com.larsreimann.api_editor.features.api

sealed interface ApiElementId

@JvmInline
value class ModuleId(private val value: String): ApiElementId {
    override fun toString(): String = value
}

@JvmInline
value class ClassId(private val value: String): ApiElementId {
    override fun toString(): String = value
}

@JvmInline
value class FunctionId(private val value: String): ApiElementId {
    override fun toString(): String = value
}

@JvmInline
value class ParameterId(private val value: String): ApiElementId {
    override fun toString(): String = value
}
