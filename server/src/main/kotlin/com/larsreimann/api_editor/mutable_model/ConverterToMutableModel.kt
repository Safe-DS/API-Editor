package com.larsreimann.api_editor.mutable_model

import com.larsreimann.api_editor.model.AnnotatedPythonAttribute
import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonEnum
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonModule
import com.larsreimann.api_editor.model.AnnotatedPythonPackage
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult

fun convertPackage(pythonPackage: AnnotatedPythonPackage): MutablePythonPackage {
    return MutablePythonPackage(
        distribution = pythonPackage.distribution,
        name = pythonPackage.name,
        version = pythonPackage.version,
        modules = pythonPackage.modules.map { convertModule(it) },
        annotations = pythonPackage.annotations
    )
}

fun convertModule(pythonModule: AnnotatedPythonModule): MutablePythonModule {
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

fun convertClass(pythonClass: AnnotatedPythonClass): MutablePythonClass {
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

fun convertEnum(pythonEnum: AnnotatedPythonEnum): MutablePythonEnum {
    return MutablePythonEnum(
        name = pythonEnum.name,
        instances = pythonEnum.instances.toMutableList(),
        annotations = pythonEnum.annotations
    )
}

fun convertFunction(pythonFunction: AnnotatedPythonFunction): MutablePythonFunction {
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

fun convertAttribute(pythonAttribute: AnnotatedPythonAttribute): MutablePythonAttribute {
    return MutablePythonAttribute(
        name = pythonAttribute.name,
        defaultValue = pythonAttribute.defaultValue,
        isPublic = pythonAttribute.isPublic,
        typeInDocs = pythonAttribute.typeInDocs,
        description = pythonAttribute.description,
        boundary = pythonAttribute.boundary,
        annotations = pythonAttribute.annotations
    )
}

fun convertParameter(pythonParameter: AnnotatedPythonParameter): MutablePythonParameter {
    return MutablePythonParameter(
        name = pythonParameter.name,
        defaultValue = pythonParameter.defaultValue,
        assignedBy = pythonParameter.assignedBy,
        isPublic = pythonParameter.isPublic,
        typeInDocs = pythonParameter.typeInDocs,
        description = pythonParameter.description,
        boundary = pythonParameter.boundary,
        annotations = pythonParameter.annotations
    )
}

fun convertResult(pythonResult: AnnotatedPythonResult): MutablePythonResult {
    return MutablePythonResult(
        name = pythonResult.name,
        type = pythonResult.type,
        typeInDocs = pythonResult.typeInDocs,
        description = pythonResult.description,
        boundary = pythonResult.boundary,
        annotations = pythonResult.annotations
    )
}
