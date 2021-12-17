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
