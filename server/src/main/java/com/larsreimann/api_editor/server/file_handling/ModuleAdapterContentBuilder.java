package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonModule;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

class ModuleAdapterContentBuilder extends FileBuilder {
    AnnotatedPythonModule pythonModule;

    /**
     * Constructor for ModuleAdapterContentBuilder
     *
     * @param pythonModule The module whose adapter content should be built
     */
    protected ModuleAdapterContentBuilder(AnnotatedPythonModule pythonModule) {
        this.pythonModule = pythonModule;
    }

    /**
     * Builds a string containing the formatted module content
     *
     * @return The string containing the formatted module content
     */
    protected String buildModuleContent() {
        String formattedImport = buildNamespace();
        String formattedClasses = buildAllClasses();
        String formattedFunctions = buildAllFunctions();
        String[] separators = buildSeparators(
            formattedImport, formattedClasses, formattedFunctions
        );
        formattedImport = formattedImport + separators[0];
        formattedClasses = formattedClasses + separators[1];
        formattedFunctions = formattedFunctions + separators[2];
        return formattedImport
            + formattedClasses
            + formattedFunctions;
    }

    private String buildNamespace() {
        HashSet<String> importedModules = new HashSet<>();
        importedModules.add(pythonModule.getName());
        pythonModule.getFunctions().forEach(
            pythonFunction ->
                importedModules.add(
                    buildParentDeclarationName(
                        Objects.requireNonNull(
                            pythonFunction
                                .getOriginalDeclaration()
                        ).getQualifiedName()
                    )
                )
        );
        pythonModule.getClasses().forEach(
            pythonClass ->
                importedModules.add(
                    buildParentDeclarationName(
                        Objects.requireNonNull(
                            pythonClass
                                .getOriginalDeclaration()
                        ).getQualifiedName()
                    )
                )
        );
        List<String> imports = new ArrayList<>();
        importedModules.forEach(
            moduleName ->
                imports.add("import " + moduleName)
        );
        return listToString(imports, 1);
    }

    private String buildParentDeclarationName(String qualifiedName) {
        String PATH_SEPARATOR = ".";
        int separationPosition = qualifiedName.lastIndexOf(PATH_SEPARATOR);
        return qualifiedName.substring(0, separationPosition);
    }

    private String buildAllClasses() {
        List<String> formattedClasses = new ArrayList<>();
        pythonModule.getClasses().forEach(pythonClass -> {
                ClassAdapterContentBuilder classAdapterContentBuilder =
                    new ClassAdapterContentBuilder(pythonClass);
                formattedClasses.add(classAdapterContentBuilder.buildClass());
            }
        );
        return listToString(formattedClasses, 2);
    }

    private String buildAllFunctions() {
        List<String> formattedFunctions = new ArrayList<>();
        pythonModule.getFunctions().forEach(pythonFunction -> {
                FunctionAdapterContentBuilder functionAdapterContentBuilder =
                    new FunctionAdapterContentBuilder(pythonFunction);
                formattedFunctions.add(functionAdapterContentBuilder.buildFunction());
            }
        );
        return listToString(formattedFunctions, 2);
    }

    private static String[] buildSeparators(
        String formattedImports,
        String formattedClasses,
        String formattedFunctions
    ) {
        String importSeparator;
        if (formattedImports.isBlank()) {
            importSeparator = "";
        } else if (formattedClasses.isBlank() && formattedFunctions.isBlank()) {
            importSeparator = "\n";
        } else {
            importSeparator = "\n\n";
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

        return new String[]{importSeparator, classesSeparator, functionSeparator};
    }
}
