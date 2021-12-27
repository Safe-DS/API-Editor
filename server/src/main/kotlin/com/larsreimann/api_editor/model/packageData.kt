package com.larsreimann.api_editor.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@Serializable
sealed class AnnotatedPythonDeclaration {
    abstract val name: String
    abstract val annotations: MutableList<EditorAnnotation>
    abstract val originalDeclaration: AnnotatedPythonDeclaration?

    abstract fun accept(visitor: PackageDataVisitor)
    abstract fun accept(transformer: PackageDataTransformer): AnnotatedPythonDeclaration?

    abstract fun children(): Sequence<AnnotatedPythonDeclaration>
    fun descendants(): Sequence<AnnotatedPythonDeclaration> = sequence {
        children().forEach {
            yield(it)
            yieldAll(it.descendants())
        }
    }

    fun hasAnnotationOfType(type: String): Boolean {
        return annotations.any { it.type == type }
    }

    fun getAnnotationsOfType(type: String): List<EditorAnnotation> {
        return annotations.filter { it.type == type }
    }
}

@Serializable
data class AnnotatedPythonPackage(
    val distribution: String,
    override val name: String,
    val version: String,
    val modules: List<AnnotatedPythonModule>,
    override val annotations: MutableList<EditorAnnotation>
) : AnnotatedPythonDeclaration() {

    @Transient
    override var originalDeclaration: AnnotatedPythonPackage? = null

    override fun accept(visitor: PackageDataVisitor) {
        val shouldTraverseChildren = visitor.enterPythonPackage(this)

        if (shouldTraverseChildren) {
            modules.forEach { it.accept(visitor) }
        }

        visitor.leavePythonPackage(this)
    }

    override fun accept(transformer: PackageDataTransformer): AnnotatedPythonPackage? {
        val newPackageOnEnter = transformer.createNewPackageOnEnter(this) ?: return null

        val newModules = when {
            transformer.shouldVisitModulesIn(newPackageOnEnter) -> {
                newPackageOnEnter.modules.mapNotNull { it.accept(transformer) }
            }
            else -> {
                this.modules
            }
        }

        return transformer.createNewPackageOnLeave(newPackageOnEnter, newModules)
    }

    override fun children() = sequence {
        yieldAll(modules)
    }

    fun fullCopy(
        distribution: String = this.distribution,
        name: String = this.name,
        version: String = this.version,
        modules: List<AnnotatedPythonModule> = this.modules,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        originalDeclaration: AnnotatedPythonPackage? = this.originalDeclaration
    ): AnnotatedPythonPackage {

        val result = copy(
            distribution = distribution,
            name = name,
            version = version,
            modules = modules,
            annotations = annotations
        )
        result.originalDeclaration = originalDeclaration
        return result
    }
}

@Serializable
data class AnnotatedPythonModule(
    override val name: String,
    val imports: List<PythonImport>,
    val fromImports: List<PythonFromImport>,
    val classes: List<AnnotatedPythonClass>,
    val functions: List<AnnotatedPythonFunction>,
    override val annotations: MutableList<EditorAnnotation>
) : AnnotatedPythonDeclaration() {

    @Transient
    override var originalDeclaration: AnnotatedPythonModule? = null

    @Transient
    val enums = mutableListOf<AnnotatedPythonEnum>()

    override fun accept(visitor: PackageDataVisitor) {
        val shouldTraverseChildren = visitor.enterPythonModule(this)

        if (shouldTraverseChildren) {
            classes.forEach { it.accept(visitor) }
            enums.forEach { it.accept(visitor) }
            functions.forEach { it.accept(visitor) }
        }

        visitor.leavePythonModule(this)
    }

    override fun accept(transformer: PackageDataTransformer): AnnotatedPythonModule? {
        val newModuleOnEnter = transformer.createNewModuleOnEnter(this) ?: return null

        val newClasses = when {
            transformer.shouldVisitClassesIn(newModuleOnEnter) -> {
                newModuleOnEnter.classes.mapNotNull { it.accept(transformer) }
            }
            else -> {
                newModuleOnEnter.classes
            }
        }

        val newEnums = when {
            transformer.shouldVisitEnumsIn(newModuleOnEnter) -> {
                newModuleOnEnter.enums.mapNotNull { it.accept(transformer) }
            }
            else -> {
                newModuleOnEnter.enums
            }
        }

        val newFunctions = when {
            transformer.shouldVisitFunctionsIn(newModuleOnEnter) -> {
                newModuleOnEnter.functions.mapNotNull { it.accept(transformer) }
            }
            else -> {
                newModuleOnEnter.functions
            }
        }

        return transformer.createNewModuleOnLeave(newModuleOnEnter, newClasses, newEnums, newFunctions)
    }

    override fun children() = sequence {
        yieldAll(classes)
        yieldAll(enums)
        yieldAll(functions)
    }

    fun fullCopy(
        name: String = this.name,
        imports: List<PythonImport> = this.imports,
        fromImports: List<PythonFromImport> = this.fromImports,
        classes: List<AnnotatedPythonClass> = this.classes,
        enums: List<AnnotatedPythonEnum> = this.enums,
        functions: List<AnnotatedPythonFunction> = this.functions,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        originalDeclaration: AnnotatedPythonModule? = this.originalDeclaration
    ): AnnotatedPythonModule {

        val result = copy(
            name = name,
            imports = imports,
            fromImports = fromImports,
            classes = classes,
            functions = functions,
            annotations = annotations
        )
        result.originalDeclaration = originalDeclaration
        result.enums += enums
        return result
    }
}

