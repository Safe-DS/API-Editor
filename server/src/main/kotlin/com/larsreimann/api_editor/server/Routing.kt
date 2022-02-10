package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.codegen.generateCode
import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.mutable_model.convertPackage
import com.larsreimann.api_editor.transformation.transform
import com.larsreimann.api_editor.validation.AnnotationValidator
import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.features.ContentNegotiation
import io.ktor.features.StatusPages
import io.ktor.http.ContentDisposition
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.defaultResource
import io.ktor.http.content.resources
import io.ktor.http.content.static
import io.ktor.request.receive
import io.ktor.response.header
import io.ktor.response.respond
import io.ktor.response.respondFile
import io.ktor.routing.Route
import io.ktor.routing.post
import io.ktor.routing.route
import io.ktor.routing.routing
import io.ktor.serialization.json
import kotlinx.serialization.json.Json
import java.io.File

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
        val pythonPackage = call.receive<SerializablePythonPackage>()
        call.respond(pythonPackage)
    }
}

fun Route.infer() {
    post("/infer") {
        val pythonPackage = call.receive<SerializablePythonPackage>()
        when (val doInferResult = doInfer(pythonPackage)) {
            is DoInferResult.ValidationFailure -> {
                call.respond(HttpStatusCode.Conflict, doInferResult.messages)
            }
            is DoInferResult.Success -> {
                try {
                    val zipFile = doInferResult.path

                    call.response.header(
                        HttpHeaders.ContentDisposition,
                        ContentDisposition.Attachment.withParameter(
                            ContentDisposition.Parameters.FileName,
                            zipFile.toString()
                        ).toString()
                    )
                    call.respondFile(zipFile)

                    zipFile.delete()
                } catch (e: Exception) {
                    e.printStackTrace()
                    call.respond(HttpStatusCode.InternalServerError, "Something went wrong while inferring the API.")
                }
            }
        }
    }
}

fun doInfer(originalPythonPackage: SerializablePythonPackage): DoInferResult {
    // Validate
    val errors = AnnotationValidator(originalPythonPackage).validate()
    if (errors.isNotEmpty()) {
        return DoInferResult.ValidationFailure(errors.map { it.message() })
    }

    // Process package
    val mutablePackage = convertPackage(originalPythonPackage)
    mutablePackage.transform()

    // Build files
    val path = mutablePackage.generateCode()
    return DoInferResult.Success(path)
}

sealed class DoInferResult {
    class Success(val path: File) : DoInferResult()
    class ValidationFailure(val messages: List<String>) : DoInferResult()
}

class AuthenticationException : RuntimeException()
class AuthorizationException : RuntimeException()
