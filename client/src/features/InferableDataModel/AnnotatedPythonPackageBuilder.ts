import { AnnotationsState } from '../annotations/annotationSlice';
import PythonClass from '../packageData/model/PythonClass';
import PythonFunction from '../packageData/model/PythonFunction';
import PythonModule from '../packageData/model/PythonModule';
import PythonPackage from '../packageData/model/PythonPackage';
import PythonParameter from '../packageData/model/PythonParameter';
import PythonResult from '../packageData/model/PythonResult';
import AnnotatedPythonClass from './AnnotatedPythonClass';
import AnnotatedPythonFunction from './AnnotatedPythonFunction';
import AnnotatedPythonModule from './AnnotatedPythonModule';
import AnnotatedPythonPackage from './AnnotatedPythonPackage';
import AnnotatedPythonParameter from './AnnotatedPythonParameter';
import AnnotatedPythonResult from './AnnotatedPythonResult';
import {
    InferableAnnotation,
    InferableAttributeAnnotation,
    InferableBoundaryAnnotation,
    InferableCalledAfterAnnotation,
    InferableConstantAnnotation,
    InferableEnumAnnotation,
    InferableGroupAnnotation,
    InferableMoveAnnotation,
    InferableOptionalAnnotation,
    InferableRenameAnnotation,
    InferableRequiredAnnotation,
    InferableUnusedAnnotation,
} from './InferableAnnotation';

export default class AnnotatedPythonPackageBuilder {
    readonly pythonPackage: PythonPackage;
    readonly annotationStore: AnnotationsState;
    constructor(
        pythonPackage: PythonPackage,
        annotationStore: AnnotationsState,
    ) {
        this.pythonPackage = pythonPackage;
        this.annotationStore = annotationStore;
    }

