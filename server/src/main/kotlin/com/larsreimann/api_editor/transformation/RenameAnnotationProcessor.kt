package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataTransformer
import com.larsreimann.api_editor.model.SerializablePythonAttribute
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonDeclaration
import com.larsreimann.api_editor.model.SerializablePythonEnum
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult
import com.larsreimann.api_editor.model.RenameAnnotation

class RenameAnnotationProcessor : AbstractPackageDataTransformer() {
    private val declarationStack = ArrayDeque<SerializablePythonDeclaration>()

    override fun createNewModuleOnEnter(oldModule: SerializablePythonModule): SerializablePythonModule {
        declarationStack.addLast(oldModule)
        return oldModule
    }

    override fun createNewModuleOnLeave(
        oldModule: SerializablePythonModule,
        newClasses: List<SerializablePythonClass>,
        newEnums: List<SerializablePythonEnum>,
        newFunctions: List<SerializablePythonFunction>
    ): SerializablePythonModule? {
        declarationStack.removeLast()
        return super.createNewModuleOnLeave(oldModule, newClasses, newEnums, newFunctions)
    }

    override fun createNewClassOnEnter(oldClass: SerializablePythonClass): SerializablePythonClass {
        val result = oldClass.rename { newName ->
            oldClass.fullCopy(
                name = newName,
                qualifiedName = qualifiedName(newName),
                annotations = oldClass.annotations.filterNot { it is RenameAnnotation }.toMutableList(),
                originalDeclaration = oldClass.originalDeclaration ?: oldClass
            )
        }

        declarationStack.addLast(result)
        return result
    }

    override fun createNewClassOnLeave(
        oldClass: SerializablePythonClass,
        newAttributes: List<SerializablePythonAttribute>,
        newMethods: List<SerializablePythonFunction>
    ): SerializablePythonClass? {
        declarationStack.removeLast()
        return super.createNewClassOnLeave(oldClass, newAttributes, newMethods)
    }

    override fun createNewAttribute(oldAttribute: SerializablePythonAttribute): SerializablePythonAttribute {
        return oldAttribute.rename { newName ->
            oldAttribute.fullCopy(
                name = newName,
                qualifiedName = qualifiedName(newName),
                originalDeclaration = oldAttribute.originalDeclaration ?: oldAttribute
            )
        }
    }

    override fun createNewFunctionOnEnter(oldFunction: SerializablePythonFunction): SerializablePythonFunction {
        val result = oldFunction.rename { newName ->
            oldFunction.fullCopy(
                name = newName,
                qualifiedName = qualifiedName(newName),
                annotations = oldFunction.annotations.filterNot { it is RenameAnnotation }.toMutableList(),
                originalDeclaration = oldFunction.originalDeclaration ?: oldFunction
            )
        }

        declarationStack.addLast(result)
        return result
    }

    override fun createNewFunctionOnLeave(
        oldFunction: SerializablePythonFunction,
        newParameters: List<SerializablePythonParameter>,
        newResults: List<SerializablePythonResult>
    ): SerializablePythonFunction? {
        declarationStack.removeLast()
        return super.createNewFunctionOnLeave(oldFunction, newParameters, newResults)
    }

    override fun createNewParameter(oldParameter: SerializablePythonParameter): SerializablePythonParameter {
        return oldParameter.rename { newName ->
            oldParameter.fullCopy(
                name = newName,
                qualifiedName = qualifiedName(newName),
                annotations = oldParameter.annotations.filterNot { it is RenameAnnotation }.toMutableList(),
                originalDeclaration = oldParameter.originalDeclaration ?: oldParameter
            )
        }
    }

    private fun <T : SerializablePythonDeclaration> T.rename(creator: (String) -> T): T {
        val renameAnnotations = this.annotations.filterIsInstance<RenameAnnotation>()
        val newName = when {
            renameAnnotations.isEmpty() -> this.name
            else -> renameAnnotations[0].newName
        }
        return creator(newName)
    }

    private fun qualifiedName(vararg additionalSegments: String): String {
        val segments = declarationStack.map { it.name } + additionalSegments
        return segments.joinToString(separator = ".")
    }
}
