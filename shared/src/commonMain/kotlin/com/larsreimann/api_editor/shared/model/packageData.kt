@file:OptIn(kotlin.js.ExperimentalJsExport::class)
@file:JsExport

package com.larsreimann.api_editor.shared.model

import kotlinx.serialization.Serializable
import kotlin.js.JsExport

@Serializable
sealed class AnnotatedPythonDeclaration {
    abstract val name: String
    abstract val annotations: Array<EditorAnnotation>
}

@Serializable
data class AnnotatedPythonPackage(
    val distribution: String,
    override val name: String,
    val version: String,
    val modules: Array<AnnotatedPythonModule>,
    override val annotations: Array<EditorAnnotation>
) : AnnotatedPythonDeclaration() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false

        other as AnnotatedPythonPackage

        if (distribution != other.distribution) return false
        if (name != other.name) return false
        if (version != other.version) return false
        if (!modules.contentEquals(other.modules)) return false
        if (!annotations.contentEquals(other.annotations)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = distribution.hashCode()
        result = 31 * result + name.hashCode()
        result = 31 * result + version.hashCode()
        result = 31 * result + modules.contentHashCode()
        result = 31 * result + annotations.contentHashCode()
        return result
    }
}

@Serializable
data class AnnotatedPythonModule(
    override val name: String,
    val imports: Array<PythonImport>,
    val fromImports: Array<PythonFromImport>,
    val classes: Array<AnnotatedPythonClass>,
    val functions: Array<AnnotatedPythonFunction>,
    override val annotations: Array<EditorAnnotation>
) : AnnotatedPythonDeclaration() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false

        other as AnnotatedPythonModule

        if (name != other.name) return false
        if (!imports.contentEquals(other.imports)) return false
        if (!fromImports.contentEquals(other.fromImports)) return false
        if (!classes.contentEquals(other.classes)) return false
        if (!functions.contentEquals(other.functions)) return false
        if (!annotations.contentEquals(other.annotations)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + imports.contentHashCode()
        result = 31 * result + fromImports.contentHashCode()
        result = 31 * result + classes.contentHashCode()
        result = 31 * result + functions.contentHashCode()
        result = 31 * result + annotations.contentHashCode()
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
    val decorators: Array<String>,
    val superclasses: Array<String>,
    val methods: Array<AnnotatedPythonFunction>,
    val description: String,
    val fullDocstring: String,
    override val annotations: Array<EditorAnnotation>
) : AnnotatedPythonDeclaration() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false

        other as AnnotatedPythonClass

        if (name != other.name) return false
        if (qualifiedName != other.qualifiedName) return false
        if (!decorators.contentEquals(other.decorators)) return false
        if (!superclasses.contentEquals(other.superclasses)) return false
        if (!methods.contentEquals(other.methods)) return false
        if (description != other.description) return false
        if (fullDocstring != other.fullDocstring) return false
        if (!annotations.contentEquals(other.annotations)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + qualifiedName.hashCode()
        result = 31 * result + decorators.contentHashCode()
        result = 31 * result + superclasses.contentHashCode()
        result = 31 * result + methods.contentHashCode()
        result = 31 * result + description.hashCode()
        result = 31 * result + fullDocstring.hashCode()
        result = 31 * result + annotations.contentHashCode()
        return result
    }
}

@Serializable
data class AnnotatedPythonFunction(
    override val name: String,
    val qualifiedName: String,
    val decorators: Array<String>,
    val parameters: Array<AnnotatedPythonParameter>,
    val results: Array<AnnotatedPythonResult>,
    val isPublic: Boolean,
    val description: String,
    val fullDocstring: String,
    override val annotations: Array<EditorAnnotation>
) : AnnotatedPythonDeclaration() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false

        other as AnnotatedPythonFunction

        if (name != other.name) return false
        if (qualifiedName != other.qualifiedName) return false
        if (!decorators.contentEquals(other.decorators)) return false
        if (!parameters.contentEquals(other.parameters)) return false
        if (!results.contentEquals(other.results)) return false
        if (isPublic != other.isPublic) return false
        if (description != other.description) return false
        if (fullDocstring != other.fullDocstring) return false
        if (!annotations.contentEquals(other.annotations)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + qualifiedName.hashCode()
        result = 31 * result + decorators.contentHashCode()
        result = 31 * result + parameters.contentHashCode()
        result = 31 * result + results.contentHashCode()
        result = 31 * result + isPublic.hashCode()
        result = 31 * result + description.hashCode()
        result = 31 * result + fullDocstring.hashCode()
        result = 31 * result + annotations.contentHashCode()
        return result
    }
}

@Serializable
data class AnnotatedPythonParameter(
    override val name: String,
    val defaultValue: String,
    val assignedBy: String,
    val isPublic: Boolean,
    val typeInDocs: String,
    val description: String,
    override val annotations: Array<EditorAnnotation>
) : AnnotatedPythonDeclaration() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false

        other as AnnotatedPythonParameter

        if (name != other.name) return false
        if (defaultValue != other.defaultValue) return false
        if (assignedBy != other.assignedBy) return false
        if (isPublic != other.isPublic) return false
        if (typeInDocs != other.typeInDocs) return false
        if (description != other.description) return false
        if (!annotations.contentEquals(other.annotations)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + defaultValue.hashCode()
        result = 31 * result + assignedBy.hashCode()
        result = 31 * result + isPublic.hashCode()
        result = 31 * result + typeInDocs.hashCode()
        result = 31 * result + description.hashCode()
        result = 31 * result + annotations.contentHashCode()
        return result
    }
}

// TODO: should be an enum once they are supported by @JsExport
class PythonParameterAssignment {
    companion object {
        const val POSITION_ONLY = "POSITION_ONLY"
        const val POSITION_OR_NAME = "POSITION_OR_NAME"
        const val NAME_ONLY = "NAME_ONLY"
    }
}

@Serializable
data class AnnotatedPythonResult(
    override val name: String,
    val type: String,
    val typeInDocs: String,
    val description: String,
    override val annotations: Array<EditorAnnotation>
) : AnnotatedPythonDeclaration() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false

        other as AnnotatedPythonResult

        if (name != other.name) return false
        if (type != other.type) return false
        if (typeInDocs != other.typeInDocs) return false
        if (description != other.description) return false
        if (!annotations.contentEquals(other.annotations)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + type.hashCode()
        result = 31 * result + typeInDocs.hashCode()
        result = 31 * result + description.hashCode()
        result = 31 * result + annotations.contentHashCode()
        return result
    }
}
