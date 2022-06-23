package com.larsreimann.api_editor.features.usages

import io.kotest.assertions.throwables.shouldNotThrow
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import org.junit.jupiter.api.Test
import java.nio.file.Path
import kotlin.io.path.inputStream

class SerializableUsageStoreTest {
    @Test
    @OptIn(ExperimentalSerializationApi::class)
    fun `should be able to parse sklearn usage counts`() {
        shouldNotThrow<SerializationException> {
            Json.decodeFromStream<SerializableUsageStore>(
                Path.of("../../data/usages/sklearn__usage_counts.json").inputStream()
            )
        }
    }
}
