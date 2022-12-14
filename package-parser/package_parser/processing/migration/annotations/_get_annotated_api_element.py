from typing import List, Optional, TypeVar, Union

from package_parser.processing.annotations.model import AbstractAnnotation
from package_parser.processing.api.model import (
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)

API_ELEMENTS = TypeVar("API_ELEMENTS", Class, Function, Parameter)


def get_annotated_api_element(
    annotation: AbstractAnnotation,
    api_element_list: List[Union[Attribute, Class, Function, Parameter, Result]],
) -> Optional[Union[Class, Function, Parameter]]:
    for element in api_element_list:
        if (
            isinstance(element, (Class, Function, Parameter))
            and element.id == annotation.target
        ):
            return element
    return None


def get_annotated_api_element_by_type(
    annotation: AbstractAnnotation,
    api_element_list: List[Union[Attribute, Class, Function, Parameter, Result]],
    api_type: type[API_ELEMENTS],
) -> Optional[API_ELEMENTS]:
    for element in api_element_list:
        if isinstance(element, api_type) and element.id == annotation.target:
            return element
    return None
