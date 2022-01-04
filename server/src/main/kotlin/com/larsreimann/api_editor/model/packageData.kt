package com.larsreimann.api_editor.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@Serializable
sealed class SerializablePythonDeclaration {
    abstract val name: String
    abstract val annotations: MutableList<EditorAnnotation>

    abstract fun accept(visitor: PackageDataVisitor)
    abstract fun accept(transformer: PackageDataTransformer): SerializablePythonDeclaration?

    abstract fun children(): Sequence<SerializablePythonDeclaration>
    fun descendants(): Sequence<SerializablePythonDeclaration> = sequence {
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
data class SerializablePythonPackage(
    val distribution: String,
    override val name: String,
    val version: String,
    val modules: MutableList<SerializablePythonModule>,
    override val annotations: MutableList<EditorAnnotation>
) : SerializablePythonDeclaration() {

    override fun accept(visitor: PackageDataVisitor) {
        val shouldTraverseChildren = visitor.enterPythonPackage(this)

        if (shouldTraverseChildren) {
            modules.forEach { it.accept(visitor) }
        }

        visitor.leavePythonPackage(this)
    }

    override fun accept(transformer: PackageDataTransformer): SerializablePythonPackage? {
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
}

@Serializable
data class SerializablePythonModule(
    override val name: String,
    val imports: List<PythonImport>,
    val fromImports: List<PythonFromImport>,
    val classes: MutableList<SerializablePythonClass>,
    val functions: MutableList<SerializablePythonFunction>,
    override val annotations: MutableList<EditorAnnotation>
) : SerializablePythonDeclaration() {

    @Transient
    val enums = mutableListOf<SerializablePythonEnum>()

    override fun accept(visitor: PackageDataVisitor) {
        val shouldTraverseChildren = visitor.enterPythonModule(this)

        if (shouldTraverseChildren) {
            classes.forEach { it.accept(visitor) }
            enums.forEach { it.accept(visitor) }
            functions.forEach { it.accept(visitor) }
        }

        visitor.leavePythonModule(this)
    }

    override fun accept(transformer: PackageDataTransformer): SerializablePythonModule? {
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
        classes: MutableList<SerializablePythonClass> = this.classes,
        enums: MutableList<SerializablePythonEnum> = this.enums,
        functions: MutableList<SerializablePythonFunction> = this.functions,
        annotations: MutableList<EditorAnnotation> = this.annotations,
    ): SerializablePythonModule {

        val result = copy(
            name = name,
            imports = imports,
            fromImports = fromImports,
            classes = classes,
            functions = functions,
            annotations = annotations
        )
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
data class SerializablePythonClass(
    override val name: String,
    val qualifiedName: String,
    val decorators: List<String>,
    val superclasses: List<String>,
    val methods: MutableList<SerializablePythonFunction>,
    val isPublic: Boolean,
    val description: String,
    val fullDocstring: String,
    override val annotations: MutableList<EditorAnnotation>
) : SerializablePythonDeclaration() {

    @Transient
    var originalDeclaration: SerializablePythonClass? = null

    @Transient
    var attributes = mutableListOf<SerializablePythonAttribute>()

    fun methodsExceptConstructor(): List<SerializablePythonFunction> {
        return methods.filter { it.name != "__init__" }
    }

    fun constructorOrNull(): SerializablePythonFunction? {
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

    override fun accept(transformer: PackageDataTransformer): SerializablePythonClass? {
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
        attributes: MutableList<SerializablePythonAttribute> = this.attributes,
        methods: MutableList<SerializablePythonFunction> = this.methods,
        isPublic: Boolean = this.isPublic,
        description: String = this.description,
        fullDocstring: String = this.fullDocstring,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        originalDeclaration: SerializablePythonClass? = this.originalDeclaration
    ): SerializablePythonClass {

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

data class SerializablePythonAttribute(
    override val name: String,
    val qualifiedName: String,
    val defaultValue: String?,
    val isPublic: Boolean,
    val typeInDocs: String,
    val description: String,
    override val annotations: MutableList<EditorAnnotation>
) : SerializablePythonDeclaration() {

    @Transient
    var originalDeclaration: SerializablePythonAttribute? = null

    @Transient
    var boundary: Boundary? = null

    override fun accept(visitor: PackageDataVisitor) {
        visitor.enterPythonAttribute(this)
        visitor.leavePythonAttribute(this)
    }

    override fun accept(transformer: PackageDataTransformer): SerializablePythonAttribute? {
        return transformer.createNewAttribute(this)
    }

    override fun children() = emptySequence<SerializablePythonDeclaration>()

    fun fullCopy(
        name: String = this.name,
        qualifiedName: String = this.qualifiedName,
        defaultValue: String? = this.defaultValue,
        isPublic: Boolean = this.isPublic,
        typeInDocs: String = this.typeInDocs,
        description: String = this.description,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        boundary: Boundary? = this.boundary,
        originalDeclaration: SerializablePythonAttribute? = this.originalDeclaration
    ): SerializablePythonAttribute {

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
) {
    fun asInterval() = buildString {
        when (lowerLimitType) {
            ComparisonOperator.LESS_THAN -> append("($lowerIntervalLimit, ")
            ComparisonOperator.LESS_THAN_OR_EQUALS -> append("[$lowerIntervalLimit, ")
            ComparisonOperator.UNRESTRICTED -> append("(-∞, ")
        }

        when (upperLimitType) {
            ComparisonOperator.LESS_THAN -> append("$upperIntervalLimit)")
            ComparisonOperator.LESS_THAN_OR_EQUALS -> append("$upperIntervalLimit]")
            ComparisonOperator.UNRESTRICTED -> append("∞)")
        }
    }
}

data class SerializablePythonEnum(
    override val name: String,
    val instances: List<PythonEnumInstance>,
    override val annotations: MutableList<EditorAnnotation>
) : SerializablePythonDeclaration() {

    override fun accept(visitor: PackageDataVisitor) {
        visitor.enterPythonEnum(this)
        visitor.leavePythonEnum(this)
    }

    override fun accept(transformer: PackageDataTransformer): SerializablePythonEnum? {
        return transformer.createNewEnum(this)
    }

    override fun children() = emptySequence<SerializablePythonDeclaration>()
}

data class PythonEnumInstance(
    val name: String,
    val value: String
)

@Serializable
data class SerializablePythonFunction(
    override val name: String,
    val qualifiedName: String,
    val decorators: List<String>,
    val parameters: MutableList<SerializablePythonParameter>,
    val results: MutableList<SerializablePythonResult>,
    val isPublic: Boolean,
    val description: String,
    val fullDocstring: String,
    override val annotations: MutableList<EditorAnnotation>
) : SerializablePythonDeclaration() {

    @Transient
    var originalDeclaration: SerializablePythonFunction? = null

    @Transient
    val calledAfter = mutableListOf<SerializablePythonFunction>()

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

    override fun accept(transformer: PackageDataTransformer): SerializablePythonFunction? {
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
        parameters: MutableList<SerializablePythonParameter> = this.parameters,
        results: MutableList<SerializablePythonResult> = this.results,
        isPublic: Boolean = this.isPublic,
        description: String = this.description,
        fullDocstring: String = this.fullDocstring,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        calledAfter: MutableList<SerializablePythonFunction> = this.calledAfter,
        isPure: Boolean = this.isPure,
        originalDeclaration: SerializablePythonFunction? = this.originalDeclaration
    ): SerializablePythonFunction {

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
data class SerializablePythonParameter(
    override val name: String,
    val qualifiedName: String,
    val defaultValue: String?,
    var assignedBy: PythonParameterAssignment,
    val isPublic: Boolean,
    val typeInDocs: String,
    val description: String,
    override val annotations: MutableList<EditorAnnotation>
) : SerializablePythonDeclaration() {

    @Transient
    var originalDeclaration: SerializablePythonParameter? = null

    @Transient
    var boundary: Boundary? = null

    fun isRequired() = defaultValue == null

    fun isOptional() = defaultValue != null

    override fun accept(visitor: PackageDataVisitor) {
        visitor.enterPythonParameter(this)
        visitor.leavePythonParameter(this)
    }

    override fun accept(transformer: PackageDataTransformer): SerializablePythonParameter? {
        return transformer.createNewParameter(this)
    }

    override fun children() = emptySequence<SerializablePythonDeclaration>()

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
        originalDeclaration: SerializablePythonParameter? = this.originalDeclaration
    ): SerializablePythonParameter {

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
data class SerializablePythonResult(
    override val name: String,
    val type: String,
    val typeInDocs: String,
    val description: String,
    override val annotations: MutableList<EditorAnnotation>
) : SerializablePythonDeclaration() {

    @Transient
    var originalDeclaration: SerializablePythonResult? = null

    @Transient
    var boundary: Boundary? = null

    override fun accept(visitor: PackageDataVisitor) {
        visitor.enterPythonResult(this)
        visitor.leavePythonResult(this)
    }

    override fun accept(transformer: PackageDataTransformer): SerializablePythonResult? {
        return transformer.createNewResult(this)
    }

    override fun children() = emptySequence<SerializablePythonDeclaration>()

    fun fullCopy(
        name: String = this.name,
        type: String = this.type,
        typeInDocs: String = this.typeInDocs,
        description: String = this.description,
        annotations: MutableList<EditorAnnotation> = this.annotations,
        boundary: Boundary? = this.boundary,
        originalDeclaration: SerializablePythonResult? = this.originalDeclaration
    ): SerializablePythonResult {

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
