from copy import deepcopy

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumAnnotation,
    EnumReviewResult,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    AbstractType,
    Attribute,
    NamedType,
    Parameter,
    Result,
    UnionType,
)
from package_parser.processing.migration.model import (
    ManyToOneMapping,
    Mapping,
    OneToOneMapping,
)

from .. import ManyToManyMapping, OneToManyMapping
from ._constants import migration_author


def _contains_string(type_: AbstractType) -> bool:
    if isinstance(type_, NamedType):
        return type_.name == "str"
    if isinstance(type_, UnionType):
        for element in type_.types:
            if _contains_string(element):
                return True
    return False


def migrate_enum_annotation(
    enum_annotation: EnumAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    enum_annotation = deepcopy(enum_annotation)
    authors = enum_annotation.authors
    authors.append(migration_author)
    enum_annotation.authors = authors

    migrate_text = (
        "The @Enum Annotation with the new name '"
        + enum_annotation.enumName
        + " ("
        + ", ".join(
            map(
                lambda enum_pair: enum_pair.stringValue + ", " + enum_pair.instanceName,
                enum_annotation.pairs,
            )
        )
        + ")' from the previous version was at '"
        + enum_annotation.target
        + "' and the possible alternatives in the new version of the api are: "
        + ", ".join(
            map(lambda api_element: api_element.name, mapping.get_apiv2_elements())
        )
    )

    if isinstance(mapping, (OneToOneMapping, ManyToOneMapping)):
        parameter = mapping.get_apiv2_elements()[0]
        if isinstance(parameter, (Attribute, Result)):
            return []
        if isinstance(parameter, Parameter):
            if parameter.type is not None:
                if _contains_string(parameter.type):
                    enum_annotation.target = parameter.id
                    return [enum_annotation]
            else:
                enum_annotation.reviewResult = EnumReviewResult.UNSURE
                return [enum_annotation]
            # assuming api has been chanced to an enum type:
            # do not migrate annotation
            if isinstance(parameter.type, NamedType):
                return []
        return [
            TodoAnnotation(
                parameter.id, authors, [], "", EnumReviewResult.NONE, migrate_text
            )
        ]

    todo_annotations: list[AbstractAnnotation] = []
    if isinstance(mapping, (OneToManyMapping, ManyToManyMapping)):
        string_parameters = [
            apiv2_element
            for apiv2_element in mapping.get_apiv2_elements()
            if isinstance(apiv2_element, Parameter)
            and apiv2_element.type is not None
            and _contains_string(apiv2_element.type)
        ]
        size = len(string_parameters)
        if size == 1:
            enum_annotation.target = string_parameters[0].id
            enum_annotation.comment = migrate_text
            return [enum_annotation]

        for parameter in mapping.get_apiv2_elements():
            if isinstance(parameter, Parameter):
                todo_annotations.append(
                    TodoAnnotation(
                        parameter.id,
                        authors,
                        [],
                        "",
                        EnumReviewResult.NONE,
                        migrate_text,
                    )
                )
    return todo_annotations
