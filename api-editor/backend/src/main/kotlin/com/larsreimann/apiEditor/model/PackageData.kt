package com.larsreimann.apiEditor.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@Serializable
sealed class SerializablePythonDeclaration {
    abstract val name: String
    abstract val annotations: MutableList<EditorAnnotation>

    abstract fun children(): Sequence<SerializablePythonDeclaration>
    fun descendants(): Sequence<SerializablePythonDeclaration> = sequence {
        children().forEach {
            yield(it)
            yieldAll(it.descendants())
        }
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
    override val annotations: MutableList<EditorAnnotation>,
) : SerializablePythonDeclaration() {

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
    override val annotations: MutableList<EditorAnnotation>,
) : SerializablePythonDeclaration() {

    @Transient
    val enums = mutableListOf<SerializablePythonEnum>()

    override fun children() = sequence {
        yieldAll(classes)
        yieldAll(enums)
        yieldAll(functions)
    }
}

@Serializable
data class PythonImport(
    val module: String,
    val alias: String?,
)

@Serializable
data class PythonFromImport(
    val module: String,
    val declaration: String,
    val alias: String?,
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
    override val annotations: MutableList<EditorAnnotation>,
) : SerializablePythonDeclaration() {

    @Transient
    var attributes = mutableListOf<SerializablePythonAttribute>()

    fun methodsExceptConstructor(): List<SerializablePythonFunction> {
        return methods.filter { it.name != "__init__" }
    }

    fun constructorOrNull(): SerializablePythonFunction? {
        return methods.firstOrNull { it.name == "__init__" }
    }

    override fun children() = sequence {
        yieldAll(attributes)
        yieldAll(methods)
    }
}

data class SerializablePythonAttribute(
    override val name: String,
    val qualifiedName: String,
    val defaultValue: String?,
    val isPublic: Boolean,
    val typeInDocs: String,
    val description: String,
    override val annotations: MutableList<EditorAnnotation>,
) : SerializablePythonDeclaration() {

    @Transient
    var boundary: Boundary? = null

    override fun children() = emptySequence<SerializablePythonDeclaration>()
}

data class Boundary(
    val isDiscrete: Boolean,
    val lowerIntervalLimit: Double,
    val lowerLimitType: ComparisonOperator,
    val upperIntervalLimit: Double,
    val upperLimitType: ComparisonOperator,
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
    val instances: List<SerializablePythonEnumInstance>,
    override val annotations: MutableList<EditorAnnotation>,
) : SerializablePythonDeclaration() {

    override fun children() = emptySequence<SerializablePythonDeclaration>()
}

data class SerializablePythonEnumInstance(
    val name: String,
    val value: String,
) {
    @Transient
    var description: String = ""
}

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
    override val annotations: MutableList<EditorAnnotation>,
) : SerializablePythonDeclaration() {

    @Transient
    val calledAfter = mutableListOf<SerializablePythonFunction>()

    @Transient
    var isPure = false

    fun isConstructor() = name == "__init__"

    override fun children() = sequence {
        yieldAll(parameters)
        yieldAll(results)
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
    override val annotations: MutableList<EditorAnnotation>,
) : SerializablePythonDeclaration() {

    @Transient
    var boundary: Boundary? = null

    fun isRequired() = defaultValue == null

    fun isOptional() = defaultValue != null

    override fun children() = emptySequence<SerializablePythonDeclaration>()
}

enum class PythonParameterAssignment {
    IMPLICIT,
    POSITION_ONLY,
    POSITION_OR_NAME,
    POSITIONAL_VARARG,
    NAME_ONLY,
    NAMED_VARARG,
}

@Serializable
data class SerializablePythonResult(
    override val name: String,
    val type: String,
    val typeInDocs: String,
    val description: String,
    override val annotations: MutableList<EditorAnnotation>,
) : SerializablePythonDeclaration() {

    @Transient
    var originalDeclaration: SerializablePythonResult? = null

    @Transient
    var boundary: Boundary? = null

    override fun children() = emptySequence<SerializablePythonDeclaration>()
}
