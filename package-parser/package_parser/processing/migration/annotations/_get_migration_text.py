from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    BoundaryAnnotation,
    CalledAfterAnnotation,
    CompleteAnnotation,
    ConstantAnnotation,
    DescriptionAnnotation,
    EnumAnnotation,
    GroupAnnotation,
    MoveAnnotation,
    OptionalAnnotation,
    PureAnnotation,
    RemoveAnnotation,
    RenameAnnotation,
    TodoAnnotation,
    ValueAnnotation,
)
from package_parser.processing.migration import Mapping


def _get_further_information(annotation: AbstractAnnotation) -> str:
    if isinstance(annotation, (CompleteAnnotation, PureAnnotation, RemoveAnnotation)):
        return ""
    if isinstance(annotation, BoundaryAnnotation):
        return " with the interval '" + str(annotation.interval.to_json()) + "'"
    if isinstance(annotation, CalledAfterAnnotation):
        return (
            " with the method '"
            + annotation.calledAfterName
            + "' that should be called before"
        )
    if isinstance(annotation, DescriptionAnnotation):
        return " with the new description '" + annotation.newDescription + "'"
    if isinstance(annotation, EnumAnnotation):
        return (
            " with the new enum '"
            + annotation.enumName
            + " ("
            + ", ".join(
                map(
                    lambda enum_pair: enum_pair.stringValue
                    + ", "
                    + enum_pair.instanceName,
                    annotation.pairs,
                )
            )
            + ")'"
        )
    if isinstance(annotation, GroupAnnotation):
        return (
            " with the group name '"
            + annotation.groupName
            + "' and the grouped parameters: '"
            + ", ".join(annotation.parameters)
            + "'"
        )
    if isinstance(annotation, MoveAnnotation):
        return " with the destination: '" + annotation.destination + "'"
    if isinstance(annotation, RenameAnnotation):
        return " with the new name '" + annotation.newName + "'"
    if isinstance(annotation, TodoAnnotation):
        return " with the todo '" + annotation.newTodo + "'"
    if isinstance(annotation, ValueAnnotation):
        value = " with the variant '" + annotation.variant.value
        if isinstance(annotation, (ConstantAnnotation, OptionalAnnotation)):
            value += (
                "' and the default Value '"
                + annotation.defaultValue
                + " ( type: "
                + annotation.defaultValueType.value
                + " )"
            )
        value += "'"
        return value
    return " with the data '" + str(annotation.to_json()) + "'"


def get_migration_text(annotation: AbstractAnnotation, mapping: Mapping) -> str:
    class_name = str(annotation.__class__.__name__)
    if class_name.endswith("Annotation"):
        class_name = class_name[:-10]
    if issubclass(type(annotation), ValueAnnotation):
        class_name = "Value"

    migrate_text = (
        "The @" + class_name + " Annotation" + _get_further_information(annotation)
    )
    migrate_text += (
        " from the previous version was at '"
        + annotation.target
        + "' and the possible alternatives in the new version of the api are: "
        + ", ".join(
            map(
                lambda api_element: api_element.id
                if hasattr(api_element, "id")
                else api_element.name,
                mapping.get_apiv2_elements(),
            )
        )
    )
    return migrate_text
