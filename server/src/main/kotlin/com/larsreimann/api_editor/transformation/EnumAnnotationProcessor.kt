package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.EnumAnnotation
import com.larsreimann.api_editor.mutable_model.PythonArgument
import com.larsreimann.api_editor.mutable_model.PythonAttribute
import com.larsreimann.api_editor.mutable_model.PythonEnum
import com.larsreimann.api_editor.mutable_model.PythonEnumInstance
import com.larsreimann.api_editor.mutable_model.PythonMemberAccess
import com.larsreimann.api_editor.mutable_model.PythonModule
import com.larsreimann.api_editor.mutable_model.PythonPackage
import com.larsreimann.api_editor.mutable_model.PythonParameter
import com.larsreimann.api_editor.mutable_model.PythonReference
import com.larsreimann.api_editor.transformation.processing_exceptions.ConflictingEnumException
import com.larsreimann.modeling.closest
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
        .forEach { annotation ->
            val enumToAdd = PythonEnum(
                annotation.enumName,
                annotation.pairs.map { enumPair ->
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
                module.enums += enumToAdd
            }

            // Update argument that references this parameter
            val arguments = this.crossReferences()
                .mapNotNull { (it.parent as? PythonReference)?.closest<PythonArgument>() }
                .toList()

            require(arguments.size == 1) {
                "Expected parameter to be referenced in exactly one argument but was used in $arguments."
            }

            val argument = arguments[0]
            argument.value = PythonMemberAccess(
                receiver = PythonReference(declaration = this),
                member = PythonReference(PythonAttribute(name = "value"))
            )

            this.typeInDocs = annotation.enumName
            this.annotations -= annotation
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
        enumToCheck.name == it.name
    }
}
