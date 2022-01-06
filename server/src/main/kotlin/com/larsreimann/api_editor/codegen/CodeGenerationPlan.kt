package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import de.unibonn.simpleml.constant.SmlFileExtension
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import kotlin.io.path.bufferedWriter

private val workingDirectory: Path = Paths.get("api-editor_inferredAPI")


/**
 * Builds the module files based on the python package of the
 * initialized class and puts them in the folder
 * at the classes specified zip folder path
 */
fun MutablePythonPackage.generateCode(): String {
    val workingPath = Files.createTempDirectory(workingDirectory.toString())
    modules.forEach { module: MutablePythonModule ->
        try {
            buildFile(
                module.name,
                module.toPythonCode(),
                Paths.get(
                    workingPath.toString(),
                    "adapter",
                    "simpleml"
                ),
                "py"
            )
            val moduleNameParts = module.name.split("\\.").toTypedArray()
            buildFile(
                moduleNameParts.joinToString(".") + "." + moduleNameParts[moduleNameParts.size - 1],
                module.toStubCode(),
                Paths.get(
                    workingPath.toString(),
                    "stub",
                    "simpleml"
                ),
                SmlFileExtension.Stub.toString()
            )
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
    val zipFolderPath = zip(workingPath)
    val workingDirectory = File(workingPath.toString())
    workingDirectory.deleteRecursively()
    return zipFolderPath
}

private fun zip(workingFolderPath: Path): String {
    val path = Files.createTempFile(workingDirectory.toString(), ".zip")
    ZipOutputStream(Files.newOutputStream(path)).use { zipOutputStream ->
        workingFolderPath.toFile().walk()
            .filter { it.isFile }
            .forEach {
                val zipEntry = ZipEntry(workingFolderPath.relativize(it.toPath()).toString())
                try {
                    zipOutputStream.putNextEntry(zipEntry)
                    Files.copy(it.toPath(), zipOutputStream)
                    zipOutputStream.closeEntry()
                } catch (e: IOException) {
                    e.printStackTrace()
                }
            }
    }
    return path.toString()
}

private fun File.bufferedOutputStream() = BufferedOutputStream(this.outputStream())
private fun File.zipOutputStream() = ZipOutputStream(this.bufferedOutputStream())
private fun File.bufferedInputStream() = BufferedInputStream(this.inputStream())
private fun File.asZipEntry() = ZipEntry(this.name)

fun archive(files: List<File>, destination: File) {
    destination.zipOutputStream().use {
        files.forEach { file ->
            it.putNextEntry(file.asZipEntry())
            file.bufferedInputStream().use { bis -> bis.copyTo(it) }
        }
    }
}

private fun buildFile(
    fileName: String,
    content: String,
    workingFolderPath: Path,
    fileExtension: String
) {
    val formattedFileName = (fileName.replace("\\.".toRegex(), "/") + "." + fileExtension)
    val filePath = Paths.get(workingFolderPath.toString(), formattedFileName)
    val directoryPath = filePath.parent
    val directory = File(directoryPath.toString())
    directory.mkdirs()
    try {
        filePath.bufferedWriter().use {
            it.write(content)
            it.flush()
        }
    } catch (e: IOException) {
        e.printStackTrace()
    }
}
