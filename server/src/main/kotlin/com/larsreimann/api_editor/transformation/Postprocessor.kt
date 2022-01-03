package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataTransformer
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.SerializablePythonAttribute
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonEnum
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult

/**
 * - Removes empty modules
 * - Creates attributes for parameters of the constructor
 * - Reorder parameters
 */
object Postprocessor : AbstractPackageDataTransformer() {

    override fun createNewModuleOnLeave(
        oldModule: SerializablePythonModule,
        newClasses: List<SerializablePythonClass>,
        newEnums: List<SerializablePythonEnum>,
        newFunctions: List<SerializablePythonFunction>
    ): SerializablePythonModule? {
        if (newClasses.isEmpty() && newEnums.isEmpty() && newFunctions.isEmpty()) {
            return null
        }

        return super.createNewModuleOnLeave(oldModule, newClasses, newEnums, newFunctions)
    }

    override fun createNewClassOnLeave(
        oldClass: SerializablePythonClass,
        newAttributes: List<SerializablePythonAttribute>,
        newMethods: List<SerializablePythonFunction>
    ): SerializablePythonClass {
        return oldClass.fullCopy(
            attributes = (newAttributes + newMethods.attributesFromConstructor()).toMutableList(),
            methods = newMethods.toMutableList(),
            originalDeclaration = oldClass.originalDeclaration ?: oldClass
        )
    }

    private fun List<SerializablePythonFunction>.attributesFromConstructor(): List<SerializablePythonAttribute> {
        return this.firstOrNull { it.isConstructor() }
            ?.parameters
            ?.filter { it.assignedBy != PythonParameterAssignment.CONSTANT }
            ?.map {
                SerializablePythonAttribute(
                    name = it.name,
                    qualifiedName = it.qualifiedName,
                    defaultValue = it.defaultValue,
                    isPublic = it.isPublic,
                    typeInDocs = it.typeInDocs,
                    description = it.description,
                    annotations = mutableListOf()
                )
            }
            .orEmpty()
    }

    override fun createNewFunctionOnLeave(
        oldFunction: SerializablePythonFunction,
        newParameters: List<SerializablePythonParameter>,
        newResults: List<SerializablePythonResult>
    ): SerializablePythonFunction {
        return oldFunction.fullCopy(
            parameters = newParameters.reorderParameters().toMutableList(),
            results = newResults.toMutableList(),
            originalDeclaration = oldFunction.originalDeclaration ?: oldFunction
        )
    }

    private fun List<SerializablePythonParameter>.reorderParameters(): List<SerializablePythonParameter> {
        val groups = this.groupBy { it.assignedBy }
        return buildList {
            addAll(groups[PythonParameterAssignment.IMPLICIT].orEmpty())
            addAll(groups[PythonParameterAssignment.POSITION_ONLY].orEmpty())
            addAll(groups[PythonParameterAssignment.POSITION_OR_NAME].orEmpty())
            addAll(groups[PythonParameterAssignment.NAME_ONLY].orEmpty())
            addAll(groups[PythonParameterAssignment.ATTRIBUTE].orEmpty())
            addAll(groups[PythonParameterAssignment.CONSTANT].orEmpty())
        }
    }
}
