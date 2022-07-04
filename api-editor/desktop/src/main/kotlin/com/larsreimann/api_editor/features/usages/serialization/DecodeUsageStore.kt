package com.larsreimann.api_editor.features.usages.serialization

import com.larsreimann.api_editor.features.usages.UsageStore
import com.larsreimann.api_editor.utils.decodeSchemaVersion
import java.nio.file.Path


fun decodeUsageStore(path: Path): UsageStore {
    return when (val schemaVersion = decodeSchemaVersion(path)) {
        2 -> decodeUsageStoreV2(path)
        else -> throw IllegalArgumentException("Unsupported schema version $schemaVersion")
    }
}
