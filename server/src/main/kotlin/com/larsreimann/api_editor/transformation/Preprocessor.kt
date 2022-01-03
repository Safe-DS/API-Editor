package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataTransformer
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.SerializablePythonAttribute
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult

class Preprocessor : AbstractPackageDataTransformer() {
    private var currentClass: SerializablePythonClass? = null
    private var currentFunction: SerializablePythonFunction? = null

    override fun createNewClassOnEnter(oldClass: SerializablePythonClass): SerializablePythonClass? {
        currentClass = oldClass
        return super.createNewClassOnEnter(oldClass)
    }

    override fun createNewClassOnLeave(
        oldClass: SerializablePythonClass,
        newAttributes: List<SerializablePythonAttribute>,
        newMethods: List<SerializablePythonFunction>
    ): SerializablePythonClass? {
        currentClass = null
        return super.createNewClassOnLeave(oldClass, newAttributes, newMethods)
    }

    override fun createNewFunctionOnEnter(oldFunction: SerializablePythonFunction): SerializablePythonFunction? {
        currentFunction = oldFunction
        return super.createNewFunctionOnEnter(oldFunction)
    }

    override fun createNewFunctionOnLeave(
        oldFunction: SerializablePythonFunction,
        newParameters: List<SerializablePythonParameter>,
        newResults: List<SerializablePythonResult>
    ): SerializablePythonFunction? {
        currentFunction = null
        return super.createNewFunctionOnLeave(oldFunction, newParameters, newResults)
    }

    override fun createNewParameter(oldParameter: SerializablePythonParameter): SerializablePythonParameter {
        return oldParameter.fullCopy(
            assignedBy = when {
                oldParameter.isImplicit() -> PythonParameterAssignment.IMPLICIT
                oldParameter.isOptional() -> PythonParameterAssignment.NAME_ONLY
                else -> PythonParameterAssignment.POSITION_OR_NAME
            },
            originalDeclaration = oldParameter
        )
    }

    private fun SerializablePythonParameter.isImplicit(): Boolean {
        if (currentClass == null) {
            return false
        }

        return currentFunction
            ?.let { "staticmethod" !in it.decorators && it.parameters.firstOrNull() == this }
            ?: false
    }
}
