package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataVisitor
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.MoveAnnotation
import com.larsreimann.api_editor.model.SerializablePythonAttribute
import com.larsreimann.api_editor.model.SerializablePythonClass
import com.larsreimann.api_editor.model.SerializablePythonFunction
import com.larsreimann.api_editor.model.SerializablePythonModule
import com.larsreimann.api_editor.model.SerializablePythonPackage
import com.larsreimann.api_editor.model.SerializablePythonParameter
import com.larsreimann.api_editor.util.createModuleCopyWithoutClassesAndFunctions
import com.larsreimann.api_editor.util.createPackageCopyWithoutModules
import com.larsreimann.api_editor.util.createPythonAttribute
import com.larsreimann.api_editor.util.createPythonClass
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonParameter

class MoveAnnotationProcessor : AbstractPackageDataVisitor() {
    var modifiedPackage: SerializablePythonPackage? = null
    private var currentModule: SerializablePythonModule? = null
    private var currentClass: SerializablePythonClass? = null
    private var currentFunction: SerializablePythonFunction? = null
    private val qualifiedNameGenerator = QualifiedNameGenerator()
    private var inFunction = false
    private var inClass = false
    private var inModule = false
    private var inPackage = false
    private var isFunctionMoved = false
    private var isClassMoved = false
    private var originalModuleName: String? = null
    var classesToAdd = mutableMapOf<String, MutableList<SerializablePythonClass>>()
    var functionsToAdd = mutableMapOf<String, MutableList<SerializablePythonFunction>>()
    private val PATH_SEPARATOR = "."

    override fun enterPythonPackage(pythonPackage: SerializablePythonPackage): Boolean {
        inPackage = true
        classesToAdd = mutableMapOf()
        functionsToAdd = mutableMapOf()
        modifiedPackage = createPackageCopyWithoutModules(pythonPackage)
        return true
    }

    override fun leavePythonPackage(pythonPackage: SerializablePythonPackage) {
        inPackage = false
        // add to existing modules
        for ((name, _, _, classes, functions) in modifiedPackage!!.modules) {
            if (classesToAdd[name] != null) {
                classes.addAll(classesToAdd[name]!!)
                classesToAdd.remove(name)
            }
            if (functionsToAdd[name] != null) {
                functions.addAll(functionsToAdd[name]!!)
                functionsToAdd.remove(name)
            }
        }
        // add to new modules
        var it = classesToAdd.keys.iterator()
        while (it.hasNext()) {
            val key = it.next()
            val pythonModuleToAdd = createPythonModule(key)
            pythonModuleToAdd.classes.addAll(classesToAdd[key]!!)
            if (functionsToAdd[key] != null) {
                pythonModuleToAdd.functions.addAll(functionsToAdd[key]!!)
                functionsToAdd.remove(key)
            }
            modifiedPackage!!.modules.add(pythonModuleToAdd)
            it.remove()
        }
        it = functionsToAdd.keys.iterator()
        while (it.hasNext()) {
            val key = it.next()
            val pythonModuleToAdd = createPythonModule(key)
            pythonModuleToAdd.functions.addAll(functionsToAdd[key]!!)
            modifiedPackage!!.modules.add(pythonModuleToAdd)
            it.remove()
        }
    }

    override fun enterPythonModule(pythonModule: SerializablePythonModule): Boolean {
        inModule = true
        qualifiedNameGenerator.currentModuleName = pythonModule.name
        currentModule = createModuleCopyWithoutClassesAndFunctions(pythonModule)
        if (inPackage) {
            modifiedPackage!!.modules.add(currentModule!!)
        }
        return true
    }

    override fun leavePythonModule(pythonModule: SerializablePythonModule) {
        inModule = false
    }

    override fun enterPythonClass(pythonClass: SerializablePythonClass): Boolean {
        inClass = true
        qualifiedNameGenerator.currentClassName = pythonClass.name
        var newModuleName: String? = null
        val annotations = mutableListOf<EditorAnnotation>()
        for (editorAnnotation in pythonClass.annotations) {
            if (editorAnnotation is MoveAnnotation) {
                isClassMoved = true
                originalModuleName = qualifiedNameGenerator.currentModuleName
                newModuleName = editorAnnotation.destination
                qualifiedNameGenerator.currentModuleName = newModuleName
            } else {
                annotations.add(editorAnnotation)
            }
        }
        currentClass = createPythonClass(
            qualifiedNameGenerator.currentClassName!!,
            qualifiedNameGenerator.qualifiedClassName,
            ArrayList(pythonClass.decorators),
            ArrayList(pythonClass.superclasses),
            ArrayList(),
            ArrayList(),
            pythonClass.isPublic,
            pythonClass.description,
            pythonClass.fullDocstring,
            annotations,
            pythonClass.originalDeclaration
        )
        if (isClassMoved) {
            addClassToAdd(newModuleName!!, currentClass!!)
        } else {
            currentModule!!.classes.add(currentClass!!)
        }
        return true
    }

