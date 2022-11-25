from abc import ABC, abstractmethod
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

api_element = Union[Attribute, Parameter, Function, Class, Result]
THRESHOLD_OF_SIMILARITY_BETWEEN_MAPPINGS = 0.05
THRESHOLD_OF_SIMILARITY_FOR_CREATION_OF_MAPPINGS = 0.5


class Mapping(ABC):
    similarity: float

    def __init__(self, similarity: float):
        self.similarity = similarity

    @abstractmethod
    def get_apiv1_elements(self) -> list[api_element]:
        pass

    @abstractmethod
    def get_apiv2_elements(self) -> list[api_element]:
        pass

    def get_similarity(self) -> float:
        return self.similarity


class OneToOneMapping(Mapping):
    apiv1_elements: api_element
    apiv2_elements: api_element

    def __init__(
        self,
        apiv1_elements: api_element,
        apiv2_elements: api_element,
        similarity: float,
    ):
        super().__init__(similarity)
        self.apiv1_elements = apiv1_elements
        self.apiv2_elements = apiv2_elements

    def get_apiv1_elements(self) -> list[api_element]:
        return [self.apiv1_elements]

    def get_apiv2_elements(self) -> list[api_element]:
        return [self.apiv2_elements]


class OneToManyMapping(Mapping):
    apiv1_elements: api_element
    apiv2_elements: list[api_element]

    def __init__(
        self,
        apiv1_elements: api_element,
        apiv2_elements: list[api_element],
        similarity: float,
    ):
        super().__init__(similarity)
        self.apiv1_elements = apiv1_elements
        self.apiv2_elements = apiv2_elements

    def get_apiv1_elements(self) -> list[api_element]:
        return [self.apiv1_elements]

    def get_apiv2_elements(self) -> list[api_element]:
        return self.apiv2_elements


class ManyToOneMapping(Mapping):
    apiv1_elements: list[api_element]
    apiv2_elements: api_element

    def __init__(
        self,
        apiv1_elements: list[api_element],
        apiv2_elements: api_element,
        similarity: float,
    ):
        super().__init__(similarity)
        self.apiv1_elements = apiv1_elements
        self.apiv2_elements = apiv2_elements

    def get_apiv1_elements(self) -> list[api_element]:
        return self.apiv1_elements

    def get_apiv2_elements(self) -> list[api_element]:
        return [self.apiv2_elements]


class ManyToManyMapping(Mapping):
    apiv1_elements: list[api_element]
    apiv2_elements: list[api_element]

    def __init__(
        self,
        apiv1_elements: list[api_element],
        apiv2_elements: list[api_element],
        similarity: float,
    ):
        super().__init__(similarity)
        self.apiv1_elements = apiv1_elements
        self.apiv2_elements = apiv2_elements

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
        return OneToOneMapping(domain[0], codomain[0], similarity)
    if len(domain) == 1:
        return OneToManyMapping(domain[0], codomain, similarity)
    if len(codomain) == 1:
        return ManyToOneMapping(domain, codomain[0], similarity)
    return ManyToManyMapping(domain, codomain, similarity)


API_ELEMENTS = TypeVar(
    "API_ELEMENTS", Attribute, Result, Parameter, Function, Class
)


def _get_mappings_for_api_elements(
    api_elementv1_list: List[API_ELEMENTS],
    api_elementv2_list: List[API_ELEMENTS],
    compute_similarity: Callable[[API_ELEMENTS, API_ELEMENTS], float],
) -> list[Mapping]:
    element_mappings: list[Mapping] = []
    for api_elementv1 in api_elementv1_list:
        mapping_for_class_1: list[Mapping] = []
        for api_elementv2 in api_elementv2_list:
            similarity = compute_similarity(api_elementv1, api_elementv2)
            if similarity >= THRESHOLD_OF_SIMILARITY_FOR_CREATION_OF_MAPPINGS:
                mapping_for_class_1.append(
                    OneToOneMapping(api_elementv1, api_elementv2, similarity)
                )
        mapping_for_class_1.sort(key=Mapping.get_similarity, reverse=True)
        new_mapping = _merge_similar_mappings(mapping_for_class_1)
        if new_mapping is not None:
            _merge_mappings_with_same_elements(new_mapping, element_mappings)
    return element_mappings


def map_api(apiv1: API, apiv2: API, differ: AbstractDiffer) -> list[Mapping]:
    all_mappings: list[Mapping] = []

    all_mappings.extend(
        _get_mappings_for_api_elements(
            list(apiv1.classes.values()),
            list(apiv2.classes.values()),
            differ.compute_class_similarity,
        )
    )
    all_mappings.extend(
        _get_mappings_for_api_elements(
            list(apiv1.functions.values()),
            list(apiv2.functions.values()),
            differ.compute_function_similarity,
        )
    )
    all_mappings.extend(
        _get_mappings_for_api_elements(
            list(apiv1.parameters().values()),
            list(apiv2.parameters().values()),
            differ.compute_parameter_similarity,
        )
    )

    all_mappings.extend(
        _get_mappings_for_api_elements(
            [
                attribute
                for class_ in apiv1.classes.values()
                for attribute in class_.instance_attributes
            ],
            [
                attribute
                for class_ in apiv2.classes.values()
                for attribute in class_.instance_attributes
            ],
            differ.compute_attribute_similarity,
        )
    )

    all_mappings.extend(
        _get_mappings_for_api_elements(
            [
                result
                for function in apiv1.functions.values()
                for result in function.results
            ],
            [
                result
                for function in apiv2.functions.values()
                for result in function.results
            ],
            differ.compute_result_similarity,
        )
    )

    all_mappings.sort(key=Mapping.get_similarity, reverse=True)
    return all_mappings


def _merge_similar_mappings(mappings: List[Mapping]) -> Optional[Mapping]:
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
        < THRESHOLD_OF_SIMILARITY_BETWEEN_MAPPINGS
    ):
        mappings[0] = merge_mappings(mappings[0], mappings[1])
        mappings.pop(1)
        return _merge_similar_mappings(mappings)
    return mappings[0]


def _merge_mappings_with_same_elements(
    mapping_to_be_appended: Mapping, mappings: list[Mapping]
):
    """
    This method prevents that an element in a mapping appears multiple times in a list of mappings
    by merging the affected mappings and include the result in the list. If there is no such element,
    the mapping will be included without any merge.

    :param mapping_to_be_appended: the mapping that should be included in mappings
    :param mappings: the list, in wich mapping_to_be_appended should be appended
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
