from typing import Optional, TypeVar, Union

from package_parser.processing.api.model import (
    API,
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)

from ._differ import AbstractDiffer
from ._mapping import Mapping

DEPENDENT_API_ELEMENTS = TypeVar(
    "DEPENDENT_API_ELEMENTS", Function, Attribute, Parameter, Result
)
api_element = Union[Attribute, Class, Function, Parameter, Result]


class StrictDiffer(AbstractDiffer):
    new_mappings: list[Mapping]
    differ: AbstractDiffer

    def __init__(
        self,
        previous_base_differ: AbstractDiffer,
        previous_mappings: list[Mapping],
        apiv1: API,
        apiv2: API,
    ) -> None:
        super().__init__(previous_base_differ, previous_mappings, apiv1, apiv2)
        self.differ = previous_base_differ
        self.new_mappings = []

    def get_related_mappings(
        self,
    ) -> Optional[list[Mapping]]:
        sort_order = {
            Class: 0,
            Attribute: 1,
            Function: 2,
            Parameter: 3,
            Result: 4,
        }
        return sorted(
            self.previous_mappings,
            key=lambda mapping: sort_order[type(mapping.get_apiv1_elements()[0])],
        )

    def notify_new_mapping(self, mappings: list[Mapping]) -> None:
        self.new_mappings.extend(mappings)

    def get_additional_mappings(self) -> list[Mapping]:
        return []

    def _is_parent(
        self,
        possible_parent: Union[Class, Function, Attribute, Parameter, Result],
        child: DEPENDENT_API_ELEMENTS,
    ) -> bool:
        if isinstance(child, Attribute) and isinstance(possible_parent, Class):
            return child.class_id == possible_parent.id
        if isinstance(child, Result) and isinstance(possible_parent, Function):
            return child.function_id == possible_parent.id
        if isinstance(child, Parameter) and isinstance(possible_parent, Function):
            return "/".join(child.id.split("/")[:-1]) == possible_parent.id
        if isinstance(child, Function) and isinstance(possible_parent, Class):
            return "/".join(child.id.split("/")[:-1]) == possible_parent.id
        return False

    def _api_elements_are_mapped_to_each_other(
        self,
        api_elementv1: DEPENDENT_API_ELEMENTS,
        api_elementv2: DEPENDENT_API_ELEMENTS,
    ) -> bool:
        (
            relevant_apiv1_mappings,
            relevant_apiv2_mappings,
        ) = self._get_mapping_for_elements(api_elementv1, api_elementv2)
        relevant_apiv2_mappings_include_functionv1 = (
            len(
                [
                    parent
                    for mapping in relevant_apiv2_mappings
                    for parent in mapping.get_apiv1_elements()
                    if self._is_parent(parent, api_elementv1)
                ]
            )
            == 1
        )
        relevant_apiv2_mappings_include_functionv2 = (
            len(
                [
                    parent
                    for mapping in relevant_apiv1_mappings
                    for parent in mapping.get_apiv2_elements()
                    if self._is_parent(parent, api_elementv2)
                ]
            )
            == 1
        )
        return (
            relevant_apiv2_mappings_include_functionv1
            and relevant_apiv2_mappings_include_functionv2
        )

    def _get_mapping_for_elements(
        self,
        apiv1_element: DEPENDENT_API_ELEMENTS,
        apiv2_element: DEPENDENT_API_ELEMENTS,
    ) -> tuple[list[Mapping], list[Mapping]]:
        mapping_for_apiv1_elements = []
        mapping_for_apiv2_elements = []
        for mapping in self.new_mappings:
            if isinstance(mapping.get_apiv1_elements()[0], (Class, Function)):
                for element in mapping.get_apiv1_elements():
                    if self._is_parent(element, apiv1_element):
                        mapping_for_apiv1_elements.append(mapping)
                for element in mapping.get_apiv2_elements():
                    if self._is_parent(element, apiv2_element):
                        mapping_for_apiv2_elements.append(mapping)
        return mapping_for_apiv1_elements, mapping_for_apiv2_elements

    def compute_class_similarity(self, classv1: Class, classv2: Class) -> float:
        """
        Computes similarity between classes from apiv1 and apiv2
        :param classv1: class from apiv1
        :param classv2: class from apiv2
        :return: if the classes are mapped together, the similarity of the previous differ, or else 0.
        """
        for mapping in self.previous_mappings:
            if (
                classv1 in mapping.get_apiv1_elements()
                and classv2 in mapping.get_apiv2_elements()
            ):
                return self.differ.compute_class_similarity(classv1, classv2)
        return 0

    def compute_function_similarity(
        self, functionv1: Function, functionv2: Function
    ) -> float:
        """
        Computes similarity between functions from apiv1 and apiv2.
        :param functionv1: function from apiv1
        :param functionv2: function from apiv2
        :return: if their parents are mapped together, the similarity of the previous differ, or else 0.
        """
        is_global_functionv1 = len(functionv1.id.split("/")) == 3
        is_global_functionv2 = len(functionv2.id.split("/")) == 3
        if (
            not is_global_functionv1 and not is_global_functionv2
        ) and self._api_elements_are_mapped_to_each_other(functionv1, functionv2):
            return self.differ.compute_function_similarity(functionv1, functionv2)
        return 0.0

    def compute_parameter_similarity(
        self, parameterv1: Parameter, parameterv2: Parameter
    ) -> float:
        """
        Computes similarity between parameters from apiv1 and apiv2.
        :param parameterv1: parameter from apiv1
        :param parameterv2: parameter from apiv2
        :return: if their parents are mapped together, the similarity of the previous differ, or else 0.
        """
        if self._api_elements_are_mapped_to_each_other(parameterv1, parameterv2):
            return self.differ.compute_parameter_similarity(parameterv1, parameterv2)
        return 0.0

    def compute_result_similarity(self, resultv1: Result, resultv2: Result) -> float:
        """
        Computes similarity between results from apiv1 and apiv2.
        :param resultv1: result from apiv1
        :param resultv2: result from apiv2
        :return: if their parents are mapped together, the similarity of the previous differ, or else 0.
        """
        if self._api_elements_are_mapped_to_each_other(resultv1, resultv2):
            return self.differ.compute_result_similarity(resultv1, resultv2)
        return 0.0

    def compute_attribute_similarity(
        self, attributev1: Attribute, attributev2: Attribute
    ) -> float:
        """
        Computes similarity between attributes from apiv1 and apiv2.
        :param attributev1: attribute from apiv1
        :param attributev2: attribute from apiv2
        :return: if their parents are mapped together, the similarity of the previous differ, or else 0.
        """
        if self._api_elements_are_mapped_to_each_other(attributev1, attributev2):
            return self.differ.compute_attribute_similarity(attributev1, attributev2)
        return 0.0
