package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class PackageFileBuilder {
    AnnotatedPythonPackage pythonPackage;
    private final String PYTHON_EXTENSION = ".py";

    public PackageFileBuilder(AnnotatedPythonPackage annotatedPythonPackage) {
        this.pythonPackage = annotatedPythonPackage;
    }

    public List<File> returnModuleFiles() {
        List<File> moduleFiles = new ArrayList<>();
        pythonPackage.getModules().forEach(module -> {
            try {
                moduleFiles.add(
                    buildFile(
                        module.getName() + PYTHON_EXTENSION,
                        ModuleContentBuilder.buildModuleContent(
                            module, pythonPackage.getName()
                        )
                    )
                );
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        return moduleFiles;
    }

    private File buildFile(String fileName, String content) throws IOException {
        File file = new File(fileName);
        try (BufferedWriter out = new BufferedWriter(new FileWriter(fileName))) {
            out.write(content);
            out.flush();
        }
        return file;
    }
}
