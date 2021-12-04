package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonModule;
import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage;
import kotlin.io.FilesKt;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class PackageFileBuilder {
    AnnotatedPythonPackage pythonPackage;
    Path workingDirectory;

    /**
     * Constructor for PackageFileBuilder
     *
     * @param pythonPackage The package whose files should be generated
     * @param workingDirectory The directory used by this class
     *                         for storing the files
     */
    public PackageFileBuilder(AnnotatedPythonPackage pythonPackage,
                              Path workingDirectory
    ) {
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
                    buildAdapterContent(
                        module
                    ),
                    Paths.get(workingPath.toString(),
                        "adapter",
                        "simpleml"
                    ),
                    ".py"
                );
                buildFile(
                    module.getName(),
                    buildStubContent(
                        module
                    ),
                    Paths.get(workingPath.toString(),
                        "stub",
                        "simpleml",
                        pythonPackage.getName()
                    ),
                    ".stub.simpleml"
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

    private void buildFile(
        String fileName,
        String content,
        Path workingFolderPath,
        String fileExtension
    ) {
        String formattedFileName = fileName.replaceAll("\\.", "/")
            + fileExtension;
        Path filePath = Paths.get(workingFolderPath.toString(), formattedFileName);
        Path directoryPath = filePath.getParent();
        File directory = new File(directoryPath.toString());
        directory.mkdirs();
        try (BufferedWriter out = new BufferedWriter(new FileWriter(filePath.toString()))) {
            out.write(content);
            out.flush();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String buildAdapterContent(AnnotatedPythonModule pythonModule) {
        ModuleAdapterContentBuilder moduleAdapterContentBuilder =
            new ModuleAdapterContentBuilder(pythonModule);
        return moduleAdapterContentBuilder.buildModuleContent();
    }

    private String buildStubContent(AnnotatedPythonModule pythonModule){
        ModuleStubContentBuilder moduleStubContentBuilder =
            new ModuleStubContentBuilder(pythonModule);
        return moduleStubContentBuilder.buildModuleContent();
    }
}
