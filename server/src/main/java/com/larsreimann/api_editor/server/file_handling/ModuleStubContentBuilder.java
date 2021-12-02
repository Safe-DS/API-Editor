package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonModule;

import java.util.ArrayList;
import java.util.List;

class ModuleStubContentBuilder extends FileBuilder {
    AnnotatedPythonModule pythonModule;

    /**
     * Constructor for ModuleStubContentBuilder
     *
     * @param pythonModule The module whose stub content should be built
     */
    public ModuleStubContentBuilder(AnnotatedPythonModule pythonModule) {
        this.pythonModule = pythonModule;
    }

    /**
     * Builds a string containing the formatted module content
     *
     * @return The string containing the formatted module content
     */
    protected String buildModuleContent() {
        String formattedPackageDeclaration = buildPackageDeclaration();
        String formattedClasses = buildAllClasses();
        String formattedFunctions = buildAllFunctions();
        String[] separators = buildSeparators(
            formattedPackageDeclaration,
            formattedClasses,
            formattedFunctions
        );
        formattedPackageDeclaration = formattedPackageDeclaration + separators[0];
        formattedClasses = formattedClasses + separators[1];
        formattedFunctions = formattedFunctions + separators[2];

        return formattedPackageDeclaration
            + formattedClasses
            + formattedFunctions;
    }

    private String buildPackageDeclaration() {
        return "package "
            + "simpleml."
            + pythonModule.getName();
    }

    private String buildAllClasses() {
        List<String> formattedClasses = new ArrayList<>();
        pythonModule.getClasses().forEach(pythonClass -> {
            ClassStubContentBuilder classStubContentBuilder =
                new ClassStubContentBuilder(pythonClass);
            formattedClasses.add(classStubContentBuilder.buildClass());
        });
        return listToString(formattedClasses, 2);
    }

    private String buildAllFunctions() {
        List<String> formattedFunctions = new ArrayList<>();
        pythonModule.getFunctions().forEach(pythonFunction -> {
                FunctionStubContentBuilder functionStubContentBuilder =
                    new FunctionStubContentBuilder(pythonFunction);
                formattedFunctions.add(functionStubContentBuilder.buildFunction());
            }
        );
        return listToString(formattedFunctions, 2);
    }

    private String[] buildSeparators(
        String formattedPackageDeclaration,
        String formattedClasses,
        String formattedFunctions
    ) {
        String packageDeclarationSeparator;
        if (formattedPackageDeclaration.isBlank()) {
            packageDeclarationSeparator = "";
        } else if (formattedClasses.isBlank() && formattedFunctions.isBlank()) {
            packageDeclarationSeparator = "\n";
        } else {
            packageDeclarationSeparator = "\n\n";
        }
        String classesSeparator;
        if (formattedClasses.isBlank()) {
            classesSeparator = "";
        } else if (formattedFunctions.isBlank()) {
            classesSeparator = "\n";
        } else {
            classesSeparator = "\n\n";
        }
        String functionSeparator;
        if (formattedFunctions.isBlank()) {
            functionSeparator = "";
        } else {
            functionSeparator = "\n";
        }

        return new String[]{packageDeclarationSeparator, classesSeparator, functionSeparator};
    }
}
