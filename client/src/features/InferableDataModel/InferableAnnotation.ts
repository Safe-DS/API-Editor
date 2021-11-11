import {
    DefaultType,
    AttributeAnnotation,
    Interval,
    DefaultValue,
    BoundaryAnnotation,
    CalledAfterAnnotation,
    ConstantAnnotation,
    EnumAnnotation,
    GroupAnnotation,
    MoveAnnotation,
    OptionalAnnotation,
    RenameAnnotation,
    RequiredAnnotation,
    UnusedAnnotation,
    EnumPair,
} from '../annotations/annotationSlice';

const dataPathPrefix = 'com.larsreimann.api_editor.server.data.';

const getDefaultValueTypeSuffix = (type: DefaultType) => {
    switch (type) {
        case 'string':
            return 'DefaultString';
        case 'boolean':
            return 'DefaultBoolean';
        case 'number':
            return 'DefaultNumber';
    }
};

export class InferableAnnotation {
    type: string;

    constructor(type: string) {
        this.type = type;
    }
}

export class InferableAttributeAnnotation extends InferableAnnotation {
    readonly defaultValue: { type: string; value: DefaultValue };

    constructor(attributeAnnotation: AttributeAnnotation) {
        super(dataPathPrefix + 'AttributeAnnotation');
        this.defaultValue = {
            type:
                dataPathPrefix +
                getDefaultValueTypeSuffix(attributeAnnotation.defaultType),
            value: attributeAnnotation.defaultValue,
        };
    }
}

export class InferableBoundary extends InferableAnnotation {
    readonly interval: Interval;

    constructor(boundaryAnnotation: BoundaryAnnotation) {
        super(dataPathPrefix + 'BoundaryAnnotation');
        this.interval = boundaryAnnotation.interval;
    }
}

export class InferableCalledAfter extends InferableAnnotation {
    readonly calledAfterName: string;

    constructor(calledAfterAnnotation: CalledAfterAnnotation) {
        super(dataPathPrefix + 'CalledAfterAnnotation');
        this.calledAfterName = calledAfterAnnotation.calledAfterName;
    }
}
export class InferableConstant extends InferableAnnotation {
    readonly defaultValue: { type: string; value: DefaultValue };

    constructor(constantAnnotation: ConstantAnnotation) {
        super(dataPathPrefix + 'ConstantAnnotation');
        this.defaultValue = {
            type:
                dataPathPrefix +
                getDefaultValueTypeSuffix(constantAnnotation.defaultType),
            value: constantAnnotation.defaultValue,
        };
    }
}
export class InferableGroup extends InferableAnnotation {
    readonly groupName: string;
    readonly parameters: string[];

    constructor(groupAnnotation: GroupAnnotation) {
        super(dataPathPrefix + 'GroupAnnotation');
        this.groupName = groupAnnotation.groupName;
        this.parameters = groupAnnotation.parameters;
    }
}
export class InferableEnum extends InferableAnnotation {
    readonly enumName: string;
    readonly pairs: EnumPair[];

    constructor(enumAnnotation: EnumAnnotation) {
        super(dataPathPrefix + 'EnumAnnotation');
        this.enumName = enumAnnotation.enumName;
        this.pairs = enumAnnotation.pairs;
    }
}
export class InferableMove extends InferableAnnotation {
    readonly destination: string;

    constructor(moveAnnotation: MoveAnnotation) {
        super(dataPathPrefix + 'MoveAnnotation');
        this.destination = moveAnnotation.destination;
    }
}
export class InferableOptional extends InferableAnnotation {
    readonly defaultValue: { type: string; value: DefaultValue };

    constructor(optionalAnnotation: OptionalAnnotation) {
        super(dataPathPrefix + 'OptionalAnnotation');
        this.defaultValue = {
            type:
                dataPathPrefix +
                getDefaultValueTypeSuffix(optionalAnnotation.defaultType),
            value: optionalAnnotation.defaultValue,
        };
    }
}
export class InferableRename extends InferableAnnotation {
    readonly newName: string;

    constructor(renameAnnotation: RenameAnnotation) {
        super(dataPathPrefix + 'RenameAnnotation');
        this.newName = renameAnnotation.newName;
    }
}
export class InferableRequired extends InferableAnnotation {
    constructor(requiredAnnotation: RequiredAnnotation) {
        super(dataPathPrefix + 'RequiredAnnotation');
    }
}
export class InferableUnused extends InferableAnnotation {
    constructor(unusedAnnotation: UnusedAnnotation) {
        super(dataPathPrefix + 'UnusedAnnotation');
    }
}
