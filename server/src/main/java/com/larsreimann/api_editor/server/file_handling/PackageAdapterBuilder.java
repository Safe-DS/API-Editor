package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.nio.file.Path;
import java.nio.file.Paths;

public class PackageAdapterBuilder extends PackageFileBuilder {
    /**
     * Constructor for class PackageFileBuilder
     *
     * @param annotatedPythonPackage The package whose files should be built
     */
    public PackageAdapterBuilder(
        AnnotatedPythonPackage annotatedPythonPackage,
        Path workingDirectory
    ) {
        super(annotatedPythonPackage, workingDirectory);
    }

    protected void buildFile(String fileName, String content, Path workingFolderPath) {
        String formattedFileName = fileName.replaceAll("\\.", "/") + ".py";
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
}
