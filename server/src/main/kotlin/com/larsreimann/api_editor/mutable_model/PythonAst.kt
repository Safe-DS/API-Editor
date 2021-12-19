package com.larsreimann.api_editor.mutable_model

import com.larsreimann.api_editor.model.EditorAnnotation

// The copy derived by a data class is wrong anyway, since the parent references don't get updated + we don't need copy
// if everything is mutable (only needed once at the beginning)

sealed class PythonAstNode : TreeNode()

sealed class PythonDeclaration(var name: String) : PythonAstNode() {
    fun qualifiedName(): String {
        return ancestorsOrSelf()
            .filterIsInstance<PythonDeclaration>()
            .toList()
            .asReversed()
            .joinToString(separator = ".") { it.name }
    }
}

class PythonFunction(
    name: String,
    val decorators: MutableList<String>,
    parameters: List<PythonParameter>,
    results: List<PythonResult>,
    // TODO: isPublic might change after a move or rename (reexports only count for original decl.)
    //  - original qualified name should be (one of) the public one -> update package analyzer
    var isPublic: Boolean,
    var description: String,
    var fullDocstring: String,
    val annotations: MutableList<EditorAnnotation>
) : PythonDeclaration(name) {

    val parameters = ContainmentList(parameters)

    val results = ContainmentList(results)

    override fun children() = sequence {
        yieldAll(parameters)
        yieldAll(results)
    }
}

class PythonParameter(name: String) : PythonDeclaration(name)
class PythonResult(name: String) : PythonDeclaration(name)

//    override val annotations: MutableList<EditorAnnotation>
//) : AnnotatedPythonDeclaration() {
//
//    @Transient
//    override var originalDeclaration: AnnotatedPythonFunction? = null
//
//    @Transient
//    val calledAfter = mutableListOf<AnnotatedPythonFunction>()
//
//    @Transient
//    var isPure = false

class PythonCall()
