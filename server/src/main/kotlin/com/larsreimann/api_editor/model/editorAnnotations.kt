package com.larsreimann.api_editor.model

import com.larsreimann.api_editor.model.AnnotationTarget.CLASS
import com.larsreimann.api_editor.model.AnnotationTarget.CONSTRUCTOR_PARAMETER
import com.larsreimann.api_editor.model.AnnotationTarget.FUNCTION_PARAMETER
import com.larsreimann.api_editor.model.AnnotationTarget.GLOBAL_FUNCTION
import com.larsreimann.api_editor.model.AnnotationTarget.METHOD
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@Serializable
sealed class EditorAnnotation {
    protected abstract val validTargets: Set<AnnotationTarget>

    val type: String
        get() {
            return this::class.simpleName?.removeSuffix("Annotation") ?: ""
        }

    fun isApplicableTo(target: AnnotationTarget) = target in validTargets
}

@Serializable
data class AttributeAnnotation(val defaultValue: DefaultValue) : EditorAnnotation() {

    @Transient
    override val validTargets = setOf(CONSTRUCTOR_PARAMETER)
}

@Serializable
data class BoundaryAnnotation(
    val isDiscrete: Boolean,
    val lowerIntervalLimit: Double,
    val lowerLimitType: ComparisonOperator,
    val upperIntervalLimit: Double,
    val upperLimitType: ComparisonOperator
) : EditorAnnotation() {

    @Transient
    override val validTargets = PARAMETERS
}

enum class ComparisonOperator(val operator: String) {
    LESS_THAN_OR_EQUALS("<="),
    LESS_THAN("<"),
    UNRESTRICTED(""),
}

@Serializable
data class CalledAfterAnnotation(val calledAfterName: String) : EditorAnnotation() {

    @Transient
    override val validTargets = FUNCTIONS
}

@Serializable
data class ConstantAnnotation(val defaultValue: DefaultValue) : EditorAnnotation() {

    @Transient
    override val validTargets = PARAMETERS
}

@Serializable
data class EnumAnnotation(val enumName: String, val pairs: List<EnumPair>) : EditorAnnotation() {

    @Transient
    override val validTargets = PARAMETERS
}

@Serializable
data class EnumPair(val stringValue: String, val instanceName: String)

@Serializable
data class GroupAnnotation(val groupName: String, val parameters: List<String>) : EditorAnnotation() {

    @Transient
    override val validTargets = FUNCTIONS
}

@Serializable
data class MoveAnnotation(val destination: String) : EditorAnnotation() {

    @Transient
    override val validTargets = GLOBAL_DECLARATIONS
}

@Serializable
data class OptionalAnnotation(val defaultValue: DefaultValue) : EditorAnnotation() {

    @Transient
    override val validTargets = PARAMETERS
}

@Serializable
object PureAnnotation : EditorAnnotation() {

    @Transient
    override val validTargets = FUNCTIONS
}

@Serializable
data class RenameAnnotation(val newName: String) : EditorAnnotation() {

    @Transient
    override val validTargets = CLASSES.union(FUNCTIONS).union(PARAMETERS)
}

@Serializable
object RequiredAnnotation : EditorAnnotation() {

    @Transient
    override val validTargets = PARAMETERS
}

@Serializable
object UnusedAnnotation : EditorAnnotation() {

    @Transient
    override val validTargets = setOf(
        CLASS,
        GLOBAL_FUNCTION,
        METHOD
    )
}

@Serializable
sealed class DefaultValue

@Serializable
class DefaultBoolean(val value: Boolean) : DefaultValue() {
    override fun toString(): String {
        return "$value"
    }
}

@Serializable
class DefaultNumber(val value: Double) : DefaultValue() {
    override fun toString(): String {
        return "$value"
    }
}

@Serializable
class DefaultString(val value: String) : DefaultValue() {
    override fun toString(): String {
        return "'$value'"
    }
}

enum class AnnotationTarget(private val target: String) {
    CLASS("class"),
    GLOBAL_FUNCTION("global function"),
    METHOD("method"),
    CONSTRUCTOR_PARAMETER("constructor parameter"),
    FUNCTION_PARAMETER("function parameter");

    override fun toString(): String {
        return target
    }
}

val GLOBAL_DECLARATIONS = setOf(CLASS, GLOBAL_FUNCTION)
val CLASSES = setOf(CLASS)
val FUNCTIONS = setOf(GLOBAL_FUNCTION, METHOD)
val PARAMETERS = setOf(
    CONSTRUCTOR_PARAMETER,
    FUNCTION_PARAMETER
)
