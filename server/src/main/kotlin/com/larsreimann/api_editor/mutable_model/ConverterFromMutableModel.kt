package com.larsreimann.api_editor.mutable_model

import com.larsreimann.api_editor.model.SerializablePythonAttribute
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonEnum
import com.larsreimann.api_editor.model.SerializablePythonEnumInstance
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult

fun convertPackage(pythonPackage: PythonPackage): SerializablePythonPackage {
    return SerializablePythonPackage(
        distribution = pythonPackage.distribution,
        name = pythonPackage.name,
        version = pythonPackage.version,
        modules = pythonPackage.modules.map { convertModule(it) }.toMutableList(),
        annotations = pythonPackage.annotations
    )
}

fun convertModule(pythonModule: PythonModule): SerializablePythonModule {
    val result = SerializablePythonModule(
        name = pythonModule.name,
        imports = pythonModule.imports,
        fromImports = pythonModule.fromImports,
        classes = pythonModule.classes.map { convertClass(it) }.toMutableList(),
        functions = pythonModule.functions.map { convertFunction(it) }.toMutableList(),
        annotations = pythonModule.annotations
    )
    result.enums += pythonModule.enums.map { convertEnum(it) }
    return result
}

fun convertClass(pythonClass: PythonClass): SerializablePythonClass {
    val result = SerializablePythonClass(
        name = pythonClass.name,
        qualifiedName = pythonClass.qualifiedName(),
        decorators = pythonClass.decorators,
        superclasses = pythonClass.superclasses,
        methods = pythonClass.methods.map { convertFunction(it) }.toMutableList(),
        isPublic = pythonClass.isPublic,
        description = pythonClass.description,
        fullDocstring = pythonClass.fullDocstring,
        annotations = pythonClass.annotations
    )
    result.attributes += pythonClass.attributes.map { convertAttribute(it) }
    return result
}

fun convertEnum(pythonEnum: PythonEnum): SerializablePythonEnum {
    return SerializablePythonEnum(
        name = pythonEnum.name,
        instances = pythonEnum.instances.map { convertEnumInstance(it) }.toMutableList(),
        annotations = pythonEnum.annotations
    )
}

fun convertEnumInstance(pythonEnumInstance: PythonEnumInstance): SerializablePythonEnumInstance {
    val instance = SerializablePythonEnumInstance(
        name = pythonEnumInstance.name,
        value = pythonEnumInstance.value
    )
    instance.description = pythonEnumInstance.description
    return instance
}

fun convertFunction(pythonFunction: PythonFunction): SerializablePythonFunction {
    val result = SerializablePythonFunction(
        name = pythonFunction.name,
        qualifiedName = pythonFunction.qualifiedName(),
        decorators = pythonFunction.decorators,
        parameters = pythonFunction.parameters.map { convertParameter(it) }.toMutableList(),
        results = pythonFunction.results.map { convertResult(it) }.toMutableList(),
        isPublic = pythonFunction.isPublic,
        description = pythonFunction.description,
        fullDocstring = pythonFunction.fullDocstring,
        annotations = pythonFunction.annotations,
    )
    result.calledAfter += pythonFunction.calledAfter
    result.isPure = pythonFunction.isPure
    return result
}

fun convertAttribute(pythonAttribute: PythonAttribute): SerializablePythonAttribute {
    val result = SerializablePythonAttribute(
        name = pythonAttribute.name,
        qualifiedName = pythonAttribute.qualifiedName(),
        defaultValue = pythonAttribute.value,
        isPublic = pythonAttribute.isPublic,
        typeInDocs = pythonAttribute.typeInDocs,
        description = pythonAttribute.description,
        annotations = pythonAttribute.annotations
    )
    result.boundary = pythonAttribute.boundary
    return result
}

fun convertParameter(pythonParameter: PythonParameter): SerializablePythonParameter {
    val result = SerializablePythonParameter(
        name = pythonParameter.name,
        qualifiedName = pythonParameter.qualifiedName(),
        defaultValue = pythonParameter.defaultValue,
        assignedBy = pythonParameter.assignedBy,
        isPublic = true,
        typeInDocs = pythonParameter.typeInDocs,
        description = pythonParameter.description,
        annotations = pythonParameter.annotations
    )
    result.boundary = pythonParameter.boundary
    return result
}

fun convertResult(pythonResult: PythonResult): SerializablePythonResult {
    val result = SerializablePythonResult(
        name = pythonResult.name,
        type = pythonResult.type,
        typeInDocs = pythonResult.typeInDocs,
        description = pythonResult.description,
        annotations = pythonResult.annotations
    )
    result.boundary = pythonResult.boundary
    return result
}
