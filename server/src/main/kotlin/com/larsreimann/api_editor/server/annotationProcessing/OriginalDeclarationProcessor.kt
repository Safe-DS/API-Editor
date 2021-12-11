package com.larsreimann.api_editor.server.annotationProcessing

import com.larsreimann.api_editor.server.data.AbstractPackageDataVisitor
import com.larsreimann.api_editor.server.data.AnnotatedPythonClass
import com.larsreimann.api_editor.server.data.AnnotatedPythonModule

object OriginalDeclarationProcessor : AbstractPackageDataVisitor() {

    override fun enterPythonClass(pythonClass: AnnotatedPythonClass): Boolean {
        pythonClass.methods.forEach {
            it.originalDeclaration = it.copy()
        }

        return false
    }

    override fun enterPythonModule(pythonModule: AnnotatedPythonModule): Boolean {
        pythonModule.classes.forEach {
            it.originalDeclaration = it.copy()
        }
        pythonModule.functions.forEach {
            it.originalDeclaration = it.copy()
        }

        return true
    }
}
