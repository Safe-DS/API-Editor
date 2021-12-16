package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.io.FileBuilder
import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import java.util.function.Consumer

/**
 * Constructor for ClassStubContentBuilder
 *
 * @param pythonClass The class whose stub content should be built
 */
class ClassStubContentBuilder(
    private val pythonClass: AnnotatedPythonClass
) : FileBuilder() {
    var classMethods: List<AnnotatedPythonFunction>
    var hasConstructor: Boolean
    var hasClassMethods: Boolean
    var constructor: AnnotatedPythonFunction? = null

    init {
        val originalClassMethods = pythonClass.methods
        hasConstructor = hasConstructor()
        hasClassMethods = hasClassMethods()
        if (!hasConstructor) {
            classMethods = originalClassMethods
        } else {
            classMethods = classMethods()
            constructor = constructorOrNull()
        }
    }

    /**
     * Builds a string containing the formatted class content
     *
     * @return The string containing the formatted class content
     */
    fun buildClass(): String {
        val formattedClassCall = buildClassCall()
        val formattedClassBody = buildClassBody()
        return when {
            formattedClassBody.isBlank() -> "$formattedClassCall {}"
            else -> """
                |$formattedClassCall {
                |${indent(formattedClassBody)}
                |}
                """.trimMargin()
        }
    }

    private fun classMethods(): List<AnnotatedPythonFunction> {
        return pythonClass.methods.filter { it.name != "__init__" }
    }

    private fun hasClassMethods(): Boolean {
        return pythonClass.methods.any { it.name != "__init__" }
    }

    private fun hasConstructor(): Boolean {
        return pythonClass.methods.any { it.name == "__init__" }
    }

    private fun constructorOrNull(): AnnotatedPythonFunction? {
        return pythonClass.methods.firstOrNull { it.name == "__init__" }
    }

    private fun buildClassCall(): String {
        val formattedConstructorBody = when {
            hasConstructor() -> buildConstructor(constructor)
            else -> ""
        }
        return "class ${pythonClass.name}($formattedConstructorBody)"
    }

    private fun buildConstructor(
        pythonFunction: AnnotatedPythonFunction?
    ): String {
        val pythonParameters = pythonFunction!!.parameters
        if (pythonParameters.isEmpty()) {
            return ""
        }
        val formattedConstructorParameters: MutableList<String> = ArrayList()
        pythonParameters.forEach(Consumer { pythonParameter: AnnotatedPythonParameter ->
            formattedConstructorParameters.add(
                buildConstructorParameter(pythonParameter)
            )
        })
        return java.lang.String.join(", ", formattedConstructorParameters)
    }

    private fun buildConstructorParameter(
        pythonParameter: AnnotatedPythonParameter
    ): String {
        val nameAndType = "${pythonParameter.name}: Any?"
        val defaultValue = when {
            pythonParameter.defaultValue.isNullOrBlank() -> ""
            else -> " or ${buildFormattedDefaultValue(pythonParameter.defaultValue)}"
        }

        return "$nameAndType$defaultValue"
    }

    private fun buildClassBody(): String {
        var formattedAttributes = ""
        if (hasConstructor) {
            formattedAttributes = buildAttributes()
        }
        var formattedFunctions = ""
        if (hasClassMethods) {
            formattedFunctions = buildFunctions()
        }
        if (formattedAttributes.isBlank()) {
            return formattedFunctions.ifBlank {
                ""
            }
        }
        return if (formattedFunctions.isBlank()) {
            formattedAttributes
        } else """
     $formattedAttributes

     $formattedFunctions
     """.trimIndent()
    }

    private fun buildAttributes(): String {
        return constructorOrNull()
            ?.parameters
            ?.joinToString { "attr ${it.name}: Any?" }
            ?: ""
    }

    private fun buildFunctions(): String {
        return classMethods.joinToString(separator = "\n") {
            buildFunction(it)
        }
    }
}
