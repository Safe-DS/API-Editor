from typing import Callable, Optional, Union

from package_parser.processing.api.model import (
    API,
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)

from ._differ import AbstractDiffer
from ._mapping import ManyToManyMapping, Mapping

api_element = Union[Attribute, Class, Function, Parameter, Result]


class InheritanceDiffer(AbstractDiffer):
    boost_value: float
    differ: AbstractDiffer
    inheritance: dict[str, list[str]]
    new_mappings: list[Mapping]

    def __init__(
        self,
        previous_base_differ: AbstractDiffer,
        previous_mappings: list[Mapping],
        apiv1: API,
        apiv2: API,
        boost_value: float = 0.15,
    ) -> None:
        super().__init__(previous_base_differ, previous_mappings, apiv1, apiv2)
        self.differ = previous_base_differ
        self.boost_value = boost_value
        self.inheritance = {}
        self.new_mappings = []
        for class_v2 in self.apiv2.classes.values():
            additional_v1_elements = []
            for mapping in previous_mappings:
                if isinstance(mapping.get_apiv2_elements()[0], Class):
                    is_inheritance_mapping = class_v2.id in map(
                        lambda class_: class_.id if isinstance(class_, Class) else "",
                        mapping.get_apiv2_elements(),
                    )
                    if not is_inheritance_mapping:
                        for inheritance_class_v2 in mapping.get_apiv2_elements():
                            if isinstance(inheritance_class_v2, Class):
                                if (
                                    inheritance_class_v2.name in class_v2.superclasses
                                    or class_v2.name
                                    in inheritance_class_v2.superclasses
                                ):
                                    is_inheritance_mapping = True
                                    break
                    if is_inheritance_mapping:
                        for class_v1 in mapping.get_apiv1_elements():
                            if isinstance(class_v1, Class):
                                additional_v1_elements.append(class_v1.id)
            if len(additional_v1_elements) > 0:
                self.inheritance[class_v2.id] = additional_v1_elements

    def compute_attribute_similarity(
        self, attributev1: Attribute, attributev2: Attribute
    ) -> float:
        """
        Computes similarity between attributes from apiv1 and apiv2.
        :param attributev1: attribute from apiv1
        :param attributev2: attribute from apiv2
        :return: if the parent of the attributes are mapped onto each other
         or onto a super- or subclass, the normalized similarity of the previous differ plus boost_value, or else 0.
        """
        if (
            attributev2.class_id in self.inheritance
            and attributev1.class_id in self.inheritance[attributev2.class_id]
        ):
            return (
                self.differ.compute_attribute_similarity(attributev1, attributev2)
                * (1 - self.boost_value)
            ) + self.boost_value
        return 0.0

    def compute_class_similarity(self, classv1: Class, classv2: Class) -> float:
        """
        Computes similarity between classes from apiv1 and apiv2
        :param classv1: class from apiv1
        :param classv2: class from apiv2
        :return: if the classes are mapped onto each other or onto a super- or subclass,
        the normalized similarity of the previous differ plus boost_value, or else 0.
        """
        if classv2.id in self.inheritance:
            for mapping in self.previous_mappings:
                for elementv2 in mapping.get_apiv2_elements():
                    if isinstance(elementv2, Class):
                        if elementv2.id in self.inheritance[classv2.id]:
                            return (
                                self.differ.compute_class_similarity(classv1, classv2)
                                * (1 - self.boost_value)
                            ) + self.boost_value
        return 0.0

    def compute_function_similarity(
        self, functionv1: Function, functionv2: Function
    ) -> float:
        """
        Computes similarity between functions from apiv1 and apiv2.
        :param functionv1: function from apiv1
        :param functionv2: function from apiv2
        :return: if functions are not global functions and its parent are mapped onto each other
         or onto a super- or subclass, the normalized similarity of the previous differ plus boost_value, or else 0.
        """
        functionv1_is_global = len(functionv1.id.split("/")) == 3
        functionv2_is_global = len(functionv2.id.split("/")) == 3
        if functionv1_is_global or functionv2_is_global:
            return 0.0
        class_id_functionv1 = "/".join(functionv1.id.split("/")[:-1])
        class_id_functionv2 = "/".join(functionv2.id.split("/")[:-1])
        if (
            class_id_functionv2 in self.inheritance
            and class_id_functionv1 in self.inheritance[class_id_functionv2]
        ):
            base_similarity = self.differ.compute_function_similarity(
                functionv1, functionv2
            )
            return (base_similarity * (1 - self.boost_value)) + self.boost_value
        return 0.0

    def compute_parameter_similarity(
        self, parameterv1: Parameter, parameterv2: Parameter
    ) -> float:
        """
        Computes similarity between parameters from apiv1 and apiv2.
        :param parameterv1: parameter from apiv1
        :param parameterv2: parameter from apiv2
        :return: if their parents are mapped together, the normalized similarity of the previous differ plus boost_value,
        or else 0.
        """
        parameterv2_id_splitted = parameterv2.id.split("/")
        if "/".join(parameterv2_id_splitted[:-2]) in self.inheritance:
            functionv1_id = "/".join(parameterv1.id.split("/")[:-1])
            for mapping in self.new_mappings:
                for functionv1 in mapping.get_apiv1_elements():
                    if (
                        isinstance(functionv1, Function)
                        and functionv1_id == functionv1.id
                    ):
                        for functionv2 in mapping.get_apiv2_elements():
                            if (
                                isinstance(functionv2, Function)
                                and "/".join(parameterv2_id_splitted[:-1])
                                == functionv2.id
                            ):
                                return (
                                    self.differ.compute_parameter_similarity(
                                        parameterv1, parameterv2
                                    )
                                    * (1 - self.boost_value)
                                ) + self.boost_value
        return 0.0

    def compute_result_similarity(self, resultv1: Result, resultv2: Result) -> float:
        """
        Computes similarity between results from apiv1 and apiv2
        :param resultv1: result from apiv1
        :param resultv2: result from apiv2
        :return: if their parents are mapped together,
        the normalized similarity of the previous differ plus boost_value, or else 0.
        """
        if (
            resultv2.function_id is not None
            and "/".join(resultv2.function_id.split("/")[:-1]) in self.inheritance
        ):
            for mapping in self.new_mappings:
                for functionv1 in mapping.get_apiv1_elements():
                    if (
                        isinstance(functionv1, Function)
                        and resultv1.function_id == functionv1.id
                    ):
                        for functionv2 in mapping.get_apiv2_elements():
                            if (
                                isinstance(functionv2, Function)
                                and resultv2.function_id == functionv2.id
                            ):
                                return (
                                    self.differ.compute_result_similarity(
                                        resultv1, resultv2
                                    )
                                    * (1 - self.boost_value)
                                ) + self.boost_value
        return 0.0

    def get_related_mappings(self) -> Optional[list[Mapping]]:
        """
        Indicates whether all api elements should be compared with each other
        or just the ones that are mapped to each other.
        :return: a list of Mappings by type whose elements are not already mapped
        """
        related_mappings = []
        mapped_apiv1_elements = [
            element
            for mapping in self.previous_mappings
            for element in mapping.get_apiv1_elements()
        ]
        mapped_apiv2_elements = [
            element
            for mapping in self.previous_mappings
            for element in mapping.get_apiv2_elements()
        ]
        for get_api_element in [
            lambda api: api.classes.values(),
            lambda api: api.functions.values(),
            lambda api: api.attributes().values(),
            lambda api: api.parameters().values(),
            lambda api: api.results().values(),
        ]:
            not_mapped_elements_mapping = self._get_not_mapped_api_elements(
                mapped_apiv1_elements, mapped_apiv2_elements, get_api_element
            )
            if not_mapped_elements_mapping is not None:
                related_mappings.append(not_mapped_elements_mapping)
        return related_mappings

    def _get_not_mapped_api_elements(
        self,
        mapped_apiv1_elements: list[api_element],
        mapped_apiv2_elements: list[api_element],
        get_api_element: Callable[[API], list[api_element]],
    ) -> Optional[Mapping]:
        not_mapped_v1_elements = []
        for api_elementv1 in get_api_element(self.apiv1):
            if api_elementv1 not in mapped_apiv1_elements:
                not_mapped_v1_elements.append(api_elementv1)
        not_mapped_v2_elements = []
        for api_elementv2 in get_api_element(self.apiv2):
            if api_elementv2 not in mapped_apiv2_elements:
                not_mapped_v2_elements.append(api_elementv2)
        if len(not_mapped_v1_elements) > 0 and len(not_mapped_v2_elements) > 0:
            return ManyToManyMapping(
                -1.0, not_mapped_v1_elements, not_mapped_v2_elements
            )
        return None

    def notify_new_mapping(self, mappings: list[Mapping]) -> None:
        self.new_mappings.extend(mappings)

    def get_additional_mappings(self) -> list[Mapping]:
        return self.previous_mappings
