package com.larsreimann.api_editor.mutable_model

import com.larsreimann.api_editor.model.AnnotatedPythonAttribute
import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonEnum
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonModule
import com.larsreimann.api_editor.model.AnnotatedPythonPackage
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult

fun convertPackage(pythonPackage: MutablePythonPackage): AnnotatedPythonPackage {
    return AnnotatedPythonPackage(
        distribution = pythonPackage.distribution,
        name = pythonPackage.name,
        version = pythonPackage.version,
        modules = pythonPackage.modules.map { convertModule(it) },
        annotations = pythonPackage.annotations
    )
}

fun convertModule(pythonModule: MutablePythonModule): AnnotatedPythonModule {
    val result = AnnotatedPythonModule(
        name = pythonModule.name,
        imports = pythonModule.imports,
        fromImports = pythonModule.fromImports,
        classes = pythonModule.classes.map { convertClass(it) },
        functions = pythonModule.functions.map { convertFunction(it) },
        annotations = pythonModule.annotations
    )
    result.enums += pythonModule.enums.map { convertEnum(it) }
    return result
}

fun convertClass(pythonClass: MutablePythonClass): AnnotatedPythonClass {
    val result = AnnotatedPythonClass(
        name = pythonClass.name,
        qualifiedName = pythonClass.qualifiedName(),
        decorators = pythonClass.decorators,
        superclasses = pythonClass.superclasses,
        methods = pythonClass.methods.map { convertFunction(it) },
        isPublic = pythonClass.isPublic,
        description = pythonClass.description,
        fullDocstring = pythonClass.fullDocstring,
        annotations = pythonClass.annotations
    )
    result.attributes += pythonClass.attributes.map { convertAttribute(it) }
    return result
}

fun convertEnum(pythonEnum: MutablePythonEnum): AnnotatedPythonEnum {
    return AnnotatedPythonEnum(
        name = pythonEnum.name,
        instances = pythonEnum.instances,
        annotations = pythonEnum.annotations
    )
}

fun convertFunction(pythonFunction: MutablePythonFunction): AnnotatedPythonFunction {
    val result = AnnotatedPythonFunction(
        name = pythonFunction.name,
        qualifiedName = pythonFunction.qualifiedName(),
        decorators = pythonFunction.decorators,
        parameters = pythonFunction.parameters.map { convertParameter(it) },
        results = pythonFunction.results.map { convertResult(it) },
        isPublic = pythonFunction.isPublic,
        description = pythonFunction.description,
        fullDocstring = pythonFunction.fullDocstring,
        annotations = pythonFunction.annotations,
    )
//    result.originalDeclaration = originalDeclaration
//    result.calledAfter += pythonFunction.calledAfter
    result.isPure = pythonFunction.isPure
    return result
}

fun convertAttribute(pythonAttribute: MutablePythonAttribute): AnnotatedPythonAttribute {
    val result = AnnotatedPythonAttribute(
        name = pythonAttribute.name,
        qualifiedName = pythonAttribute.qualifiedName(),
        defaultValue = pythonAttribute.defaultValue,
        isPublic = pythonAttribute.isPublic,
        typeInDocs = pythonAttribute.typeInDocs,
        description = pythonAttribute.description,
        annotations = pythonAttribute.annotations
    )
//    result.originalDeclaration = originalDeclaration
    result.boundary = pythonAttribute.boundary
    return result
}

fun convertParameter(pythonParameter: MutablePythonParameter): AnnotatedPythonParameter {
    val result = AnnotatedPythonParameter(
        name = pythonParameter.name,
        qualifiedName = pythonParameter.qualifiedName(),
        defaultValue = pythonParameter.defaultValue,
        assignedBy = pythonParameter.assignedBy,
        isPublic = pythonParameter.isPublic,
        typeInDocs = pythonParameter.typeInDocs,
        description = pythonParameter.description,
        annotations = pythonParameter.annotations
    )
//    result.originalDeclaration = originalDeclaration
    result.boundary = pythonParameter.boundary
    return result
}

fun convertResult(pythonResult: MutablePythonResult): AnnotatedPythonResult {
    val result = AnnotatedPythonResult(
        name = pythonResult.name,
        type = pythonResult.type,
        typeInDocs = pythonResult.typeInDocs,
        description = pythonResult.description,
        annotations = pythonResult.annotations
    )
    result.boundary = pythonResult.boundary
    return result
}
