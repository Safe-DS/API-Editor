package com.larsreimann.api_editor.server.fileHandling;

import com.larsreimann.api_editor.server.data.*;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class PackageFileBuilder {
    AnnotatedPythonPackage pythonPackage;
    private final String PYTHON_EXTENSION = ".py";

    public PackageFileBuilder(AnnotatedPythonPackage pythonPackage) {
        this.pythonPackage = pythonPackage;
    }

    public List<File> returnModuleFiles() {
        List<File> moduleFiles = new ArrayList<>();
        pythonPackage.getModules().forEach(module -> {
            try {
                moduleFiles.add(
                    buildFile(
                    module.getName() + PYTHON_EXTENSION,
                        buildModuleContent(module)
                    )
                );
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        return moduleFiles;
    }

    private File buildFile(String fileName, String content) throws IOException {
        File file = new File(fileName);
        try (BufferedWriter out = new BufferedWriter(new FileWriter(fileName))) {
            out.write(content);
            out.flush();
        }
        return file;
    }

    private String buildModuleContent(AnnotatedPythonModule pythonModule) {
        String formattedImports = listToString(
            buildAllImports(pythonModule), 1
        );
        String formattedClasses = listToString(
            buildAllClasses(pythonModule.getClasses()), 2
        );
        String formattedFunctions = listToString(
            buildAllFunctions(pythonModule.getFunctions()), 2
        );
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
        formattedImports = formattedImports + importSeparator;
        return formattedImports
            + importSeparator
            + formattedClasses
            + classesSeparator
            + formattedFunctions
            + functionSeparator;
    }

    private List<String> buildAllImports(AnnotatedPythonModule pythonModule) {
        List<String> imports = new ArrayList<>();
        imports.add(buildNamespace(pythonModule.getName()));
        imports.addAll(buildImports(pythonModule.getImports()));
        imports.addAll(buildFromImports(pythonModule.getFromImports()));
        return imports;
    }

    private String buildNamespace(String moduleName) {
        return "import " + pythonPackage.getName() + "." + moduleName;
    }

    private List<String> buildImports(List<PythonImport> pythonImports) {
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

    private List<String> buildFromImports(
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

    private String listToString(
        List<String> listToConvert, int numberOfNewlines
    ) {
        String delimiter;
        if (numberOfNewlines <= 0) {
            delimiter = "";
        }
        else {
            delimiter = "\n".repeat(numberOfNewlines);
        }
        if (listToConvert == null || listToConvert.isEmpty()) {
            return "";
        }
        else {
            return String.join(delimiter, listToConvert);
        }
    }



    private List<String> buildAllClasses(
        List<AnnotatedPythonClass> pythonClasses
    ) {
        List<String> formattedClasses = new ArrayList<>();
        pythonClasses.forEach(pythonClass ->
            formattedClasses.add(buildClass(pythonClass)));
        return formattedClasses;
    }

    private String buildClass(AnnotatedPythonClass pythonClass) {
        String formattedClass = "class " + pythonClass.getName() + ":\n";
        formattedClass = formattedClass
            + indent(listToString(buildAllFunctions(pythonClass.getMethods()), 2));
        return formattedClass;
    }

    private String indent(String toIndent) {
        String INDENTATION = "    ";
        toIndent = INDENTATION + toIndent;
        return toIndent.replaceAll("\n", "\n" + INDENTATION);
    }

    private List<String> buildAllFunctions(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        List<String> formattedFunctions = new ArrayList<>();
        pythonFunctions.forEach(pythonFunction ->
            formattedFunctions.add(buildFunction(pythonFunction)));
        return formattedFunctions;
    }

    private String buildFunction(AnnotatedPythonFunction pythonFunction) {
        return "def "
            + pythonFunction.getName()
            + "("
            + buildFunctionParameters(pythonFunction.getParameters())
            + ")"
            + ":\n"
            + indent(buildFunctionBody(pythonFunction));
    }

    private String buildFunctionParameters(
        List<AnnotatedPythonParameter> pythonParameters
    ) {
        String formattedFunctionParameters = "";
        List<String> positionOnlyParameters = new ArrayList<>();
        List<String> positionOrNameParameters = new ArrayList<>();
        List<String> nameOnlyParameters = new ArrayList<>();
        pythonParameters.forEach(pythonParameter -> {
            switch (pythonParameter.getAssignedBy()) {
                case POSITION_ONLY -> positionOnlyParameters
                    .add(pythonParameter.getName());
                case POSITION_OR_NAME -> positionOrNameParameters
                    .add(pythonParameter.getName());
                case NAME_ONLY -> nameOnlyParameters
                    .add(pythonParameter.getName());
            }
        });
        boolean hasPositionOnlyParameters = !positionOnlyParameters.isEmpty();
        boolean hasPositionOrNameParameters = !positionOrNameParameters.isEmpty();
        boolean hasNameOnlyParameters = !nameOnlyParameters.isEmpty();

        if (hasPositionOnlyParameters) {
            formattedFunctionParameters =
                formattedFunctionParameters
                    + String.join(", ", positionOnlyParameters);
            if (hasPositionOrNameParameters || hasNameOnlyParameters) {
                formattedFunctionParameters =
                    formattedFunctionParameters
                    + ", /, ";
            }
            else {
                formattedFunctionParameters =
                    formattedFunctionParameters
                        + ", /";
            }
        }
        if (hasPositionOrNameParameters) {
            formattedFunctionParameters =
                formattedFunctionParameters
                    + String.join(", ", positionOrNameParameters);
        }
        if (hasNameOnlyParameters) {
            if (hasPositionOnlyParameters || hasPositionOrNameParameters) {
                formattedFunctionParameters =
                    formattedFunctionParameters + ", *, ";
            }
            else {
                formattedFunctionParameters =
                    formattedFunctionParameters + "*, ";
            }
            formattedFunctionParameters =
                formattedFunctionParameters
                    + ", *, "
                    + String.join(", ", nameOnlyParameters);
        }
        return formattedFunctionParameters;
    }

    private String buildFunctionBody(AnnotatedPythonFunction pythonFunction) {
        return pythonFunction.getQualifiedName()
            + "("
            + buildFunctionParameterCall(pythonFunction.getParameters())
            + ")";
    }

    private String buildFunctionParameterCall(
        List<AnnotatedPythonParameter> pythonParameters
    ) {
        List<String> formattedParameters = new ArrayList<>();
        pythonParameters.forEach(pythonParameter -> {
            if (pythonParameter.getAssignedBy()
                == PythonParameterAssignment.NAME_ONLY) {
                formattedParameters.add(
                    pythonParameter.getName()
                        + "="
                        + pythonParameter.getName()
                );
            } else {
                formattedParameters.add(
                    pythonParameter.getName()
                );
            }
        });
        return String.join(", ", formattedParameters);
    }
}
