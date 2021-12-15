package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataVisitor
import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter

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
