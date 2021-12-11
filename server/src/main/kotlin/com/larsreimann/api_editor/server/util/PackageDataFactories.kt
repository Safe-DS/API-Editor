package com.larsreimann.api_editor.server.util

import com.larsreimann.api_editor.server.data.AnnotatedPythonClass
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction
import com.larsreimann.api_editor.server.data.AnnotatedPythonModule
import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter
import com.larsreimann.api_editor.server.data.AnnotatedPythonResult
import com.larsreimann.api_editor.server.data.EditorAnnotation
import com.larsreimann.api_editor.server.data.PythonFromImport
import com.larsreimann.api_editor.server.data.PythonImport
import com.larsreimann.api_editor.server.data.PythonParameterAssignment

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
    annotations: MutableList<EditorAnnotation> = mutableListOf()
): AnnotatedPythonClass {

    return AnnotatedPythonClass(
        name,
        qualifiedName,
        decorators,
        superclasses,
        methods,
        description,
        fullDocstring,
        annotations
    )
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
    annotations: MutableList<EditorAnnotation> = mutableListOf()
): AnnotatedPythonFunction {

    return AnnotatedPythonFunction(
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
    annotations: MutableList<EditorAnnotation> = mutableListOf()
): AnnotatedPythonParameter {

    return AnnotatedPythonParameter(
        name,
        qualifiedName,
        defaultValue,
        assignedBy,
        isPublic,
        typeInDocs,
        description,
        annotations
    )
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
    return AnnotatedPythonClass(
        name = pythonClass.name,
        qualifiedName = pythonClass.qualifiedName,
        decorators = pythonClass.decorators.toMutableList(),
        superclasses = pythonClass.superclasses.toMutableList(),
        methods = mutableListOf(),
        description = pythonClass.description,
        fullDocstring = pythonClass.fullDocstring,
        annotations = pythonClass.annotations.toMutableList()
    )
}

fun createFunctionCopy(
    pythonFunction: AnnotatedPythonFunction
): AnnotatedPythonFunction {
    return AnnotatedPythonFunction(
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
}
