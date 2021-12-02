package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonClass;
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;

import java.util.ArrayList;
import java.util.List;

class ClassAdapterContentBuilder extends FileBuilder {
    AnnotatedPythonClass pythonClass;

    /**
     * Constructor for ClassAdapterContentBuilder
     *
     * @param pythonClass The module whose adapter content should be built
     */
    protected ClassAdapterContentBuilder(AnnotatedPythonClass pythonClass) {
        this.pythonClass = pythonClass;
    }

    /**
     * Builds a string containing the formatted class content
     *
     * @return The string containing the formatted class content
     */
    protected String buildClass() {
        String formattedClass = "class " + pythonClass.getName() + ":";
        if (!pythonClass.getMethods().isEmpty()) {
            formattedClass = formattedClass + "\n";
            formattedClass = formattedClass
                + indent(listToString(buildAllFunctions(), 2));
        }
        return formattedClass;
    }

    private List<String> buildAllFunctions() {
        List<String> formattedFunctions = new ArrayList<>();
        pythonClass.getMethods().forEach(pythonFunction -> {
                FunctionAdapterContentBuilder functionAdapterContentBuilder =
                    new FunctionAdapterContentBuilder(pythonFunction);
                formattedFunctions.add(
                    functionAdapterContentBuilder.buildFunction()
                );
            }
        );
        return formattedFunctions;
    }
}
