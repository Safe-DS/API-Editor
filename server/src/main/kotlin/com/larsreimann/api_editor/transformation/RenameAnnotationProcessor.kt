package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.GroupAnnotation
import com.larsreimann.api_editor.model.RenameAnnotation
import com.larsreimann.api_editor.mutable_model.PythonDeclaration
import com.larsreimann.api_editor.mutable_model.PythonFunction
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
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
