package com.larsreimann.api_editor.model

interface PackageDataVisitor {

    /**
     * @return Whether to visit modules in the package.
     */
    fun enterPythonPackage(pythonPackage: SerializablePythonPackage): Boolean
    fun leavePythonPackage(pythonPackage: SerializablePythonPackage)

    /**
     * @return Whether to visit classes and functions in the module.
     */
    fun enterPythonModule(pythonModule: SerializablePythonModule): Boolean
    fun leavePythonModule(pythonModule: SerializablePythonModule)

    /**
     * @return Whether to visit methods in the class.
     */
    fun enterPythonClass(pythonClass: SerializablePythonClass): Boolean
    fun leavePythonClass(pythonClass: SerializablePythonClass)

    fun enterPythonAttribute(pythonAttribute: SerializablePythonAttribute)
    fun leavePythonAttribute(pythonAttribute: SerializablePythonAttribute)

    fun enterPythonEnum(pythonEnum: SerializablePythonEnum)
    fun leavePythonEnum(pythonEnum: SerializablePythonEnum)

    /**
     * @return Whether to visit parameters and results in the function.
     */
    fun enterPythonFunction(pythonFunction: SerializablePythonFunction): Boolean
    fun leavePythonFunction(pythonFunction: SerializablePythonFunction)

    fun enterPythonParameter(pythonParameter: SerializablePythonParameter)
    fun leavePythonParameter(pythonParameter: SerializablePythonParameter)

    fun enterPythonResult(pythonResult: SerializablePythonResult)
    fun leavePythonResult(pythonResult: SerializablePythonResult)
}

abstract class AbstractPackageDataVisitor : PackageDataVisitor {
    override fun enterPythonPackage(pythonPackage: SerializablePythonPackage) = true
    override fun leavePythonPackage(pythonPackage: SerializablePythonPackage) {}

    override fun enterPythonModule(pythonModule: SerializablePythonModule) = true
    override fun leavePythonModule(pythonModule: SerializablePythonModule) {}

    override fun enterPythonClass(pythonClass: SerializablePythonClass) = true
    override fun leavePythonClass(pythonClass: SerializablePythonClass) {}

    override fun enterPythonAttribute(pythonAttribute: SerializablePythonAttribute) {}
    override fun leavePythonAttribute(pythonAttribute: SerializablePythonAttribute) {}

    override fun enterPythonEnum(pythonEnum: SerializablePythonEnum) {}
    override fun leavePythonEnum(pythonEnum: SerializablePythonEnum) {}

    override fun enterPythonFunction(pythonFunction: SerializablePythonFunction) = true
    override fun leavePythonFunction(pythonFunction: SerializablePythonFunction) {}

    override fun enterPythonParameter(pythonParameter: SerializablePythonParameter) {}
    override fun leavePythonParameter(pythonParameter: SerializablePythonParameter) {}

    override fun enterPythonResult(pythonResult: SerializablePythonResult) {}
    override fun leavePythonResult(pythonResult: SerializablePythonResult) {}
}
