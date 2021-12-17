package com.larsreimann.api_editor.model

/**
 * Specifies transformations of declarations in the package data.
 */
interface PackageDataTransformer {

    /**
     * Whether to visit modules in the package. Used to prune the traversal.
     */
    fun shouldVisitModulesIn(oldPackage: AnnotatedPythonPackage): Boolean

    /**
     * Whether to visit classes in the module. Used to prune the traversal.
     */
    fun shouldVisitClassesIn(oldModule: AnnotatedPythonModule): Boolean

    /**
     * Whether to visit enums in the module. Used to prune the traversal.
     */
    fun shouldVisitEnumsIn(oldModule: AnnotatedPythonModule): Boolean

    /**
     * Whether to visit functions in the module. Used to prune the traversal.
     */
    fun shouldVisitFunctionsIn(oldModule: AnnotatedPythonModule): Boolean

    /**
     * Whether to visit attributes of the class. Used to prune the traversal.
     */
    fun shouldVisitAttributesIn(oldClass: AnnotatedPythonClass): Boolean

    /**
     * Whether to visit methods of the class. Used to prune the traversal.
     */
    fun shouldVisitMethodsIn(oldClass: AnnotatedPythonClass): Boolean

    /**
     * Whether to visit parameters of the function. Used to prune the traversal.
     */
    fun shouldVisitParametersIn(oldFunction: AnnotatedPythonFunction): Boolean

    /**
     * Whether to visit results of the function. Used to prune the traversal.
     */
    fun shouldVisitResultsIn(oldFunction: AnnotatedPythonFunction): Boolean

    /**
     * Called before the modules in the package are visited.
     *
     * Return the result of transforming the package or `null` to remove it and stop the processing of this package and
     * its children.
     */
    fun createNewPackageOnEnter(oldPackage: AnnotatedPythonPackage): AnnotatedPythonPackage?

    /**
     * Called after the modules in the package were visited. The result of transforming the modules is passed as a
     * parameter.
     *
     * Return the result of transforming the package or `null` to remove it.
     */
    fun createNewPackageOnLeave(
        oldPackage: AnnotatedPythonPackage,
        newModules: List<AnnotatedPythonModule>
    ): AnnotatedPythonPackage?

    /**
     * Called before the children of the module are visited.
     *
     * Return the result of transforming the module or `null` to remove it and stop the processing of this module and
     * its children.
     */
    fun createNewModuleOnEnter(oldModule: AnnotatedPythonModule): AnnotatedPythonModule?

    /**
     * Called after the children of the module were visited. The results of transforming the children are passed as
     * parameters.
     *
     * Return the result of transforming the module or `null` to remove it.
     */
    fun createNewModuleOnLeave(
        oldModule: AnnotatedPythonModule,
        newClasses: List<AnnotatedPythonClass>,
        newEnums: List<AnnotatedPythonEnum>,
        newFunctions: List<AnnotatedPythonFunction>
    ): AnnotatedPythonModule?

    /**
     * Called before attributes and methods of the class are visited.
     *
     * Return the result of transforming the class or `null` to remove it and stop the processing of this class and its
     * children.
     */
    fun createNewClassOnEnter(oldClass: AnnotatedPythonClass): AnnotatedPythonClass?

    /**
     * Called after attributes and methods of the class were visited. The results of transforming the children are
     * passed as parameters.
     *
     * Return the result of transforming the class or `null` to remove it.
     */
    fun createNewClassOnLeave(
        oldClass: AnnotatedPythonClass,
        newAttributes: List<AnnotatedPythonAttribute>,
        newMethods: List<AnnotatedPythonFunction>
    ): AnnotatedPythonClass?

    /**
     * Return the result of transforming the attribute or `null` to remove it.
     */
    fun createNewAttribute(oldAttribute: AnnotatedPythonAttribute): AnnotatedPythonAttribute?

    /**
     * Return the result of transforming the enum or `null` to remove it.
     */
    fun createNewEnum(oldEnum: AnnotatedPythonEnum): AnnotatedPythonEnum?

    /**
     * Called before parameters and results of the function are visited.
     *
     * Return the result of transforming the function or `null` to remove it and stop the processing of this function
     * and its children.
     */
    fun createNewFunctionOnEnter(oldFunction: AnnotatedPythonFunction): AnnotatedPythonFunction?

