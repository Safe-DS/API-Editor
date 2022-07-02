package com.larsreimann.apiEditor.server

import com.larsreimann.apiEditor.codegen.generateCode
import com.larsreimann.apiEditor.model.SerializablePythonPackage
import com.larsreimann.apiEditor.mutableModel.convertPackage
import com.larsreimann.apiEditor.transformation.processingExceptions.ConflictingEnumException
import com.larsreimann.apiEditor.transformation.processingExceptions.ConflictingGroupException
import com.larsreimann.apiEditor.transformation.transform
import com.larsreimann.apiEditor.validation.AnnotationValidator
import io.ktor.http.ContentDisposition
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.http.content.defaultResource
import io.ktor.server.http.content.resources
import io.ktor.server.http.content.static
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.request.receive
import io.ktor.server.response.header
import io.ktor.server.response.respond
import io.ktor.server.response.respondFile
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.server.util.getOrFail
import java.io.File

fun Application.configureRouting() {
    install(ContentNegotiation) {
        json()
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
    post("/generate-adapters/{newPackageName}") {
        val pythonPackage = call.receive<SerializablePythonPackage>()
        when (val doInferResult = doInfer(pythonPackage, call.parameters.getOrFail("newPackageName"))) {
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
                            zipFile.toString(),
                        ).toString(),
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

fun doInfer(originalPythonPackage: SerializablePythonPackage, newPackageNew: String): DoInferResult {
    // Validate
    val errors = AnnotationValidator(originalPythonPackage).validate()
    if (errors.isNotEmpty()) {
        return DoInferResult.ValidationFailure(errors.map { it.message() })
    }

    // Process package
    val mutablePackage = convertPackage(originalPythonPackage)

    try {
        mutablePackage.transform(newPackageNew)
    } catch (e: ConflictingEnumException) {
        return DoInferResult.ValidationFailure(listOf(e.message!!))
    } catch (e: ConflictingGroupException) {
        return DoInferResult.ValidationFailure(listOf(e.message!!))
    }

    // Build files
    val path = mutablePackage.generateCode()
    return DoInferResult.Success(path)
}

sealed class DoInferResult {
    class Success(val path: File) : DoInferResult()
    class ValidationFailure(val messages: List<String>) : DoInferResult()
}
