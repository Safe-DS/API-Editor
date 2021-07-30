package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.server.plugins.configureHTTP
import com.larsreimann.api_editor.server.plugins.configureMonitoring
import com.larsreimann.api_editor.server.plugins.configureRouting
import com.larsreimann.api_editor.server.plugins.configureSerialization
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main() {
    embeddedServer(Netty, port = 4280, host = "localhost") {
        configureRouting()
        configureHTTP()
        configureMonitoring()
        configureSerialization()
    }.start(wait = true)
}
