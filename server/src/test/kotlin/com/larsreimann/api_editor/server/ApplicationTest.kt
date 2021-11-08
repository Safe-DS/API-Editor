package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.server.data.PackageData
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals

class ApplicationTest {
    @Test
    @ExperimentalSerializationApi
    fun testRoot() {
        withTestApplication({ configureRouting() }) {
            handleRequest(HttpMethod.Get, "/api/packageData/sklearn").apply {
                assertEquals(HttpStatusCode.OK, response.status())
                assertEquals(Json.encodeToString(PackageData("sklearn")), response.content)
            }
        }
    }
}
