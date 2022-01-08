package com.larsreimann.api_editor.transformation.processing_exceptions

class ConflictingEnumException(enumName: String, moduleName: String,qualifiedParameterName: String) :
    Exception(
        "Enum '" +
            enumName.replaceFirstChar { firstChar -> firstChar.uppercase() } +
            "' for parameter '" +
            qualifiedParameterName +
            "' already exists in module '" +
            moduleName +
            "' with conflicting instances."
    )
