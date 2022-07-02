import {
    BoundaryAnnotation,
    CalledAfterAnnotation,
    ComparisonOperator,
    DescriptionAnnotation,
    DefaultValue,
    EnumAnnotation,
    EnumPair,
    GroupAnnotation,
    MoveAnnotation,
    RenameAnnotation,
    TodoAnnotation, DefaultValueType, ValueAnnotation,
} from '../../annotations/versioning/AnnotationStoreV2';

const dataPathPrefix = 'com.larsreimann.apiEditor.model.';

const convertDefaultValue = (type: DefaultValueType, value: DefaultValue) => {
    switch (type) {
        case 'string':
            return {
                type: `${dataPathPrefix}DefaultString`,
                value,
            };
        case 'boolean':
            return {
                type: `${dataPathPrefix}DefaultBoolean`,
                value,
            };
        case 'number':
            return {
                type: `${dataPathPrefix}DefaultNumber`,
                value,
            };
        case 'none':
            return {
                type: `${dataPathPrefix}DefaultNone`,
            };
    }
};

export class InferableAnnotation {
    type: string;

    constructor(type: string) {
        this.type = type;
    }
}

export class InferableBoundaryAnnotation extends InferableAnnotation {
    readonly isDiscrete: boolean;
    readonly lowerIntervalLimit: number;
    readonly lowerLimitType: string;
    readonly upperIntervalLimit: number;
    readonly upperLimitType: string;

    constructor(boundaryAnnotation: BoundaryAnnotation) {
        super(dataPathPrefix + 'BoundaryAnnotation');
        this.isDiscrete = boundaryAnnotation.interval.isDiscrete;
        this.lowerIntervalLimit = boundaryAnnotation.interval.lowerIntervalLimit;
        this.lowerLimitType = ComparisonOperator[boundaryAnnotation.interval.lowerLimitType];
        this.upperIntervalLimit = boundaryAnnotation.interval.upperIntervalLimit;
        this.upperLimitType = ComparisonOperator[boundaryAnnotation.interval.upperLimitType];
    }
}

export class InferableCalledAfterAnnotation extends InferableAnnotation {
    readonly calledAfterName: string;

    constructor(calledAfterAnnotation: CalledAfterAnnotation) {
        super(dataPathPrefix + 'CalledAfterAnnotation');
        this.calledAfterName = calledAfterAnnotation.calledAfterName;
    }
}

export class InferableConstantAnnotation extends InferableAnnotation {
    readonly defaultValue: { type: string; value?: DefaultValue };

    constructor(constantAnnotation: ValueAnnotation) {
        super(dataPathPrefix + 'ConstantAnnotation');
        this.defaultValue = convertDefaultValue(constantAnnotation.defaultValueType!, constantAnnotation.defaultValue!);
    }
}

export class InferableDescriptionAnnotation extends InferableAnnotation {
    readonly newDescription: string;

    constructor(descriptionAnnotation: DescriptionAnnotation) {
        super(dataPathPrefix + 'DescriptionAnnotation');
        this.newDescription = descriptionAnnotation.newDescription;
    }
}

export class InferableGroupAnnotation extends InferableAnnotation {
    readonly groupName: string;
    readonly parameters: string[];

    constructor(groupAnnotation: GroupAnnotation) {
        super(dataPathPrefix + 'GroupAnnotation');
        this.groupName = groupAnnotation.groupName;
        this.parameters = groupAnnotation.parameters;
    }
}

export class InferableEnumAnnotation extends InferableAnnotation {
    readonly enumName: string;
    readonly pairs: EnumPair[];

    constructor(enumAnnotation: EnumAnnotation) {
        super(dataPathPrefix + 'EnumAnnotation');
        this.enumName = enumAnnotation.enumName;
        this.pairs = enumAnnotation.pairs;
    }
}

export class InferableMoveAnnotation extends InferableAnnotation {
    readonly destination: string;

    constructor(moveAnnotation: MoveAnnotation) {
        super(dataPathPrefix + 'MoveAnnotation');
        this.destination = moveAnnotation.destination;
    }
}

export class InferableOptionalAnnotation extends InferableAnnotation {
    readonly defaultValue: { type: string; value?: DefaultValue };

    constructor(optionalAnnotation: ValueAnnotation) {
        super(dataPathPrefix + 'OptionalAnnotation');
        this.defaultValue = convertDefaultValue(optionalAnnotation.defaultValueType!, optionalAnnotation.defaultValue!);
    }
}

export class InferablePureAnnotation extends InferableAnnotation {
    constructor() {
        super(dataPathPrefix + 'PureAnnotation');
    }
}

export class InferableRenameAnnotation extends InferableAnnotation {
    readonly newName: string;

    constructor(renameAnnotation: RenameAnnotation) {
        super(dataPathPrefix + 'RenameAnnotation');
        this.newName = renameAnnotation.newName;
    }
}

export class InferableRequiredAnnotation extends InferableAnnotation {
    constructor() {
        super(dataPathPrefix + 'RequiredAnnotation');
    }
}

export class InferableRemoveAnnotation extends InferableAnnotation {
    constructor() {
        super(dataPathPrefix + 'RemoveAnnotation');
    }
}

export class InferableTodoAnnotation extends InferableAnnotation {
    readonly message: string;

    constructor(todoAnnotation: TodoAnnotation) {
        super(dataPathPrefix + 'TodoAnnotation');
        this.message = todoAnnotation.newTodo;
    }
}
