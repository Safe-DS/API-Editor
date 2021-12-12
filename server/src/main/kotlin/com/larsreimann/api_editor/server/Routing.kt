package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.server.annotationProcessing.MoveAnnotationProcessor
import com.larsreimann.api_editor.server.annotationProcessing.OriginalDeclarationProcessor
import com.larsreimann.api_editor.server.annotationProcessing.PureAnnotationProcessor
import com.larsreimann.api_editor.server.annotationProcessing.RenameAnnotationProcessor
import com.larsreimann.api_editor.server.annotationProcessing.UnusedAnnotationProcessor
import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage
import com.larsreimann.api_editor.server.file_handling.PackageFileBuilder
import com.larsreimann.api_editor.server.validation.AnnotationValidator
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
        val pythonPackage = call.receive<AnnotatedPythonPackage>()
        call.respond(pythonPackage)
    }
}

fun Route.infer() {
    post("/infer") {
        val pythonPackage = call.receive<AnnotatedPythonPackage>()
        when (val doInferResult = doInfer(pythonPackage)) {
            is DoInferResult.ValidationFailure -> {
                call.respond(HttpStatusCode.Conflict, doInferResult.messages)
            }
            is DoInferResult.Success -> {
                try {
                    val zipFolderPath = doInferResult.path
                    val zipFile = File(zipFolderPath)

                    call.response.header(
                        HttpHeaders.ContentDisposition,
                        ContentDisposition.Attachment.withParameter(
                            ContentDisposition.Parameters.FileName, zipFolderPath
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

fun doInfer(originalPythonPackage: AnnotatedPythonPackage): DoInferResult {
    var modifiedPythonPackage = originalPythonPackage

    // Validate
    val errors = AnnotationValidator(originalPythonPackage).validate()
    if (errors.isNotEmpty()) {
        return DoInferResult.ValidationFailure(errors.map { it.message() })
    }

    // Create original declarations
    modifiedPythonPackage.accept(OriginalDeclarationProcessor)

    // Apply annotations (don't change the order)
    val unusedAnnotationProcessor = UnusedAnnotationProcessor()
    modifiedPythonPackage.accept(unusedAnnotationProcessor)
    modifiedPythonPackage = unusedAnnotationProcessor.modifiedPackage

    val renameAnnotationProcessor = RenameAnnotationProcessor()
    modifiedPythonPackage.accept(renameAnnotationProcessor)
    modifiedPythonPackage = renameAnnotationProcessor.modifiedPackage

    val moveAnnotationProcessor = MoveAnnotationProcessor()
    modifiedPythonPackage.accept(moveAnnotationProcessor)
    modifiedPythonPackage = moveAnnotationProcessor.modifiedPackage

    modifiedPythonPackage.accept(PureAnnotationProcessor)

    // Build files
    val path = PackageFileBuilder(modifiedPythonPackage).buildModuleFiles()
    return DoInferResult.Success(path)
}

sealed class DoInferResult {
    class ValidationFailure(val messages: List<String>) : DoInferResult()
    class Success(val path: String) : DoInferResult()
}

class AuthenticationException : RuntimeException()
class AuthorizationException : RuntimeException()
