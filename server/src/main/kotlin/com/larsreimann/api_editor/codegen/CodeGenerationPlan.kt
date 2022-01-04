package com.larsreimann.api_editor.codegen

import com.larsreimann.api_editor.mutable_model.MutablePythonModule
import com.larsreimann.api_editor.mutable_model.MutablePythonPackage
import de.unibonn.simpleml.constant.SmlFileExtension
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.function.Consumer
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

class CodeGenerationPlan(var pythonPackage: MutablePythonPackage) {
    var workingDirectory: Path = Paths.get("api-editor_inferredAPI")

    /**
     * Builds the module files based on the python package of the
     * initialized class and puts them in the folder
     * at the classes specified zip folder path
     */
    @Throws(Exception::class)
    fun buildModuleFiles(): String {
        val workingPath = Files.createTempDirectory(workingDirectory.toString())
        pythonPackage.modules.forEach(Consumer { module: MutablePythonModule ->
            try {
                buildFile(
                    module.name,
                    buildAdapterContent(
                        module
                    ),
                    Paths.get(
                        workingPath.toString(),
                        "adapter",
                        "simpleml"
                    ),
                    "py"
                )
                val moduleNameParts = module.name.split("\\.").toTypedArray()
                buildFile(
                    java.lang.String.join(".", *moduleNameParts) + "." + moduleNameParts[moduleNameParts.size - 1],
                    buildStubContent(module),
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
        })
        val zipFolderPath = zip(workingPath)
        val workingDirectory = File(workingPath.toString())
        workingDirectory.deleteRecursively()
        return zipFolderPath
    }

    @Throws(Exception::class)
    private fun zip(workingFolderPath: Path): String {
        val path = Files.createTempFile(workingDirectory.toString(), ".zip")
        ZipOutputStream(Files.newOutputStream(path)).use { zipOutputStream ->
            Files.walk(workingFolderPath)
                .filter { currentPath: Path -> !Files.isDirectory(currentPath) }
                .forEach { currentPath: Path ->
                    val zipEntry = ZipEntry(workingFolderPath.relativize(currentPath).toString())
                    try {
                        zipOutputStream.putNextEntry(zipEntry)
                        Files.copy(currentPath, zipOutputStream)
                        zipOutputStream.closeEntry()
                    } catch (e: IOException) {
                        e.printStackTrace()
                    }
                }
        }
        return path.toString()
    }

    private fun buildFile(
        fileName: String,
        content: String,
        workingFolderPath: Path,
        fileExtension: String
    ) {
        val formattedFileName = (fileName.replace("\\.".toRegex(), "/")
            + "." + fileExtension)
        val filePath = Paths.get(workingFolderPath.toString(), formattedFileName)
        val directoryPath = filePath.parent
        val directory = File(directoryPath.toString())
        directory.mkdirs()
        try {
            BufferedWriter(FileWriter(filePath.toString())).use { out ->
                out.write(content)
                out.flush()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun buildAdapterContent(pythonModule: MutablePythonModule): String {
        return pythonModule.toPythonCode()
    }

    private fun buildStubContent(pythonModule: MutablePythonModule): String {
        return buildCompilationUnitToString(pythonModule)
    }
}
