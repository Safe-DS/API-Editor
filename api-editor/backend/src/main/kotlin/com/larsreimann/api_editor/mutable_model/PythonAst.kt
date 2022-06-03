@file:Suppress("unused")

package com.larsreimann.api_editor.mutable_model

import com.larsreimann.api_editor.model.Boundary
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
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

class PythonAttribute(
    override var name: String,
    type: PythonType? = null,
    value: PythonExpression? = null,
    var isPublic: Boolean = true,
    var description: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
) : PythonDeclaration() {

    var type by ContainmentReference(type)
    var value by ContainmentReference(value)

    override fun children() = sequence {
        type?.let { yield(it) }
        value?.let { yield(it) }
    }
}

class PythonClass(
    override var name: String,
    val decorators: MutableList<String> = mutableListOf(),
    superclasses: MutableList<PythonType> = mutableListOf(),
    constructor: PythonConstructor? = null,
    attributes: List<PythonAttribute> = emptyList(),
    methods: List<PythonFunction> = emptyList(),
    var isPublic: Boolean = true,
    var description: String = "",
    var todo: String = "",
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
    var originalClass: OriginalPythonClass? = null
) : PythonDeclaration() {

    val superclasses = MutableContainmentList(superclasses)
    var constructor by ContainmentReference(constructor)
    val attributes = MutableContainmentList(attributes)
    val methods = MutableContainmentList(methods)

    override fun children() = sequence {
        yieldAll(superclasses)
        constructor?.let { yield(it) }
        yieldAll(attributes)
        yieldAll(methods)
    }
}

class PythonConstructor(
    parameters: List<PythonParameter> = emptyList(),
    val callToOriginalAPI: PythonCall? = null
) : PythonAstNode() {

    val parameters = MutableContainmentList(parameters)

    override fun children() = sequence {
        yieldAll(parameters)
    }
}

class PythonEnum(
    override var name: String,
    instances: List<PythonEnumInstance> = emptyList(),
    var description: String = "",
    override val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration() {

    val instances = MutableContainmentList(instances)

    override fun children() = sequence {
        yieldAll(instances)
    }
}

class PythonEnumInstance(
    override var name: String,
    value: PythonExpression = PythonString(name),
    var description: String = "",
    override val annotations: MutableList<EditorAnnotation> = mutableListOf()
) : PythonDeclaration() {

    var value by ContainmentReference(value)

    override fun children() = sequence {
        value?.let { yield(it) }
    }
}

class PythonFunction(
    override var name: String,
    val decorators: MutableList<String> = mutableListOf(),
    parameters: List<PythonParameter> = emptyList(),
    results: List<PythonResult> = emptyList(),
    var isPublic: Boolean = true,
    var description: String = "",
    var todo: String = "",
    var isPure: Boolean = false,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
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

class PythonParameter(
    override var name: String,
    type: PythonType? = null,
    defaultValue: PythonExpression? = null,
    var assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
    var description: String = "",
    var todo: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
) : PythonDeclaration() {

    var type by ContainmentReference(type)
    var defaultValue by ContainmentReference(defaultValue)

    override fun children() = sequence {
        type?.let { yield(it) }
        defaultValue?.let { yield(it) }
    }

    fun isRequired() = defaultValue == null

    fun isOptional() = defaultValue != null
}

class PythonResult(
    override var name: String,
    type: PythonType? = null,
    var description: String = "",
    var boundary: Boundary? = null,
    override val annotations: MutableList<EditorAnnotation> = mutableListOf(),
) : PythonDeclaration() {

    var type by ContainmentReference(type)

    override fun children() = sequence {
        type?.let { yield(it) }
    }
}

data class OriginalPythonClass(val qualifiedName: String)

/* ********************************************************************************************************************
 * Expressions
 * ********************************************************************************************************************/

sealed class PythonExpression : PythonAstNode()

class PythonCall(
    receiver: PythonExpression,
    arguments: List<PythonArgument> = emptyList()
) : PythonExpression() {

    var receiver by ContainmentReference(receiver)
    val arguments = MutableContainmentList(arguments)

    override fun children() = sequence {
        receiver?.let { yield(it) }
        yieldAll(arguments)
    }
}

sealed class PythonLiteral : PythonExpression()

data class PythonBoolean(val value: Boolean) : PythonLiteral()
data class PythonFloat(val value: Double) : PythonLiteral()
data class PythonInt(val value: Int) : PythonLiteral()
data class PythonString(val value: String) : PythonLiteral()
object PythonNone : PythonLiteral()

class PythonMemberAccess(
    receiver: PythonExpression,
    member: PythonReference
) : PythonExpression() {

    var receiver by ContainmentReference(receiver)
    var member by ContainmentReference(member)

    override fun children() = sequence {
        receiver?.let { yield(it) }
        member?.let { yield(it) }
    }
}

class PythonReference(declaration: PythonDeclaration) : PythonExpression() {
    var declaration by CrossReference(declaration)
}

data class PythonStringifiedExpression(val string: String) : PythonExpression()

/* ********************************************************************************************************************
 * Types
 * ********************************************************************************************************************/

sealed class PythonType : PythonAstNode() {
    abstract fun copy(): PythonType
}

class PythonNamedType(declaration: PythonDeclaration?) : PythonType() {
    var declaration by CrossReference(declaration)

    override fun copy(): PythonNamedType {
        return PythonNamedType(declaration)
    }
}

data class PythonStringifiedType(val string: String) : PythonType() {
    override fun copy(): PythonStringifiedType {
        return PythonStringifiedType(string)
    }
}

/* ********************************************************************************************************************
 * Other
 * ********************************************************************************************************************/

class PythonArgument(val name: String? = null, value: PythonExpression) : PythonAstNode() {
    var value by ContainmentReference(value)

    override fun children() = sequence {
        value?.let { yield(it) }
    }
}
