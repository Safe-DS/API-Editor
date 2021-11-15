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
data class EnumAnnotation(val enumName: String, val pairs: List<EnumPair>) : EditorAnnotation()

@Serializable
data class EnumPair(val stringValue: String, val instanceName: String)

@Serializable
data class GroupAnnotation(val groupName: String, val parameters: List<String>) : EditorAnnotation()

@Serializable
data class MoveAnnotation(val destination: String) : EditorAnnotation()

@Serializable
data class OptionalAnnotation(val defaultValue: DefaultValue) : EditorAnnotation()

@Serializable
data class RenameAnnotation(val newName: String) : EditorAnnotation()

@Serializable
object RequiredAnnotation : EditorAnnotation()

@Serializable
object UnusedAnnotation : EditorAnnotation()

@Serializable
sealed class DefaultValue

@Serializable
class DefaultBoolean(val value: Boolean) : DefaultValue()

@Serializable
class DefaultNumber(val value: Double) : DefaultValue()

@Serializable
class DefaultString(val value: String) : DefaultValue()
