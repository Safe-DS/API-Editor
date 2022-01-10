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

fun convertPackage(pythonPackage: SerializablePythonPackage): PythonPackage {
    return PythonPackage(
        distribution = pythonPackage.distribution,
        name = pythonPackage.name,
        version = pythonPackage.version,
        modules = pythonPackage.modules.map { convertModule(it) },
        annotations = pythonPackage.annotations
    )
}

fun convertModule(pythonModule: SerializablePythonModule): PythonModule {
    return PythonModule(
        name = pythonModule.name,
        imports = pythonModule.imports.toMutableList(),
        fromImports = pythonModule.fromImports.toMutableList(),
        classes = pythonModule.classes.map { convertClass(it) },
        enums = pythonModule.enums.map { convertEnum(it) },
        functions = pythonModule.functions.map { convertFunction(it) },
        annotations = pythonModule.annotations
    )
}

fun convertClass(pythonClass: SerializablePythonClass): PythonClass {
    return PythonClass(
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

fun convertEnum(pythonEnum: SerializablePythonEnum): PythonEnum {
    return PythonEnum(
        name = pythonEnum.name,
        instances = pythonEnum.instances.map { convertEnumInstance(it) }.toMutableList(),
        annotations = pythonEnum.annotations
    )
}

fun convertEnumInstance(pythonEnumInstance: SerializablePythonEnumInstance): PythonEnumInstance {
    return PythonEnumInstance(
        name = pythonEnumInstance.name,
        value = pythonEnumInstance.value,
        description = pythonEnumInstance.description,
        annotations = mutableListOf()
    )
}

fun convertFunction(pythonFunction: SerializablePythonFunction): PythonFunction {
    return PythonFunction(
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

fun convertAttribute(pythonAttribute: SerializablePythonAttribute): PythonAttribute {
    return PythonAttribute(
        name = pythonAttribute.name,
        type = PythonStringifiedType(pythonAttribute.typeInDocs),
        value = pythonAttribute.defaultValue,
        isPublic = pythonAttribute.isPublic,
        description = pythonAttribute.description,
        boundary = pythonAttribute.boundary,
        annotations = pythonAttribute.annotations,
    )
}

fun convertParameter(pythonParameter: SerializablePythonParameter): PythonParameter {
    return PythonParameter(
        name = pythonParameter.name,
        type = PythonStringifiedType(pythonParameter.typeInDocs),
        defaultValue = pythonParameter.defaultValue,
        assignedBy = pythonParameter.assignedBy,
        description = pythonParameter.description,
        boundary = pythonParameter.boundary,
        annotations = pythonParameter.annotations,
    )
}

fun convertResult(pythonResult: SerializablePythonResult): PythonResult {
    return PythonResult(
        name = pythonResult.name,
        type = PythonStringifiedType(pythonResult.type),
        description = pythonResult.description,
        boundary = pythonResult.boundary,
        annotations = pythonResult.annotations,
    )
}