@Serializable
data class PythonImport(
    val module: String,
    val alias: String?
)

@Serializable
data class PythonFromImport(
    val module: String,
    val declaration: String,
    val alias: String?
)

@Serializable
data class AnnotatedPythonClass(
    override val name: String,
    val qualifiedName: String,
    val decorators: List<String>,
    val superclasses: List<String>,
    val methods: List<AnnotatedPythonFunction>,
    val isPublic: Boolean,
    val description: String,
    val fullDocstring: String,
    override val annotations: MutableList<EditorAnnotation>
) : AnnotatedPythonDeclaration() {

    @Transient
    override var originalDeclaration: AnnotatedPythonClass? = null

    @Transient
    val attributes = mutableListOf<AnnotatedPythonAttribute>()

    fun methodsExceptConstructor(): List<AnnotatedPythonFunction> {
        return methods.filter { it.name != "__init__" }
    }

    fun constructorOrNull(): AnnotatedPythonFunction? {
        return methods.firstOrNull { it.name == "__init__" }
    }

    override fun accept(visitor: PackageDataVisitor) {
        val shouldTraverseChildren = visitor.enterPythonClass(this)

        if (shouldTraverseChildren) {
            attributes.forEach { it.accept(visitor) }
            methods.forEach { it.accept(visitor) }
        }

        visitor.leavePythonClass(this)
    }

    override fun accept(transformer: PackageDataTransformer): AnnotatedPythonClass? {
        val newClassOnEnter = transformer.createNewClassOnEnter(this) ?: return null

        val newAttributes = when {
            transformer.shouldVisitAttributesIn(newClassOnEnter) -> {
                newClassOnEnter.attributes.mapNotNull { it.accept(transformer) }
            }
            else -> {
                newClassOnEnter.attributes
            }
        }

        val newMethods = when {
            transformer.shouldVisitMethodsIn(newClassOnEnter) -> {
                newClassOnEnter.methods.mapNotNull { it.accept(transformer) }
            }
            else -> {
                newClassOnEnter.methods
            }
        }

        return transformer.createNewClassOnLeave(newClassOnEnter, newAttributes, newMethods)
    }

    override fun children() = sequence {
        yieldAll(attributes)
        yieldAll(methods)
    }

    fun fullCopy(
        name: String = this.name,
        qualifiedName: String = this.qualifiedName,
        decorators: List<String> = this.decorators,
        superclasses: List<String> = this.superclasses,
        attributes: List<AnnotatedPythonAttribute> = this.attributes,
        methods: List<AnnotatedPythonFunction> = this.methods,
        isPublic: Boolean = this.isPublic,
        description: String = this.description,
        fullDocstring: String = this.fullDocstring,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        originalDeclaration: AnnotatedPythonClass? = this.originalDeclaration
    ): AnnotatedPythonClass {

        val result = copy(
            name = name,
            qualifiedName = qualifiedName,
            decorators = decorators,
            superclasses = superclasses,
            methods = methods,
            isPublic = isPublic,
            description = description,
            fullDocstring = fullDocstring,
            annotations = annotations
        )
        result.originalDeclaration = originalDeclaration
        result.attributes += attributes
        return result
    }
}

