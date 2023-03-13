from typing import Callable, Optional, Union

from package_parser.processing.api.model import (
    API,
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)

from ._mapping import ManyToManyMapping, Mapping

api_element = Union[Attribute, Class, Function, Parameter, Result]


def _get_not_mapped_api_elements(
    previous_mappings: list[Mapping], apiv1: API, apiv2: API
) -> list[Mapping]:
    related_mappings = []
    mapped_apiv1_elements = [
        element
        for mapping in previous_mappings
        for element in mapping.get_apiv1_elements()
    ]
    mapped_apiv2_elements = [
        element
        for mapping in previous_mappings
        for element in mapping.get_apiv2_elements()
    ]
    for get_api_element_for_type in [
        lambda api: api.classes.values(),
        lambda api: api.functions.values(),
        lambda api: api.attributes().values(),
        lambda api: api.parameters().values(),
        lambda api: api.results().values(),
    ]:
        not_mapped_elements_mapping = _get_not_mapped_api_elements_for_type(
            apiv1,
            apiv2,
            mapped_apiv1_elements,
            mapped_apiv2_elements,
            get_api_element_for_type,
        )
        if not_mapped_elements_mapping is not None:
            related_mappings.append(not_mapped_elements_mapping)
    return related_mappings


def _get_not_mapped_api_elements_for_type(
    apiv1: API,
    apiv2: API,
    mapped_apiv1_elements: list[api_element],
    mapped_apiv2_elements: list[api_element],
    get_api_element_for_type: Callable[[API], list[api_element]],
) -> Optional[Mapping]:
    not_mapped_v1_elements = []
    for api_elementv1 in get_api_element_for_type(apiv1):
        if api_elementv1 not in mapped_apiv1_elements:
            not_mapped_v1_elements.append(api_elementv1)
    not_mapped_v2_elements = []
    for api_elementv2 in get_api_element_for_type(apiv2):
        if api_elementv2 not in mapped_apiv2_elements:
            not_mapped_v2_elements.append(api_elementv2)
    if len(not_mapped_v1_elements) > 0 and len(not_mapped_v2_elements) > 0:
        return ManyToManyMapping(-1.0, not_mapped_v1_elements, not_mapped_v2_elements)
    return None
