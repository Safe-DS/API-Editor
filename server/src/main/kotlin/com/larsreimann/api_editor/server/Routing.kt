package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.server.data.PackageData
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.serialization.*

fun Application.configureRouting() {
    install(ContentNegotiation) {
        json()
    }

    routing {
        static("/") {
            resources("static")
            defaultResource("static/index.html")
        }

        route("/api") {
            packageData()
        }

        install(StatusPages) {
            exception<AuthenticationException> {
                call.respond(HttpStatusCode.Unauthorized)
            }
            exception<AuthorizationException> {
                call.respond(HttpStatusCode.Forbidden)
            }
        }
    }
}

fun Route.packageData() {
    get("/packageData/{packageName}") {
        val packageData = PackageData(call.parameters["packageName"]!!)
        println(packageData)
        println(call.request.headers)
        call.respond(packageData)
    }
}

class AuthenticationException : RuntimeException()
class AuthorizationException : RuntimeException()
