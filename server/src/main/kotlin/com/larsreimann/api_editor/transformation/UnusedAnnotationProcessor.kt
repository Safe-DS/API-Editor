package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataTransformer
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction

class UnusedAnnotationProcessor : AbstractPackageDataTransformer() {
    override fun shouldVisitAttributesIn(oldClass: SerializablePythonClass) = false
    override fun shouldVisitParametersIn(oldFunction: SerializablePythonFunction) = false
    override fun shouldVisitResultsIn(oldFunction: SerializablePythonFunction) = false

    override fun createNewClassOnEnter(oldClass: SerializablePythonClass): SerializablePythonClass? {
        if (oldClass.hasAnnotationOfType("Unused")) {
            return null
        }

        return super.createNewClassOnEnter(oldClass)
    }

    override fun createNewFunctionOnEnter(oldFunction: SerializablePythonFunction): SerializablePythonFunction? {
        if (oldFunction.hasAnnotationOfType("Unused")) {
            return null
        }

        return super.createNewFunctionOnEnter(oldFunction)
    }
}
