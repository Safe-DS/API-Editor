package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataVisitor
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.PureAnnotation

object PureAnnotationProcessor : AbstractPackageDataVisitor() {

    /**
     * Marks functions with the `@Pure` annotation as pure and removes the annotation. Mutates the original declaration.
     */
    override fun enterPythonFunction(pythonFunction: SerializablePythonFunction): Boolean {
        pythonFunction.annotations
            .filterIsInstance<PureAnnotation>()
            .forEach {
                pythonFunction.isPure = true
                pythonFunction.annotations.remove(it)
            }

        return false
    }
}
