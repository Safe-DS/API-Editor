package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage;

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
    private final String zipFolderPath;

    /**
     * Constructor for class PackageFileBuilder
     *
     * @param annotatedPythonPackage The package whose files
     *                               should be built
     * @param zipFolderPath The path to the folder in which the zip file
     *                      will be generated
     *
     */
    public PackageFileBuilder(
        AnnotatedPythonPackage annotatedPythonPackage,
        String zipFolderPath
    ) {
        this.pythonPackage = annotatedPythonPackage;
        this.zipFolderPath = zipFolderPath;
    }

    /**
     * Builds the module files based on the python package of the
     * initialized class and puts them in the folder
     * at the classes specified zip folder path
     *
     */
    public void buildModuleFiles() throws Exception {
        Path workingPath = Files.createTempDirectory("working");
        String absoluteWorkingPath = workingPath.toFile().getAbsolutePath() + "/";
        pythonPackage.getModules().forEach(module -> {
            try {
                buildFile(
                    module.getName(),
                    ModuleContentBuilder.buildModuleContent(
                        module
                    ),
                    absoluteWorkingPath
                );
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        zip(absoluteWorkingPath);
        File workingDirectory = new File(absoluteWorkingPath);
        deleteFolder(workingDirectory);
    }

    private File buildFile(String fileName, String content, String workingFolderPath) {
        fileName = fileName.replaceAll("\\.", "/");
        fileName = workingFolderPath + fileName;
        fileName = fileName.replaceAll("/", "\\\\");
        String directoryName = fileName.substring(0, fileName.lastIndexOf("\\"));
        File directory = new File(directoryName);
        directory.mkdirs();
        fileName = fileName + ".py";
        System.out.println(fileName);
        File file = new File(fileName);
        try (BufferedWriter out = new BufferedWriter(new FileWriter(fileName))) {
            out.write(content);
            out.flush();
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return file;
    }

    private void zip(String workingFolderPath) throws Exception {
        Path path = Files.createFile(Paths.get(zipFolderPath));
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(Files.newOutputStream(path))) {
            Path sourcePath = Paths.get(workingFolderPath);
            Files.walk(sourcePath)
                .filter(currentPath -> !Files.isDirectory(currentPath))
                .forEach(currentPath -> {
                    ZipEntry zipEntry = new ZipEntry(sourcePath.relativize(currentPath).toString());
                    try {
                        zipOutputStream.putNextEntry(zipEntry);
                        Files.copy(currentPath, zipOutputStream);
                        zipOutputStream.closeEntry();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
        }
    }

    private void deleteFolder(File directory) {
        if (directory.exists()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        deleteFolder(file);
                    } else {
                        file.delete();
                    }
                }
            }
        }
        directory.delete();
    }
}
