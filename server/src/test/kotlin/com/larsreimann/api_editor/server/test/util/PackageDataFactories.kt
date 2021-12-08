package com.larsreimann.api_editor.server.test.util

import com.larsreimann.api_editor.server.data.AnnotatedPythonClass
import com.larsreimann.api_editor.server.data.AnnotatedPythonFunction
import com.larsreimann.api_editor.server.data.AnnotatedPythonModule
import com.larsreimann.api_editor.server.data.AnnotatedPythonPackage
import com.larsreimann.api_editor.server.data.AnnotatedPythonParameter
import com.larsreimann.api_editor.server.data.AnnotatedPythonResult
import com.larsreimann.api_editor.server.data.EditorAnnotation
import com.larsreimann.api_editor.server.data.PythonFromImport
import com.larsreimann.api_editor.server.data.PythonImport

@JvmOverloads
fun createAnnotatedPythonPackage(
    name: String,
    distribution: String = "testDistribution",
    version: String = "1.0.0",
    modules: List<AnnotatedPythonModule> = emptyList(),
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
    classes: List<AnnotatedPythonClass> = emptyList(),
    functions: List<AnnotatedPythonFunction> = emptyList(),
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
    methods: List<AnnotatedPythonFunction> = emptyList(),
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
    parameters: List<AnnotatedPythonParameter> = emptyList(),
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
