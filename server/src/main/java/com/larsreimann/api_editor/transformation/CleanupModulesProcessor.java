package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.AbstractPackageDataVisitor;
import com.larsreimann.api_editor.model.AnnotatedPythonClass;
import com.larsreimann.api_editor.model.AnnotatedPythonFunction;
import com.larsreimann.api_editor.model.AnnotatedPythonModule;
import com.larsreimann.api_editor.model.AnnotatedPythonPackage;
import org.jetbrains.annotations.NotNull;

import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createClassCopyWithoutFunctions;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createFunctionCopy;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createModuleCopyWithoutClassesAndFunctions;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPackageCopyWithoutModules;

public class CleanupModulesProcessor extends AbstractPackageDataVisitor {
    private AnnotatedPythonPackage modifiedPackage;

    private AnnotatedPythonModule currentModule;
    private AnnotatedPythonClass currentClass;
    boolean inClass = false;
    boolean inModule = false;

    @Override
    public boolean enterPythonPackage(@NotNull AnnotatedPythonPackage pythonPackage) {
        setModifiedPackage(createPackageCopyWithoutModules(pythonPackage));

        return true;
    }

    @Override
    public boolean enterPythonModule(@NotNull AnnotatedPythonModule pythonModule) {
        inModule = true;
        setCurrentModule(createModuleCopyWithoutClassesAndFunctions(pythonModule));

        return true;
    }

    @Override
    public void leavePythonModule(@NotNull AnnotatedPythonModule pythonModule) {
        AnnotatedPythonModule currentModule = getCurrentModule();
        if (!currentModule.getClasses().isEmpty()
            || !currentModule.getFunctions().isEmpty()) {
            getModifiedPackage().getModules().add(currentModule);
        }
        inModule = false;
    }

    @Override
    public boolean enterPythonClass(@NotNull AnnotatedPythonClass pythonClass) {
        inClass = true;
        setCurrentClass(createClassCopyWithoutFunctions(pythonClass));

        getCurrentModule().getClasses().add(
            getCurrentClass()
        );

        return true;
    }

    @Override
    public void leavePythonClass(@NotNull AnnotatedPythonClass pythonClass) {
        inClass = false;
    }

    @Override
    public boolean enterPythonFunction(@NotNull AnnotatedPythonFunction pythonFunction) {
        AnnotatedPythonFunction currentFunctionCopy =
            createFunctionCopy(pythonFunction);
        if (inClass) {
            getCurrentClass().getMethods().add(currentFunctionCopy);
        } else if (inModule) {
            getCurrentModule().getFunctions().add(currentFunctionCopy);
        }

        return false;
    }

    public AnnotatedPythonPackage getModifiedPackage() {
        return modifiedPackage;
    }

    private void setModifiedPackage(AnnotatedPythonPackage modifiedPackage) {
        this.modifiedPackage = modifiedPackage;
    }

    private AnnotatedPythonModule getCurrentModule() {
        return currentModule;
    }

    private void setCurrentModule(AnnotatedPythonModule currentModule) {
        this.currentModule = currentModule;
    }

    private AnnotatedPythonClass getCurrentClass() {
        return currentClass;
    }

    private void setCurrentClass(AnnotatedPythonClass currentClass) {
        this.currentClass = currentClass;
    }
}
