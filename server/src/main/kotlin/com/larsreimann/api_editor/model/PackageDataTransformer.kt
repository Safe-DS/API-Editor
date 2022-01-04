package com.larsreimann.api_editor.model

/**
 * Specifies transformations of declarations in the package data.
 */
interface PackageDataTransformer {

    /**
     * Whether to visit modules in the package. Used to prune the traversal.
     */
    fun shouldVisitModulesIn(oldPackage: SerializablePythonPackage): Boolean

    /**
     * Whether to visit classes in the module. Used to prune the traversal.
     */
    fun shouldVisitClassesIn(oldModule: SerializablePythonModule): Boolean

    /**
     * Whether to visit enums in the module. Used to prune the traversal.
     */
    fun shouldVisitEnumsIn(oldModule: SerializablePythonModule): Boolean

    /**
     * Whether to visit functions in the module. Used to prune the traversal.
     */
    fun shouldVisitFunctionsIn(oldModule: SerializablePythonModule): Boolean

    /**
     * Whether to visit attributes of the class. Used to prune the traversal.
     */
    fun shouldVisitAttributesIn(oldClass: SerializablePythonClass): Boolean

    /**
     * Whether to visit methods of the class. Used to prune the traversal.
     */
    fun shouldVisitMethodsIn(oldClass: SerializablePythonClass): Boolean

    /**
     * Whether to visit parameters of the function. Used to prune the traversal.
     */
    fun shouldVisitParametersIn(oldFunction: SerializablePythonFunction): Boolean

    /**
     * Whether to visit results of the function. Used to prune the traversal.
     */
    fun shouldVisitResultsIn(oldFunction: SerializablePythonFunction): Boolean

    /**
     * Called before the modules in the package are visited.
     *
     * Return the result of transforming the package or `null` to remove it and stop the processing of this package and
     * its children.
     */
    fun createNewPackageOnEnter(oldPackage: SerializablePythonPackage): SerializablePythonPackage?

    /**
     * Called after the modules in the package were visited. The result of transforming the modules is passed as a
     * parameter.
     *
     * Return the result of transforming the package or `null` to remove it.
     */
    fun createNewPackageOnLeave(
        oldPackage: SerializablePythonPackage,
        newModules: List<SerializablePythonModule>
    ): SerializablePythonPackage?

    /**
     * Called before the children of the module are visited.
     *
     * Return the result of transforming the module or `null` to remove it and stop the processing of this module and
     * its children.
     */
    fun createNewModuleOnEnter(oldModule: SerializablePythonModule): SerializablePythonModule?

    /**
     * Called after the children of the module were visited. The results of transforming the children are passed as
     * parameters.
     *
     * Return the result of transforming the module or `null` to remove it.
     */
    fun createNewModuleOnLeave(
        oldModule: SerializablePythonModule,
        newClasses: List<SerializablePythonClass>,
        newEnums: List<SerializablePythonEnum>,
        newFunctions: List<SerializablePythonFunction>
    ): SerializablePythonModule?

    /**
     * Called before attributes and methods of the class are visited.
     *
     * Return the result of transforming the class or `null` to remove it and stop the processing of this class and its
     * children.
     */
    fun createNewClassOnEnter(oldClass: SerializablePythonClass): SerializablePythonClass?

    /**
     * Called after attributes and methods of the class were visited. The results of transforming the children are
     * passed as parameters.
     *
     * Return the result of transforming the class or `null` to remove it.
     */
    fun createNewClassOnLeave(
        oldClass: SerializablePythonClass,
        newAttributes: List<SerializablePythonAttribute>,
        newMethods: List<SerializablePythonFunction>
    ): SerializablePythonClass?

    /**
     * Return the result of transforming the attribute or `null` to remove it.
     */
    fun createNewAttribute(oldAttribute: SerializablePythonAttribute): SerializablePythonAttribute?

    /**
     * Return the result of transforming the enum or `null` to remove it.
     */
    fun createNewEnum(oldEnum: SerializablePythonEnum): SerializablePythonEnum?

    /**
     * Called before parameters and results of the function are visited.
     *
     * Return the result of transforming the function or `null` to remove it and stop the processing of this function
     * and its children.
     */
    fun createNewFunctionOnEnter(oldFunction: SerializablePythonFunction): SerializablePythonFunction?

