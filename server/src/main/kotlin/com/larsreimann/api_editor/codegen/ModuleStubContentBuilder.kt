package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.io.FileBuilder
import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonModule
import java.util.function.Consumer

class ModuleStubContentBuilder
/**
 * Constructor for ModuleStubContentBuilder
 *
 * @param pythonModule The module whose stub content should be built
 */(var pythonModule: AnnotatedPythonModule) : FileBuilder() {
    /**
     * Builds a string containing the formatted module content
     *
     * @return The string containing the formatted module content
     */
    fun buildModuleContent(): String {
        var formattedPackageDeclaration = buildPackageDeclaration()
        var formattedClasses = buildAllClasses()
        var formattedFunctions = buildAllFunctions()
        val separators = buildSeparators(
            formattedPackageDeclaration,
            formattedClasses,
            formattedFunctions
        )
        formattedPackageDeclaration += separators[0]
        formattedClasses += separators[1]
        formattedFunctions += separators[2]
        return (formattedPackageDeclaration
            + formattedClasses
            + formattedFunctions)
    }

    private fun buildPackageDeclaration(): String {
        return ("package "
            + "simpleml."
            + pythonModule.name)
    }

    private fun buildAllClasses(): String {
        val formattedClasses: MutableList<String> = ArrayList()
        pythonModule.classes.forEach(Consumer { pythonClass: AnnotatedPythonClass? ->
            val classStubContentBuilder = ClassStubContentBuilder(
                pythonClass!!
            )
            formattedClasses.add(classStubContentBuilder.buildClass())
        })
        return listToString(formattedClasses, 2)
    }

    private fun buildAllFunctions(): String {
        val formattedFunctions: MutableList<String> = ArrayList()
        pythonModule.functions.forEach(
            Consumer { pythonFunction: AnnotatedPythonFunction? ->
                formattedFunctions.add(buildFunction(pythonFunction!!))
            }
        )
        return listToString(formattedFunctions, 2)
    }

    private fun buildSeparators(
        formattedPackageDeclaration: String,
        formattedClasses: String,
        formattedFunctions: String
    ): Array<String> {
        val packageDeclarationSeparator: String = when {
            formattedPackageDeclaration.isBlank() -> ""
            formattedClasses.isBlank() && formattedFunctions.isBlank() -> "\n"
            else -> "\n\n"
        }
        val classesSeparator: String = when {
            formattedClasses.isBlank() -> ""
            formattedFunctions.isBlank() -> "\n"
            else -> "\n\n"
        }
        val functionSeparator: String = when {
            formattedFunctions.isBlank() -> ""
            else -> "\n"
        }
        return arrayOf(packageDeclarationSeparator, classesSeparator, functionSeparator)
    }
}
