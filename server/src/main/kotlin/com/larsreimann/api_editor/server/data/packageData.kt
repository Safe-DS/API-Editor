package com.larsreimann.api_editor.server.data

import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@Serializable
sealed class AnnotatedPythonDeclaration {
    abstract val name: String
    abstract val annotations: MutableList<EditorAnnotation>
    abstract val originalDeclaration: AnnotatedPythonDeclaration?

    abstract fun accept(visitor: PackageDataVisitor)
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
        }
        if (shouldTraverseChildren) {
            functions.forEach { it.accept(visitor) }
        }

        visitor.leavePythonModule(this)
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
            methods.forEach { it.accept(visitor) }
        }

        visitor.leavePythonClass(this)
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
}
