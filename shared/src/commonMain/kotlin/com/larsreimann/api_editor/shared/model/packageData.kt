@file:OptIn(kotlin.js.ExperimentalJsExport::class)
@file:JsExport

package com.larsreimann.api_editor.shared.model

import kotlinx.serialization.Serializable
import kotlin.js.JsExport

@Serializable
sealed class AnnotatedPythonDeclaration {
    abstract val name: String
    abstract val annotations: List<EditorAnnotation>
}

@Serializable
data class AnnotatedPythonPackage(
    val distribution: String,
    override val name: String,
    val version: String,
    val modules: List<AnnotatedPythonModule>,
    override val annotations: List<EditorAnnotation>
) : AnnotatedPythonDeclaration()

@Serializable
data class AnnotatedPythonModule(
    override val name: String,
    val imports: List<PythonImport>,
    val fromImports: List<PythonFromImport>,
    val classes: List<AnnotatedPythonClass>,
    val functions: List<AnnotatedPythonFunction>,
    override val annotations: List<EditorAnnotation>
) : AnnotatedPythonDeclaration()

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
    override val annotations: List<EditorAnnotation>
) : AnnotatedPythonDeclaration()

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
    override val annotations: List<EditorAnnotation>
) : AnnotatedPythonDeclaration()

@Serializable
data class AnnotatedPythonParameter(
    override val name: String,
    val defaultValue: String,
    val assignedBy: String,
    val isPublic: Boolean,
    val typeInDocs: String,
    val description: String,
    override val annotations: List<EditorAnnotation>
) : AnnotatedPythonDeclaration()

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
    override val annotations: List<EditorAnnotation>
) : AnnotatedPythonDeclaration()
