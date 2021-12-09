package com.larsreimann.api_editor.server.annotationProcessing

import com.larsreimann.api_editor.server.data.AbstractPackageDataVisitor
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction
import com.larsreimann.api_editor.server.data.PureAnnotation

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
