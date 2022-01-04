@file:Suppress("unused")

package com.larsreimann.api_editor.mutable_model

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.PythonEnumInstance
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.SerializablePythonAttribute
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult

sealed class MutablePythonAstNode : TreeNode()

sealed class MutablePythonDeclaration : MutablePythonAstNode() {

    abstract var name: String
    abstract val annotations: MutableList<EditorAnnotation>

    /**
     * Returns the qualified name of the declaration.
     */
    fun qualifiedName(): String {
        return ancestorsOrSelf()
            .filterIsInstance<MutablePythonDeclaration>()
            .filterNot { it is MutablePythonPackage }
            .toList()
            .asReversed()
            .joinToString(separator = ".") { it.name }
    }
}

class MutablePythonPackage(
    var distribution: String,
    override var name: String,
    var version: String,
    modules: List<MutablePythonModule> = emptyList(),
    override val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration() {

    val modules = ContainmentList(modules)

    override fun children() = sequence {
        yieldAll(modules)
    }
}

class MutablePythonModule(
    override var name: String,
    val imports: MutableList<PythonImport> = mutableListOf(),
    val fromImports: MutableList<PythonFromImport> = mutableListOf(),
    classes: List<MutablePythonClass> = emptyList(),
    enums: List<MutablePythonEnum> = emptyList(),
    functions: List<MutablePythonFunction> = emptyList(),
    override val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration() {

    val classes = ContainmentList(classes)
    val enums = ContainmentList(enums)
    val functions = ContainmentList(functions)

    override fun children() = sequence {
        yieldAll(classes)
        yieldAll(enums)
        yieldAll(functions)
    }
}

class MutablePythonClass(
    override var name: String,
    val decorators: MutableList<String> = mutableListOf(),
    val superclasses: MutableList<String> = mutableListOf(),
    attributes: List<MutablePythonAttribute> = emptyList(),
    methods: List<MutablePythonFunction> = emptyList(),
    var isPublic: Boolean = true,
    var description: String = "",
    var fullDocstring: String = "",
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    var originalDeclaration: SerializablePythonClass? = null
) : MutablePythonDeclaration() {

    val attributes = ContainmentList(attributes)
    val methods = ContainmentList(methods)

    override fun children() = sequence {
        yieldAll(attributes)
        yieldAll(methods)
    }
}

data class MutablePythonEnum(
    override var name: String,
    val instances: MutableList<PythonEnumInstance> = mutableListOf(),
    override val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration()

class MutablePythonFunction(
    override var name: String,
    val decorators: MutableList<String> = mutableListOf(),
    parameters: List<MutablePythonParameter> = emptyList(),
    results: List<MutablePythonResult> = emptyList(),
    var isPublic: Boolean = true,
    var description: String = "",
    var fullDocstring: String = "",
    var isPure: Boolean = false,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    val calledAfter: MutableList<SerializablePythonFunction> = mutableListOf(),
    var originalDeclaration: SerializablePythonFunction? = null
) : MutablePythonDeclaration() {

    val parameters = ContainmentList(parameters)
    val results = ContainmentList(results)

    override fun children() = sequence {
        yieldAll(parameters)
        yieldAll(results)
    }

    fun isConstructor() = name == "__init__"
}

data class MutablePythonAttribute(
    override var name: String,
    var defaultValue: String? = null,
    var isPublic: Boolean = true,
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    var originalDeclaration: SerializablePythonAttribute? = null
) : MutablePythonDeclaration()

data class MutablePythonParameter(
    override var name: String,
    var defaultValue: String? = null,
    var assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
    var isPublic: Boolean = true,
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    var originalDeclaration: SerializablePythonParameter? = null
) : MutablePythonDeclaration() {

    fun isRequired() = defaultValue == null

    fun isOptional() = defaultValue != null
}

data class MutablePythonResult(
    override var name: String,
    var type: String = "",
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    var originalDeclaration: SerializablePythonResult? = null
) : MutablePythonDeclaration()

private sealed class MutablePythonStatement : MutablePythonAstNode() // TODO

private class MutablePythonExpressionStatement : MutablePythonStatement() // TODO

private sealed class MutablePythonExpression : MutablePythonAstNode() // TODO

private class MutablePythonCall : MutablePythonStatement() // TODO
