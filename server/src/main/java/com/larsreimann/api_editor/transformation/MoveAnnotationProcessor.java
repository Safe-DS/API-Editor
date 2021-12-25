package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.AbstractPackageDataVisitor;
import com.larsreimann.api_editor.model.AnnotatedPythonClass;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonModule;
import com.larsreimann.api_editor.model.AnnotatedPythonPackage;
import com.larsreimann.api_editor.model.AnnotatedPythonParameter;
import com.larsreimann.api_editor.model.EditorAnnotation;
import com.larsreimann.api_editor.model.MoveAnnotation;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPythonClass;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPythonFunction;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPythonModule;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPythonParameter;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createModuleCopyWithoutClassesAndFunctions;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPackageCopyWithoutModules;

public class MoveAnnotationProcessor extends AbstractPackageDataVisitor {
    private AnnotatedPythonPackage modifiedPackage;

    private AnnotatedPythonModule currentModule;
    private AnnotatedPythonClass currentClass;
    private AnnotatedPythonFunction currentFunction;
    private final QualifiedNameGenerator qualifiedNameGenerator =
        new QualifiedNameGenerator();
    private boolean inFunction = false;
    private boolean inClass = false;
    private boolean inModule = false;
    private boolean inPackage = false;

    private boolean isFunctionMoved = false;
    private boolean isClassMoved = false;

    private String originalModuleName;

    HashMap<String, ArrayList<AnnotatedPythonClass>> classesToAdd;
    HashMap<String, ArrayList<AnnotatedPythonFunction>> functionsToAdd;

    private final String PATH_SEPARATOR = ".";

    @Override
    public boolean enterPythonPackage(@NotNull AnnotatedPythonPackage pythonPackage) {
        inPackage = true;
        classesToAdd = new HashMap<>();
        functionsToAdd = new HashMap<>();
        setModifiedPackage(createPackageCopyWithoutModules(pythonPackage));

        return true;
    }

    @Override
    public void leavePythonPackage(@NotNull AnnotatedPythonPackage pythonPackage) {
        inPackage = false;
        // add to existing modules
        for (AnnotatedPythonModule pythonModule : modifiedPackage.getModules()) {
            if (classesToAdd.get(pythonModule.getName()) != null) {
                pythonModule.getClasses().addAll(classesToAdd.get(pythonModule.getName()));
                classesToAdd.remove(pythonModule.getName());
            }
            if (functionsToAdd.get(pythonModule.getName()) != null) {
                pythonModule.getFunctions().addAll(functionsToAdd.get(pythonModule.getName()));
                functionsToAdd.remove(pythonModule.getName());
            }
        }
        // add to new modules
        Iterator<String> it = classesToAdd.keySet().iterator();
        while (it.hasNext()) {
            String key = it.next();
            AnnotatedPythonModule pythonModuleToAdd = createPythonModule(key);
            pythonModuleToAdd.getClasses().addAll(classesToAdd.get(key));
            if (functionsToAdd.get(key) != null) {
                pythonModuleToAdd.getFunctions().addAll(functionsToAdd.get(key));
                functionsToAdd.remove(key);
            }
            modifiedPackage.getModules().add(pythonModuleToAdd);
            it.remove();
        }
        it = functionsToAdd.keySet().iterator();
        while (it.hasNext()) {
            String key = it.next();
            AnnotatedPythonModule pythonModuleToAdd = createPythonModule(key);
            pythonModuleToAdd.getFunctions().addAll(functionsToAdd.get(key));
            modifiedPackage.getModules().add(pythonModuleToAdd);
            it.remove();
        }
    }

    @Override
    public boolean enterPythonModule(@NotNull AnnotatedPythonModule pythonModule) {
        inModule = true;
        qualifiedNameGenerator.currentModuleName = pythonModule.getName();
        currentModule = createModuleCopyWithoutClassesAndFunctions(pythonModule);
        if (inPackage) {
            getModifiedPackage().getModules().add(currentModule);
        }

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
        String newModuleName = null;
        ArrayList<EditorAnnotation> annotations = new ArrayList<>();

        for (EditorAnnotation editorAnnotation : pythonClass.getAnnotations()) {
            if (editorAnnotation instanceof MoveAnnotation) {
                isClassMoved = true;
                originalModuleName = qualifiedNameGenerator.currentModuleName;
                newModuleName = ((MoveAnnotation) editorAnnotation).getDestination();
                qualifiedNameGenerator.currentModuleName = newModuleName;
            } else {
                annotations.add(editorAnnotation);
            }
        }

        currentClass = createPythonClass(
            qualifiedNameGenerator.currentClassName,
            qualifiedNameGenerator.getQualifiedClassName(),
            new ArrayList<>(pythonClass.getDecorators()),
            new ArrayList<>(pythonClass.getSuperclasses()),
            new ArrayList<>(),
            new ArrayList<>(),
            pythonClass.isPublic(),
            pythonClass.getDescription(),
            pythonClass.getFullDocstring(),
            annotations,
            pythonClass.getOriginalDeclaration()
        );

        if (isClassMoved) {
            addClassToAdd(newModuleName, currentClass);
        } else {
            currentModule.getClasses().add(currentClass);
        }

        return true;
    }

