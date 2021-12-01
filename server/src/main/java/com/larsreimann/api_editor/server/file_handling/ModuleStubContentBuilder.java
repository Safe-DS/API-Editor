package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonClass;
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;
import com.larsreimann.api_editor.server.data.AnnotatedPythonModule;

import java.util.ArrayList;
import java.util.List;

class ModuleStubContentBuilder extends FileBuilder {
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
        String formattedPackageDeclaration = buildPackageDeclaration(
            pythonModule.getName()
        );
        String formattedClasses = buildAllClasses(
            pythonModule.getClasses()
        );
        String formattedFunctions = buildAllFunctions(
            pythonModule.getFunctions()
        );
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

    private static String buildPackageDeclaration(String moduleName) {
        return "package "
            + "simpleml."
            + moduleName;
    }

    private static String buildAllClasses(
        List<AnnotatedPythonClass> pythonClasses
    ) {
        List<String> formattedClasses = new ArrayList<>();
        pythonClasses.forEach(pythonClass ->
            formattedClasses.add(ClassStubContentBuilder.buildClass(pythonClass)));
        return listToString(formattedClasses, 2);
    }

    private static String buildAllFunctions(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        List<String> formattedFunctions = new ArrayList<>();
        pythonFunctions.forEach(pythonFunction ->
            formattedFunctions.add(FunctionStubContentBuilder.buildFunction(pythonFunction)));
        return listToString(formattedFunctions, 2);
    }

    private static String[] buildSeparators(
        String formattedPackageDeclaration,
        String formattedClasses,
        String formattedFunctions
    ) {
        String packageDeclarationSeparator;
        if (formattedPackageDeclaration.isBlank()) {
            packageDeclarationSeparator = "";
        }
        else if (formattedClasses.isBlank() && formattedFunctions.isBlank()) {
            packageDeclarationSeparator = "\n";
        }
        else {
            packageDeclarationSeparator = "\n\n";
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

        return new String[]{packageDeclarationSeparator, classesSeparator, functionSeparator};
    }
}
