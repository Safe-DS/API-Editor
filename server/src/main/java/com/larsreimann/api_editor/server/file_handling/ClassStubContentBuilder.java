package com.larsreimann.api_editor.server.file_handling;

import com.larsreimann.api_editor.server.data.AnnotatedPythonClass;
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction;
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

class ClassStubContentBuilder extends FileBuilder {
    String className;
    List<AnnotatedPythonFunction> classMethods;
    boolean hasConstructor;
    boolean hasClassMethods;
    AnnotatedPythonFunction constructor;

    /**
     * Constructor for ClassStubContentBuilder
     *
     * @param pythonClass The class whose stub content should be built
     */
    public ClassStubContentBuilder(
        AnnotatedPythonClass pythonClass
    ) {
        List<AnnotatedPythonFunction> originalClassMethods = pythonClass.getMethods();
        this.hasConstructor = hasConstructor(originalClassMethods);
        this.hasClassMethods = hasClassMethods(originalClassMethods);
        this.className = pythonClass.getName();
        if (!hasConstructor) {
            this.classMethods = originalClassMethods;
        }
        else {
            this.classMethods = getClassMethods(originalClassMethods);
            this.constructor = getConstructor(originalClassMethods);
        }
    }

    /**
     * Builds a string containing the formatted class content
     *
     * @return The string containing the formatted class content
     */
    protected String buildClass() {
        String formattedClassCall = buildClassCall();
        String formattedClassBody = buildClassBody();
        return buildFormattedClass(formattedClassCall, formattedClassBody);
    }

    private List<AnnotatedPythonFunction> getClassMethods(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        return pythonFunctions.stream()
            .filter(pythonFunction ->
                !pythonFunction.getName().equals("__init__"))
            .collect(Collectors.toList());
    }

    private boolean hasClassMethods(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        return pythonFunctions
            .stream()
            .filter(pythonFunction ->
                !pythonFunction.getName().equals("__init__"))
            .findAny()
            .orElse(null) != null;
    }

    private boolean hasConstructor(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        return pythonFunctions
            .stream()
            .filter(pythonFunction ->
                pythonFunction.getName().equals("__init__"))
            .findAny()
            .orElse(null) != null;
    }

    private AnnotatedPythonFunction getConstructor(
        List<AnnotatedPythonFunction> pythonFunctions
    ) {
        return pythonFunctions
            .stream()
            .filter(pythonFunction ->
                pythonFunction.getName().equals("__init__"))
            .findAny()
            .orElse(null);
    }

    private String buildClassCall() {
        String formattedConstructorBody = "";
        if (hasConstructor) {
            formattedConstructorBody = buildConstructor(constructor);
        }
        return "open class "
            + className
            + " constructor("
            + formattedConstructorBody
            + ")";
    }

    private String buildConstructor(
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

    private String buildConstructorParameter(
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

    private String buildClassBody() {
        String formattedAttributes = "";
        if (hasConstructor) {
            formattedAttributes = buildAttributes();
        }
        String formattedFunctions = "";
        if (hasClassMethods) {
            formattedFunctions = buildFunctions();
        }
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

    private String buildAttributes() {
        List<String> formattedAttributes = new ArrayList<>();
        constructor.getParameters().forEach(pythonParameter -> formattedAttributes.add(
            "attr "
                + pythonParameter.getName()
                + ": "
                + "Any?"
        ));
        return listToString(formattedAttributes, 1);
    }

    private String buildFunctions() {
        List<String> formattedFunctions = new ArrayList<>();
        classMethods.forEach(pythonFunction -> {
            String formattedFunction = "";
            if (isOverriding(pythonFunction)) {
                formattedFunction = formattedFunction + "override ";
            }
            FunctionStubContentBuilder functionStubContentBuilder =
                new FunctionStubContentBuilder(pythonFunction);
            formattedFunction = formattedFunction
                + functionStubContentBuilder.buildFunction();
            formattedFunctions.add(
                formattedFunction
            );
        });
        return listToString(formattedFunctions, 1);
    }

    private boolean isOverriding(AnnotatedPythonFunction pythonFunction) {
        // TODO
        return false;
    }

    private String buildFormattedClass(
        String classCall,
        String classBody
    ) {
        if (classBody.isBlank()) {
            return classCall + " {}";
        }
        return classCall
            + " {\n"
            + indent(classBody)
            + "\n}";
    }
}
