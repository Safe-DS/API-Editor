import re

from package_parser.processing.annotations.model import (
    AnnotationStore,
    EnumAnnotation,
    EnumPair,
)
from package_parser.processing.api.model import API

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
            annotation.target for annotation in annotations.constants
        ):
            continue

        enum_type = parameter.type.to_json()
        pairs = []
        if "kind" in enum_type and enum_type["kind"] == "UnionType":
            for type_in_union in enum_type["types"]:
                if type_in_union["kind"] == "EnumType":
                    values = sorted(list(type_in_union["values"]))
                    for string_value in values:
                        instance_name = _enum_instance_name(string_value)
                        pairs.append(
                            EnumPair(
                                stringValue=string_value, instanceName=instance_name
                            )
                        )
        elif "kind" in enum_type and enum_type["kind"] == "EnumType":
            values = sorted(list(enum_type["values"]))
            for string_value in values:
                instance_name = _enum_instance_name(string_value)
                pairs.append(
                    EnumPair(stringValue=string_value, instanceName=instance_name)
                )

        if len(pairs) > 0:
            enum_name = _enum_name(parameter.name)
            annotations.enums.append(
                EnumAnnotation(
                    target=parameter.id,
                    authors=[autogen_author],
                    reviewers=[],
                    enumName=enum_name,
                    pairs=pairs,
                )
            )


def _enum_name(parameter_name: str) -> str:
    segments = re.split(r"_", parameter_name)

    return "".join([segment.capitalize() for segment in segments if segment != ""])


def _enum_instance_name(string_value: str) -> str:
    segments = re.split(r"[_-]", string_value)

    result = "_".join(
        re.sub(r"\W", "", segment).upper()
        for segment in segments
        if re.sub(r"\W", "", segment) != ""
    )

    if len(result) == 0 or result[0].isdigit():
        result = "_" + result

    return result
