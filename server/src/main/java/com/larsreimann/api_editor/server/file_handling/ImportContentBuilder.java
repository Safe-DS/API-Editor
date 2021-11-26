package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonModule;
import com.larsreimann.api_editor.server.data.PythonFromImport;
import com.larsreimann.api_editor.server.data.PythonImport;

import java.util.ArrayList;
import java.util.List;

public class ImportContentBuilder extends PythonFileBuilder {
    protected static String buildAllImports(
        AnnotatedPythonModule pythonModule,
        String packageName
    ) {
        List<String> imports = new ArrayList<>();
        imports.add(buildNamespace(packageName, pythonModule.getName()));
        imports.addAll(buildImports(pythonModule.getImports()));
        imports.addAll(buildFromImports(pythonModule.getFromImports()));
        return listToString(imports, 1);
    }

    private static String buildNamespace(String packageName, String moduleName) {
        return "import " + packageName + "." + moduleName;
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
