package com.larsreimann.api_editor.server.annotationProcessing;

import com.larsreimann.api_editor.server.data.*;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;

import static com.larsreimann.api_editor.server.util.PackageDataFactoriesKt.createModuleCopyWithoutClassesAndFunctions;
import static com.larsreimann.api_editor.server.util.PackageDataFactoriesKt.createPackageCopyWithoutModules;

public class RenameAnnotationProcessor extends AbstractPackageDataVisitor {
    private AnnotatedPythonPackage modifiedPackage;

    private AnnotatedPythonModule currentModule;
    private AnnotatedPythonClass currentClass;
    private AnnotatedPythonFunction currentFunction;
    private final QualifiedNameGenerator qualifiedNameGenerator =
            new QualifiedNameGenerator();
    private boolean inClass = false;
    private boolean inModule = false;

    private final String PATH_SEPARATOR = "/";

    @Override
    public boolean enterPythonPackage(@NotNull AnnotatedPythonPackage pythonPackage) {
        qualifiedNameGenerator.currentPackageName = pythonPackage.getName();
        setModifiedPackage(createPackageCopyWithoutModules(pythonPackage));

        return true;
    }

    @Override
    public boolean enterPythonModule(@NotNull AnnotatedPythonModule pythonModule) {
        inModule = true;
        qualifiedNameGenerator.currentModuleName = pythonModule.getName();
        currentModule = createModuleCopyWithoutClassesAndFunctions(pythonModule);
        getModifiedPackage().getModules().add(currentModule);

        return true;
    }

    @Override
    public void leavePythonModule(@NotNull AnnotatedPythonModule pythonModule) {
        inModule = false;
    }

    @Override
    public boolean enterPythonClass(@NotNull AnnotatedPythonClass pythonClass) {
        inClass = true;
        qualifiedNameGenerator.currentClassName = pythonClass.getName();
        ArrayList<EditorAnnotation> annotations = new ArrayList<>();
        pythonClass
                .getAnnotations()
                .forEach(
                        editorAnnotation -> {
                            if (editorAnnotation instanceof RenameAnnotation) {
                                qualifiedNameGenerator.currentClassName =
                                        ((RenameAnnotation) editorAnnotation)
                                                .getNewName();
                            }
                            else {
                                annotations.add(editorAnnotation);
                            }
                        }
                );

        currentClass = new AnnotatedPythonClass(
                qualifiedNameGenerator.currentClassName,
                qualifiedNameGenerator.getQualifiedClassName(),
                new ArrayList<>(pythonClass.getDecorators()),
                new ArrayList<>(pythonClass.getSuperclasses()),
                new ArrayList<>(),
                pythonClass.getDescription(),
                pythonClass.getFullDocstring(),
                annotations
        );

        currentModule.getClasses().add(currentClass);

        return true;
    }

    @Override
    public void leavePythonClass(@NotNull AnnotatedPythonClass pythonClass) {
        inClass = false;
    }

    @Override
    public void enterPythonParameter(AnnotatedPythonParameter pythonParameter) {
        qualifiedNameGenerator.currentParameterName = pythonParameter.getName();
        ArrayList<EditorAnnotation> annotations = new ArrayList<>();
        pythonParameter
                .getAnnotations()
                .forEach(
                        editorAnnotation -> {
                            if (editorAnnotation instanceof RenameAnnotation) {
                                qualifiedNameGenerator.currentParameterName =
                                        ((RenameAnnotation) editorAnnotation)
                                                .getNewName();
                            }
                            else {
                                annotations.add(editorAnnotation);
                            }
                        }
                );

        AnnotatedPythonParameter modifiedPythonParameter =
                new AnnotatedPythonParameter(
                        qualifiedNameGenerator.currentParameterName,
                        qualifiedNameGenerator.getQualifiedParameterName(),
                        pythonParameter.getDefaultValue(),
                        pythonParameter.getAssignedBy(),
                        pythonParameter.isPublic(),
                        pythonParameter.getTypeInDocs(),
                        pythonParameter.getDescription(),
                        annotations
                );

        currentFunction.getParameters().add(modifiedPythonParameter);
    }

    @Override
    public boolean enterPythonFunction(AnnotatedPythonFunction pythonFunction) {
        qualifiedNameGenerator.currentFunctionName = pythonFunction.getName();
        ArrayList<EditorAnnotation> annotations = new ArrayList<>();
        pythonFunction
                .getAnnotations()
                .forEach(
                        editorAnnotation -> {
                            if (editorAnnotation instanceof RenameAnnotation) {
                                qualifiedNameGenerator.currentFunctionName =
                                        ((RenameAnnotation) editorAnnotation)
                                                .getNewName();
                            }
                            else {
                                annotations.add(editorAnnotation);
                            }
                        }
                );

        currentFunction = new AnnotatedPythonFunction(
                qualifiedNameGenerator.currentFunctionName,
                qualifiedNameGenerator.getQualifiedFunctionName(),
                new ArrayList<>(pythonFunction.getDecorators()),
                new ArrayList<>(),
                new ArrayList<>(pythonFunction.getResults()),
                pythonFunction.isPublic(),
                pythonFunction.getDescription(),
                pythonFunction.getFullDocstring(),
                annotations
        );

        if (inClass) {
            currentClass.getMethods().add(currentFunction);
        } else if (inModule) {
            currentModule.getFunctions().add(currentFunction);
        }

        return true;
    }

    public AnnotatedPythonPackage getModifiedPackage() {
        return modifiedPackage;
    }

    public void setModifiedPackage(AnnotatedPythonPackage modifiedPackage) {
        this.modifiedPackage = modifiedPackage;
    }

    private class QualifiedNameGenerator {
        String currentPackageName;
        String currentModuleName;
        String currentClassName;
        String currentFunctionName;
        String currentParameterName;

        String getQualifiedModuleName() {
            return currentPackageName + PATH_SEPARATOR + currentModuleName;
        }

        String getQualifiedClassName() {
            return getQualifiedModuleName() + PATH_SEPARATOR + currentClassName;
        }

        String getQualifiedFunctionName() {
            if (inClass) {
                return getQualifiedClassName() + PATH_SEPARATOR + currentFunctionName;
            }
            return getQualifiedModuleName() + PATH_SEPARATOR + currentFunctionName;
        }

        String getQualifiedParameterName() {
            return getQualifiedFunctionName() + PATH_SEPARATOR + currentParameterName;
        }
    }
}
