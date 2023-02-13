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
from ._mapping import Mapping, OneToOneMapping, merge_mappings

api_element = Union[Attribute, Class, Function, Parameter, Result]
API_ELEMENTS = TypeVar("API_ELEMENTS", Attribute, Class, Function, Parameter, Result)


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
        threshold_of_similarity_for_creation_of_mappings: float = 0.5,
        threshold_of_similarity_between_mappings: float = 0.05,
    ) -> None:
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
        previous_mappings = self.differ.get_related_mappings()
        if previous_mappings is not None:
            for mapping in previous_mappings:
                new_mapping = None
                if isinstance(
                    mapping.get_apiv1_elements()[0], Attribute
                ) and isinstance(mapping.get_apiv2_elements()[0], Attribute):
                    new_mapping = self._get_mappings_for_api_elements(
                        [
                            element
                            for element in mapping.get_apiv1_elements()
                            if isinstance(element, Attribute)
                        ],
                        [
                            element
                            for element in mapping.get_apiv2_elements()
                            if isinstance(element, Attribute)
                        ],
                        self.differ.compute_attribute_similarity,
                    )
                    mappings.extend(new_mapping)
                elif isinstance(mapping.get_apiv1_elements()[0], Class) and isinstance(
                    mapping.get_apiv2_elements()[0], Class
                ):
                    new_mapping = self._get_mappings_for_api_elements(
                        [
                            element
                            for element in mapping.get_apiv1_elements()
                            if isinstance(element, Class)
                        ],
                        [
                            element
                            for element in mapping.get_apiv2_elements()
                            if isinstance(element, Class)
                        ],
                        self.differ.compute_class_similarity,
                    )
                    mappings.extend(new_mapping)
                elif isinstance(
                    mapping.get_apiv1_elements()[0], Function
                ) and isinstance(mapping.get_apiv2_elements()[0], Function):
                    new_mapping = self._get_mappings_for_api_elements(
                        [
                            element
                            for element in mapping.get_apiv1_elements()
                            if isinstance(element, Function)
                        ],
                        [
                            element
                            for element in mapping.get_apiv2_elements()
                            if isinstance(element, Function)
                        ],
                        self.differ.compute_function_similarity,
                    )
                    mappings.extend(new_mapping)
                elif isinstance(
                    mapping.get_apiv1_elements()[0], Parameter
                ) and isinstance(mapping.get_apiv2_elements()[0], Parameter):
                    new_mapping = self._get_mappings_for_api_elements(
                        [
                            element
                            for element in mapping.get_apiv1_elements()
                            if isinstance(element, Parameter)
                        ],
                        [
                            element
                            for element in mapping.get_apiv2_elements()
                            if isinstance(element, Parameter)
                        ],
                        self.differ.compute_parameter_similarity,
                    )
                    mappings.extend(new_mapping)
                elif isinstance(mapping.get_apiv1_elements()[0], Result) and isinstance(
                    mapping.get_apiv2_elements()[0], Result
                ):
                    new_mapping = self._get_mappings_for_api_elements(
                        [
                            element
                            for element in mapping.get_apiv1_elements()
                            if isinstance(element, Result)
                        ],
                        [
                            element
                            for element in mapping.get_apiv2_elements()
                            if isinstance(element, Result)
                        ],
                        self.differ.compute_result_similarity,
                    )
                    mappings.extend(new_mapping)
                if new_mapping is not None:
                    self.differ.notify_new_mapping(new_mapping)
        else:
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
    ) -> None:
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
