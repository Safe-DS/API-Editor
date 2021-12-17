package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataVisitor
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.PureAnnotation

object PureAnnotationProcessor : AbstractPackageDataVisitor() {

    /**
     * Marks functions with the `@Pure` annotation as pure and removes the annotation. Mutates the original declaration.
     */
    override fun enterPythonFunction(pythonFunction: AnnotatedPythonFunction): Boolean {
        pythonFunction.annotations
            .filterIsInstance<PureAnnotation>()
            .forEach {
                pythonFunction.isPure = true
                pythonFunction.annotations.remove(it)
            }

        return false
    }
}
