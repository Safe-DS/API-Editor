package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataTransformer
import com.larsreimann.api_editor.model.AnnotatedPythonAttribute
import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonDeclaration
import com.larsreimann.api_editor.model.AnnotatedPythonEnum
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonModule
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import com.larsreimann.api_editor.model.RenameAnnotation

class RenameAnnotationProcessor : AbstractPackageDataTransformer() {
    private val declarationStack = ArrayDeque<AnnotatedPythonDeclaration>()

    override fun createNewModuleOnEnter(oldModule: AnnotatedPythonModule): AnnotatedPythonModule {
        declarationStack.addLast(oldModule)
        return oldModule
    }

    override fun createNewModuleOnLeave(
        oldModule: AnnotatedPythonModule,
        newClasses: List<AnnotatedPythonClass>,
        newEnums: List<AnnotatedPythonEnum>,
        newFunctions: List<AnnotatedPythonFunction>
    ): AnnotatedPythonModule? {
        declarationStack.removeLast()
        return super.createNewModuleOnLeave(oldModule, newClasses, newEnums, newFunctions)
    }

    override fun createNewClassOnEnter(oldClass: AnnotatedPythonClass): AnnotatedPythonClass {
        val result = oldClass.rename {
            oldClass.fullCopy(
                name = it,
                qualifiedName = qualifiedName(it),
                originalDeclaration = oldClass.originalDeclaration ?: oldClass
            )
        }

        declarationStack.addLast(result)
        return result
    }

    override fun createNewClassOnLeave(
        oldClass: AnnotatedPythonClass,
        newAttributes: List<AnnotatedPythonAttribute>,
        newMethods: List<AnnotatedPythonFunction>
    ): AnnotatedPythonClass? {
        declarationStack.removeLast()
        return super.createNewClassOnLeave(oldClass, newAttributes, newMethods)
    }

    override fun createNewFunctionOnEnter(oldFunction: AnnotatedPythonFunction): AnnotatedPythonFunction {
        val result = oldFunction.rename {
            oldFunction.fullCopy(
                name = it,
                qualifiedName = qualifiedName(it),
                originalDeclaration = oldFunction.originalDeclaration ?: oldFunction
            )
        }

        declarationStack.addLast(result)
        return result
    }

    override fun createNewFunctionOnLeave(
        oldFunction: AnnotatedPythonFunction,
        newParameters: List<AnnotatedPythonParameter>,
        newResults: List<AnnotatedPythonResult>
    ): AnnotatedPythonFunction? {
        declarationStack.removeLast()
        return super.createNewFunctionOnLeave(oldFunction, newParameters, newResults)
    }

    override fun createNewParameter(oldParameter: AnnotatedPythonParameter): AnnotatedPythonParameter {
        return oldParameter.rename { newName ->
            oldParameter.fullCopy(
                name = newName,
                qualifiedName = qualifiedName(newName),
                annotations = oldParameter.annotations.filterNot { it is RenameAnnotation }.toMutableList(),
                originalDeclaration = oldParameter.originalDeclaration ?: oldParameter
            )
        }
    }

    private fun <T : AnnotatedPythonDeclaration> T.rename(creator: (String) -> T): T {
        val renameAnnotations = this.annotations.filterIsInstance<RenameAnnotation>()
        return when {
            renameAnnotations.isEmpty() -> this
            else -> creator(renameAnnotations[0].newName)
        }
    }

    private fun qualifiedName(vararg additionalSegments: String): String {
        val segments = declarationStack.map { it.name } + additionalSegments
        return segments.joinToString(separator = ".")
    }
}
