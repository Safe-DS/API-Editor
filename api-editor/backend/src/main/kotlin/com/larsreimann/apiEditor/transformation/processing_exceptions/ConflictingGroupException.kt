package com.larsreimann.apiEditor.transformation.processing_exceptions

class ConflictingGroupException(groupName: String, moduleName: String, qualifiedFunctionName: String) :
    Exception(
        "Group '" +
            groupName.replaceFirstChar { firstChar -> firstChar.uppercase() } +
            "' for function '" +
            qualifiedFunctionName +
            "' already exists in module '" +
            moduleName +
            "' with conflicting instances."
    )
