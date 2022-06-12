from package_parser.model.annotations import (
    AnnotationStore,
    BoundaryAnnotation,
    Interval,
)
from package_parser.model.api import API


def _generate_boundary_annotations(api: API, annotations: AnnotationStore) -> None:
    """
    Annotates all parameters which are a boundary.
    :param api: Description of the API
    :param annotations: AnnotationStore, that holds all annotations
    """
    for _, parameter in api.parameters().items():
        boundary_type = parameter.type.to_json()
        if "kind" in boundary_type and boundary_type["kind"] == "UnionType":
            union_type = boundary_type
            for type_in_union in union_type["types"]:
                if type_in_union["kind"] == "BoundaryType":
                    boundary_type = type_in_union
        if "kind" in boundary_type and boundary_type["kind"] == "BoundaryType":
            min_value = boundary_type["min"]
            max_value = boundary_type["max"]

            is_discrete = boundary_type["base_type"] == "int"

            min_limit_type = 0
            max_limit_type = 0
            if not boundary_type["min_inclusive"]:
                min_limit_type = 1
            if not boundary_type["max_inclusive"]:
                max_limit_type = 1
            if min_value == "NegativeInfinity":
                min_value = 0
                min_limit_type = 2
            if max_value == "Infinity":
                max_value = 0
                max_limit_type = 2

            interval = Interval(
                isDiscrete=is_discrete,
                lowerIntervalLimit=min_value,
                upperIntervalLimit=max_value,
                lowerLimitType=min_limit_type,
                upperLimitType=max_limit_type,
            )
            boundary = BoundaryAnnotation(
                target=parameter.id,
                interval=interval,
            )
            annotations.boundaries.append(boundary)
