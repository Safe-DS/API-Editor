package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataTransformer
import com.larsreimann.api_editor.model.AnnotatedPythonAttribute
import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult

class UnusedAnnotationProcessor : AbstractPackageDataTransformer() {
    override fun createNewClass(
        oldClass: AnnotatedPythonClass,
        newAttributes: List<AnnotatedPythonAttribute>,
        newMethods: List<AnnotatedPythonFunction>
    ): AnnotatedPythonClass? {
        if (oldClass.hasAnnotationOfType("Unused")) {
            return null
        }

        return super.createNewClass(oldClass, newAttributes, newMethods)
    }

    override fun createNewFunction(
        oldFunction: AnnotatedPythonFunction,
        newParameters: List<AnnotatedPythonParameter>,
        newResults: List<AnnotatedPythonResult>
    ): AnnotatedPythonFunction? {
        if (oldFunction.hasAnnotationOfType("Unused")) {
            return null
        }

        return super.createNewFunction(oldFunction, newParameters, newResults)
    }
}
