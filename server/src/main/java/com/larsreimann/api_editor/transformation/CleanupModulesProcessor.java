package com.larsreimann.api_editor.transformation;

import com.larsreimann.api_editor.model.AbstractPackageDataVisitor;
import com.larsreimann.api_editor.model.SerializablePythonClass;
import com.larsreimann.api_editor.model.SerializablePythonFunction;
import com.larsreimann.api_editor.model.SerializablePythonModule;
import com.larsreimann.api_editor.model.SerializablePythonPackage;
import org.jetbrains.annotations.NotNull;

import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createClassCopyWithoutFunctions;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createFunctionCopy;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createModuleCopyWithoutClassesAndFunctions;
import static com.larsreimann.api_editor.util.PackageDataFactoriesKt.createPackageCopyWithoutModules;

public class CleanupModulesProcessor extends AbstractPackageDataVisitor {
    private SerializablePythonPackage modifiedPackage;

    private SerializablePythonModule currentModule;
    private SerializablePythonClass currentClass;
    boolean inClass = false;
    boolean inModule = false;

    @Override
    public boolean enterPythonPackage(@NotNull SerializablePythonPackage pythonPackage) {
        setModifiedPackage(createPackageCopyWithoutModules(pythonPackage));

        return true;
    }

    @Override
    public boolean enterPythonModule(@NotNull SerializablePythonModule pythonModule) {
        inModule = true;
        setCurrentModule(createModuleCopyWithoutClassesAndFunctions(pythonModule));

        return true;
    }

    @Override
    public void leavePythonModule(@NotNull SerializablePythonModule pythonModule) {
        SerializablePythonModule currentModule = getCurrentModule();
        if (!currentModule.getClasses().isEmpty()
            || !currentModule.getFunctions().isEmpty()) {
            getModifiedPackage().getModules().add(currentModule);
        }
        inModule = false;
    }

    @Override
    public boolean enterPythonClass(@NotNull SerializablePythonClass pythonClass) {
        inClass = true;
        setCurrentClass(createClassCopyWithoutFunctions(pythonClass));

        getCurrentModule().getClasses().add(
            getCurrentClass()
        );

        return true;
    }

    @Override
    public void leavePythonClass(@NotNull SerializablePythonClass pythonClass) {
        inClass = false;
    }

    @Override
    public boolean enterPythonFunction(@NotNull SerializablePythonFunction pythonFunction) {
        SerializablePythonFunction currentFunctionCopy =
            createFunctionCopy(pythonFunction);
        if (inClass) {
            getCurrentClass().getMethods().add(currentFunctionCopy);
        } else if (inModule) {
            getCurrentModule().getFunctions().add(currentFunctionCopy);
        }

        return false;
    }

    public SerializablePythonPackage getModifiedPackage() {
        return modifiedPackage;
    }

    private void setModifiedPackage(SerializablePythonPackage modifiedPackage) {
        this.modifiedPackage = modifiedPackage;
    }

    private SerializablePythonModule getCurrentModule() {
        return currentModule;
    }

    private void setCurrentModule(SerializablePythonModule currentModule) {
        this.currentModule = currentModule;
    }

    private SerializablePythonClass getCurrentClass() {
        return currentClass;
    }

    private void setCurrentClass(SerializablePythonClass currentClass) {
        this.currentClass = currentClass;
    }
}
