package com.larsreimann.api_editor.server.annotationProcessing

import com.larsreimann.api_editor.server.data.AbstractPackageDataVisitor
import com.larsreimann.api_editor.server.data.AnnotatedPythonClass
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter

object OriginalDeclarationProcessor : AbstractPackageDataVisitor() {

    override fun enterPythonFunction(pythonFunction: AnnotatedPythonFunction): Boolean {
        pythonFunction.originalDeclaration = pythonFunction.copy()

        return true
    }

    override fun enterPythonClass(pythonClass: AnnotatedPythonClass): Boolean {
        pythonClass.originalDeclaration = pythonClass.copy()

        return true
    }

    override fun enterPythonParameter(pythonParameter: AnnotatedPythonParameter) {
        pythonParameter.originalDeclaration = pythonParameter.copy()
    }
}
