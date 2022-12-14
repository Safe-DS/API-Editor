from typing import List, TypeVar, Optional, Union

from package_parser.processing.annotations.model import AbstractAnnotation
from package_parser.processing.api.model import Attribute, Result, Class, Function, Parameter

ANNOTATABLE_API_ELEMENTS = TypeVar("ANNOTATABLE_API_ELEMENTS", Class, Function, Parameter)
API_ELEMENTS = TypeVar("API_ELEMENTS", Attribute, Class, Function, Parameter, Result)


def get_annotated_api_element(
    annotation: AbstractAnnotation, api_element_list: List[Union[Attribute, Class, Function, Parameter, Result]]
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
    api_type: type[ANNOTATABLE_API_ELEMENTS]
) -> Optional[ANNOTATABLE_API_ELEMENTS]:
    for element in api_element_list:
        if (
            isinstance(element, api_type)
            and element.id == annotation.target
        ):
            return element
    return None