    @Override
    public void leavePythonClass(@NotNull AnnotatedPythonClass pythonClass) {
        if (isClassMoved) {
            qualifiedNameGenerator.currentModuleName = originalModuleName;
            isClassMoved = false;
        }
        inClass = false;
    }

    @Override
    public void enterPythonParameter(AnnotatedPythonParameter pythonParameter) {
        qualifiedNameGenerator.currentParameterName = pythonParameter.getName();

        AnnotatedPythonParameter modifiedPythonParameter =
            createPythonParameter(
                qualifiedNameGenerator.currentParameterName,
                qualifiedNameGenerator.getQualifiedParameterName(),
                pythonParameter.getDefaultValue(),
                pythonParameter.getAssignedBy(),
                pythonParameter.isPublic(),
                pythonParameter.getTypeInDocs(),
                pythonParameter.getDescription(),
                new ArrayList<>(pythonParameter.getAnnotations()),
                pythonParameter.getOriginalDeclaration()
            );

        if (inFunction) {
            currentFunction.getParameters().add(modifiedPythonParameter);
        }
    }

    @Override
    public boolean enterPythonFunction(AnnotatedPythonFunction pythonFunction) {
        inFunction = true;
        String newModuleName = null;
        qualifiedNameGenerator.currentFunctionName = pythonFunction.getName();
        ArrayList<EditorAnnotation> annotations = new ArrayList<>();

        for (EditorAnnotation editorAnnotation : pythonFunction.getAnnotations()) {
            if (editorAnnotation instanceof MoveAnnotation) {
                isFunctionMoved = true;
                originalModuleName = qualifiedNameGenerator.currentModuleName;
                newModuleName = ((MoveAnnotation) editorAnnotation).getDestination();
                qualifiedNameGenerator.currentModuleName = newModuleName;
            } else {
                annotations.add(editorAnnotation);
            }
        }

        currentFunction = createPythonFunction(
            qualifiedNameGenerator.currentFunctionName,
            qualifiedNameGenerator.getQualifiedFunctionName(),
            new ArrayList<>(pythonFunction.getDecorators()),
            new ArrayList<>(),
            new ArrayList<>(pythonFunction.getResults()),
            pythonFunction.isPublic(),
            pythonFunction.getDescription(),
            pythonFunction.getFullDocstring(),
            annotations,
            pythonFunction.getOriginalDeclaration()
        );

        if (isFunctionMoved) {
            addFunctionToAdd(newModuleName, currentFunction);
            return true;
        }
        if (inClass) {
            currentClass.getMethods().add(currentFunction);
        } else if (inModule) {
            currentModule.getFunctions().add(currentFunction);
        }

        return true;
    }

    @Override
    public void leavePythonFunction(@NotNull AnnotatedPythonFunction pythonFunction) {
        if (isFunctionMoved) {
            qualifiedNameGenerator.currentModuleName = originalModuleName;
            isFunctionMoved = false;
        }
        inFunction = false;
    }

    public AnnotatedPythonPackage getModifiedPackage() {
        return modifiedPackage;
    }

    public void setModifiedPackage(AnnotatedPythonPackage modifiedPackage) {
        this.modifiedPackage = modifiedPackage;
    }

    public AnnotatedPythonModule getCurrentModule() {
        return this.currentModule;
    }

    public AnnotatedPythonClass getCurrentClass() {
        return this.currentClass;
    }

    public AnnotatedPythonFunction getCurrentFunction() {
        return this.currentFunction;
    }

    private void addClassToAdd(String moduleName, AnnotatedPythonClass pythonClass) {
        classesToAdd.computeIfAbsent(moduleName, k -> new ArrayList<>());
        classesToAdd.get(moduleName).add(pythonClass);
    }

    private void addFunctionToAdd(String moduleName, AnnotatedPythonFunction pythonFunction) {
        functionsToAdd.computeIfAbsent(moduleName, k -> new ArrayList<>());
        functionsToAdd.get(moduleName).add(pythonFunction);
    }

    private class QualifiedNameGenerator {
        String currentModuleName;
        String currentClassName;
        String currentFunctionName;
        String currentParameterName;

        String getQualifiedModuleName() {
            return currentModuleName;
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
