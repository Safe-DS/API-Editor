import { AnnotationStore } from '../../annotations/versioning/AnnotationStoreV2';
import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonPackage } from '../../packageData/model/PythonPackage';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { PythonResult } from '../../packageData/model/PythonResult';
import { AnnotatedPythonClass } from './AnnotatedPythonClass';
import { AnnotatedPythonFunction } from './AnnotatedPythonFunction';
import { AnnotatedPythonModule } from './AnnotatedPythonModule';
import { AnnotatedPythonPackage } from './AnnotatedPythonPackage';
import { AnnotatedPythonParameter } from './AnnotatedPythonParameter';
import { AnnotatedPythonResult } from './AnnotatedPythonResult';
import {
    InferableAnnotation,
    InferableBoundaryAnnotation,
    InferableCalledAfterAnnotation,
    InferableConstantAnnotation,
    InferableDescriptionAnnotation,
    InferableEnumAnnotation,
    InferableGroupAnnotation,
    InferableMoveAnnotation,
    InferableOptionalAnnotation,
    InferablePureAnnotation,
    InferableRemoveAnnotation,
    InferableRenameAnnotation,
    InferableRequiredAnnotation,
    InferableTodoAnnotation,
} from './InferableAnnotation';

export class AnnotatedPythonPackageBuilder {
    readonly pythonPackage: PythonPackage;
    readonly annotationStore: AnnotationStore;

    constructor(pythonPackage: PythonPackage, annotationStore: AnnotationStore) {
        this.pythonPackage = pythonPackage;
        this.annotationStore = annotationStore;
    }

    generateAnnotatedPythonPackage(): AnnotatedPythonPackage {
        return new AnnotatedPythonPackage(
            this.pythonPackage.name,
            this.pythonPackage.distribution,
            this.pythonPackage.version,
            this.#buildAnnotatedPythonModules(this.pythonPackage.modules),
            this.#getExistingAnnotations(this.pythonPackage.id),
        );
    }

