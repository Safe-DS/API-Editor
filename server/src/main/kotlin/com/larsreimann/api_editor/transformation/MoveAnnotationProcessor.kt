package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.AbstractPackageDataVisitor
import com.larsreimann.api_editor.model.AnnotatedPythonAttribute
import com.larsreimann.api_editor.model.AnnotatedPythonClass
import com.larsreimann.api_editor.model.AnnotatedPythonFunction
import com.larsreimann.api_editor.model.AnnotatedPythonModule
import com.larsreimann.api_editor.model.AnnotatedPythonPackage
import com.larsreimann.api_editor.model.AnnotatedPythonParameter
import com.larsreimann.api_editor.model.EditorAnnotation
import com.larsreimann.api_editor.model.MoveAnnotation
import com.larsreimann.api_editor.util.createModuleCopyWithoutClassesAndFunctions
import com.larsreimann.api_editor.util.createPackageCopyWithoutModules
import com.larsreimann.api_editor.util.createPythonAttribute
import com.larsreimann.api_editor.util.createPythonClass
import com.larsreimann.api_editor.util.createPythonFunction
import com.larsreimann.api_editor.util.createPythonModule
import com.larsreimann.api_editor.util.createPythonParameter

class MoveAnnotationProcessor : AbstractPackageDataVisitor() {
    var modifiedPackage: AnnotatedPythonPackage? = null
    private var currentModule: AnnotatedPythonModule? = null
    private var currentClass: AnnotatedPythonClass? = null
    private var currentFunction: AnnotatedPythonFunction? = null
    private val qualifiedNameGenerator = QualifiedNameGenerator()
    private var inFunction = false
    private var inClass = false
    private var inModule = false
    private var inPackage = false
    private var isFunctionMoved = false
    private var isClassMoved = false
    private var originalModuleName: String? = null
    var classesToAdd: HashMap<String?, ArrayList<AnnotatedPythonClass>?>? = null
    var functionsToAdd: HashMap<String?, ArrayList<AnnotatedPythonFunction>?>? = null
    private val PATH_SEPARATOR = "."
    override fun enterPythonPackage(pythonPackage: AnnotatedPythonPackage): Boolean {
        inPackage = true
        classesToAdd = HashMap()
        functionsToAdd = HashMap()
        modifiedPackage = createPackageCopyWithoutModules(pythonPackage)
        return true
    }

    override fun leavePythonPackage(pythonPackage: AnnotatedPythonPackage) {
        inPackage = false
        // add to existing modules
        for ((name, _, _, classes, functions) in modifiedPackage!!.modules) {
            if (classesToAdd!![name] != null) {
                classes.addAll(classesToAdd!![name]!!)
                classesToAdd!!.remove(name)
            }
            if (functionsToAdd!![name] != null) {
                functions.addAll(functionsToAdd!![name]!!)
                functionsToAdd!!.remove(name)
            }
        }
        // add to new modules
        var it = classesToAdd!!.keys.iterator()
        while (it.hasNext()) {
            val key = it.next()
            val pythonModuleToAdd = createPythonModule(key!!)
            pythonModuleToAdd.classes.addAll(classesToAdd!![key]!!)
            if (functionsToAdd!![key] != null) {
                pythonModuleToAdd.functions.addAll(functionsToAdd!![key]!!)
                functionsToAdd!!.remove(key)
            }
            modifiedPackage!!.modules.add(pythonModuleToAdd)
            it.remove()
        }
        it = functionsToAdd!!.keys.iterator()
        while (it.hasNext()) {
            val key = it.next()
            val pythonModuleToAdd = createPythonModule(key!!)
            pythonModuleToAdd.functions.addAll(functionsToAdd!![key]!!)
            modifiedPackage!!.modules.add(pythonModuleToAdd)
            it.remove()
        }
    }

    override fun enterPythonModule(pythonModule: AnnotatedPythonModule): Boolean {
        inModule = true
        qualifiedNameGenerator.currentModuleName = pythonModule.name
        currentModule = createModuleCopyWithoutClassesAndFunctions(pythonModule)
        if (inPackage) {
            modifiedPackage!!.modules.add(currentModule!!)
        }
        return true
    }

    override fun leavePythonModule(pythonModule: AnnotatedPythonModule) {
        inModule = false
    }

    override fun enterPythonClass(pythonClass: AnnotatedPythonClass): Boolean {
        inClass = true
        qualifiedNameGenerator.currentClassName = pythonClass.name
        var newModuleName: String? = null
        val annotations = ArrayList<EditorAnnotation>()
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
            addClassToAdd(newModuleName, currentClass!!)
        } else {
            currentModule!!.classes.add(currentClass!!)
        }
        return true
    }

    override fun enterPythonAttribute(pythonAttribute: AnnotatedPythonAttribute) {
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

    override fun leavePythonClass(pythonClass: AnnotatedPythonClass) {
        if (isClassMoved) {
            qualifiedNameGenerator.currentModuleName = originalModuleName
            isClassMoved = false
        }
        inClass = false
    }

    override fun enterPythonParameter(pythonParameter: AnnotatedPythonParameter) {
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

    override fun enterPythonFunction(pythonFunction: AnnotatedPythonFunction): Boolean {
        inFunction = true
        var newModuleName: String? = null
        qualifiedNameGenerator.currentFunctionName = pythonFunction.name
        val annotations = ArrayList<EditorAnnotation>()
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
            ArrayList(),
            ArrayList(pythonFunction.results),
            pythonFunction.isPublic,
            pythonFunction.description,
            pythonFunction.fullDocstring,
            annotations,
            pythonFunction.originalDeclaration
        )
        if (isFunctionMoved) {
            addFunctionToAdd(newModuleName, currentFunction!!)
            return true
        }
        if (inClass) {
            currentClass!!.methods.add(currentFunction!!)
        } else if (inModule) {
            currentModule!!.functions.add(currentFunction!!)
        }
        return true
    }

    override fun leavePythonFunction(pythonFunction: AnnotatedPythonFunction) {
        if (isFunctionMoved) {
            qualifiedNameGenerator.currentModuleName = originalModuleName
            isFunctionMoved = false
        }
        inFunction = false
    }

    private fun addClassToAdd(moduleName: String?, pythonClass: AnnotatedPythonClass) {
        classesToAdd!!.computeIfAbsent(moduleName) { k: String? -> ArrayList() }
        classesToAdd!![moduleName]!!.add(pythonClass)
    }

    private fun addFunctionToAdd(moduleName: String?, pythonFunction: AnnotatedPythonFunction) {
        functionsToAdd!!.computeIfAbsent(moduleName) { k: String? -> ArrayList() }
        functionsToAdd!![moduleName]!!.add(pythonFunction)
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
