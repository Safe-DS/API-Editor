package com.larsreimann.api_editor.assertions

import com.larsreimann.api_editor.model.AnnotatedPythonDeclaration

/**
 * Finds a unique descendant of the root with given type and name. If none or multiple matching descendants are found,
 * an assertion error is thrown.
 */
inline fun <reified T : AnnotatedPythonDeclaration> AnnotatedPythonDeclaration.findUniqueDescendantOrFail(
    name: String
): T {
    return findUniqueDescendantOrFail(this, T::class.java, name)
}

/**
 * Finds a unique descendant of the root with given type and name. If none or multiple matching descendants are found,
 * an assertion error is thrown. This variant can be called from Java:
 *
 * ```java
 * ModelAssertionsKt.findUniqueDescendantOrFail(
 *     testPythonPackage,
 *     AnnotatedPythonClass.class,
 *     "test"
 * );
 * ```
 */
fun <T: AnnotatedPythonDeclaration> findUniqueDescendantOrFail(
    root: AnnotatedPythonDeclaration,
    type: Class<out T>,
    name: String
): T {
    val candidates = root.descendants()
        .filterIsInstance(type)
        .filter { it.name == name }
        .toList()

    return when (candidates.size) {
        1 -> candidates.first()
        else -> throw AssertionError(
            "Expected a unique descendant with type '${type.simpleName}' and name '$name' but found ${candidates.size}."
        )
    }
}