data class AnnotatedPythonAttribute(
    override val name: String,
    val qualifiedName: String,
    val defaultValue: String?,
    val isPublic: Boolean,
    val typeInDocs: String,
    val description: String,
    override val annotations: MutableList<EditorAnnotation>
) : AnnotatedPythonDeclaration() {

    @Transient
    override var originalDeclaration: AnnotatedPythonAttribute? = null

    @Transient
    var boundary: Boundary? = null

    override fun accept(visitor: PackageDataVisitor) {
        visitor.enterPythonAttribute(this)
        visitor.leavePythonAttribute(this)
    }

    override fun accept(transformer: PackageDataTransformer): AnnotatedPythonAttribute? {
        return transformer.createNewAttribute(this)
    }

    override fun children() = emptySequence<AnnotatedPythonDeclaration>()

    fun fullCopy(
        name: String = this.name,
        qualifiedName: String = this.qualifiedName,
        defaultValue: String? = this.defaultValue,
        isPublic: Boolean = this.isPublic,
        typeInDocs: String = this.typeInDocs,
        description: String = this.description,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        boundary: Boundary? = this.boundary,
        originalDeclaration: AnnotatedPythonAttribute? = this.originalDeclaration
    ): AnnotatedPythonAttribute {

        val result = copy(
            name = name,
            qualifiedName = qualifiedName,
            defaultValue = defaultValue,
            isPublic = isPublic,
            typeInDocs = typeInDocs,
            description = description,
            annotations = annotations
        )
        result.originalDeclaration = originalDeclaration
        result.boundary = boundary
        return result
    }
}

data class Boundary(
    val isDiscrete: Boolean,
    val lowerIntervalLimit: Double,
    val lowerLimitType: ComparisonOperator,
    val upperIntervalLimit: Double,
    val upperLimitType: ComparisonOperator
)

data class AnnotatedPythonEnum(
    override val name: String,
    val instances: List<PythonEnumInstance>,
    override val annotations: MutableList<EditorAnnotation>
) : AnnotatedPythonDeclaration() {

    @Transient
    override var originalDeclaration: AnnotatedPythonEnum? = null

    override fun accept(visitor: PackageDataVisitor) {
        visitor.enterPythonEnum(this)
        visitor.leavePythonEnum(this)
    }

    override fun accept(transformer: PackageDataTransformer): AnnotatedPythonEnum? {
        return transformer.createNewEnum(this)
    }

    override fun children() = emptySequence<AnnotatedPythonDeclaration>()

    fun fullCopy(
        name: String = this.name,
        instances: List<PythonEnumInstance> = this.instances,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        originalDeclaration: AnnotatedPythonEnum? = this.originalDeclaration
    ): AnnotatedPythonEnum {
        val result = copy(
            name = name,
            instances = instances,
            annotations = annotations
        )
        result.originalDeclaration = originalDeclaration
        return result
    }
}

data class PythonEnumInstance(
    val name: String,
    val value: String
)

@Serializable
data class AnnotatedPythonFunction(
    override val name: String,
    val qualifiedName: String,
    val decorators: List<String>,
    val parameters: List<AnnotatedPythonParameter>,
    val results: List<AnnotatedPythonResult>,
    val isPublic: Boolean,
    val description: String,
    val fullDocstring: String,
    override val annotations: MutableList<EditorAnnotation>
) : AnnotatedPythonDeclaration() {

    @Transient
    override var originalDeclaration: AnnotatedPythonFunction? = null

    @Transient
    val calledAfter = mutableListOf<AnnotatedPythonFunction>()

    @Transient
    var isPure = false

    fun isConstructor() = name == "__init__"

    override fun accept(visitor: PackageDataVisitor) {
        val shouldTraverseChildren = visitor.enterPythonFunction(this)

        if (shouldTraverseChildren) {
            parameters.forEach { it.accept(visitor) }
            results.forEach { it.accept(visitor) }
        }

        visitor.leavePythonFunction(this)
    }

    override fun accept(transformer: PackageDataTransformer): AnnotatedPythonFunction? {
        val newFunctionOnEnter = transformer.createNewFunctionOnEnter(this) ?: return null

        val newParameters = when {
            transformer.shouldVisitParametersIn(newFunctionOnEnter) -> {
                newFunctionOnEnter.parameters.mapNotNull { it.accept(transformer) }
            }
            else -> {
                newFunctionOnEnter.parameters
            }
        }

        val newResults = when {
            transformer.shouldVisitResultsIn(newFunctionOnEnter) -> {
                newFunctionOnEnter.results.mapNotNull { it.accept(transformer) }
            }
            else -> {
                newFunctionOnEnter.results
            }
        }

        return transformer.createNewFunctionOnLeave(newFunctionOnEnter, newParameters, newResults)
    }

    override fun children() = sequence {
        yieldAll(parameters)
        yieldAll(results)
    }

    fun fullCopy(
        name: String = this.name,
        qualifiedName: String = this.qualifiedName,
        decorators: List<String> = this.decorators,
        parameters: List<AnnotatedPythonParameter> = this.parameters,
        results: List<AnnotatedPythonResult> = this.results,
        isPublic: Boolean = this.isPublic,
        description: String = this.description,
        fullDocstring: String = this.fullDocstring,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        calledAfter: MutableList<AnnotatedPythonFunction> = this.calledAfter,
        isPure: Boolean = this.isPure,
        originalDeclaration: AnnotatedPythonFunction? = this.originalDeclaration
    ): AnnotatedPythonFunction {

        val result = copy(
            name = name,
            qualifiedName = qualifiedName,
            decorators = decorators,
            parameters = parameters,
            results = results,
            isPublic = isPublic,
            description = description,
            fullDocstring = fullDocstring,
            annotations = annotations,
        )
        result.originalDeclaration = originalDeclaration
        result.calledAfter += calledAfter
        result.isPure = isPure
        return result
    }
}

