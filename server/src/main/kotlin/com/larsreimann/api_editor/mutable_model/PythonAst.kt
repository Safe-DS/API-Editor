@file:Suppress("unused")

package com.larsreimann.api_editor.mutable_model

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.PythonEnumInstance
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment

private sealed class PythonAstNode : TreeNode()

private sealed class PythonDeclaration(
    var name: String,
    val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonAstNode() {

    /**
     * Returns the qualified name of the declaration.
     */
    fun qualifiedName(): String {
        return ancestorsOrSelf()
            .filterIsInstance<PythonDeclaration>()
            .toList()
            .asReversed()
            .joinToString(separator = ".") { it.name }
    }
}

private class PythonPackage(
    var distribution: String,
    name: String,
    var version: String,
    modules: List<PythonModule> = emptyList(),
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration(name, annotations) {

    val modules = ContainmentList(modules)

    override fun children() = sequence {
        yieldAll(modules)
    }
}

private class PythonModule(
    name: String,
    val imports: MutableList<PythonImport> = mutableListOf(),
    val fromImports: MutableList<PythonFromImport> = mutableListOf(),
    classes: List<PythonClass> = emptyList(),
    enums: List<PythonEnum> = emptyList(),
    functions: List<PythonFunction> = emptyList(),
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration(name, annotations) {

    val classes = ContainmentList(classes)
    val enums = ContainmentList(enums)
    val functions = ContainmentList(functions)

    override fun children() = sequence {
        yieldAll(classes)
        yieldAll(enums)
        yieldAll(functions)
    }
}

private class PythonClass(
    name: String,
    val decorators: MutableList<String> = mutableListOf(),
    val superclasses: MutableList<String> = mutableListOf(),
    attributes: List<PythonAttribute> = emptyList(),
    methods: List<PythonFunction> = emptyList(),
    var description: String = "",
    var fullDocstring: String = "",
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration(name, annotations) {

    val attributes = ContainmentList(attributes)
    val methods = ContainmentList(methods)

    override fun children() = sequence {
        yieldAll(attributes)
        yieldAll(methods)
    }
}

private class PythonEnum(
    name: String,
    val instances: MutableList<PythonEnumInstance> = mutableListOf(),
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration(name, annotations)

private class PythonFunction(
    name: String,
    val decorators: MutableList<String> = mutableListOf(),
    parameters: List<PythonParameter> = emptyList(),
    results: List<PythonResult> = emptyList(),
    var isPublic: Boolean = true,
    var description: String = "",
    var fullDocstring: String = "",
    val calledAfter: MutableList<String> = mutableListOf(), // TODO: should be cross-references
    var isPure: Boolean = false,
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration(name, annotations) {

    val parameters = ContainmentList(parameters)
    val results = ContainmentList(results)

    override fun children() = sequence {
        yieldAll(parameters)
        yieldAll(results)
    }

    fun isConstructor() = name == "__init__"
}

private class PythonAttribute(
    name: String,
    var defaultValue: String = "",
    var isPublic: Boolean = true,
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration(name, annotations)

private class PythonParameter(
    name: String,
    var defaultValue: String? = null,
    var assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
    var isPublic: Boolean = true,
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration(name, annotations)

private class PythonResult(
    name: String,
    var type: String = "",
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration(name, annotations)

private sealed class PythonStatement : PythonAstNode() // TODO

private class PythonExpressionStatement : PythonStatement() // TODO

private sealed class PythonExpression : PythonAstNode() // TODO

private class PythonCall : PythonStatement() // TODO
