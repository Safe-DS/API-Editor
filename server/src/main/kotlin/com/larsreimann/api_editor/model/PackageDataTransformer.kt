package com.larsreimann.api_editor.model

interface PackageDataTransformer {

    /**
     * Whether to visit modules in the package.
     */
    fun shouldVisitModulesIn(oldPackage: AnnotatedPythonPackage): Boolean

    /**
     * Whether to visit classes in the module.
     */
    fun shouldVisitClassesIn(oldModule: AnnotatedPythonModule): Boolean

    /**
     * Whether to visit enums in the module.
     */
    fun shouldVisitEnumsIn(oldModule: AnnotatedPythonModule): Boolean

    /**
     * Whether to visit functions in the module.
     */
    fun shouldVisitFunctionsIn(oldModule: AnnotatedPythonModule): Boolean

    /**
     * Whether to visit attributes in the class.
     */
    fun shouldVisitAttributesIn(oldClass: AnnotatedPythonClass): Boolean

    /**
     * Whether to visit methods in the class.
     */
    fun shouldVisitMethodsIn(oldClass: AnnotatedPythonClass): Boolean

    /**
     * Whether to visit parameters of the function.
     */
    fun shouldVisitParametersIn(oldFunction: AnnotatedPythonFunction): Boolean

    /**
     * Whether to visit results of the function.
     */
    fun shouldVisitResultsIn(oldFunction: AnnotatedPythonFunction): Boolean

    fun createNewPackage(
        oldPackage: AnnotatedPythonPackage,
        newModules: List<AnnotatedPythonModule>
    ): AnnotatedPythonPackage?

    fun createNewModule(
        oldModule: AnnotatedPythonModule,
        newClasses: List<AnnotatedPythonClass>,
        newEnums: List<AnnotatedPythonEnum>,
        newFunctions: List<AnnotatedPythonFunction>
    ): AnnotatedPythonModule?

    fun createNewClass(
        oldClass: AnnotatedPythonClass,
        newAttributes: List<AnnotatedPythonAttribute>,
        newMethods: List<AnnotatedPythonFunction>
    ): AnnotatedPythonClass?

    fun createNewAttribute(oldAttribute: AnnotatedPythonAttribute): AnnotatedPythonAttribute?

    fun createNewEnum(oldEnum: AnnotatedPythonEnum): AnnotatedPythonEnum?

    fun createNewFunction(
        oldFunction: AnnotatedPythonFunction,
        newParameters: List<AnnotatedPythonParameter>,
        newResults: List<AnnotatedPythonResult>
    ): AnnotatedPythonFunction?

    fun createNewParameter(oldParameter: AnnotatedPythonParameter): AnnotatedPythonParameter?

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

    override fun createNewPackage(
        oldPackage: AnnotatedPythonPackage,
        newModules: List<AnnotatedPythonModule>
    ): AnnotatedPythonPackage? {
        val result = oldPackage.copy(modules = newModules)
        result.originalDeclaration = oldPackage.originalDeclaration ?: oldPackage
        return result
    }

    override fun createNewModule(
        oldModule: AnnotatedPythonModule,
        newClasses: List<AnnotatedPythonClass>,
        newEnums: List<AnnotatedPythonEnum>,
        newFunctions: List<AnnotatedPythonFunction>
    ): AnnotatedPythonModule? {
        val result = oldModule.copy(classes = newClasses, functions = newFunctions)
        result.originalDeclaration = oldModule.originalDeclaration ?: oldModule
        result.enums += newEnums
        return result
    }

    override fun createNewClass(
        oldClass: AnnotatedPythonClass,
        newAttributes: List<AnnotatedPythonAttribute>,
        newMethods: List<AnnotatedPythonFunction>
    ): AnnotatedPythonClass? {
        val result = oldClass.copy(methods = newMethods)
        result.originalDeclaration = oldClass.originalDeclaration ?: oldClass
        result.attributes += newAttributes
        return result
    }

    override fun createNewAttribute(oldAttribute: AnnotatedPythonAttribute): AnnotatedPythonAttribute? {
        return oldAttribute
    }

    override fun createNewEnum(oldEnum: AnnotatedPythonEnum): AnnotatedPythonEnum? {
        return oldEnum
    }

    override fun createNewFunction(
        oldFunction: AnnotatedPythonFunction,
        newParameters: List<AnnotatedPythonParameter>,
        newResults: List<AnnotatedPythonResult>
    ): AnnotatedPythonFunction? {
        val result = oldFunction.copy(parameters = newParameters, results = newResults)
        result.originalDeclaration = oldFunction.originalDeclaration ?: oldFunction
        result.calledAfter += oldFunction.calledAfter
        result.isPure = oldFunction.isPure
        return result
    }

    override fun createNewParameter(oldParameter: AnnotatedPythonParameter): AnnotatedPythonParameter? {
        return oldParameter
    }

    override fun createNewResult(oldResult: AnnotatedPythonResult): AnnotatedPythonResult? {
        return oldResult
    }
}
