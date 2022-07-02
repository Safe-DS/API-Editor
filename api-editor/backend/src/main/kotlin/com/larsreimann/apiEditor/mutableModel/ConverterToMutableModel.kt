package com.larsreimann.apiEditor.mutableModel

import com.larsreimann.apiEditor.model.SerializablePythonAttribute
import com.larsreimann.apiEditor.model.SerializablePythonClass
import com.larsreimann.apiEditor.model.SerializablePythonEnum
import com.larsreimann.apiEditor.model.SerializablePythonEnumInstance
import com.larsreimann.apiEditor.model.SerializablePythonFunction
import com.larsreimann.apiEditor.model.SerializablePythonModule
import com.larsreimann.apiEditor.model.SerializablePythonPackage
import com.larsreimann.apiEditor.model.SerializablePythonParameter
import com.larsreimann.apiEditor.model.SerializablePythonResult

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
        superclasses = pythonClass.superclasses.map { PythonNamedType(PythonClass(name = it)) }.toMutableList(),
        attributes = pythonClass.attributes.map { convertAttribute(it) },
        methods = pythonClass.methods.map { convertFunction(it) },
        isPublic = pythonClass.isPublic,
        description = pythonClass.description,
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
        value = PythonStringifiedExpression(pythonEnumInstance.value),
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
        isPure = pythonFunction.isPure,
        annotations = pythonFunction.annotations,
    )
}

fun convertAttribute(pythonAttribute: SerializablePythonAttribute): PythonAttribute {
    return PythonAttribute(
        name = pythonAttribute.name,
        type = PythonStringifiedType(pythonAttribute.typeInDocs),
        value = pythonAttribute.defaultValue?.let { PythonStringifiedExpression(it) },
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
        defaultValue = pythonParameter.defaultValue?.let { PythonStringifiedExpression(it) },
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
