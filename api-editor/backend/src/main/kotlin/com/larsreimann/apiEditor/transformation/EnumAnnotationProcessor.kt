package com.larsreimann.apiEditor.transformation

import com.larsreimann.apiEditor.model.EnumAnnotation
import com.larsreimann.apiEditor.mutableModel.PythonArgument
import com.larsreimann.apiEditor.mutableModel.PythonAttribute
import com.larsreimann.apiEditor.mutableModel.PythonEnum
import com.larsreimann.apiEditor.mutableModel.PythonEnumInstance
import com.larsreimann.apiEditor.mutableModel.PythonMemberAccess
import com.larsreimann.apiEditor.mutableModel.PythonModule
import com.larsreimann.apiEditor.mutableModel.PythonNamedType
import com.larsreimann.apiEditor.mutableModel.PythonPackage
import com.larsreimann.apiEditor.mutableModel.PythonParameter
import com.larsreimann.apiEditor.mutableModel.PythonReference
import com.larsreimann.apiEditor.mutableModel.PythonString
import com.larsreimann.apiEditor.transformation.processingExceptions.ConflictingEnumException
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
                        PythonString(enumPair.stringValue),
                    )
                },
            )
            if (hasConflictingEnums(module.enums, enumToAdd)) {
                throw ConflictingEnumException(
                    enumToAdd.name,
                    module.name,
                    this.qualifiedName(),
                )
            }
            if (!isAlreadyDefinedInModule(module.enums, enumToAdd)) {
                module.enums += enumToAdd
            }

            // Update argument that references this parameter
            val arguments = crossReferencesToThis()
                .mapNotNull { (it.parent as? PythonReference)?.closest<PythonArgument>() }
                .toList()

            require(arguments.size == 1) {
                "Expected parameter to be referenced in exactly one argument but was used in $arguments."
            }

            val argument = arguments[0]
            argument.value = PythonMemberAccess(
                receiver = PythonReference(declaration = this),
                member = PythonReference(PythonAttribute(name = "value")),
            )

            this.type = PythonNamedType(enumToAdd)
            this.annotations -= annotation
        }
}

private fun hasConflictingEnums(
    moduleEnums: List<PythonEnum>,
    enumToCheck: PythonEnum,
): Boolean {
    return moduleEnums.any { enum ->
        (enumToCheck.name == enum.name) &&
            (
                enumToCheck.instances.size != enum.instances.size ||
                    !enumToCheck.instances.mapNotNull { (it.value as? PythonString)?.value }
                        .containsAll(enum.instances.mapNotNull { (it.value as? PythonString)?.value })
                )
    }
}

private fun isAlreadyDefinedInModule(
    moduleEnums: List<PythonEnum>,
    enumToCheck: PythonEnum,
): Boolean {
    return moduleEnums.any {
        enumToCheck.name == it.name
    }
}
