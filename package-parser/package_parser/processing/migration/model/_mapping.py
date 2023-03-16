from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import TypeVar, Union

from package_parser.processing.api.model import (
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)

api_element = Union[Attribute, Class, Function, Parameter, Result]
API_ELEMENTS = TypeVar("API_ELEMENTS", Attribute, Class, Function, Parameter, Result)


@dataclass
class Mapping(ABC):
    similarity: float

    @abstractmethod
    def get_apiv1_elements(self) -> list[api_element]:
        pass

    @abstractmethod
    def get_apiv2_elements(self) -> list[api_element]:
        pass

    def get_similarity(self) -> float:
        return self.similarity


@dataclass
class OneToOneMapping(Mapping):
    apiv1_element: api_element
    apiv2_element: api_element

    def get_apiv1_elements(self) -> list[api_element]:
        return [self.apiv1_element]

    def get_apiv2_elements(self) -> list[api_element]:
        return [self.apiv2_element]


@dataclass
class OneToManyMapping(Mapping):
    apiv1_element: api_element
    apiv2_elements: list[api_element]

    def get_apiv1_elements(self) -> list[api_element]:
        return [self.apiv1_element]

    def get_apiv2_elements(self) -> list[api_element]:
        return self.apiv2_elements


@dataclass
class ManyToOneMapping(Mapping):
    apiv1_elements: list[api_element]
    apiv2_element: api_element

    def get_apiv1_elements(self) -> list[api_element]:
        return self.apiv1_elements

    def get_apiv2_elements(self) -> list[api_element]:
        return [self.apiv2_element]


@dataclass
class ManyToManyMapping(Mapping):
    apiv1_elements: list[api_element]
    apiv2_elements: list[api_element]

    def get_apiv1_elements(self) -> list[api_element]:
        return self.apiv1_elements

    def get_apiv2_elements(self) -> list[api_element]:
        return self.apiv2_elements


def merge_mappings(mapping_a: Mapping, mapping_b: Mapping) -> Mapping:
    similarity = (mapping_a.similarity + mapping_b.similarity) / 2
    codomain = merge_api_elements_and_remove_duplicates(
        mapping_a.get_apiv2_elements(), mapping_b.get_apiv2_elements()
    )
    domain: list[api_element] = merge_api_elements_and_remove_duplicates(
        mapping_a.get_apiv1_elements(), mapping_b.get_apiv1_elements()
    )
    if len(domain) == 1 and len(codomain) == 1:
        return OneToOneMapping(similarity, domain[0], codomain[0])
    if len(domain) == 1:
        return OneToManyMapping(similarity, domain[0], codomain)
    if len(codomain) == 1:
        return ManyToOneMapping(similarity, domain, codomain[0])
    return ManyToManyMapping(similarity, domain, codomain)


def merge_api_elements_and_remove_duplicates(
    list_a: list[api_element], list_b: list[api_element]
) -> list[api_element]:
    api_elements: list[api_element] = []
    api_elements.extend(list_a)
    api_elements.extend(list_b)
    id_list: list[str] = []
    merged_list: list[api_element] = []
    for element in api_elements:
        element_id = ""
        if isinstance(element, (Class, Function, Parameter)):
            element_id = element.id
        elif isinstance(element, Attribute):
            element_id = str(element.class_id) + "/" + element.name
        elif isinstance(element, Result):
            element_id = str(element.function_id) + "/" + element.name
        if len(element_id) > 0 and element_id not in id_list:
            merged_list.append(element)
            id_list.append(element_id)
    return merged_list
