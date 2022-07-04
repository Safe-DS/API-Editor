package com.larsreimann.api_editor.features.usages.serialization

import io.kotest.assertions.throwables.shouldNotThrow
import kotlinx.serialization.SerializationException
import org.junit.jupiter.api.Test
import java.nio.file.Path

class SerializableUsageStoreV1Test {

    @Test
    fun `should be able to parse sklearn usage counts`() {
        shouldNotThrow<SerializationException> {
            decodeUsageStore(
                Path.of("../../data/usages/sklearn__usage_counts.json"),
            )
        }
    }
}
