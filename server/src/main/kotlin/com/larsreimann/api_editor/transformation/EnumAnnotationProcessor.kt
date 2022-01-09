package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.EnumAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.PythonEnum
import com.larsreimann.api_editor.mutable_model.PythonEnumInstance
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.transformation.processing_exceptions.ConflictingEnumException
import com.larsreimann.modeling.descendants

/**
 * Processes and removes `@enum` annotations.
 */
fun PythonPackage.processEnumAnnotations() {
    this.descendants()
        .filterIsInstance<PythonModule>()
        .forEach { it.processEnumAnnotations() }
}

private fun PythonModule.processEnumAnnotations() {
    this.descendants()
        .filterIsInstance<PythonParameter>()
        .forEach { it.processEnumAnnotations(this) }
}

private fun PythonParameter.processEnumAnnotations(module: PythonModule) {
    this.annotations
        .filterIsInstance<EnumAnnotation>()
        .forEach {
            val enumToAdd = PythonEnum(
                it.enumName,
                it.pairs.map { enumPair ->
                    PythonEnumInstance(
                        enumPair.instanceName,
                        enumPair.stringValue
                    )
                }
            )
            if (hasConflictingEnums(module.enums, enumToAdd)) {
                throw ConflictingEnumException(
                    enumToAdd.name,
                    module.name,
                    this.qualifiedName()
                )
            }
            if (!isAlreadyDefinedInModule(module.enums, enumToAdd)) {
                module.enums.add(enumToAdd)
            }
            this.typeInDocs = it.enumName
            this.assignedBy = PythonParameterAssignment.ENUM
            this.annotations.remove(it)
        }
}

private fun hasConflictingEnums(
    moduleEnums: List<PythonEnum>,
    enumToCheck: PythonEnum
): Boolean {
    return moduleEnums.any {
        (enumToCheck.name == it.name) &&
            (
                enumToCheck.instances.size != it.instances.size ||
                    !enumToCheck.instances.containsAll(it.instances)
                )
    }
}

private fun isAlreadyDefinedInModule(
    moduleEnums: List<PythonEnum>,
    enumToCheck: PythonEnum
): Boolean {
    return moduleEnums.any {
        (enumToCheck.name == it.name)
    }
}
