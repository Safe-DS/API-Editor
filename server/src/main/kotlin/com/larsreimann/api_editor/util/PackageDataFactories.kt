package com.larsreimann.api_editor.util

import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonModule
import com.larsreimann.api_editor.model.AnnotatedPythonPackage
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.AnnotatedPythonResult
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment

@JvmOverloads
fun createAnnotatedPythonPackage(
    name: String,
    distribution: String = "testDistribution",
    version: String = "1.0.0",
    modules: List<AnnotatedPythonModule> = mutableListOf(),
    annotations: MutableList<EditorAnnotation> = mutableListOf()
): AnnotatedPythonPackage {

    return AnnotatedPythonPackage(
        distribution,
        name,
        version,
        modules,
        annotations
    )
}

@JvmOverloads
fun createAnnotatedPythonModule(
    name: String,
    imports: List<PythonImport> = emptyList(),
    fromImports: List<PythonFromImport> = emptyList(),
    classes: List<AnnotatedPythonClass> = mutableListOf(),
    functions: List<AnnotatedPythonFunction> = mutableListOf(),
    annotations: MutableList<EditorAnnotation> = mutableListOf()
): AnnotatedPythonModule {

    return AnnotatedPythonModule(
        name,
        imports,
        fromImports,
        classes,
        functions,
        annotations
    )
}

@JvmOverloads
fun createAnnotatedPythonClass(
    name: String,
    qualifiedName: String = name,
    decorators: List<String> = emptyList(),
    superclasses: List<String> = emptyList(),
    methods: List<AnnotatedPythonFunction> = mutableListOf(),
    description: String = "",
    fullDocstring: String = "",
    annotations: MutableList<EditorAnnotation> = mutableListOf(),
    originalDeclaration: AnnotatedPythonClass? = null
): AnnotatedPythonClass {
    val newPythonClass = AnnotatedPythonClass(
        name,
        qualifiedName,
        decorators,
        superclasses,
        methods,
        description,
        fullDocstring,
        annotations
    )
    newPythonClass.originalDeclaration = originalDeclaration
    return newPythonClass
}

@JvmOverloads
fun createAnnotatedPythonFunction(
    name: String,
    qualifiedName: String = name,
    decorators: List<String> = emptyList(),
    parameters: List<AnnotatedPythonParameter> = mutableListOf(),
    results: List<AnnotatedPythonResult> = emptyList(),
    isPublic: Boolean = true,
    description: String = "",
    fullDocstring: String = "",
    annotations: MutableList<EditorAnnotation> = mutableListOf(),
    originalDeclaration: AnnotatedPythonFunction? = null
): AnnotatedPythonFunction {
    val pythonFunction = AnnotatedPythonFunction(
        name,
        qualifiedName,
        decorators,
        parameters,
        results,
        isPublic,
        description,
        fullDocstring,
        annotations
    )
    pythonFunction.originalDeclaration = originalDeclaration
    return pythonFunction
}

@JvmOverloads
fun createAnnotatedPythonParameter(
    name: String,
    qualifiedName: String = name,
    defaultValue: String? = "",
    assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
    isPublic: Boolean = true,
    typeInDocs: String = "",
    description: String = "",
    annotations: MutableList<EditorAnnotation> = mutableListOf(),
    originalDeclaration: AnnotatedPythonParameter? = null
): AnnotatedPythonParameter {
    val pythonParameter = AnnotatedPythonParameter(
        name,
        qualifiedName,
        defaultValue,
        assignedBy,
        isPublic,
        typeInDocs,
        description,
        annotations
    )
    pythonParameter.originalDeclaration = originalDeclaration
    return pythonParameter
}

fun createPackageCopyWithoutModules(
    pythonPackage: AnnotatedPythonPackage
): AnnotatedPythonPackage {
    return AnnotatedPythonPackage(
        name = pythonPackage.name,
        distribution = pythonPackage.distribution,
        version = pythonPackage.version,
        modules = mutableListOf(),
        annotations = pythonPackage.annotations.toMutableList()
    )
}

fun createModuleCopyWithoutClassesAndFunctions(
    pythonModule: AnnotatedPythonModule
): AnnotatedPythonModule {
    return AnnotatedPythonModule(
        name = pythonModule.name,
        imports = pythonModule.imports.toMutableList(),
        fromImports = pythonModule.fromImports.toMutableList(),
        classes = mutableListOf(),
        functions = mutableListOf(),
        annotations = pythonModule.annotations.toMutableList()
    )
}

fun createClassCopyWithoutFunctions(
    pythonClass: AnnotatedPythonClass
): AnnotatedPythonClass {
    val newPythonClass = AnnotatedPythonClass(
        name = pythonClass.name,
        qualifiedName = pythonClass.qualifiedName,
        decorators = pythonClass.decorators.toMutableList(),
        superclasses = pythonClass.superclasses.toMutableList(),
        methods = mutableListOf(),
        description = pythonClass.description,
        fullDocstring = pythonClass.fullDocstring,
        annotations = pythonClass.annotations.toMutableList()
    )
    newPythonClass.originalDeclaration = pythonClass.originalDeclaration?.copy()
    return newPythonClass
}

fun createFunctionCopy(
    pythonFunction: AnnotatedPythonFunction
): AnnotatedPythonFunction {
    val newPythonFunction = AnnotatedPythonFunction(
        name = pythonFunction.name,
        qualifiedName = pythonFunction.qualifiedName,
        decorators = pythonFunction.decorators,
        parameters = pythonFunction.parameters.toMutableList(),
        results = pythonFunction.results.toMutableList(),
        isPublic = pythonFunction.isPublic,
        description = pythonFunction.description,
        fullDocstring = pythonFunction.fullDocstring,
        annotations = pythonFunction.annotations.toMutableList()
    )
    newPythonFunction.originalDeclaration = pythonFunction.originalDeclaration?.copy()
    return newPythonFunction
}
