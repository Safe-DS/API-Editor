from package_parser.processing.annotations.model import (
    AbstractAnnotation, MoveAnnotation, BoundaryAnnotation,
    EnumAnnotation, RenameAnnotation, TodoAnnotation, ValueAnnotation, ConstantAnnotation, OptionalAnnotation
)
from package_parser.processing.migration import Mapping


def _get_further_information(annotation: AbstractAnnotation) -> str:
    if isinstance(annotation, BoundaryAnnotation):
        return "the interval '" + str(annotation.interval.to_json()) + "'"
    if isinstance(annotation, EnumAnnotation):
        return "new enum '" + annotation.enumName + " (" + ", ".join(
            map(lambda enum_pair: enum_pair.stringValue + ", " + enum_pair.instanceName, annotation.pairs)) \
               + ")'"
    if isinstance(annotation, MoveAnnotation):
        return "the destination: '" + annotation.destination + "'"
    if isinstance(annotation, RenameAnnotation):
        return "the new name '" + annotation.newName + "'"
    if isinstance(annotation, TodoAnnotation):
        return "the todo '" + annotation.newTodo + "'"
    if isinstance(annotation, ValueAnnotation):
        value = "the variant '" + annotation.variant.value
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
    return "the data '" + str(annotation.to_json()) + "'"


def get_migration_text(annotation: AbstractAnnotation, mapping: Mapping) -> str:
    class_name = str(annotation.__class__.__name__)
    if class_name.endswith("Annotation"):
        class_name = class_name[:-10]

    migrate_text = (
        "The @" + class_name + " Annotation with " + _get_further_information(annotation))
    migrate_text += (
        " from the previous version was at '"
        + annotation.target
        + "' and the possible alternatives in the new version of the api are: "
        + ", ".join(
        map(lambda api_element: api_element.id if hasattr(api_element, 'id') else api_element.name,
            mapping.get_apiv2_elements())
    )
    )
    return migrate_text
