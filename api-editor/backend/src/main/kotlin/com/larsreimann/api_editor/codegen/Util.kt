package com.larsreimann.api_editor.codegen

internal fun String.prependIndentUnlessBlank(indent: String = "    "): String {
    return lineSequence()
        .map {
            when {
                it.isBlank() -> it.trim()
                else -> it.prependIndent(indent)
            }
        }
        .joinToString("\n")
}

internal fun StringBuilder.appendIndented(init: StringBuilder.() -> Unit): StringBuilder {
    val stringToIndent = StringBuilder().apply(init).toString()
    append(stringToIndent.prependIndentUnlessBlank())
    return this
}

internal fun StringBuilder.appendIndented(value: String): StringBuilder {
    append(value.prependIndentUnlessBlank())
    return this
}
