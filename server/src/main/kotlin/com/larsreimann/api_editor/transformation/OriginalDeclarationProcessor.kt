package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataVisitor
import com.larsreimann.api_editor.model.SerializablePythonAttribute
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonParameter

object OriginalDeclarationProcessor : AbstractPackageDataVisitor() {

    override fun enterPythonFunction(pythonFunction: SerializablePythonFunction): Boolean {
        pythonFunction.originalDeclaration = pythonFunction.copy()

        return true
    }

    override fun enterPythonClass(pythonClass: SerializablePythonClass): Boolean {
        pythonClass.originalDeclaration = pythonClass.copy()

        return true
    }

    override fun enterPythonParameter(pythonParameter: SerializablePythonParameter) {
        pythonParameter.originalDeclaration = pythonParameter.copy()
    }

    override fun enterPythonAttribute(pythonAttribute: SerializablePythonAttribute) {
        pythonAttribute.originalDeclaration = pythonAttribute.copy()
    }
}
