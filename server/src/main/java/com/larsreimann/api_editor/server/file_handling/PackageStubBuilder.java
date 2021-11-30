package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonModule;
import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage;

import java.nio.file.Path;

public class PackageStubBuilder extends PackageFileBuilder{
    /**
     * Constructor for class PackageStubBuilder
     *
     * @param annotatedPythonPackage The package whose stub files should be built
     */
    public PackageStubBuilder(
        AnnotatedPythonPackage annotatedPythonPackage,
        Path workingDirectory
    ) {
        super(annotatedPythonPackage, workingDirectory);
    }

    @Override
    String buildModuleContent(AnnotatedPythonModule pythonModule) {
        return ModuleStubContentBuilder.buildModuleContent(pythonModule);
    }
}
