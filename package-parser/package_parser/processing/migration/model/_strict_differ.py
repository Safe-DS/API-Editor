from dataclasses import dataclass, field
from typing import Optional, TypeVar, Union

from package_parser.processing.api.model import (
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)

from ._differ import AbstractDiffer
from ._mapping import Mapping

DEPENDENT_API_ELEMENTS = TypeVar("DEPENDENT_API_ELEMENTS", Attribute, Parameter, Result)
api_element = Union[Attribute, Class, Function, Parameter, Result]


@dataclass
class StrictDiffer(AbstractDiffer):
    previous_mappings: list[Mapping]
    differ: AbstractDiffer
    relevant_comparisons: Optional[list[tuple[list[api_element], list[api_element]]]] = field(init=False)

    def __post_init__(self) -> None:
        self.relevant_comparisons = self.get_relevant_comparisons()

    def get_relevant_comparisons(
        self,
    ) -> Optional[list[tuple[list[api_element], list[api_element]]]]:
        if hasattr(self, "relevant_comparisons") and self.relevant_comparisons is not None:
            return self.relevant_comparisons
        relevant_comparisons = []
        for mapping in self.previous_mappings:
            relevant_comparisons.append(
                (mapping.get_apiv1_elements(), mapping.get_apiv2_elements())
            )
        return relevant_comparisons

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
        return False

    def _get_mapping_for_elements(
        self,
        apiv1_element: DEPENDENT_API_ELEMENTS,
        apiv2_element: DEPENDENT_API_ELEMENTS,
    ) -> tuple[list[Mapping], list[Mapping]]:
        mapping_for_apiv1_elements = []
        mapping_for_apiv2_elements = []
        for mapping in self.previous_mappings:
            if isinstance(mapping.get_apiv1_elements()[0], (Class, Function)):
                for element in mapping.get_apiv1_elements():
                    if self._is_parent(element, apiv1_element):
                        mapping_for_apiv1_elements.append(mapping)
                for element in mapping.get_apiv2_elements():
                    if self._is_parent(element, apiv2_element):
                        mapping_for_apiv2_elements.append(mapping)
        return mapping_for_apiv1_elements, mapping_for_apiv2_elements

    def compute_class_similarity(self, class_a: Class, class_b: Class) -> float:
        classv1 = class_a
        classv2 = class_b

        for mapping in self.previous_mappings:
            if (
                classv1 in mapping.get_apiv1_elements()
                and classv2 in mapping.get_apiv2_elements()
            ):
                return self.differ.compute_class_similarity(classv1, classv2)
        return 0

    def compute_function_similarity(
        self, function_a: Function, function_b: Function
    ) -> float:
        functionv1 = function_a
        functionv2 = function_a

        for mapping in self.previous_mappings:
            if (
                functionv1 in mapping.get_apiv1_elements()
                and functionv2 in mapping.get_apiv2_elements()
            ):
                return self.differ.compute_function_similarity(functionv1, functionv2)
        return 0

    def compute_parameter_similarity(
        self, parameter_a: Parameter, parameter_b: Parameter
    ) -> float:
        parameterv1 = parameter_a
        parameterv2 = parameter_b
        (
            relevant_apiv1_mappings,
            relevant_apiv2_mappings,
        ) = self._get_mapping_for_elements(parameterv1, parameterv2)
        relevant_apiv2_mappings_include_parameterv1 = (
            len(
                [
                    function
                    for mapping in relevant_apiv2_mappings
                    for function in mapping.get_apiv1_elements()
                    if self._is_parent(function, parameterv1)
                ]
            )
            == 1
        )
        relevant_apiv2_mappings_include_parameterv2 = (
            len(
                [
                    function
                    for mapping in relevant_apiv1_mappings
                    for function in mapping.get_apiv2_elements()
                    if self._is_parent(function, parameterv2)
                ]
            )
            == 1
        )
        if (
            relevant_apiv2_mappings_include_parameterv1
            and relevant_apiv2_mappings_include_parameterv2
        ):
            return self.differ.compute_parameter_similarity(parameterv1, parameterv2)
        if (
            relevant_apiv2_mappings_include_parameterv1
            or relevant_apiv2_mappings_include_parameterv2
        ):
            return self.differ.compute_parameter_similarity(parameterv1, parameterv2) / 2
        return 0.0

    def compute_result_similarity(self, result_a: Result, result_b: Result) -> float:
        resultv1 = result_a
        resultv2 = result_b
        (
            relevant_apiv1_mappings,
            relevant_apiv2_mappings,
        ) = self._get_mapping_for_elements(resultv1, resultv2)
        relevant_apiv2_mappings_include_resultv1 = (
            len(
                [
                    function
                    for mapping in relevant_apiv2_mappings
                    for function in mapping.get_apiv1_elements()
                    if self._is_parent(function, resultv1)
                ]
            )
            == 1
        )
        relevant_apiv2_mappings_include_resultv2 = (
            len(
                [
                    function
                    for mapping in relevant_apiv1_mappings
                    for function in mapping.get_apiv2_elements()
                    if self._is_parent(function, resultv2)
                ]
            )
            == 1
        )
        if (
            relevant_apiv2_mappings_include_resultv1
            and relevant_apiv2_mappings_include_resultv2
        ):
            return self.differ.compute_result_similarity(resultv1, resultv2)
        if (
            relevant_apiv2_mappings_include_resultv1
            or relevant_apiv2_mappings_include_resultv2
        ):
            return 0.5
        return 0.0

    def compute_attribute_similarity(
        self, attributes_a: Attribute, attributes_b: Attribute
    ) -> float:
        attributev1 = attributes_a
        attributev2 = attributes_b
        (
            relevant_apiv1_mappings,
            relevant_apiv2_mappings,
        ) = self._get_mapping_for_elements(attributev1, attributev2)
        relevant_apiv2_mappings_include_attributev1 = (
            len(
                [
                    class_
                    for mapping in relevant_apiv2_mappings
                    for class_ in mapping.get_apiv1_elements()
                    if self._is_parent(class_, attributev1)
                ]
            )
            == 1
        )
        relevant_apiv2_mappings_include_attributev2 = (
            len(
                [
                    class_
                    for mapping in relevant_apiv1_mappings
                    for class_ in mapping.get_apiv2_elements()
                    if self._is_parent(class_, attributev2)
                ]
            )
            == 1
        )
        if (
            relevant_apiv2_mappings_include_attributev1
            and relevant_apiv2_mappings_include_attributev2
        ):
            return self.differ.compute_attribute_similarity(attributev1, attributev2)
        if (
            relevant_apiv2_mappings_include_attributev1
            or relevant_apiv2_mappings_include_attributev2
        ):
            return self.differ.compute_attribute_similarity(attributev1, attributev2) / 2
        return 0.0
