package com.larsreimann.api_editor

import com.larsreimann.api_editor.plugins.configureHTTP
import com.larsreimann.api_editor.plugins.configureMonitoring
import com.larsreimann.api_editor.plugins.configureRouting
import com.larsreimann.api_editor.plugins.configureSerialization
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        configureRouting()
        configureHTTP()
        configureMonitoring()
        configureSerialization()
    }.start(wait = true)
}
