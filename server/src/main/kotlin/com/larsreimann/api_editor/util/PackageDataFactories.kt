package com.larsreimann.api_editor.util

import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.PythonFromImport
import com.larsreimann.api_editor.model.PythonImport
import com.larsreimann.api_editor.model.PythonParameterAssignment
import com.larsreimann.api_editor.model.SerializablePythonAttribute
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.model.SerializablePythonResult

@JvmOverloads
fun createPythonPackage(
    name: String,
    distribution: String = "testDistribution",
    version: String = "1.0.0",
    modules: List<SerializablePythonModule> = mutableListOf(),
    annotations: MutableList<EditorAnnotation> = mutableListOf()
): SerializablePythonPackage {

    return SerializablePythonPackage(
        distribution,
        name,
        version,
        modules.toMutableList(),
        annotations
    )
}

@JvmOverloads
fun createPythonModule(
    name: String,
    imports: List<PythonImport> = emptyList(),
    fromImports: List<PythonFromImport> = emptyList(),
    classes: List<SerializablePythonClass> = mutableListOf(),
    functions: List<SerializablePythonFunction> = mutableListOf(),
    annotations: MutableList<EditorAnnotation> = mutableListOf()
): SerializablePythonModule {

    return SerializablePythonModule(
        name,
        imports,
        fromImports,
        classes.toMutableList(),
        functions.toMutableList(),
        annotations
    )
}

@JvmOverloads
fun createPythonClass(
    name: String,
    qualifiedName: String = name,
    decorators: List<String> = emptyList(),
    superclasses: List<String> = emptyList(),
    attributes: List<SerializablePythonAttribute> = mutableListOf(),
    methods: List<SerializablePythonFunction> = mutableListOf(),
    isPublic: Boolean = true,
    description: String = "",
    fullDocstring: String = "",
    annotations: MutableList<EditorAnnotation> = mutableListOf(),
    originalDeclaration: SerializablePythonClass? = null
): SerializablePythonClass {
    val newPythonClass = SerializablePythonClass(
        name,
        qualifiedName,
        decorators,
        superclasses,
        methods.toMutableList(),
        isPublic,
        description,
        fullDocstring,
        annotations
    )
    newPythonClass.attributes += attributes
    newPythonClass.originalDeclaration = originalDeclaration
    return newPythonClass
}

@JvmOverloads
fun createPythonAttribute(
    name: String,
    qualifiedName: String = name,
    defaultValue: String? = null,
    isPublic: Boolean = true,
    typeInDocs: String = "",
    description: String = "",
    annotations: MutableList<EditorAnnotation> = mutableListOf(),
    originalDeclaration: SerializablePythonAttribute? = null,
): SerializablePythonAttribute {
    val result = SerializablePythonAttribute(
        name,
        qualifiedName,
        defaultValue,
        isPublic,
        typeInDocs,
        description,
        annotations
    )
    result.originalDeclaration = originalDeclaration
    return result
}

@JvmOverloads
fun createPythonFunction(
    name: String,
    qualifiedName: String = name,
    decorators: List<String> = emptyList(),
    parameters: List<SerializablePythonParameter> = mutableListOf(),
    results: List<SerializablePythonResult> = emptyList(),
    isPublic: Boolean = true,
    description: String = "",
    fullDocstring: String = "",
    annotations: MutableList<EditorAnnotation> = mutableListOf(),
    originalDeclaration: SerializablePythonFunction? = null
): SerializablePythonFunction {
    val pythonFunction = SerializablePythonFunction(
        name,
        qualifiedName,
        decorators,
        parameters.toMutableList(),
        results.toMutableList(),
        isPublic,
        description,
        fullDocstring,
        annotations
    )
    pythonFunction.originalDeclaration = originalDeclaration
    return pythonFunction
}

@JvmOverloads
fun createPythonParameter(
    name: String,
    qualifiedName: String = name,
    defaultValue: String? = "",
    assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
    isPublic: Boolean = true,
    typeInDocs: String = "",
    description: String = "",
    annotations: MutableList<EditorAnnotation> = mutableListOf(),
    originalDeclaration: SerializablePythonParameter? = null
): SerializablePythonParameter {
    val pythonParameter = SerializablePythonParameter(
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
    pythonPackage: SerializablePythonPackage
): SerializablePythonPackage {
    return SerializablePythonPackage(
        name = pythonPackage.name,
        distribution = pythonPackage.distribution,
        version = pythonPackage.version,
        modules = mutableListOf(),
        annotations = pythonPackage.annotations.toMutableList()
    )
}

fun createModuleCopyWithoutClassesAndFunctions(
    pythonModule: SerializablePythonModule
): SerializablePythonModule {
    return SerializablePythonModule(
        name = pythonModule.name,
        imports = pythonModule.imports.toMutableList(),
        fromImports = pythonModule.fromImports.toMutableList(),
        classes = mutableListOf(),
        functions = mutableListOf(),
        annotations = pythonModule.annotations.toMutableList()
    )
}

fun createClassCopyWithoutFunctions(
    pythonClass: SerializablePythonClass
): SerializablePythonClass {
    val newPythonClass = SerializablePythonClass(
        name = pythonClass.name,
        qualifiedName = pythonClass.qualifiedName,
        decorators = pythonClass.decorators.toMutableList(),
        superclasses = pythonClass.superclasses.toMutableList(),
        methods = mutableListOf(),
        isPublic = pythonClass.isPublic,
        description = pythonClass.description,
        fullDocstring = pythonClass.fullDocstring,
        annotations = pythonClass.annotations.toMutableList()
    )
    newPythonClass.originalDeclaration = pythonClass.originalDeclaration?.copy()
    newPythonClass.attributes = pythonClass.attributes
    return newPythonClass
}

fun createFunctionCopy(
    pythonFunction: SerializablePythonFunction
): SerializablePythonFunction {
    val newPythonFunction = SerializablePythonFunction(
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
