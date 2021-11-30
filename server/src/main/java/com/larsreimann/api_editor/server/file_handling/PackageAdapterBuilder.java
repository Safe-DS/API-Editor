package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonModule;
import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage;

import java.nio.file.Path;

public class PackageAdapterBuilder extends PackageFileBuilder {
    /**
     * Constructor for class PackageFileBuilder
     *
     * @param annotatedPythonPackage The package whose adapter files should be built
     */
    public PackageAdapterBuilder(
        AnnotatedPythonPackage annotatedPythonPackage,
        Path workingDirectory
    ) {
        super(annotatedPythonPackage, workingDirectory);
    }

    @Override
    String buildModuleContent(AnnotatedPythonModule pythonModule) {
        return ModuleAdapterContentBuilder.buildModuleContent(pythonModule);
    }
}
