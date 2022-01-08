@file:Suppress("unused")

package com.larsreimann.api_editor.mutable_model

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.modeling.ModelNode
import com.larsreimann.modeling.ancestorsOrSelf

sealed class MutablePythonAstNode : ModelNode()

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

    val modules = MutableContainmentList(modules)

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

    val classes = MutableContainmentList(classes)
    val enums = MutableContainmentList(enums)
    val functions = MutableContainmentList(functions)

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
    constructor: MutablePythonConstructor? = null,
    attributes: List<MutablePythonAttribute> = emptyList(),
    methods: List<MutablePythonFunction> = emptyList(),
    var isPublic: Boolean = true,
    var description: String = "",
    var fullDocstring: String = "",
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    var originalClass: OriginalPythonClass? = null
) : MutablePythonDeclaration() {

    var constructor by ContainmentReference(constructor)
    val attributes = MutableContainmentList(attributes)
    val methods = MutableContainmentList(methods)

    override fun children() = sequence {
        yieldAll(attributes)
        yieldAll(methods)
    }
}

class MutablePythonConstructor(
    parameters: List<MutablePythonParameter> = emptyList(),
    val callToOriginalAPI: OriginalPythonFunction? = null
) : MutablePythonAstNode() {

    val parameters = MutableContainmentList(parameters)

    override fun children() = sequence {
        yieldAll(parameters)
    }
}

data class OriginalPythonClass(val qualifiedName: String)

class MutablePythonEnum(
    override var name: String,
    instances: List<MutablePythonEnumInstance> = emptyList(),
    var description: String = "",
    override val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : MutablePythonDeclaration() {

    val instances = MutableContainmentList(instances)
}

data class MutablePythonEnumInstance(
    override var name: String,
    val value: String = name,
    var description: String = "",
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
    var originalFunction: OriginalPythonFunction? = null
) : MutablePythonDeclaration() {

    val parameters = MutableContainmentList(parameters)
    val results = MutableContainmentList(results)

    override fun children() = sequence {
        yieldAll(parameters)
        yieldAll(results)
    }

    fun isMethod() = parent is MutablePythonClass
    fun isStaticMethod() = isMethod() && "staticmethod" in decorators
}

data class OriginalPythonFunction(
    val qualifiedName: String,
    val parameters: List<OriginalPythonParameter> = emptyList()
)

data class MutablePythonAttribute(
    override var name: String,
    var defaultValue: String? = null,
    var isPublic: Boolean = true,
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
) : MutablePythonDeclaration()

data class MutablePythonParameter(
    override var name: String,
    var defaultValue: String? = null,
    var assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    var originalParameter: OriginalPythonParameter? = null
) : MutablePythonDeclaration() {

    fun isRequired() = defaultValue == null

    fun isOptional() = defaultValue != null
}

data class OriginalPythonParameter(
    val name: String,
    val assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME
)

data class MutablePythonResult(
    override var name: String,
    var type: String = "",
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
) : MutablePythonDeclaration()