@Serializable
data class AnnotatedPythonParameter(
    override val name: String,
    val qualifiedName: String,
    val defaultValue: String?,
    val assignedBy: PythonParameterAssignment,
    val isPublic: Boolean,
    val typeInDocs: String,
    val description: String,
    override val annotations: MutableList<EditorAnnotation>
) : AnnotatedPythonDeclaration() {

    @Transient
    override var originalDeclaration: AnnotatedPythonParameter? = null

    @Transient
    var boundary: Boundary? = null

    fun isRequired() = defaultValue == null

    fun isOptional() = defaultValue != null

    override fun accept(visitor: PackageDataVisitor) {
        visitor.enterPythonParameter(this)
        visitor.leavePythonParameter(this)
    }

    override fun accept(transformer: PackageDataTransformer): AnnotatedPythonParameter? {
        return transformer.createNewParameter(this)
    }

    override fun children() = emptySequence<AnnotatedPythonDeclaration>()

    fun fullCopy(
        name: String = this.name,
        qualifiedName: String = this.qualifiedName,
        defaultValue: String? = this.defaultValue,
        assignedBy: PythonParameterAssignment = this.assignedBy,
        isPublic: Boolean = this.isPublic,
        typeInDocs: String = this.typeInDocs,
        description: String = this.description,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        boundary: Boundary? = this.boundary,
        originalDeclaration: AnnotatedPythonParameter? = this.originalDeclaration
    ): AnnotatedPythonParameter {

        val result = copy(
            name = name,
            qualifiedName = qualifiedName,
            defaultValue = defaultValue,
            assignedBy = assignedBy,
            isPublic = isPublic,
            typeInDocs = typeInDocs,
            description = description,
            annotations = annotations
        )
        result.originalDeclaration = originalDeclaration
        result.boundary = boundary
        return result
    }
}

enum class PythonParameterAssignment {
    POSITION_ONLY,
    POSITION_OR_NAME,
    NAME_ONLY,
    CONSTANT,
    ATTRIBUTE,
    IMPLICIT
}

@Serializable
data class AnnotatedPythonResult(
    override val name: String,
    val type: String,
    val typeInDocs: String,
    val description: String,
    override val annotations: MutableList<EditorAnnotation>
) : AnnotatedPythonDeclaration() {

    @Transient
    override var originalDeclaration: AnnotatedPythonResult? = null

    @Transient
    var boundary: Boundary? = null

    override fun accept(visitor: PackageDataVisitor) {
        visitor.enterPythonResult(this)
        visitor.leavePythonResult(this)
    }

    override fun accept(transformer: PackageDataTransformer): AnnotatedPythonResult? {
        return transformer.createNewResult(this)
    }

    override fun children() = emptySequence<AnnotatedPythonDeclaration>()

    fun fullCopy(
        name: String = this.name,
        type: String = this.type,
        typeInDocs: String = this.typeInDocs,
        description: String = this.description,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        boundary: Boundary? = this.boundary,
        originalDeclaration: AnnotatedPythonResult? = this.originalDeclaration
    ): AnnotatedPythonResult {

        val result = copy(
            name = name,
            type = type,
            typeInDocs = typeInDocs,
            description = description,
            annotations = annotations
        )
        result.originalDeclaration = originalDeclaration
        result.boundary = boundary
        return result
    }
}
