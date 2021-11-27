package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonModule;
import com.larsreimann.api_editor.server.data.PythonFromImport;
import com.larsreimann.api_editor.server.data.PythonImport;

import java.util.ArrayList;
import java.util.List;

public class ImportContentBuilder extends PythonFileBuilder {
    /**
     * Builds a string containing the formatted imports
     *
     * @param pythonModule The module whose imports are to be returned
     * @return The string containing the formatted imports
     */
    protected static String buildAllImports(
        AnnotatedPythonModule pythonModule
    ) {
        List<String> imports = new ArrayList<>();
        imports.add(buildNamespace(pythonModule.getName()));
        imports.addAll(buildImports(pythonModule.getImports()));
        imports.addAll(buildFromImports(pythonModule.getFromImports()));
        return listToString(imports, 1);
    }

    private static String buildNamespace(String moduleName) {
        return "import " + moduleName;
    }

    private static List<String> buildImports(List<PythonImport> pythonImports) {
        List<String> formattedImports = new ArrayList<>();
        pythonImports.forEach(pythonImport -> {
            if (pythonImport.getAlias() != null
                && !pythonImport.getAlias().isBlank()) {
                formattedImports.add(
                    "import "
                        + pythonImport.getModule()
                        + " as "
                        + pythonImport.getAlias()
                );
            }
            else {
                formattedImports.add(
                    "import "
                        + pythonImport.getModule()
                );
            }
        });
        return formattedImports;
    }

    private static List<String> buildFromImports(
        List<PythonFromImport> pythonFromImports
    ) {
        List<String> formattedImports = new ArrayList<>();
        pythonFromImports.forEach(pythonFromImport -> {
            if (pythonFromImport.getAlias() != null
                && !pythonFromImport.getAlias().isBlank()) {
                formattedImports.add(
                    "from "
                        + pythonFromImport.getModule()
                        + " import "
                        + pythonFromImport.getDeclaration()
                        + " as "
                        + pythonFromImport.getAlias()
                );
            }
            else {
                formattedImports.add(
                    "from "
                        + pythonFromImport.getModule()
                        + " import "
                        + pythonFromImport.getDeclaration()
                );
            }
        });
        return formattedImports;
    }
}
