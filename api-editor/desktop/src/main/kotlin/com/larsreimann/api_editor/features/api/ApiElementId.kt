package com.larsreimann.api_editor.features.api

@JvmInline
value class ApiElementId(private val value: String) {
    override fun toString(): String = value
}
