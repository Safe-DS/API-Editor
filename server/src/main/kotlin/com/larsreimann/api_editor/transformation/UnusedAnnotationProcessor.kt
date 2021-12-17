package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataTransformer
import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction

class UnusedAnnotationProcessor : AbstractPackageDataTransformer() {
    override fun shouldVisitAttributesIn(oldClass: AnnotatedPythonClass) = false
    override fun shouldVisitParametersIn(oldFunction: AnnotatedPythonFunction) = false
    override fun shouldVisitResultsIn(oldFunction: AnnotatedPythonFunction) = false

    override fun createNewClassOnEnter(oldClass: AnnotatedPythonClass): AnnotatedPythonClass? {
        if (oldClass.hasAnnotationOfType("Unused")) {
            return null
        }

        return super.createNewClassOnEnter(oldClass)
    }

    override fun createNewFunctionOnEnter(oldFunction: AnnotatedPythonFunction): AnnotatedPythonFunction? {
        if (oldFunction.hasAnnotationOfType("Unused")) {
            return null
        }

        return super.createNewFunctionOnEnter(oldFunction)
    }
}
