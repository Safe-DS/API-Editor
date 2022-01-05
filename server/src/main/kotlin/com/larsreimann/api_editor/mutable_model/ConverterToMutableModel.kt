package com.larsreimann.api_editor.mutable_model

import com.larsreimann.api_editor.model.SerializablePythonAttribute
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonEnum
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult

fun convertPackage(pythonPackage: SerializablePythonPackage): MutablePythonPackage {
    return MutablePythonPackage(
        distribution = pythonPackage.distribution,
        name = pythonPackage.name,
        version = pythonPackage.version,
        modules = pythonPackage.modules.map { convertModule(it) },
        annotations = pythonPackage.annotations
    )
}

fun convertModule(pythonModule: SerializablePythonModule): MutablePythonModule {
    return MutablePythonModule(
        name = pythonModule.name,
        imports = pythonModule.imports.toMutableList(),
        fromImports = pythonModule.fromImports.toMutableList(),
        classes = pythonModule.classes.map { convertClass(it) },
        enums = pythonModule.enums.map { convertEnum(it) },
        functions = pythonModule.functions.map { convertFunction(it) },
        annotations = pythonModule.annotations
    )
}

fun convertClass(pythonClass: SerializablePythonClass): MutablePythonClass {
    return MutablePythonClass(
        name = pythonClass.name,
        decorators = pythonClass.decorators.toMutableList(),
        superclasses = pythonClass.superclasses.toMutableList(),
        attributes = pythonClass.attributes.map { convertAttribute(it) },
        methods = pythonClass.methods.map { convertFunction(it) },
        isPublic = pythonClass.isPublic,
        description = pythonClass.description,
        fullDocstring = pythonClass.fullDocstring,
        annotations = pythonClass.annotations
    )
}

fun convertEnum(pythonEnum: SerializablePythonEnum): MutablePythonEnum {
    return MutablePythonEnum(
        name = pythonEnum.name,
        instances = pythonEnum.instances.toMutableList(),
        annotations = pythonEnum.annotations
    )
}

fun convertFunction(pythonFunction: SerializablePythonFunction): MutablePythonFunction {
    return MutablePythonFunction(
        name = pythonFunction.name,
        decorators = pythonFunction.decorators.toMutableList(),
        parameters = pythonFunction.parameters.map { convertParameter(it) },
        results = pythonFunction.results.map { convertResult(it) },
        isPublic = pythonFunction.isPublic,
        description = pythonFunction.description,
        fullDocstring = pythonFunction.fullDocstring,
//        calledAfter = pythonFunction.calledAfter,
        isPure = pythonFunction.isPure,
        annotations = pythonFunction.annotations,
    )
}

fun convertAttribute(pythonAttribute: SerializablePythonAttribute): MutablePythonAttribute {
    return MutablePythonAttribute(
        name = pythonAttribute.name,
        defaultValue = pythonAttribute.defaultValue,
        isPublic = pythonAttribute.isPublic,
        typeInDocs = pythonAttribute.typeInDocs,
        description = pythonAttribute.description,
        boundary = pythonAttribute.boundary,
        annotations = pythonAttribute.annotations,
    )
}

fun convertParameter(pythonParameter: SerializablePythonParameter): MutablePythonParameter {
    return MutablePythonParameter(
        name = pythonParameter.name,
        defaultValue = pythonParameter.defaultValue,
        assignedBy = pythonParameter.assignedBy,
        typeInDocs = pythonParameter.typeInDocs,
        description = pythonParameter.description,
        boundary = pythonParameter.boundary,
        annotations = pythonParameter.annotations,
    )
}

fun convertResult(pythonResult: SerializablePythonResult): MutablePythonResult {
    return MutablePythonResult(
        name = pythonResult.name,
        type = pythonResult.type,
        typeInDocs = pythonResult.typeInDocs,
        description = pythonResult.description,
        boundary = pythonResult.boundary,
        annotations = pythonResult.annotations,
    )
}
