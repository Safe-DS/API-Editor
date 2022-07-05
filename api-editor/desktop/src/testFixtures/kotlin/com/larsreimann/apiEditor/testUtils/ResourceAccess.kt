package com.larsreimann.apiEditor.testUtils

import java.nio.file.Path
import kotlin.io.path.toPath

/**
 * Returns a [Sequence] of [Path]s to the files with the given [extension] inside the directory with the given [name].
 * This function also visits files inside nested directories.
 */
fun <T> Class<T>.walkResourceDirectory(name: String, extension: String): Sequence<Path> {
    return resourcePathOrNull(name)
        ?.toFile()
        ?.walk()
        ?.filter { it.isFile && it.extension == extension }
        ?.map { it.toPath() }
        ?: emptySequence()
}

/**
 * Returns the [Path] to the resource with the given [name] or `null` if the resource does not exist.
 */
fun <T> Class<T>.resourcePathOrNull(name: String): Path? {
    return this.getResource(name)
        ?.toURI()
        ?.toPath()
}
