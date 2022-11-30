from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Callable, List, Optional, TypeVar, Union

from package_parser.processing.api.model import (
    API,
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)

from ._differ import AbstractDiffer

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
    codomain: list[api_element] = list(
        set(mapping_a.get_apiv2_elements()) | set(mapping_b.get_apiv2_elements())
    )
    domain: list[api_element] = list(
        set(mapping_a.get_apiv1_elements()) | set(mapping_b.get_apiv1_elements())
    )
    if len(domain) == 1 and len(codomain) == 1:
        return OneToOneMapping(similarity, domain[0], codomain[0])
    if len(domain) == 1:
        return OneToManyMapping(similarity, domain[0], codomain)
    if len(codomain) == 1:
        return ManyToOneMapping(similarity, domain, codomain[0])
    return ManyToManyMapping(similarity, domain, codomain)


class APIMapping:
    threshold_of_similarity_between_mappings: float
    threshold_of_similarity_for_creation_of_mappings: float
    apiv1: API
    apiv2: API
    differ: AbstractDiffer

    def __init__(
        self,
        apiv1: API,
        apiv2: API,
        differ: AbstractDiffer,
        threshold_of_similarity_for_creation_of_mappings=0.5,
        threshold_of_similarity_between_mappings=0.05,
    ):
        self.apiv1 = apiv1
        self.apiv2 = apiv2
        self.differ = differ
        self.threshold_of_similarity_for_creation_of_mappings = (
            threshold_of_similarity_for_creation_of_mappings
        )
        self.threshold_of_similarity_between_mappings = (
            threshold_of_similarity_between_mappings
        )

    def _get_mappings_for_api_elements(
        self,
        api_elementv1_list: List[API_ELEMENTS],
        api_elementv2_list: List[API_ELEMENTS],
        compute_similarity: Callable[[API_ELEMENTS, API_ELEMENTS], float],
    ) -> list[Mapping]:
        element_mappings: list[Mapping] = []
        for api_elementv1 in api_elementv1_list:
            mapping_for_class_1: list[Mapping] = []
            for api_elementv2 in api_elementv2_list:
                similarity = compute_similarity(api_elementv1, api_elementv2)
                if similarity >= self.threshold_of_similarity_for_creation_of_mappings:
                    mapping_for_class_1.append(
                        OneToOneMapping(similarity, api_elementv1, api_elementv2)
                    )
            mapping_for_class_1.sort(key=Mapping.get_similarity, reverse=True)
            new_mapping = self._merge_similar_mappings(mapping_for_class_1)
            if new_mapping is not None:
                self._merge_mappings_with_same_elements(new_mapping, element_mappings)
        return element_mappings

    def map_api(self) -> List[Mapping]:
        mappings: List[Mapping] = []
        mappings.extend(
            self._get_mappings_for_api_elements(
                list(self.apiv1.classes.values()),
                list(self.apiv2.classes.values()),
                self.differ.compute_class_similarity,
            )
        )
        mappings.extend(
            self._get_mappings_for_api_elements(
                list(self.apiv1.functions.values()),
                list(self.apiv2.functions.values()),
                self.differ.compute_function_similarity,
            )
        )
        mappings.extend(
            self._get_mappings_for_api_elements(
                list(self.apiv1.parameters().values()),
                list(self.apiv2.parameters().values()),
                self.differ.compute_parameter_similarity,
            )
        )

        mappings.extend(
            self._get_mappings_for_api_elements(
                [
                    attribute
                    for class_ in self.apiv1.classes.values()
                    for attribute in class_.instance_attributes
                ],
                [
                    attribute
                    for class_ in self.apiv2.classes.values()
                    for attribute in class_.instance_attributes
                ],
                self.differ.compute_attribute_similarity,
            )
        )

        mappings.extend(
            self._get_mappings_for_api_elements(
                [
                    result
                    for function in self.apiv1.functions.values()
                    for result in function.results
                ],
                [
                    result
                    for function in self.apiv2.functions.values()
                    for result in function.results
                ],
                self.differ.compute_result_similarity,
            )
        )

        mappings.sort(key=Mapping.get_similarity, reverse=True)
        return mappings

    def _merge_similar_mappings(self, mappings: List[Mapping]) -> Optional[Mapping]:
        """
        Given a list of OneToOne(Many)Mappings which apiv1 element is the same, this method returns the best mapping
        from this apiv1 element to apiv2 elements by merging the first and second elements recursively,
        if the difference in similarity is smaller than THRESHOLD_OF_SIMILARITY_BETWEEN_MAPPINGS.

        :param mappings: mappings sorted by decreasing similarity, which apiv1 element is the same
        :return: the first element of the sorted list that could be a result of merged similar mappings
        """
        if len(mappings) == 0:
            return None
        if len(mappings) == 1:
            return mappings[0]
        if (
            mappings[0].similarity - mappings[1].similarity
            < self.threshold_of_similarity_between_mappings
        ):
            mappings[0] = merge_mappings(mappings[0], mappings[1])
            mappings.pop(1)
            return self._merge_similar_mappings(mappings)
        return mappings[0]

    def _merge_mappings_with_same_elements(
        self, mapping_to_be_appended: Mapping, mappings: list[Mapping]
    ):
        """
        This method prevents that an element in a mapping appears multiple times in a list of mappings
        by merging the affected mappings and include the result in the list. If there is no such element,
        the mapping will be included without any merge.

        :param mapping_to_be_appended: the mapping that should be included in mappings
        :param mappings: the list, in which mapping_to_be_appended should be appended
        """
        duplicated: list[Mapping] = []
        for mapping in mappings:
            duplicated_element = False
            for element in mapping.get_apiv2_elements():
                for element_2 in mapping_to_be_appended.get_apiv2_elements():
                    if element == element_2:
                        duplicated_element = True
                        break
            if duplicated_element:
                duplicated.append(mapping)

        if len(duplicated) == 0:
            mappings.append(mapping_to_be_appended)
            return

        for conflicted_mapping in duplicated:
            mapping_to_be_appended = merge_mappings(
                mapping_to_be_appended, conflicted_mapping
            )
            mappings.remove(conflicted_mapping)

        mappings.append(mapping_to_be_appended)
