package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage
import com.larsreimann.api_editor.server.file_handling.PackageFileBuilder
import com.larsreimann.api_editor.server.validation.AnnotationValidator
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.serialization.*
import kotlinx.serialization.json.Json
import java.io.*
import java.nio.file.Files
import kotlin.io.path.absolutePathString

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
        val pythonPackage = call.receive<AnnotatedPythonPackage>()
        val annotationValidator = AnnotationValidator(pythonPackage)
        val annotationErrors = annotationValidator.validate()
        val messages = annotationErrors.map { it.message() }
        val zipFolderPath = "./zipFolder/"
        if (messages.isNotEmpty()) {
            call.respond(HttpStatusCode.Conflict, messages)
        } else {
            val packageFileBuilder =
                PackageFileBuilder(
                    pythonPackage,
                    zipFolderPath
                )
            try {
                packageFileBuilder.buildModuleFiles()
            }
            catch (e: Exception) {
                e.printStackTrace()
            }

            val zipFile = File(zipFolderPath)

            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(
                    ContentDisposition.Parameters.FileName, zipFolderPath
                ).toString()
            )
            call.respondFile(zipFile)
            zipFile.delete()
        }
    }
}

class AuthenticationException : RuntimeException()
class AuthorizationException : RuntimeException()
