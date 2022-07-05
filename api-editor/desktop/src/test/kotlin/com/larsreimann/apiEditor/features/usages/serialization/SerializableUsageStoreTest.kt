package com.larsreimann.apiEditor.features.usages.serialization

import com.larsreimann.apiEditor.testUtils.resourcePathOrNull
import com.larsreimann.apiEditor.testUtils.walkResourceDirectory
import io.kotest.assertions.throwables.shouldNotThrow
import kotlinx.serialization.SerializationException
import org.junit.jupiter.api.Named
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.nio.file.Path
import java.util.stream.Stream
import kotlin.streams.asStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SerializableUsageStoreTest {

    @ParameterizedTest
    @MethodSource("serializationTestPaths")
    fun `should be able to decode usage count JSON files`(path: Path) {
        shouldNotThrow<SerializationException> {
            decodeUsageStore(path)
        }
    }

    companion object {
        @JvmStatic
        private fun serializationTestPaths(): Stream<Arguments> {
            val rootPath = Companion::class.java.resourcePathOrNull("/usages/serialization")
                ?: throw IllegalStateException("Could not find test files.")

            return Companion::class.java
                .walkResourceDirectory("/usages/serialization", "json")
                .map {
                    Arguments.of(
                        Named.of(rootPath.relativize(it).toString(), it),
                    )
                }
                .asStream()
        }
    }
}
