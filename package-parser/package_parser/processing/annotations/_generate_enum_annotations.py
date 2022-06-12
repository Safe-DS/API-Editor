import re

from package_parser.model.annotations import AnnotationStore, EnumAnnotation, EnumPair
from package_parser.model.api import API


def _generate_enum_annotations(api: API, annotations: AnnotationStore) -> None:
    """
    Returns all parameters that are never used.
    :param api: API object for usages
    :param annotations: AnnotationStore object
    """
    for _, parameter in api.parameters().items():
        enum_type = parameter.type.to_json()
        pairs = []
        if "kind" in enum_type and enum_type["kind"] == "UnionType":
            for type_in_union in enum_type["types"]:
                if type_in_union["kind"] == "EnumType":
                    values = sorted(list(type_in_union["values"]))
                    for string_value in values:
                        instance_name = __to_enum_name(string_value)
                        pairs.append(
                            EnumPair(
                                stringValue=string_value, instanceName=instance_name
                            )
                        )
        elif "kind" in enum_type and enum_type["kind"] == "EnumType":
            values = sorted(list(enum_type["values"]))
            for string_value in values:
                instance_name = __to_enum_name(string_value)
                pairs.append(
                    EnumPair(stringValue=string_value, instanceName=instance_name)
                )

        if len(pairs) > 0:
            enum_name = __to_enum_name(parameter.name)
            annotations.enums.append(
                EnumAnnotation(target=parameter.id, enumName=enum_name, pairs=pairs)
            )


def __to_enum_name(parameter_name: str) -> str:
    parameter_name = re.sub("[^a-zA-Z_]", "", parameter_name)
    value_split = re.split("_", parameter_name)
    parameter_name = ""
    for split in value_split:
        parameter_name += split.capitalize()
    return parameter_name
