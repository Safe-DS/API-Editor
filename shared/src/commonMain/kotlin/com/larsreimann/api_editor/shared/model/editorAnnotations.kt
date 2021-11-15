@file:OptIn(kotlin.js.ExperimentalJsExport::class)
@file:JsExport

package com.larsreimann.api_editor.shared.model

import kotlinx.serialization.Serializable
import kotlin.js.JsExport

@Serializable
sealed class EditorAnnotation

@Serializable
data class AttributeAnnotation(val defaultValue: DefaultValue) : EditorAnnotation()

@Serializable
data class BoundaryAnnotation(
    val isDiscrete: Boolean,
    val lowerIntervalLimit: Double,
    val lowerLimitType: String,
    val upperIntervalLimit: Double,
    val upperLimitType: String
) : EditorAnnotation()

// TODO: should be an enum once they are supported by @JsExport
class ComparisonOperator {
    companion object {
        const val LESS_THAN_OR_EQUALS = "LESS_THAN_OR_EQUALS"
        const val LESS_THAN = "LESS_THAN"
        const val UNRESTRICTED = "UNRESTRICTED"
    }
}

@Serializable
data class CalledAfterAnnotation(val calledAfterName: String) : EditorAnnotation()

@Serializable
data class ConstantAnnotation(val defaultValue: DefaultValue) : EditorAnnotation()

@Serializable
data class EnumAnnotation(val enumName: String, val pairs: Array<EnumPair>) : EditorAnnotation() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false

        other as EnumAnnotation

        if (enumName != other.enumName) return false
        if (!pairs.contentEquals(other.pairs)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = enumName.hashCode()
        result = 31 * result + pairs.contentHashCode()
        return result
    }
}

@Serializable
data class EnumPair(val stringValue: String, val instanceName: String)

@Serializable
data class GroupAnnotation(val groupName: String, val parameters: Array<String>) : EditorAnnotation() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false

        other as GroupAnnotation

        if (groupName != other.groupName) return false
        if (!parameters.contentEquals(other.parameters)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = groupName.hashCode()
        result = 31 * result + parameters.contentHashCode()
        return result
    }
}

@Serializable
data class MoveAnnotation(val destination: String) : EditorAnnotation()

@Serializable
data class OptionalAnnotation(val defaultValue: DefaultValue) : EditorAnnotation()

@Serializable
data class RenameAnnotation(val newName: String) : EditorAnnotation()

// TODO: should be an object once they are properly supported by @JsExport
@Serializable
class RequiredAnnotation : EditorAnnotation() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false
        return true
    }

    override fun hashCode(): Int {
        return this::class.hashCode()
    }
}

// TODO: should be an object once they are properly supported by @JsExport
@Serializable
class UnusedAnnotation : EditorAnnotation() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false
        return true
    }

    override fun hashCode(): Int {
        return this::class.hashCode()
    }
}

@Serializable
sealed class DefaultValue

@Serializable
class DefaultBoolean(val value: Boolean) : DefaultValue()

@Serializable
class DefaultNumber(val value: Double) : DefaultValue()

@Serializable
class DefaultString(val value: String) : DefaultValue()
