package com.larsreimann.api_editor.codegen;

import com.larsreimann.api_editor.io.FileBuilder;
import com.larsreimann.api_editor.model.AnnotatedPythonModule;

import java.util.ArrayList;
import java.util.List;

public class ModuleAdapterContentBuilder extends FileBuilder {
    AnnotatedPythonModule pythonModule;

    /**
     * Constructor for ModuleAdapterContentBuilder
     *
     * @param pythonModule The module whose adapter content should be built
     */
    public ModuleAdapterContentBuilder(AnnotatedPythonModule pythonModule) {
        this.pythonModule = pythonModule;
    }

    /**
     * Builds a string containing the formatted module content
     *
     * @return The string containing the formatted module content
     */
    public String buildModuleContent() {
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
        return "import " + pythonModule.getName();
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
