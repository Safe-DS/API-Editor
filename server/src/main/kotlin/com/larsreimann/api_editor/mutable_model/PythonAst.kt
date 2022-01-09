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

sealed class PythonAstNode : ModelNode()

/* ********************************************************************************************************************
 * Declarations
 * ********************************************************************************************************************/

sealed class PythonDeclaration : PythonAstNode() {

    abstract var name: String
    abstract val annotations: MutableList<EditorAnnotation>

    /**
     * Returns the qualified name of the declaration.
     */
    fun qualifiedName(): String {
        return ancestorsOrSelf()
            .filterIsInstance<PythonDeclaration>()
            .filterNot { it is PythonPackage }
            .toList()
            .asReversed()
            .joinToString(separator = ".") { it.name }
    }
}

class PythonPackage(
    var distribution: String,
    override var name: String,
    var version: String,
    modules: List<PythonModule> = emptyList(),
    override val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration() {

    val modules = MutableContainmentList(modules)

    override fun children() = sequence {
        yieldAll(modules)
    }
}

class PythonModule(
    override var name: String,
    val imports: MutableList<PythonImport> = mutableListOf(),
    val fromImports: MutableList<PythonFromImport> = mutableListOf(),
    classes: List<PythonClass> = emptyList(),
    enums: List<PythonEnum> = emptyList(),
    functions: List<PythonFunction> = emptyList(),
    override val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration() {

    val classes = MutableContainmentList(classes)
    val enums = MutableContainmentList(enums)
    val functions = MutableContainmentList(functions)

    override fun children() = sequence {
        yieldAll(classes)
        yieldAll(enums)
        yieldAll(functions)
    }
}

class PythonClass(
    override var name: String,
    val decorators: MutableList<String> = mutableListOf(),
    val superclasses: MutableList<String> = mutableListOf(),
    constructor: PythonConstructor? = null,
    attributes: List<PythonAttribute> = emptyList(),
    methods: List<PythonFunction> = emptyList(),
    var isPublic: Boolean = true,
    var description: String = "",
    var fullDocstring: String = "",
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    var originalClass: OriginalPythonClass? = null
) : PythonDeclaration() {

    var constructor by ContainmentReference(constructor)
    val attributes = MutableContainmentList(attributes)
    val methods = MutableContainmentList(methods)

    override fun children() = sequence {
        yieldAll(attributes)
        yieldAll(methods)
    }
}

class PythonConstructor(
    parameters: List<PythonParameter> = emptyList(),
    val callToOriginalAPI: OriginalPythonFunction? = null
) : PythonAstNode() {

    val parameters = MutableContainmentList(parameters)

    override fun children() = sequence {
        yieldAll(parameters)
    }
}

data class OriginalPythonClass(val qualifiedName: String)

class PythonEnum(
    override var name: String,
    instances: List<PythonEnumInstance> = emptyList(),
    var description: String = "",
    override val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration() {

    val instances = MutableContainmentList(instances)
}

data class PythonEnumInstance(
    override var name: String,
    val value: String = name,
    var description: String = "",
    override val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration()

class PythonFunction(
    override var name: String,
    val decorators: MutableList<String> = mutableListOf(),
    parameters: List<PythonParameter> = emptyList(),
    results: List<PythonResult> = emptyList(),
    var isPublic: Boolean = true,
    var description: String = "",
    var fullDocstring: String = "",
    var isPure: Boolean = false,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    val calledAfter: MutableList<SerializablePythonFunction> = mutableListOf(),
    var originalFunction: OriginalPythonFunction? = null,
    var callToOriginalAPI: PythonCall? = null
) : PythonDeclaration() {

    val parameters = MutableContainmentList(parameters)
    val results = MutableContainmentList(results)

    override fun children() = sequence {
        yieldAll(parameters)
        yieldAll(results)
    }

    fun isMethod() = parent is PythonClass
    fun isStaticMethod() = isMethod() && "staticmethod" in decorators
}

data class OriginalPythonFunction(
    val qualifiedName: String,
    val parameters: List<OriginalPythonParameter> = emptyList()
)

data class PythonAttribute(
    override var name: String,
    var defaultValue: String? = null,
    var isPublic: Boolean = true,
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
) : PythonDeclaration()

data class PythonParameter(
    override var name: String,
    var defaultValue: String? = null,
    var assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    var groupedParametersOldToNewName: MutableMap<String, String> = mutableMapOf(),
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    var originalParameter: OriginalPythonParameter? = null
) : PythonDeclaration() {

    fun isRequired() = defaultValue == null

    fun isOptional() = defaultValue != null
}

data class OriginalPythonParameter(
    val name: String,
    val assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME
)

data class PythonResult(
    override var name: String,
    var type: String = "",
    var typeInDocs: String = "",
    var description: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
) : PythonDeclaration()

/* ********************************************************************************************************************
 * Expressions
 * ********************************************************************************************************************/

sealed class PythonExpression: PythonAstNode()

class PythonCall(val receiver: String, arguments: List<PythonArgument> = emptyList()): PythonExpression() {
    val arguments = ContainmentList(arguments)

    override fun children() = sequence {
        yieldAll(arguments)
    }
}

class PythonArgument(val name: String? = null, value: PythonExpression): PythonAstNode() {
    var value by ContainmentReference(value)

    override fun children() = sequence {
        value?.let { yield(it) }
    }
}

class PythonReference(declaration: PythonDeclaration): PythonExpression() {
    var declaration by CrossReference(declaration)
}

sealed class PythonLiteral: PythonExpression()

data class PythonBoolean(val value: Boolean): PythonLiteral()
data class PythonFloat(val value: Double): PythonLiteral()
data class PythonInt(val value: Int): PythonLiteral()
data class PythonString(val value: String): PythonLiteral()
