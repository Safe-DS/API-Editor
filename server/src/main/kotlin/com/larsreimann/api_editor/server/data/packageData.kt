package com.larsreimann.api_editor.server.data

import kotlinx.serialization.Serializable

sealed interface PythonDeclaration {
    val name: String
    val annotations: List<EditorAnnotation>
}

@Serializable
data class PythonPackage(
    val distribution: String,
    override val name: String,
    val version: String,
    val modules: List<PythonModule>,
    override val annotations: List<EditorAnnotation>
) : PythonDeclaration

@Serializable
data class PythonModule(
    override val name: String,
    val imports: List<PythonImport>,
    val fromImports: List<PythonFromImport>,
    val classes: List<PythonClass>,
    val functions: List<PythonFunction>,
    override val annotations: List<EditorAnnotation>
) : PythonDeclaration

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
data class PythonClass(
    override val name: String,
    val qualifiedName: String,
    val decorators: List<String>,
    val superclasses: List<String>,
    val methods: List<PythonFunction>,
    val description: String,
    val fullDocstring: String,
    override val annotations: List<EditorAnnotation>
) : PythonDeclaration

@Serializable
data class PythonFunction(
    override val name: String,
    val qualifiedName: String,
    val decorators: List<String>,
    val parameters: List<PythonParameter>,
    val results: List<PythonResult>,
    val isPublic: Boolean,
    val description: String,
    val fullDocstring: String,
    override val annotations: List<EditorAnnotation>
) : PythonDeclaration

@Serializable
data class PythonParameter(
    override val name: String,
    val defaultValue: String,
    val assignedBy: PythonParameterAssignment,
    val isPublic: Boolean,
    val typeInDocs: String,
    val description: String,
    override val annotations: List<EditorAnnotation>
) : PythonDeclaration

enum class PythonParameterAssignment {
    POSITION_ONLY,
    POSITION_OR_NAME,
    NAME_ONLY
}

@Serializable
data class PythonResult(
    override val name: String,
    val type: String,
    val typeInDocs: String,
    val description: String,
    override val annotations: List<EditorAnnotation>
) : PythonDeclaration