    override fun enterPythonAttribute(pythonAttribute: SerializablePythonAttribute) {
        qualifiedNameGenerator.currentAttributeName = pythonAttribute.name
        val modifiedPythonAttribute = createPythonAttribute(
            qualifiedNameGenerator.currentAttributeName!!,
            qualifiedNameGenerator.qualifiedAttributeName,
            pythonAttribute.defaultValue,
            pythonAttribute.isPublic,
            pythonAttribute.typeInDocs,
            pythonAttribute.description,
            pythonAttribute.annotations
        )
        if (inClass) {
            currentClass!!.attributes.add(modifiedPythonAttribute)
        }
    }

    override fun leavePythonClass(pythonClass: SerializablePythonClass) {
        if (isClassMoved) {
            qualifiedNameGenerator.currentModuleName = originalModuleName
            isClassMoved = false
        }
        inClass = false
    }

    override fun enterPythonParameter(pythonParameter: SerializablePythonParameter) {
        qualifiedNameGenerator.currentParameterName = pythonParameter.name
        val modifiedPythonParameter = createPythonParameter(
            qualifiedNameGenerator.currentParameterName!!,
            qualifiedNameGenerator.qualifiedParameterName,
            pythonParameter.defaultValue,
            pythonParameter.assignedBy,
            pythonParameter.isPublic,
            pythonParameter.typeInDocs,
            pythonParameter.description,
            ArrayList(pythonParameter.annotations),
            pythonParameter.originalDeclaration
        )
        if (inFunction) {
            currentFunction!!.parameters.add(modifiedPythonParameter)
        }
    }

    override fun enterPythonFunction(pythonFunction: SerializablePythonFunction): Boolean {
        inFunction = true
        var newModuleName: String? = null
        qualifiedNameGenerator.currentFunctionName = pythonFunction.name
        val annotations = mutableListOf<EditorAnnotation>()
        for (editorAnnotation in pythonFunction.annotations) {
            if (editorAnnotation is MoveAnnotation) {
                isFunctionMoved = true
                originalModuleName = qualifiedNameGenerator.currentModuleName
                newModuleName = editorAnnotation.destination
                qualifiedNameGenerator.currentModuleName = newModuleName
            } else {
                annotations.add(editorAnnotation)
            }
        }
        currentFunction = createPythonFunction(
            qualifiedNameGenerator.currentFunctionName!!,
            qualifiedNameGenerator.qualifiedFunctionName,
            ArrayList(pythonFunction.decorators),
            listOf(),
            ArrayList(pythonFunction.results),
            pythonFunction.isPublic,
            pythonFunction.description,
            pythonFunction.fullDocstring,
            annotations,
            pythonFunction.originalDeclaration
        )
        if (isFunctionMoved) {
            addFunctionToAdd(newModuleName!!, currentFunction!!)
            return true
        }
        if (inClass) {
            currentClass!!.methods.add(currentFunction!!)
        } else if (inModule) {
            currentModule!!.functions.add(currentFunction!!)
        }
        return true
    }

    override fun leavePythonFunction(pythonFunction: SerializablePythonFunction) {
        if (isFunctionMoved) {
            qualifiedNameGenerator.currentModuleName = originalModuleName
            isFunctionMoved = false
        }
        inFunction = false
    }

    private fun addClassToAdd(moduleName: String, pythonClass: SerializablePythonClass) {
        classesToAdd.computeIfAbsent(moduleName) { k: String? -> ArrayList() }
        classesToAdd[moduleName]!!.add(pythonClass)
    }

    private fun addFunctionToAdd(moduleName: String, pythonFunction: SerializablePythonFunction) {
        functionsToAdd.computeIfAbsent(moduleName) { k: String? -> ArrayList() }
        functionsToAdd[moduleName]!!.add(pythonFunction)
    }

    private inner class QualifiedNameGenerator {
        val qualifiedModuleName: String?
            get() = currentModuleName
        var currentModuleName: String? = null
        var currentClassName: String? = null
        var currentFunctionName: String? = null
        var currentParameterName: String? = null
        var currentAttributeName: String? = null
        val qualifiedClassName: String
            get() = qualifiedModuleName + PATH_SEPARATOR + currentClassName
        val qualifiedFunctionName: String
            get() = if (inClass) {
                qualifiedClassName + PATH_SEPARATOR + currentFunctionName
            } else qualifiedModuleName + PATH_SEPARATOR + currentFunctionName
        val qualifiedParameterName: String
            get() = qualifiedFunctionName + PATH_SEPARATOR + currentParameterName
        val qualifiedAttributeName: String
            get() = qualifiedClassName + PATH_SEPARATOR + currentAttributeName
    }
}
