package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage;
import kotlin.io.FilesKt;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public abstract class PackageFileBuilder {
    AnnotatedPythonPackage pythonPackage;
    Path workingDirectory;

    public PackageFileBuilder(AnnotatedPythonPackage pythonPackage, Path workingDirectory) {
        this.pythonPackage = pythonPackage;
        this.workingDirectory = workingDirectory;
    }

    /**
     * Builds the module files based on the python package of the
     * initialized class and puts them in the folder
     * at the classes specified zip folder path
     */
    public String buildModuleFiles() throws Exception {
        Path workingPath = Files.createTempDirectory(workingDirectory.toString());
        pythonPackage.getModules().forEach(module -> {
            try {
                buildFile(
                    module.getName(),
                    ModuleContentBuilder.buildModuleContent(
                        module
                    ),
                    workingPath
                );
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        var zipFolderPath = zip(workingPath);
        File workingDirectory = new File(workingPath.toString());
        FilesKt.deleteRecursively(workingDirectory);

        return zipFolderPath;
    }

    private String zip(Path workingFolderPath) throws Exception {
        Path path = Files.createTempFile(workingDirectory.toString(), ".zip");
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(Files.newOutputStream(path))) {
            Files.walk(workingFolderPath)
                .filter(currentPath -> !Files.isDirectory(currentPath))
                .forEach(currentPath -> {
                    ZipEntry zipEntry = new ZipEntry(workingFolderPath.relativize(currentPath).toString());
                    try {
                        zipOutputStream.putNextEntry(zipEntry);
                        Files.copy(currentPath, zipOutputStream);
                        zipOutputStream.closeEntry();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
        }
        return path.toString();
    }

    abstract void buildFile(String fileName, String content, Path workingFolderPath);
}
