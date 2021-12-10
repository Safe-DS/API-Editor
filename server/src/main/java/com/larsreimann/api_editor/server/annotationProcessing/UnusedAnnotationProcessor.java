package com.larsreimann.api_editor.server.annotationProcessing;

import com.larsreimann.api_editor.server.data.*;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;

public class UnusedAnnotationProcessor extends AbstractPackageDataVisitor {
    public AnnotatedPythonPackage modifiedPackage;

    AnnotatedPythonModule currentModule;
    AnnotatedPythonClass currentClass;
    boolean inClass = false;
    boolean inModule = false;

    @Override
    public boolean enterPythonPackage(AnnotatedPythonPackage pythonPackage) {
        modifiedPackage = new AnnotatedPythonPackage(
            pythonPackage.getName(),
            pythonPackage.getDistribution(),
            pythonPackage.getVersion(),
            new ArrayList<>(),
            new ArrayList<>(pythonPackage.getAnnotations())
        );

        return true;
    }

    @Override
    public boolean enterPythonModule(AnnotatedPythonModule pythonModule) {
        inModule = true;
        currentModule = new AnnotatedPythonModule(
            pythonModule.getName(),
            new ArrayList<>(pythonModule.getImports()),
            new ArrayList<>(pythonModule.getFromImports()),
            new ArrayList<>(),
            new ArrayList<>(),
            new ArrayList<>(pythonModule.getAnnotations())
        );
        modifiedPackage.getModules().add(currentModule);

        return true;
    }

    @Override
    public void leavePythonModule(@NotNull AnnotatedPythonModule pythonModule) {
        inModule = false;
    }

    @Override
    public boolean enterPythonClass(AnnotatedPythonClass pythonClass) {
        inClass = true;
        currentClass = new AnnotatedPythonClass(
            pythonClass.getName(),
            pythonClass.getQualifiedName(),
            new ArrayList<>(pythonClass.getDecorators()),
            new ArrayList<>(pythonClass.getSuperclasses()),
            new ArrayList<>(),
            pythonClass.getDescription(),
            pythonClass.getFullDocstring(),
            new ArrayList<>(pythonClass.getAnnotations())
        );

        if (pythonClass.getAnnotations()
            .stream()
            .noneMatch(editorAnnotation
                -> editorAnnotation.getType().equals("Unused")
            )
        ) {
            currentModule.getClasses().add(
                currentClass
            );
        }

        return true;
    }

    @Override
    public void leavePythonClass(@NotNull AnnotatedPythonClass pythonClass) {
        inClass = false;
    }

    @Override
    public boolean enterPythonFunction(AnnotatedPythonFunction pythonFunction) {
        if (pythonFunction.getAnnotations()
            .stream()
            .noneMatch(
                editorAnnotation -> editorAnnotation.getType().equals("Unused")
            )
        ) {
            AnnotatedPythonFunction currentFunctionCopy =
                new AnnotatedPythonFunction(
                    pythonFunction.getName(),
                    pythonFunction.getQualifiedName(),
                    pythonFunction.getDecorators(),
                    new ArrayList<>(pythonFunction.getParameters()),
                    new ArrayList<>(pythonFunction.getResults()),
                    pythonFunction.isPublic(),
                    pythonFunction.getDescription(),
                    pythonFunction.getFullDocstring(),
                    new ArrayList<>(pythonFunction.getAnnotations())
                );
            if (inClass) {
                currentClass.getMethods().add(currentFunctionCopy);
            } else if (inModule) {
                currentModule.getFunctions().add(currentFunctionCopy);
            }
        }

        return false;
    }
}
