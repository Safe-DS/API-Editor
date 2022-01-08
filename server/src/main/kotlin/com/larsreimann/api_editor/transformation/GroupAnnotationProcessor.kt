package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.mutable_model.MutablePythonClass
import com.larsreimann.api_editor.mutable_model.MutablePythonFunction
import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import com.larsreimann.api_editor.mutable_model.descendants

/**
 * Processes and removes `@boundary` annotations.
 */
fun MutablePythonPackage.processGroupAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonModule>()
        .forEach { it.processGroupAnnotations() }
}

private fun MutablePythonModule.processGroupAnnotations() {
    this.descendants()
        .filterIsInstance<MutablePythonFunction>()
        .forEach { it.processGroupAnnotations(this) }
}

private fun MutablePythonFunction.processGroupAnnotations(
    module: MutablePythonModule
) {

}

private fun hasConflictingGroups(
    moduleClasses: List<MutablePythonClass>,
    groupToCheck: MutablePythonClass
): Boolean {
    moduleClasses.forEach {
        if (groupToCheck.name == it.name) {
            if (
                groupToCheck.constructor == it.constructor
            ) {
                return true
            }
        }
    }
    return false
}
