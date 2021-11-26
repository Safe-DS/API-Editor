package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonClass;
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;

import java.util.ArrayList;
import java.util.List;

public class ClassContentBuilder extends PythonFileBuilder {
    public static String buildClass(AnnotatedPythonClass pythonClass) {
        String formattedClass = "class " + pythonClass.getName() + ":";
        if (!pythonClass.getMethods().isEmpty()) {
            formattedClass = formattedClass + "\n";
            formattedClass = formattedClass
                + indent(listToString(buildAllFunctions(pythonClass.getMethods()), 2));
        }
        return formattedClass;
    }

    private static List<String> buildAllFunctions(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        List<String> formattedFunctions = new ArrayList<>();
        pythonFunctions.forEach(pythonFunction ->
            formattedFunctions.add(FunctionContentBuilder.buildFunction(pythonFunction)));
        return formattedFunctions;
    }
}
