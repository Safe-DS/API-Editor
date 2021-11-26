package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.*;

import java.util.ArrayList;
import java.util.List;

public class ModuleContentBuilder extends PythonFileBuilder {
    public static String buildModuleContent(
        AnnotatedPythonModule pythonModule,
        String packageName
    ) {
        String formattedImports = ImportContentBuilder.buildAllImports(
            pythonModule, packageName
        );
        String formattedClasses = buildAllClasses(pythonModule.getClasses());
        String formattedFunctions = buildAllFunctions(pythonModule.getFunctions());
        String[] separators = buildSeparators(
            formattedImports, formattedClasses, formattedFunctions
        );
        formattedImports = formattedImports + separators[0];
        formattedClasses = formattedClasses + separators[1];
        formattedFunctions = formattedFunctions + separators[2];
        return formattedImports
            + formattedClasses
            + formattedFunctions;
    }

    private static String buildAllClasses(
        List<AnnotatedPythonClass> pythonClasses
    ) {
        List<String> formattedClasses = new ArrayList<>();
        pythonClasses.forEach(pythonClass ->
            formattedClasses.add(ClassContentBuilder.buildClass(pythonClass)));
        return listToString(formattedClasses, 2);
    }

    private static String buildAllFunctions(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        List<String> formattedFunctions = new ArrayList<>();
        pythonFunctions.forEach(pythonFunction ->
            formattedFunctions.add(FunctionContentBuilder.buildFunction(pythonFunction)));
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
