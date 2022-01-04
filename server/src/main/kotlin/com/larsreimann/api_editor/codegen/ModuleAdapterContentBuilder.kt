package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import java.util.Objects

/**
 * Constructor for ModuleAdapterContentBuilder
 *
 * @param pythonModule The module whose adapter content should be built
 */
class ModuleAdapterContentBuilder(var pythonModule: MutablePythonModule) {

    /**
     * Builds a string containing the formatted module content
     *
     * @return The string containing the formatted module content
     */
    fun buildModuleContent(): String {
        var formattedImport = buildNamespace()
        var formattedClasses = buildAllClasses()
        var formattedFunctions = buildAllFunctions()
        val separators = buildSeparators(
            formattedImport, formattedClasses, formattedFunctions
        )
        formattedImport += separators[0]
        formattedClasses += separators[1]
        formattedFunctions += separators[2]
        return (formattedImport
            + formattedClasses
            + formattedFunctions)
    }

    private fun buildNamespace(): String {
        val importedModules = HashSet<String>()
        pythonModule.functions.forEach { pythonFunction: MutablePythonFunction ->
            importedModules.add(
                buildParentDeclarationName(
                    Objects.requireNonNull(pythonFunction.originalDeclaration)!!.qualifiedName
                )
            )
        }
        pythonModule.classes.forEach { pythonClass: MutablePythonClass ->
            importedModules.add(
                buildParentDeclarationName(
                    Objects.requireNonNull(pythonClass.originalDeclaration)!!.qualifiedName
                )
            )
        }
        val imports: MutableList<String> = ArrayList()
        importedModules.forEach { moduleName: String -> imports.add("import $moduleName") }
        return listToString(imports, 1)
    }

    private fun buildParentDeclarationName(qualifiedName: String): String {
        val PATH_SEPARATOR = "."
        val separationPosition = qualifiedName.lastIndexOf(PATH_SEPARATOR)
        return qualifiedName.substring(0, separationPosition)
    }

    private fun buildAllClasses(): String {
        val formattedClasses: MutableList<String> = ArrayList()
        pythonModule.classes.forEach { pythonClass: MutablePythonClass? ->
            val classAdapterContentBuilder = ClassAdapterContentBuilder(
                pythonClass!!
            )
            formattedClasses.add(classAdapterContentBuilder.buildClass())
        }
        return listToString(formattedClasses, 2)
    }

    private fun buildAllFunctions(): String {
        val formattedFunctions: MutableList<String> = ArrayList()
        pythonModule.functions.forEach { pythonFunction: MutablePythonFunction? ->
            val functionAdapterContentBuilder = FunctionAdapterContentBuilder(pythonFunction!!)
            formattedFunctions.add(functionAdapterContentBuilder.buildFunction())
        }
        return listToString(formattedFunctions, 2)
    }

    companion object {
        private fun buildSeparators(
            formattedImports: String,
            formattedClasses: String,
            formattedFunctions: String
        ): Array<String> {
            val importSeparator: String = if (formattedImports.isBlank()) {
                ""
            } else if (formattedClasses.isBlank() && formattedFunctions.isBlank()) {
                "\n"
            } else {
                "\n\n"
            }
            val classesSeparator: String = if (formattedClasses.isBlank()) {
                ""
            } else if (formattedFunctions.isBlank()) {
                "\n"
            } else {
                "\n\n"
            }
            val functionSeparator: String = if (formattedFunctions.isBlank()) {
                ""
            } else {
                "\n"
            }
            return arrayOf(importSeparator, classesSeparator, functionSeparator)
        }
    }
}
