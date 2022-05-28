package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonClass
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonParameter

private fun attributesDocstring(attributes: List<PythonAttribute>) = buildString {
    if (attributes.all { it.description.isBlank() }) {
        return@buildString
    }

    appendLine("Attributes")
    appendLine("----------")
    append(attributes.joinToString("\n") { it.docstring() })
}

private fun PythonAttribute.docstring() = buildString {
    append(name)
    type.toPythonCodeOrNull()?.let { append(" : $it") }
    if (description.isNotBlank()) {
        appendLine()
        appendIndented(description)
    }
}

fun PythonClass.docstring() = buildString {
    if (description.isNotBlank()) {
        append(description)
    }

    val parameterSection = constructor?.parameters?.let { parametersDocstring(it) } ?: ""
    if (parameterSection.isNotBlank()) {
        if (description.isNotBlank()) {
            append("\n\n")
        }
        append(parameterSection)
    }

    val attributesSection = attributesDocstring(attributes)
    if (attributesSection.isNotBlank()) {
        if (description.isNotBlank() || parameterSection.isNotBlank()) {
            append("\n\n")
        }
        appendLine(attributesSection)
    }
}

fun PythonFunction.docstring() = buildString {
    if (description.isNotBlank()) {
        appendLine(description)
    }

    val parameterSection = parametersDocstring(parameters)
    if (parameterSection.isNotBlank()) {
        if (description.isNotBlank()) {
            appendLine()
        }
        appendLine(parameterSection)
    }
}

private fun parametersDocstring(parameters: List<PythonParameter>) = buildString {
    if (parameters.all { it.description.isBlank() }) {
        return@buildString
    }

    appendLine("Parameters")
    appendLine("----------")
    append(parameters.joinToString("\n") { it.docstring() })
}

private fun PythonParameter.docstring() = buildString {
    append(name)
    type.toPythonCodeOrNull()?.let { append(" : $it") }
    if (description.isNotBlank()) {
        appendLine()
        appendIndented(description)
    }
}
