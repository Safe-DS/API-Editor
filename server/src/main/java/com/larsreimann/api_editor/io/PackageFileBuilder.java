package com.larsreimann.api_editor.io;

import com.larsreimann.api_editor.codegen.ModuleAdapterContentBuilder;
import com.larsreimann.api_editor.codegen.ModuleStubContentBuilder;
import com.larsreimann.api_editor.model.AnnotatedPythonModule;
import com.larsreimann.api_editor.model.AnnotatedPythonPackage;
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
     */
    public PackageFileBuilder(AnnotatedPythonPackage pythonPackage) {
        this.pythonPackage = pythonPackage;
        this.workingDirectory = Paths.get("api-editor_inferredAPI");
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

                var moduleNameParts = module.getName().split("\\.");

                buildFile(
                    String.join(".", moduleNameParts) + "." + moduleNameParts[moduleNameParts.length - 1],
                    buildStubContent(module),
                    Paths.get(workingPath.toString(),
                        "com/larsreimann/api_editor/io/stub",
                        "simpleml"
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

    private String buildStubContent(AnnotatedPythonModule pythonModule) {
        ModuleStubContentBuilder moduleStubContentBuilder =
            new ModuleStubContentBuilder(pythonModule);
        return moduleStubContentBuilder.buildModuleContent();
    }
}