    #buildAnnotatedPythonModules(pythonModules: PythonModule[]): AnnotatedPythonModule[] {
        return pythonModules.map(
            (pythonModule: PythonModule) =>
                new AnnotatedPythonModule(
                    pythonModule.name,
                    pythonModule.imports,
                    pythonModule.fromImports,
                    this.#buildAnnotatedPythonClasses(pythonModule),
                    this.#buildAnnotatedPythonFunctions(pythonModule),
                    this.#getExistingAnnotations(pythonModule.id),
                ),
        );
    }

    #buildAnnotatedPythonClasses(pythonModule: PythonModule): AnnotatedPythonClass[] {
        return pythonModule.classes.map(
            (pythonClass: PythonClass) =>
                new AnnotatedPythonClass(
                    pythonClass.name,
                    pythonClass.qualifiedName,
                    pythonClass.decorators,
                    pythonClass.superclasses,
                    this.#buildAnnotatedPythonFunctions(pythonClass),
                    pythonClass.isPublic,
                    pythonClass.description,
                    pythonClass.fullDocstring,
                    this.#getExistingAnnotations(pythonClass.id),
                ),
        );
    }

    #buildAnnotatedPythonFunctions(pythonDeclaration: PythonModule | PythonClass): AnnotatedPythonFunction[] {
        if (pythonDeclaration instanceof PythonModule) {
            return pythonDeclaration.functions.map((pythonFunction: PythonFunction) =>
                this.#buildAnnotatedPythonFunction(pythonFunction),
            );
        } else {
            return pythonDeclaration.methods.map((pythonFunction: PythonFunction) =>
                this.#buildAnnotatedPythonFunction(pythonFunction),
            );
        }
    }

    #buildAnnotatedPythonFunction(pythonFunction: PythonFunction): AnnotatedPythonFunction {
        return new AnnotatedPythonFunction(
            pythonFunction.name,
            pythonFunction.qualifiedName,
            pythonFunction.decorators,
            this.#buildAnnotatedPythonParameters(pythonFunction.parameters, pythonFunction),
            this.#buildAnnotatedPythonResults(pythonFunction.results),
            pythonFunction.isPublic,
            pythonFunction.description,
            pythonFunction.fullDocstring,
            this.#getExistingAnnotations(pythonFunction.id),
        );
    }

    #buildAnnotatedPythonParameters(
        pythonParameters: PythonParameter[],
        pythonFunction: PythonFunction,
    ): AnnotatedPythonParameter[] {
        return pythonParameters.map(
            (pythonParameter: PythonParameter) =>
                new AnnotatedPythonParameter(
                    pythonParameter.name,
                    `${pythonFunction.qualifiedName}.${pythonParameter.name}`,
                    pythonParameter.defaultValue,
                    pythonParameter.assignedBy,
                    pythonParameter.isPublic,
                    pythonParameter.typeInDocs,
                    pythonParameter.description,
                    this.#getExistingAnnotations(pythonParameter.id),
                ),
        );
    }

    #buildAnnotatedPythonResults(pythonResults: PythonResult[]): AnnotatedPythonResult[] {
        return pythonResults.map(
            (pythonResult: PythonResult) =>
                new AnnotatedPythonResult(
                    pythonResult.name,
                    pythonResult.typeInDocs,
                    pythonResult.typeInDocs,
                    pythonResult.description,
                    this.#getExistingAnnotations(pythonResult.id),
                ),
        );
    }

    #possibleAnnotations = [
        'Attribute',
        'Boundary',
        'CalledAfters',
        'Constant',
        'Description',
        'Enum',
        'Groups',
        'Move',
        'Optional',
        'Pure',
        'Remove',
        'Rename',
        'Required',
        'Todo',
    ];

    #getExistingAnnotations(target: string): InferableAnnotation[] {
        let targetAnnotations: InferableAnnotation[] = [];
        this.#possibleAnnotations.forEach((annotation) => {
            const returnedAnnotations = this.#returnFormattedAnnotation(target, annotation);
            if (returnedAnnotations) {
                targetAnnotations = targetAnnotations.concat(returnedAnnotations);
            }
        });
        return targetAnnotations;
    }

    #returnFormattedAnnotation(
        target: string,
        annotationType: string,
    ): InferableAnnotation[] | InferableAnnotation | undefined {
        switch (annotationType) {
            case 'Boundary':
                const boundaryAnnotation = (this.annotationStore.boundaryAnnotations ?? {})[target];
                if (boundaryAnnotation && !boundaryAnnotation.isRemoved) {
                    return new InferableBoundaryAnnotation(boundaryAnnotation);
                }
                break;
            case 'CalledAfters':
                const calledAfterAnnotations = (this.annotationStore.calledAfterAnnotations ?? {})[target];
                if (!calledAfterAnnotations) {
                    break;
                }
                return Object.values(calledAfterAnnotations)
                    .filter((it) => !it.isRemoved)
                    .map((calledAfterAnnotation) => new InferableCalledAfterAnnotation(calledAfterAnnotation));
            case 'Constant':
                const valueAnnotation1 = (this.annotationStore.valueAnnotations ?? {})[target];
                if (valueAnnotation1 && !valueAnnotation1.isRemoved && valueAnnotation1.variant === 'constant') {
                    return new InferableConstantAnnotation(valueAnnotation1);
                }
                break;
            case 'Description':
                const descriptionAnnotation = (this.annotationStore.descriptionAnnotations ?? {})[target];
                if (descriptionAnnotation && !descriptionAnnotation.isRemoved) {
                    return new InferableDescriptionAnnotation(descriptionAnnotation);
                }
                break;
            case 'Groups':
                const groupAnnotations = (this.annotationStore.groupAnnotations ?? {})[target];
                if (!groupAnnotations) {
                    break;
                }
                return Object.values(groupAnnotations)
                    .filter((it) => !it.isRemoved)
                    .map((groupAnnotation) => new InferableGroupAnnotation(groupAnnotation));
            case 'Enum':
                const enumAnnotation = (this.annotationStore.enumAnnotations ?? {})[target];
                if (enumAnnotation && !enumAnnotation.isRemoved) {
                    return new InferableEnumAnnotation(enumAnnotation);
                }
                break;
            case 'Move':
                const moveAnnotation = (this.annotationStore.moveAnnotations ?? {})[target];
                if (moveAnnotation && !moveAnnotation.isRemoved) {
                    return new InferableMoveAnnotation(moveAnnotation);
                }
                break;
            case 'Optional':
                const valueAnnotation2 = (this.annotationStore.valueAnnotations ?? {})[target];
                if (valueAnnotation2 && !valueAnnotation2.isRemoved && valueAnnotation2.variant === 'optional') {
                    return new InferableOptionalAnnotation(valueAnnotation2);
                }
                break;
            case 'Pure':
                const pureAnnotation = (this.annotationStore.pureAnnotations ?? {})[target];
                if (pureAnnotation && !pureAnnotation.isRemoved) {
                    return new InferablePureAnnotation();
                }
                break;
            case 'Remove':
                const removeAnnotation = (this.annotationStore.removeAnnotations ?? {})[target];
                if (removeAnnotation && !removeAnnotation.isRemoved) {
                    return new InferableRemoveAnnotation();
                }
                break;
            case 'Rename':
                const renameAnnotation = (this.annotationStore.renameAnnotations ?? {})[target];
                if (renameAnnotation && !renameAnnotation.isRemoved) {
                    return new InferableRenameAnnotation(renameAnnotation);
                }
                break;
            case 'Required':
                const valueAnnotation3 = (this.annotationStore.valueAnnotations ?? {})[target];
                if (valueAnnotation3 && !valueAnnotation3.isRemoved && valueAnnotation3.variant === 'required') {
                    return new InferableRequiredAnnotation();
                }
                break;
            case 'Todo':
                const todoAnnotation = (this.annotationStore.todoAnnotations ?? {})[target];
                if (todoAnnotation && !todoAnnotation.isRemoved) {
                    return new InferableTodoAnnotation(todoAnnotation);
                }
                break;
        }
        return undefined;
    }
}
