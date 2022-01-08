package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.EnumAnnotation
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.mutable_model.MutablePythonEnum
import com.larsreimann.api_editor.mutable_model.MutablePythonEnumInstance
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.MutablePythonParameter
import com.larsreimann.api_editor.mutable_model.descendants
import com.larsreimann.api_editor.transformation.processing_exceptions.ConflictingEnumException

/**
 * Processes and removes `@enum` annotations.
 */
fun MutablePythonPackage.processEnumAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonModule>()
        .forEach { it.processEnumAnnotations() }
}

private fun MutablePythonModule.processEnumAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonParameter>()
        .forEach { it.processEnumAnnotations(this) }
}

private fun MutablePythonParameter.processEnumAnnotations(module: MutablePythonModule) {
    this.annotations
        .filterIsInstance<EnumAnnotation>()
        .forEach {
            val enumToAdd = MutablePythonEnum(
                it.enumName,
                it.pairs.map { enumPair ->
                    MutablePythonEnumInstance(
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
    moduleEnums: List<MutablePythonEnum>,
    enumToCheck: MutablePythonEnum
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
    moduleEnums: List<MutablePythonEnum>,
    enumToCheck: MutablePythonEnum
): Boolean {
    return moduleEnums.any {
        (enumToCheck.name == it.name)
    }
}
