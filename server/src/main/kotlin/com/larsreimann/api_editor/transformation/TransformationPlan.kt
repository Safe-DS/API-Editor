package com.larsreimann.api_editor.transformation

import com.larsreimann.api_editor.model.SerializablePythonPackage

fun processPackage(originalPythonPackage: SerializablePythonPackage): SerializablePythonPackage {
    var modifiedPythonPackage = originalPythonPackage

    // Add attributes to classes
    modifiedPythonPackage = modifiedPythonPackage.accept(AttributesInitializer())!!

    // Create original declarations
    modifiedPythonPackage.accept(OriginalDeclarationProcessor)

    // Apply annotations (don't change the order)
    val unusedAnnotationProcessor = UnusedAnnotationProcessor()
    modifiedPythonPackage = modifiedPythonPackage.accept(unusedAnnotationProcessor)!!

    val renameAnnotationProcessor = RenameAnnotationProcessor()
    modifiedPythonPackage = modifiedPythonPackage.accept(renameAnnotationProcessor)!!

    val moveAnnotationProcessor = MoveAnnotationProcessor()
    modifiedPythonPackage.accept(moveAnnotationProcessor)
    modifiedPythonPackage = moveAnnotationProcessor.modifiedPackage!!

    val parameterAnnotationProcessor = ParameterAnnotationProcessor()
    modifiedPythonPackage = modifiedPythonPackage.accept(parameterAnnotationProcessor)!!

    val boundaryAnnotationProcessor = BoundaryAnnotationProcessor()
    modifiedPythonPackage = modifiedPythonPackage.accept(boundaryAnnotationProcessor)!!

    modifiedPythonPackage.accept(PureAnnotationProcessor)

    // Cleanup
    val cleanupModulesProcessor = CleanupModulesProcessor()
    modifiedPythonPackage.accept(cleanupModulesProcessor)
    modifiedPythonPackage = cleanupModulesProcessor.modifiedPackage

    return modifiedPythonPackage
}
