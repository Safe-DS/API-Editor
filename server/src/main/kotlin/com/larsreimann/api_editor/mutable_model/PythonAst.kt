@file:Suppress("unused")

package com.larsreimann.api_editor.mutable_model

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.PythonEnumInstance
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment

sealed class MutablePythonAstNode : TreeNode()

sealed class MutablePythonDeclaration(
    var name: String,
    val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonAstNode() {

    /**
     * Returns the qualified name of the declaration.
     */
    fun qualifiedName(): String {
        return ancestorsOrSelf()
            .filterIsInstance<MutablePythonDeclaration>()
            .toList()
            .asReversed()
            .joinToString(separator = ".") { it.name }
    }
}

class MutablePythonPackage(
    var distribution: String,
    name: String,
    var version: String,
    modules: List<MutablePythonModule> = emptyList(),
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration(name, annotations) {

    val modules = ContainmentList(modules)

    override fun children() = sequence {
        yieldAll(modules)
    }
}

class MutablePythonModule(
    name: String,
    val imports: MutableList<PythonImport> = mutableListOf(),
    val fromImports: MutableList<PythonFromImport> = mutableListOf(),
    classes: List<MutablePythonClass> = emptyList(),
    enums: List<MutablePythonEnum> = emptyList(),
    functions: List<MutablePythonFunction> = emptyList(),
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration(name, annotations) {

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
    name: String,
    val decorators: MutableList<String> = mutableListOf(),
    val superclasses: MutableList<String> = mutableListOf(),
    attributes: List<MutablePythonAttribute> = emptyList(),
    methods: List<MutablePythonFunction> = emptyList(),
    var isPublic: Boolean = true,
    var description: String = "",
    var fullDocstring: String = "",
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration(name, annotations) {

    val attributes = ContainmentList(attributes)
    val methods = ContainmentList(methods)

    override fun children() = sequence {
        yieldAll(attributes)
        yieldAll(methods)
    }
}

class MutablePythonEnum(
    name: String,
    val instances: MutableList<PythonEnumInstance> = mutableListOf(),
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration(name, annotations)

class MutablePythonFunction(
    name: String,
    val decorators: MutableList<String> = mutableListOf(),
    parameters: List<MutablePythonParameter> = emptyList(),
    results: List<MutablePythonResult> = emptyList(),
    var isPublic: Boolean = true,
    var description: String = "",
    var fullDocstring: String = "",
    val calledAfter: MutableList<String> = mutableListOf(), // TODO: should be cross-references
    var isPure: Boolean = false,
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration(name, annotations) {

    val parameters = ContainmentList(parameters)
    val results = ContainmentList(results)

    override fun children() = sequence {
        yieldAll(parameters)
        yieldAll(results)
    }

    fun isConstructor() = name == "__init__"
}

class MutablePythonAttribute(
    name: String,
    var defaultValue: String? = null,
    var isPublic: Boolean = true,
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration(name, annotations)

class MutablePythonParameter(
    name: String,
    var defaultValue: String? = null,
    var assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
    var isPublic: Boolean = true,
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration(name, annotations)

class MutablePythonResult(
    name: String,
    var type: String = "",
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration(name, annotations)

private sealed class MutablePythonStatement : MutablePythonAstNode() // TODO

private class MutablePythonExpressionStatement : MutablePythonStatement() // TODO

private sealed class MutablePythonExpression : MutablePythonAstNode() // TODO

private class MutablePythonCall : MutablePythonStatement() // TODO