    generateAnnotatedPythonPackage(): AnnotatedPythonPackage {
        return {
            name: this.pythonPackage.name,
            distribution: this.pythonPackage.distribution,
            version: this.pythonPackage.version,
            annotations: this.#getExistingAnnotations(
                this.pythonPackage.pathAsString(),
            ),
            modules: this.#buildInferableModules(this.pythonPackage.modules),
        };
    }

    #possibleAnnotations = [
        'Attribute',
        'Boundary',
        'CalledAfters',
        'Constant',
        'Enum',
        'Groups',
        'Move',
        'Optional',
        'Rename',
        'Required',
        'Unused',
    ];

    #getExistingAnnotations(target: string): InferableAnnotation[] {
        let targetAnnotations: InferableAnnotation[] = [];
        this.#possibleAnnotations.forEach((annotation) => {
            const returnedAnnotations = this.#returnFormattedAnnotation(
                target,
                annotation,
            );
            if (returnedAnnotations) {
                targetAnnotations =
                    targetAnnotations.concat(returnedAnnotations);
            }
        });
        return targetAnnotations;
    }

    #returnFormattedAnnotation(
        target: string,
        annotationType: string,
    ): InferableAnnotation[] | InferableAnnotation | undefined {
        switch (annotationType) {
            case 'Attribute':
                const attributeAnnotation =
                    this.annotationStore.attributes[target];
                if (attributeAnnotation) {
                    return new InferableAttributeAnnotation(
                        attributeAnnotation,
                    );
                }
                break;
            case 'Boundary':
                const boundaryAnnotation =
                    this.annotationStore.boundaries[target];
                if (boundaryAnnotation) {
                    return new InferableBoundaryAnnotation(boundaryAnnotation);
                }
                break;
            case 'CalledAfters':
                const calledAfterAnnotations =
                    this.annotationStore.calledAfters[target];
                if (!calledAfterAnnotations) {
                    break;
                }
                const calledAfterAnnotationList = Object.values(
                    calledAfterAnnotations,
                );
                if (calledAfterAnnotationList.length === 1) {
                    return new InferableCalledAfterAnnotation(
                        calledAfterAnnotationList[0],
                    );
                }
                let inferableCalledAfterAnnotations: InferableCalledAfterAnnotation[] =
                    [];
                calledAfterAnnotationList.forEach((calledAfterAnnotation) => {
                    inferableCalledAfterAnnotations.push(
                        new InferableCalledAfterAnnotation(
                            calledAfterAnnotation,
                        ),
                    );
                });
                return inferableCalledAfterAnnotations;
            case 'Constant':
                const constantAnnotation =
                    this.annotationStore.constants[target];
                if (constantAnnotation) {
                    return new InferableConstantAnnotation(constantAnnotation);
                }
                break;
            case 'Groups':
                const groupAnnotations = this.annotationStore.groups[target];
                if (!groupAnnotations) {
                    break;
                }
                const groupAnnotationList = Object.values(groupAnnotations);
                if (groupAnnotationList.length === 1) {
                    return new InferableGroupAnnotation(groupAnnotationList[0]);
                }
                let inferableGroupAnnotations: InferableGroupAnnotation[] = [];
                groupAnnotationList.forEach((groupAnnotation) => {
                    inferableGroupAnnotations.push(
                        new InferableGroupAnnotation(groupAnnotation),
                    );
                });
                return inferableGroupAnnotations;
            case 'Enum':
                const enumAnnotation = this.annotationStore.enums[target];
                if (enumAnnotation) {
                    return new InferableEnumAnnotation(enumAnnotation);
                }
                break;
            case 'Move':
                const moveAnnotation = this.annotationStore.moves[target];
                if (moveAnnotation) {
                    return new InferableMoveAnnotation(moveAnnotation);
                }
                break;
            case 'Optional':
                const optionalAnnotation =
                    this.annotationStore.optionals[target];
                if (optionalAnnotation) {
                    return new InferableOptionalAnnotation(optionalAnnotation);
                }
                break;
            case 'Rename':
                const renameAnnotation = this.annotationStore.renamings[target];
                if (renameAnnotation) {
                    return new InferableRenameAnnotation(renameAnnotation);
                }
                break;
            case 'Required':
                const requiredAnnotation =
                    this.annotationStore.requireds[target];
                if (requiredAnnotation) {
                    return new InferableRequiredAnnotation();
                }
                break;
            case 'Unused':
                const unusedAnnotation = this.annotationStore.unuseds[target];
                if (unusedAnnotation) {
                    return new InferableUnusedAnnotation();
                }
                break;
        }
        return undefined;
    }

    #buildInferableClasses(pythonModule: PythonModule) {
        let pythonClasses: AnnotatedPythonClass[] = [];
        pythonModule.classes.forEach((pythonClass: PythonClass) => {
            pythonClasses.push({
                name: pythonClass.name,
                qualifiedName: pythonClass.qualifiedName,
                decorators: pythonClass.decorators,
                superclasses: pythonClass.superclasses,
                description: pythonClass.description,
                fullDocstring: pythonClass.fullDocstring,
                methods: this.#buildInferableFunctions(pythonClass),
                annotations: this.#getExistingAnnotations(
                    pythonClass.pathAsString(),
                ),
            });
        });
        return pythonClasses;
    }

    #buildInferableFunctions(pythonDeclaration: PythonModule | PythonClass) {
        let pythonFunctions: AnnotatedPythonFunction[] = [];
        if (pythonDeclaration instanceof PythonModule) {
            pythonDeclaration.functions.forEach(
                (pythonFunction: PythonFunction) => {
                    pythonFunctions.push(
                        this.#buildInferableFunction(pythonFunction),
                    );
                },
            );
        }
        if (pythonDeclaration instanceof PythonClass) {
            pythonDeclaration.methods.forEach(
                (pythonFunction: PythonFunction) => {
                    pythonFunctions.push(
                        this.#buildInferableFunction(pythonFunction),
                    );
                },
            );
        }
        return pythonFunctions;
    }

    #buildInferableFunction(pythonFunction: PythonFunction) {
        return new AnnotatedPythonFunction(
            pythonFunction.name,
            pythonFunction.qualifiedName,
            pythonFunction.decorators,
            this.#buildInferableParameters(pythonFunction.parameters),
            this.#buildInferablePythonResults(pythonFunction.results),
            pythonFunction.isPublic,
            pythonFunction.description,
            pythonFunction.fullDocstring,
            this.#getExistingAnnotations(pythonFunction.pathAsString()),
        );
    }

    #buildInferableModules(pythonModules: PythonModule[]) {
        let inferablePythonModules: AnnotatedPythonModule[] = [];
        pythonModules.forEach((pythonModule: PythonModule) => {
            inferablePythonModules.push(
                new AnnotatedPythonModule(
                    pythonModule.name,
                    pythonModule.imports,
                    pythonModule.fromImports,
                    this.#buildInferableClasses(pythonModule),
                    this.#buildInferableFunctions(pythonModule),
                    this.#getExistingAnnotations(pythonModule.pathAsString()),
                ),
            );
        });
        return inferablePythonModules;
    }

    #buildInferableParameters(pythonParameters: PythonParameter[]) {
        let inferablePythonParameters: AnnotatedPythonParameter[] = [];
        pythonParameters.forEach((pythonParameter: PythonParameter) => {
            inferablePythonParameters.push(
                new AnnotatedPythonParameter(
                    pythonParameter.name,
                    pythonParameter.defaultValue,
                    pythonParameter.assignedBy,
                    pythonParameter.isPublic,
                    pythonParameter.typeInDocs,
                    pythonParameter.description,
                    this.#getExistingAnnotations(
                        pythonParameter.pathAsString(),
                    ),
                ),
            );
        });
        return inferablePythonParameters;
    }

    #buildInferablePythonResults(pythonResults: PythonResult[]) {
        let inferablePythonResults: AnnotatedPythonResult[] = [];
        pythonResults.forEach((pythonResult: PythonResult) => {
            inferablePythonResults.push(
                new AnnotatedPythonResult(
                    pythonResult.name,
                    pythonResult.type,
                    pythonResult.typeInDocs,
                    pythonResult.description,
                    this.#getExistingAnnotations(pythonResult.pathAsString()),
                ),
            );
        });
        return inferablePythonResults;
    }
}
