package com.larsreimann.api_editor.transformation.processing_exceptions

class ConflictingEnumException(enumName: String, moduleName: String) :
    Exception(
        "'"
            + enumName.replaceFirstChar { firstChar -> firstChar.uppercase() }
            + "' already exists in module '"
            + moduleName
            + "' with conflicting instances."
    )
