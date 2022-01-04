package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction

/**
 * Constructor for ClassAdapterContentBuilder
 *
 * @param pythonClass The module whose adapter content should be built
 */
class ClassAdapterContentBuilder(var pythonClass: MutablePythonClass) {

    /**
     * Builds a string containing the formatted class content
     *
     * @return The string containing the formatted class content
     */
    fun buildClass(): String {
        var formattedClass = "class " + pythonClass.name + ":"
        if (!pythonClass.methods.isEmpty()) {
            formattedClass = """
                $formattedClass

                """.trimIndent()
            formattedClass = (formattedClass
                + indent(listToString(buildAllFunctions(), 2)))
        }
        return formattedClass
    }

    private fun buildAllFunctions(): List<String> {
        val formattedFunctions: MutableList<String> = ArrayList()
        pythonClass.methods
            .forEach { pythonFunction: MutablePythonFunction ->
                val functionAdapterContentBuilder = FunctionAdapterContentBuilder(pythonFunction)
                formattedFunctions.add(
                    functionAdapterContentBuilder.buildFunction()
                )
            }
        return formattedFunctions
    }
}
