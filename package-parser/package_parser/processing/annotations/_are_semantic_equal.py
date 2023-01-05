from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    BoundaryAnnotation,
    CalledAfterAnnotation,
    ConstantAnnotation,
    DescriptionAnnotation,
    EnumAnnotation,
    ExpertAnnotation,
    GroupAnnotation,
    MoveAnnotation,
    OmittedAnnotation,
    OptionalAnnotation,
    RemoveAnnotation,
    RenameAnnotation,
    RequiredAnnotation,
    TodoAnnotation,
    ValueAnnotation,
)


def are_semantic_equal(
    annotation_a: AbstractAnnotation, annotation_b: AbstractAnnotation
) -> bool:
    if (
        annotation_a.target == annotation_b.target
        and isinstance(annotation_a, type(annotation_b))
        and isinstance(annotation_b, type(annotation_a))
    ):
        if isinstance(annotation_a, BoundaryAnnotation) and isinstance(
            annotation_b, BoundaryAnnotation
        ):
            return annotation_a.interval == annotation_b.interval
        if isinstance(annotation_a, CalledAfterAnnotation) and isinstance(
            annotation_b, CalledAfterAnnotation
        ):
            return annotation_a.calledAfterName == annotation_b.calledAfterName
        if isinstance(annotation_a, DescriptionAnnotation) and isinstance(
            annotation_b, DescriptionAnnotation
        ):
            return annotation_a.newDescription == annotation_b.newDescription
        if (
            isinstance(annotation_a, EnumAnnotation)
            and isinstance(annotation_b, EnumAnnotation)
            and annotation_a.enumName == annotation_b.enumName
            and len(annotation_a.pairs) == len(annotation_a.pairs)
        ):
            list_a = sorted(list(annotation_a.pairs), key=lambda x: x.stringValue)
            list_b = sorted(list(annotation_b.pairs), key=lambda x: x.stringValue)
            for i in range(len(annotation_a.pairs)):
                if (
                    list_a[i].stringValue != list_b[i].stringValue
                    or list_a[i].instanceName != list_b[i].instanceName
                ):
                    return False
            return True
        if isinstance(annotation_a, ExpertAnnotation) and isinstance(
            annotation_b, ExpertAnnotation
        ):
            return True
        if isinstance(annotation_a, GroupAnnotation) and isinstance(
            annotation_b, GroupAnnotation
        ):
            return annotation_a.groupName == annotation_b.groupName and set(
                annotation_a.parameters
            ) == set(annotation_b.parameters)
        if isinstance(annotation_a, MoveAnnotation) and isinstance(
            annotation_b, MoveAnnotation
        ):
            return annotation_a.destination == annotation_b.destination
        if isinstance(annotation_a, RemoveAnnotation) and isinstance(
            annotation_b, RemoveAnnotation
        ):
            return True
        if isinstance(annotation_a, RenameAnnotation) and isinstance(
            annotation_b, RenameAnnotation
        ):
            return annotation_a.newName == annotation_b.newName
        if isinstance(annotation_a, TodoAnnotation) and isinstance(
            annotation_b, TodoAnnotation
        ):
            return annotation_a.newTodo == annotation_b.newTodo
        if (
            isinstance(annotation_a, ValueAnnotation)
            and isinstance(annotation_b, ValueAnnotation)
            and annotation_a.variant == annotation_b.variant
        ):
            if isinstance(annotation_a, ConstantAnnotation) and isinstance(
                annotation_b, ConstantAnnotation
            ):
                return (
                    annotation_a.defaultValue == annotation_b.defaultValue
                    and annotation_a.defaultValueType == annotation_b.defaultValueType
                )
            if isinstance(annotation_a, OptionalAnnotation) and isinstance(
                annotation_b, OptionalAnnotation
            ):
                return (
                    annotation_a.defaultValue == annotation_b.defaultValue
                    and annotation_a.defaultValueType == annotation_b.defaultValueType
                )
            if isinstance(annotation_a, OmittedAnnotation) and isinstance(
                annotation_b, OmittedAnnotation
            ):
                return True
            if isinstance(annotation_a, RequiredAnnotation) and isinstance(
                annotation_b, RequiredAnnotation
            ):
                return True
    return False
