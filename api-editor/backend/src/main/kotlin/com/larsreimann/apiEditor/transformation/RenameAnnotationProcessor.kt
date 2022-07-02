package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.GroupAnnotation
import com.larsreimann.apiEditor.model.RenameAnnotation
import com.larsreimann.apiEditor.mutableModel.PythonDeclaration
import com.larsreimann.apiEditor.mutableModel.PythonFunction
import com.larsreimann.apiEditor.mutableModel.PythonPackage
import com.larsreimann.apiEditor.mutableModel.PythonParameter
import com.larsreimann.modeling.closest
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@rename` annotations.
 */
fun PythonPackage.processRenameAnnotations() {
    this.descendants()
        .filterIsInstance<PythonDeclaration>()
        .forEach { it.processRenameAnnotations() }
}

private fun PythonDeclaration.processRenameAnnotations() {
    this.annotations
        .filterIsInstance<RenameAnnotation>()
        .forEach {
            (this as? PythonParameter)?.updateGroupAnnotationOnContainingFunction(it.newName)
            this.name = it.newName
            this.annotations.remove(it)
        }
}

private fun PythonParameter.updateGroupAnnotationOnContainingFunction(newName: String) {
    val containingFunction = closest<PythonFunction>() ?: return
    containingFunction.annotations
        .filterIsInstance<GroupAnnotation>()
        .forEach { annotation ->
            annotation.parameters.replaceAll { oldName ->
                when (oldName) {
                    this.name -> newName
                    else -> oldName
                }
            }
        }
}
