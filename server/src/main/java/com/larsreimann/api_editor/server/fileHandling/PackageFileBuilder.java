package com.larsreimann.api_editor.server.fileHandling;

import com.larsreimann.api_editor.server.data.*;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class PackageFileBuilder {
    AnnotatedPythonPackage pythonPackage;
    private final String PYTHON_EXTENSION = ".py";

    public PackageFileBuilder(AnnotatedPythonPackage pythonPackage) {
        this.pythonPackage = pythonPackage;
    }

    public List<File> returnModuleFiles() {
        List<File> moduleFiles = new ArrayList<>();
        pythonPackage.getModules().forEach(module -> {
            try {
                moduleFiles.add(
                    buildFile(
                    module.getName() + PYTHON_EXTENSION,
                        buildModuleContent(module)
                    )
                );
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        return moduleFiles;
    }

    private String buildModuleContent(AnnotatedPythonModule module) {
        // TODO
        return "TODO";
    }

    private String indent(String toIndent) {
        String INDENTATION = "    ";
        toIndent = INDENTATION + toIndent;
        return toIndent.replaceAll("\n", "\n" + INDENTATION);
    }

    private File buildFile(String fileName, String content) throws IOException {
        File file = new File(fileName);
        try (BufferedWriter out = new BufferedWriter(new FileWriter(fileName))) {
            out.write(content);
            out.flush();
        }
        return file;
    }

    private String buildFunction(AnnotatedPythonFunction pythonFunction) {
        return "TODO";
    }

    private String buildParameters(List<AnnotatedPythonParameter> pythonParameters) {
        return "TODO";
    }

    private String buildClass(AnnotatedPythonClass pythonClass) {
        return "TODO";
    }

    private String buildImports(AnnotatedPythonModule pythonModule) {
        // imports
        // fromImports
        // namespace
        return "TODO";
    }
}
