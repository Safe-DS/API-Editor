package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonClass;
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter;

import java.util.ArrayList;
import java.util.List;

class ClassStubContentBuilder extends FileBuilder {
    /**
     * Builds a string containing the formatted class content
     *
     * @param pythonClass The class whose content is to be formatted and returned
     * @return The string containing the formatted class content
     */
    protected static String buildClass(AnnotatedPythonClass pythonClass) {
        String formattedClassCall = buildClassCall(pythonClass);
        String formattedClassBody = buildClassBody(pythonClass);
        return buildFormattedClass(formattedClassCall, formattedClassBody);
    }

    private static String buildClassCall(AnnotatedPythonClass pythonClass) {
        AnnotatedPythonFunction constructor = getConstructor(pythonClass.getMethods());
        return "open class "
            + pythonClass.getName()
            + " constructor("
            + buildConstructor(constructor)
            + ")";
    }

    private static AnnotatedPythonFunction getConstructor(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        AnnotatedPythonFunction constructor = pythonFunctions
            .stream()
            .filter(pythonFunction ->
                pythonFunction.getName().equals("__init__"))
            .findAny()
            .orElse(null);
        assert constructor != null;
        return constructor;
    }

    private static String buildConstructor(
        AnnotatedPythonFunction pythonFunction
    ) {
        List<AnnotatedPythonParameter> pythonParameters = pythonFunction.getParameters();
        if (pythonParameters.isEmpty()) {
            return "";
        }
        List<String> formattedConstructorParameters = new ArrayList<>();
        pythonParameters.forEach(pythonParameter ->
            formattedConstructorParameters.add(
                buildConstructorParameter(pythonParameter)
            ));
        return String.join(", ", formattedConstructorParameters);
    }

    private static String buildConstructorParameter(
        AnnotatedPythonParameter pythonParameter
    ) {
        String formattedParameter = pythonParameter.getName() + ": " + "Any?";
        String defaultValue = pythonParameter.getDefaultValue();
        if (defaultValue != null
            && !defaultValue.isBlank()) {
            formattedParameter = formattedParameter + " or " + defaultValue;
        }
        return formattedParameter;
    }

    private static String buildClassBody(AnnotatedPythonClass pythonClass) {
        List<AnnotatedPythonParameter> attributes = getConstructor(
            pythonClass.getMethods()
        ).getParameters();
        List<AnnotatedPythonFunction> pythonFunctions = pythonClass.getMethods();
        String formattedAttributes = buildAttributes(attributes);
        String formattedFunctions = buildFunctions(pythonFunctions);
        if (formattedAttributes.isBlank()) {
            if (formattedFunctions.isBlank()) {
                return "";
            }
            return formattedFunctions;
        }
        if (formattedFunctions.isBlank()) {
            return formattedAttributes;
        }
        return formattedAttributes + "\n\n" + formattedFunctions;
    }

    private static String buildAttributes(
        List<AnnotatedPythonParameter> pythonParameters
    ) {
        List<String> formattedAttributes = new ArrayList<>();
        pythonParameters.forEach(pythonParameter -> formattedAttributes.add(
            "attr "
                + pythonParameter.getName()
                + ": "
                + "Any?"
        ));
        return listToString(formattedAttributes, 1);
    }

    private static String buildFunctions(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        List<String> formattedFunctions = new ArrayList<>();
        pythonFunctions.forEach(pythonFunction -> {
            String formattedFunction = "";
            if (isOverriding(pythonFunction)) {
                formattedFunction = formattedFunction + "override ";
            }
            formattedFunction = formattedFunction
                + FunctionStubContentBuilder.buildFunction(pythonFunction);
            formattedFunctions.add(
                formattedFunction
            );
        });
        return listToString(formattedFunctions, 1);
    }

    private static boolean isOverriding(AnnotatedPythonFunction pythonFunction) {
        // TODO
        return false;
    }

    private static String buildFormattedClass(
        String classCall,
        String classBody) {
        if (classBody.isBlank()) {
            return classCall + " {}";
        }
        return classCall
            + " {\n"
            + indent(classBody)
            + "\n}";
    }
}
