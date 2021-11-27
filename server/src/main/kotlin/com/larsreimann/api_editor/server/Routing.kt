package com.larsreimann.api_editor.server

import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage
import com.larsreimann.api_editor.server.file_handling.ModuleContentBuilder
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
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import kotlin.io.use

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
            downloadAdapters()
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
        if (messages.isNotEmpty()) {
            call.respond(HttpStatusCode.Conflict, messages)
        } else {
            call.respond(HttpStatusCode.OK, "TODO")
        }
    }
}

fun Route.downloadAdapters() {
    post("/downloadAdapters") {
        val pythonPackage = call.receive<AnnotatedPythonPackage>()
        val packageFileBuilder =
            PackageFileBuilder(
                pythonPackage
            )
        val zipFileName = pythonPackage.name.plus(".zip")
        val zipFile = File(zipFileName)
        val fileList = packageFileBuilder.returnModuleFiles()
        ZipOutputStream(BufferedOutputStream(FileOutputStream(zipFile))).use { output ->
            fileList.forEach { file ->
                if (file.length() > 1)
                    FileInputStream(file).use { input ->
                        BufferedInputStream(input).use { origin ->
                            val entry = ZipEntry(file.name)
                            output.putNextEntry(entry)
                            origin.copyTo(output, 1024)
                        }
                    }
            }
        }
        call.response.header(
            HttpHeaders.ContentDisposition,
            ContentDisposition.Attachment.withParameter(
                ContentDisposition.Parameters.FileName, zipFileName
            ).toString()
        )
        call.respondFile(zipFile)
        fileList.forEach { file -> file.delete() }
        zipFile.delete()
    }
}

class AuthenticationException : RuntimeException()
class AuthorizationException : RuntimeException()
