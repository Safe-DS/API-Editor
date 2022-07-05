package com.larsreimann.apiEditor.features.api.serialization

import com.larsreimann.apiEditor.testUtils.resourcePathOrNull
import com.larsreimann.apiEditor.testUtils.walkResourceDirectory
import io.kotest.assertions.throwables.shouldNotThrow
import kotlinx.serialization.SerializationException
import org.junit.jupiter.api.Named
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.nio.file.Path
import java.util.stream.Stream
import kotlin.streams.asStream

class SerializableApiStoreTest {

    @ParameterizedTest
    @MethodSource("serializationTestPaths")
    fun `should be able to decode API JSON files`(path: Path) {
        shouldNotThrow<SerializationException> {
            createApiStoreFromFile(path)
        }
    }

    companion object {
        @JvmStatic
        private fun serializationTestPaths(): Stream<Arguments> {
            val resourceName = "/api/serialization"

            val rootPath = Companion::class.java.resourcePathOrNull(resourceName)
                ?: throw IllegalStateException("Could not find test files.")

            return Companion::class.java
                .walkResourceDirectory(resourceName, "json")
                .map {
                    Arguments.of(
                        Named.of(rootPath.relativize(it).toString(), it),
                    )
                }
                .asStream()
        }
    }
}
