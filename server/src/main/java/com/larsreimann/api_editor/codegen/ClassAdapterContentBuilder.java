package com.larsreimann.api_editor.codegen;

import com.larsreimann.api_editor.io.FileBuilder;
import com.larsreimann.api_editor.model.SerializablePythonClass;

import java.util.ArrayList;
import java.util.List;

public class ClassAdapterContentBuilder extends FileBuilder {
    SerializablePythonClass pythonClass;

    /**
     * Constructor for ClassAdapterContentBuilder
     *
     * @param pythonClass The module whose adapter content should be built
     */
    public ClassAdapterContentBuilder(SerializablePythonClass pythonClass) {
        this.pythonClass = pythonClass;
    }

    /**
     * Builds a string containing the formatted class content
     *
     * @return The string containing the formatted class content
     */
    public String buildClass() {
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
        pythonClass.getMethods()
            .forEach(pythonFunction -> {
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
