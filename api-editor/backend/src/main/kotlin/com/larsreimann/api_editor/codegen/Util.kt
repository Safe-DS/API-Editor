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

internal fun StringBuilder.appendIndented(value: String, indent: String = "    "): StringBuilder {
    append(value.prependIndentUnlessBlank(indent))
    return this
}
