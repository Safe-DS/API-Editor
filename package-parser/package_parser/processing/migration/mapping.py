from abc import ABC, abstractmethod
from typing import Union

from package_parser.processing.api.model import (
    Class,
    Function,
    InstanceAttribute,
    Parameter,
    Result,
)

api_element = Union[Parameter, Function, Class, InstanceAttribute, Result]


class Mapping(ABC):
    similarity: float

    def __init__(self, similarity: float):
        self.similarity = similarity

    @abstractmethod
    def get_apiv1_elements(self) -> Union[api_element, list[api_element]]:
        pass

    @abstractmethod
    def get_apiv2_elements(self) -> Union[api_element, list[api_element]]:
        pass

    def get_similarity(self) -> float:
        return self.similarity


class OneToOneMapping(Mapping):
    apiv1_elements: api_element
    apiv2_elements: api_element

    def __init__(self, apiv1_elements: api_element, apiv2_elements: api_element, similarity: float):
        super().__init__(similarity)
        self.apiv1_elements = apiv1_elements
        self.apiv2_elements = apiv2_elements

    def get_apiv1_elements(self) -> api_element:
        return self.apiv1_elements

    def get_apiv2_elements(self) -> api_element:
        return self.apiv2_elements


class OneToManyMapping(Mapping):
    apiv1_elements: api_element
    apiv2_elements: list[api_element]

    def __init__(self, apiv1_elements: api_element,
                 apiv2_elements: list[api_element], similarity: float):
        super().__init__(similarity)
        self.apiv1_elements = apiv1_elements
        self.apiv2_elements = apiv2_elements

    def get_apiv1_elements(self) -> api_element:
        return self.apiv1_elements

    def get_apiv2_elements(self) -> list[api_element]:
        return self.apiv2_elements


class ManyToOneMapping(Mapping):
    apiv1_elements: list[api_element]
    apiv2_elements: api_element

    def __init__(self, apiv1_elements: list[api_element],
                 apiv2_elements: api_element, similarity: float):
        super().__init__(similarity)
        self.apiv1_elements = apiv1_elements
        self.apiv2_elements = apiv2_elements

    def get_apiv1_elements(self) -> list[api_element]:
        return self.apiv1_elements

    def get_apiv2_elements(self) -> api_element:
        return self.apiv2_elements


class ManyToManyMapping(Mapping):
    apiv1_elements: list[api_element]
    apiv2_elements: list[api_element]

    def __init__(
        self,
        apiv1_elements: list[api_element],
        apiv2_elements: list[api_element],
        similarity: float
    ):
        super().__init__(similarity)
        self.apiv1_elements = apiv1_elements
        self.apiv2_elements = apiv2_elements

    def get_apiv1_elements(self) -> list[api_element]:
        return self.apiv1_elements

    def get_apiv2_elements(self) -> list[api_element]:
        return self.apiv2_elements