    /**
     * Called after parameters and results of the function were visited. The results of transforming the children are
     * passed as parameters.
     *
     * Return the result of transforming the function or `null` to remove it.
     */
    fun createNewFunctionOnLeave(
        oldFunction: SerializablePythonFunction,
        newParameters: List<SerializablePythonParameter>,
        newResults: List<SerializablePythonResult>
    ): SerializablePythonFunction?

    /**
     * Return the result of transforming the parameter or `null` to remove it.
     */
    fun createNewParameter(oldParameter: SerializablePythonParameter): SerializablePythonParameter?

    /**
     * Return the result of transforming the result or `null` to remove it.
     */
    fun createNewResult(oldResult: SerializablePythonResult): SerializablePythonResult?
}

abstract class AbstractPackageDataTransformer : PackageDataTransformer {

    override fun shouldVisitModulesIn(oldPackage: SerializablePythonPackage) = true
    override fun shouldVisitClassesIn(oldModule: SerializablePythonModule) = true
    override fun shouldVisitEnumsIn(oldModule: SerializablePythonModule) = true
    override fun shouldVisitFunctionsIn(oldModule: SerializablePythonModule) = true
    override fun shouldVisitAttributesIn(oldClass: SerializablePythonClass) = true
    override fun shouldVisitMethodsIn(oldClass: SerializablePythonClass) = true
    override fun shouldVisitParametersIn(oldFunction: SerializablePythonFunction) = true
    override fun shouldVisitResultsIn(oldFunction: SerializablePythonFunction) = true

    override fun createNewPackageOnEnter(oldPackage: SerializablePythonPackage): SerializablePythonPackage? {
        return oldPackage
    }

    override fun createNewPackageOnLeave(
        oldPackage: SerializablePythonPackage,
        newModules: List<SerializablePythonModule>
    ): SerializablePythonPackage? {
        return oldPackage.copy(
            modules = newModules.toMutableList()
        )
    }

    override fun createNewModuleOnEnter(oldModule: SerializablePythonModule): SerializablePythonModule? {
        return oldModule
    }

    override fun createNewModuleOnLeave(
        oldModule: SerializablePythonModule,
        newClasses: List<SerializablePythonClass>,
        newEnums: List<SerializablePythonEnum>,
        newFunctions: List<SerializablePythonFunction>
    ): SerializablePythonModule? {
        return oldModule.fullCopy(
            classes = newClasses.toMutableList(),
            enums = newEnums.toMutableList(),
            functions = newFunctions.toMutableList()
        )
    }

    override fun createNewClassOnEnter(oldClass: SerializablePythonClass): SerializablePythonClass? {
        return oldClass
    }

    override fun createNewClassOnLeave(
        oldClass: SerializablePythonClass,
        newAttributes: List<SerializablePythonAttribute>,
        newMethods: List<SerializablePythonFunction>
    ): SerializablePythonClass? {
        return oldClass.fullCopy(
            attributes = newAttributes.toMutableList(),
            methods = newMethods.toMutableList(),
            originalDeclaration = oldClass.originalDeclaration ?: oldClass
        )
    }

    override fun createNewAttribute(oldAttribute: SerializablePythonAttribute): SerializablePythonAttribute? {
        return oldAttribute
    }

    override fun createNewEnum(oldEnum: SerializablePythonEnum): SerializablePythonEnum? {
        return oldEnum
    }

    override fun createNewFunctionOnEnter(oldFunction: SerializablePythonFunction): SerializablePythonFunction? {
        return oldFunction
    }

    override fun createNewFunctionOnLeave(
        oldFunction: SerializablePythonFunction,
        newParameters: List<SerializablePythonParameter>,
        newResults: List<SerializablePythonResult>
    ): SerializablePythonFunction? {
        return oldFunction.fullCopy(
            parameters = newParameters.toMutableList(),
            results = newResults.toMutableList(),
            originalDeclaration = oldFunction.originalDeclaration ?: oldFunction
        )
    }

    override fun createNewParameter(oldParameter: SerializablePythonParameter): SerializablePythonParameter? {
        return oldParameter.fullCopy(
            originalDeclaration = oldParameter.originalDeclaration ?: oldParameter
        )
    }

    override fun createNewResult(oldResult: SerializablePythonResult): SerializablePythonResult? {
        return oldResult
    }
}
