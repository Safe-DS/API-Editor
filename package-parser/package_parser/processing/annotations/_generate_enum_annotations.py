import re

from package_parser.processing.annotations.model import (
    AnnotationStore,
    EnumAnnotation,
    EnumPair,
    ValueAnnotation,
)
from package_parser.processing.api.model import API, UnionType, EnumType

from ._constants import autogen_author


def _generate_enum_annotations(api: API, annotations: AnnotationStore) -> None:
    """
    Returns all parameters that are never used.
    :param api: API object for usages
    :param annotations: AnnotationStore object
    """
    for _, parameter in api.parameters().items():

        # Don't add enum annotation to constant parameters
        if parameter.id in set(
            annotation.target
            for annotation in annotations.valueAnnotations
            if annotation.variant == ValueAnnotation.Variant.CONSTANT
        ):
            continue

        parameter_type = parameter.type.type
        if parameter_type is None:
            continue

        pairs = []
        full_match = ""
        print(parameter_type.to_json())
        if isinstance(parameter_type, UnionType):
            for type_in_union in parameter_type.types:
                print(type_in_union.to_json())
                if isinstance(type_in_union, EnumType):
                    pairs = _enum_pairs(type_in_union)
                    full_match = type_in_union.full_match

        elif isinstance(parameter_type, EnumType):
            pairs = _enum_pairs(parameter_type)
            full_match = parameter_type.full_match

        print(pairs)
        print(full_match)

        if len(pairs) > 0:
            enum_name = _enum_name(parameter.name)
            annotations.enumAnnotations.append(
                EnumAnnotation(
                    target=parameter.id,
                    authors=[autogen_author],
                    reviewers=[],
                    comment=f"I turned this into an enum because the type in the documentation contained {full_match}.",
                    enumName=enum_name,
                    pairs=pairs,
                )
            )


def _enum_name(parameter_name: str) -> str:
    segments = re.split(r"_", parameter_name)

    return "".join([segment.capitalize() for segment in segments if segment != ""])


def _enum_pairs(enum_type: EnumType) -> list[EnumPair]:
    result = []

    sorted_values = sorted(list(enum_type.values))
    for string_value in sorted_values:
        instance_name = _enum_instance_name(string_value)
        result.append(
            EnumPair(
                stringValue=string_value,
                instanceName=instance_name
            )
        )

    return result


def _enum_instance_name(string_value: str) -> str:
    segments = re.split(r"[_\-.]", string_value)

    result = "_".join(
        re.sub(r"\W", "", segment).upper()
        for segment in segments
        if re.sub(r"\W", "", segment) != ""
    )

    if len(result) == 0 or result[0].isdigit():
        result = "_" + result

    return result
