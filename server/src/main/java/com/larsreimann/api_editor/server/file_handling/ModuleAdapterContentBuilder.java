package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.*;

import java.util.ArrayList;
import java.util.List;

class ModuleAdapterContentBuilder extends FileBuilder {
    /**
     * Builds a string containing the formatted module content
     *
     * @param pythonModule The module whose content is to be formatted
     *                     and returned
     * @return The string containing the formatted module content
     */
    protected static String buildModuleContent(
        AnnotatedPythonModule pythonModule
    ) {
        String formattedImport = buildNamespace(pythonModule.getName());
        String formattedClasses = buildAllClasses(pythonModule.getClasses());
        String formattedFunctions = buildAllFunctions(pythonModule.getFunctions());
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

    private static String buildNamespace(String moduleName) {
        return "import " + moduleName;
    }

    private static String buildAllClasses(
        List<AnnotatedPythonClass> pythonClasses
    ) {
        List<String> formattedClasses = new ArrayList<>();
        pythonClasses.forEach(pythonClass ->
            formattedClasses.add(ClassAdapterContentBuilder.buildClass(pythonClass)));
        return listToString(formattedClasses, 2);
    }

    private static String buildAllFunctions(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        List<String> formattedFunctions = new ArrayList<>();
        pythonFunctions.forEach(pythonFunction ->
            formattedFunctions.add(FunctionAdapterContentBuilder.buildFunction(pythonFunction)));
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
        }
        else if (formattedClasses.isBlank() && formattedFunctions.isBlank()) {
            importSeparator = "\n";
        }
        else {
            importSeparator = "\n\n";
        }
        String classesSeparator;
        if (formattedClasses.isBlank()) {
            classesSeparator = "";
        }
        else if (formattedFunctions.isBlank()) {
            classesSeparator = "\n";
        }
        else {
            classesSeparator = "\n\n";
        }
        String functionSeparator;
        if (formattedFunctions.isBlank()) {
            functionSeparator = "";
        }
        else {
            functionSeparator = "\n";
        }

        return new String[]{importSeparator, classesSeparator, functionSeparator};
    }
}
