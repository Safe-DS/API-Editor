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
        val newModules = when {
            transformer.shouldVisitModulesIn(this) -> this.modules.mapNotNull { it.accept(transformer) }
            else -> this.modules
        }

        return transformer.createNewPackage(this, newModules)
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
        val newClasses = when {
            transformer.shouldVisitClassesIn(this) -> this.classes.mapNotNull { it.accept(transformer) }
            else -> this.classes
        }

        val newEnums = when {
            transformer.shouldVisitEnumsIn(this) -> this.enums.mapNotNull { it.accept(transformer) }
            else -> this.enums
        }

        val newFunctions = when {
            transformer.shouldVisitFunctionsIn(this) -> this.functions.mapNotNull { it.accept(transformer) }
            else -> this.functions
        }

        return transformer.createNewModule(this, newClasses, newEnums, newFunctions)
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
    val description: String,
    val fullDocstring: String,
    override val annotations: MutableList<EditorAnnotation>
) : AnnotatedPythonDeclaration() {

    @Transient
    override var originalDeclaration: AnnotatedPythonClass? = null

    @Transient
    val attributes = mutableListOf<AnnotatedPythonAttribute>()

    override fun accept(visitor: PackageDataVisitor) {
        val shouldTraverseChildren = visitor.enterPythonClass(this)

        if (shouldTraverseChildren) {
            attributes.forEach { it.accept(visitor) }
            methods.forEach { it.accept(visitor) }
        }

        visitor.leavePythonClass(this)
    }

    override fun accept(transformer: PackageDataTransformer): AnnotatedPythonClass? {
        val newAttributes = when {
            transformer.shouldVisitAttributesIn(this) -> this.attributes.mapNotNull { it.accept(transformer) }
            else -> this.attributes
        }

        val newMethods = when {
            transformer.shouldVisitMethodsIn(this) -> this.methods.mapNotNull { it.accept(transformer) }
            else -> this.methods
        }

        return transformer.createNewClass(this, newAttributes, newMethods)
    }
}

data class AnnotatedPythonAttribute(
    override val name: String,
    val qualifiedName: String,
    val defaultValue: String,
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
        val newParameters = when {
            transformer.shouldVisitParametersIn(this) -> this.parameters.mapNotNull { it.accept(transformer) }
            else -> this.parameters
        }

        val newResults = when {
            transformer.shouldVisitResultsIn(this) -> this.results.mapNotNull { it.accept(transformer) }
            else -> this.results
        }

        return transformer.createNewFunction(this, newParameters, newResults)
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

    override fun accept(visitor: PackageDataVisitor) {
        visitor.enterPythonParameter(this)
        visitor.leavePythonParameter(this)
    }

    override fun accept(transformer: PackageDataTransformer): AnnotatedPythonParameter? {
        return transformer.createNewParameter(this)
    }
}

enum class PythonParameterAssignment {
    POSITION_ONLY,
    POSITION_OR_NAME,
    NAME_ONLY
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
}