    /**
     * Called after parameters and results of the function were visited. The results of transforming the children are
     * passed as parameters.
     *
     * Return the result of transforming the function or `null` to remove it.
     */
    fun createNewFunctionOnLeave(
        oldFunction: AnnotatedPythonFunction,
        newParameters: List<AnnotatedPythonParameter>,
        newResults: List<AnnotatedPythonResult>
    ): AnnotatedPythonFunction?

    /**
     * Return the result of transforming the parameter or `null` to remove it.
     */
    fun createNewParameter(oldParameter: AnnotatedPythonParameter): AnnotatedPythonParameter?

    /**
     * Return the result of transforming the result or `null` to remove it.
     */
    fun createNewResult(oldResult: AnnotatedPythonResult): AnnotatedPythonResult?
}

abstract class AbstractPackageDataTransformer : PackageDataTransformer {

    override fun shouldVisitModulesIn(oldPackage: AnnotatedPythonPackage) = true
    override fun shouldVisitClassesIn(oldModule: AnnotatedPythonModule) = true
    override fun shouldVisitEnumsIn(oldModule: AnnotatedPythonModule) = true
    override fun shouldVisitFunctionsIn(oldModule: AnnotatedPythonModule) = true
    override fun shouldVisitAttributesIn(oldClass: AnnotatedPythonClass) = true
    override fun shouldVisitMethodsIn(oldClass: AnnotatedPythonClass) = true
    override fun shouldVisitParametersIn(oldFunction: AnnotatedPythonFunction) = true
    override fun shouldVisitResultsIn(oldFunction: AnnotatedPythonFunction) = true

    override fun createNewPackageOnEnter(oldPackage: AnnotatedPythonPackage): AnnotatedPythonPackage? {
        return oldPackage
    }

    override fun createNewPackageOnLeave(
        oldPackage: AnnotatedPythonPackage,
        newModules: List<AnnotatedPythonModule>
    ): AnnotatedPythonPackage? {
        return oldPackage.fullCopy(
            modules = newModules,
            originalDeclaration = oldPackage.originalDeclaration ?: oldPackage
        )
    }

    override fun createNewModuleOnEnter(oldModule: AnnotatedPythonModule): AnnotatedPythonModule? {
        return oldModule
    }

    override fun createNewModuleOnLeave(
        oldModule: AnnotatedPythonModule,
        newClasses: List<AnnotatedPythonClass>,
        newEnums: List<AnnotatedPythonEnum>,
        newFunctions: List<AnnotatedPythonFunction>
    ): AnnotatedPythonModule? {
        return oldModule.fullCopy(
            classes = newClasses,
            enums = newEnums,
            functions = newFunctions,
            originalDeclaration = oldModule.originalDeclaration ?: oldModule
        )
    }

    override fun createNewClassOnEnter(oldClass: AnnotatedPythonClass): AnnotatedPythonClass? {
        return oldClass
    }

    override fun createNewClassOnLeave(
        oldClass: AnnotatedPythonClass,
        newAttributes: List<AnnotatedPythonAttribute>,
        newMethods: List<AnnotatedPythonFunction>
    ): AnnotatedPythonClass? {
        return oldClass.fullCopy(
            attributes = newAttributes,
            methods = newMethods,
            originalDeclaration = oldClass.originalDeclaration ?: oldClass
        )
    }

    override fun createNewAttribute(oldAttribute: AnnotatedPythonAttribute): AnnotatedPythonAttribute? {
        return oldAttribute
    }

    override fun createNewEnum(oldEnum: AnnotatedPythonEnum): AnnotatedPythonEnum? {
        return oldEnum
    }

    override fun createNewFunctionOnEnter(oldFunction: AnnotatedPythonFunction): AnnotatedPythonFunction? {
        return oldFunction
    }

    override fun createNewFunctionOnLeave(
        oldFunction: AnnotatedPythonFunction,
        newParameters: List<AnnotatedPythonParameter>,
        newResults: List<AnnotatedPythonResult>
    ): AnnotatedPythonFunction? {
        return oldFunction.fullCopy(
            parameters = newParameters,
            results = newResults,
            originalDeclaration = oldFunction.originalDeclaration ?: oldFunction
        )
    }

    override fun createNewParameter(oldParameter: AnnotatedPythonParameter): AnnotatedPythonParameter? {
        return oldParameter
    }

    override fun createNewResult(oldResult: AnnotatedPythonResult): AnnotatedPythonResult? {
        return oldResult
    }
}
