package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.shared.model.AnnotatedPythonPackage
import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.features.ContentNegotiation
import io.ktor.features.StatusPages
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.defaultResource
import io.ktor.http.content.resources
import io.ktor.http.content.static
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.post
import io.ktor.routing.route
import io.ktor.routing.routing
import io.ktor.serialization.json
import kotlinx.serialization.json.Json

fun Application.configureRouting() {
    install(ContentNegotiation) {
        // Necessary due to https://youtrack.jetbrains.com/issue/KTOR-435
        json(
            Json {
                useArrayPolymorphism = false
            }
        )
    }

    routing {
        static("/") {
            resources("static")
            defaultResource("static/index.html")
        }

        route("/api-editor") {
            echo()
            infer()
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

/**
 * Route to test serialization and deserialization.
 */
fun Route.echo() {
    post("/echo") {
        val pythonPackage = call.receive<AnnotatedPythonPackage>()
        call.respond(pythonPackage)
    }
}

fun Route.infer() {
    post("/infer") {
        // val pythonPackage = call.receive<AnnotatedPythonPackage>()

        call.respond("Not implemented")
    }
}

class AuthenticationException : RuntimeException()
class AuthorizationException : RuntimeException()
