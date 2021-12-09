package com.larsreimann.api_editor.server.data

interface PackageDataVisitor {

    /**
     * @return Whether to visit modules in the package.
     */
    fun enterPythonPackage(pythonPackage: AnnotatedPythonPackage): Boolean
    fun leavePythonPackage(pythonPackage: AnnotatedPythonPackage)

    /**
     * @return Whether to visit classes and functions in the module.
     */
    fun enterPythonModule(pythonModule: AnnotatedPythonModule): Boolean
    fun leavePythonModule(pythonModule: AnnotatedPythonModule)

    /**
     * @return Whether to visit methods in the class.
     */
    fun enterPythonClass(pythonClass: AnnotatedPythonClass): Boolean
    fun leavePythonClass(pythonClass: AnnotatedPythonClass)

    fun enterPythonAttribute(pythonAttribute: AnnotatedPythonAttribute)
    fun leavePythonAttribute(pythonAttribute: AnnotatedPythonAttribute)

    fun enterPythonEnum(pythonEnum: AnnotatedPythonEnum)
    fun leavePythonEnum(pythonEnum: AnnotatedPythonEnum)

    /**
     * @return Whether to visit parameters and results in the function.
     */
    fun enterPythonFunction(pythonFunction: AnnotatedPythonFunction): Boolean
    fun leavePythonFunction(pythonFunction: AnnotatedPythonFunction)

    fun enterPythonParameter(pythonParameter: AnnotatedPythonParameter)
    fun leavePythonParameter(pythonParameter: AnnotatedPythonParameter)

    fun enterPythonResult(pythonResult: AnnotatedPythonResult)
    fun leavePythonResult(pythonResult: AnnotatedPythonResult)
}

abstract class AbstractPackageDataVisitor : PackageDataVisitor {
    override fun enterPythonPackage(pythonPackage: AnnotatedPythonPackage) = true
    override fun leavePythonPackage(pythonPackage: AnnotatedPythonPackage) {}

    override fun enterPythonModule(pythonModule: AnnotatedPythonModule) = true
    override fun leavePythonModule(pythonModule: AnnotatedPythonModule) {}

    override fun enterPythonClass(pythonClass: AnnotatedPythonClass) = true
    override fun leavePythonClass(pythonClass: AnnotatedPythonClass) {}

    override fun enterPythonAttribute(pythonAttribute: AnnotatedPythonAttribute) {}
    override fun leavePythonAttribute(pythonAttribute: AnnotatedPythonAttribute) {}

    override fun enterPythonEnum(pythonEnum: AnnotatedPythonEnum) {}
    override fun leavePythonEnum(pythonEnum: AnnotatedPythonEnum) {}

    override fun enterPythonFunction(pythonFunction: AnnotatedPythonFunction) = true
    override fun leavePythonFunction(pythonFunction: AnnotatedPythonFunction) {}

    override fun enterPythonParameter(pythonParameter: AnnotatedPythonParameter) {}
    override fun leavePythonParameter(pythonParameter: AnnotatedPythonParameter) {}

    override fun enterPythonResult(pythonResult: AnnotatedPythonResult) {}
    override fun leavePythonResult(pythonResult: AnnotatedPythonResult) {}
}
