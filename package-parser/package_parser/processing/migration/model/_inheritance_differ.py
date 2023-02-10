from dataclasses import dataclass, field
from typing import Callable, Optional, Union

from package_parser.processing.api.model import (
    API,
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)
from package_parser.processing.migration.model import (
    AbstractDiffer,
    ManyToManyMapping,
    Mapping,
)

api_element = Union[Attribute, Class, Function, Parameter, Result]


@dataclass
class InheritanceDiffer(AbstractDiffer):
    previous_mappings: list[Mapping]
    differ: AbstractDiffer
    apiv1: API
    apiv2: API
    inheritance: dict[str, list[Class]]
    boost_value: float = 0.25
    new_mappings: list[Mapping] = field(init=False)

    def __post_init__(self) -> None:
        self.new_mappings = []
        self.inheritance = {}
        for class_v2 in self.apiv2.classes.values():
            additional_v2_elements = []
            additional_v2_elements.extend(
                [
                    element
                    for element in self.apiv2.classes.values()
                    if isinstance(element, Class)
                    and (
                        element.name in class_v2.superclasses
                        or class_v2 in element.superclasses
                    )
                ]
            )
            if len(additional_v2_elements) > 0:
                self.inheritance[class_v2.id] = additional_v2_elements

    def compute_attribute_similarity(
        self, attributev1: Attribute, attributev2: Attribute
    ) -> float:
        if attributev2.class_id in self.inheritance:
            for mapping in self.previous_mappings:
                if (
                    attributev1 in mapping.get_apiv1_elements()
                    and attributev2 in mapping.get_apiv2_elements()
                ):
                    return (
                        self.differ.compute_attribute_similarity(
                            attributev1, attributev2
                        )
                        * 0.75
                    ) + self.boost_value
        return 0.0

    def compute_class_similarity(self, classv1: Class, classv2: Class) -> float:
        if classv2.id in self.inheritance:
            for mapping in self.previous_mappings:
                if (
                    classv1 in mapping.get_apiv1_elements()
                    and classv2 in mapping.get_apiv2_elements()
                ):
                    return (
                        self.differ.compute_class_similarity(classv1, classv2) * 0.75
                    ) + self.boost_value
        return 0.0

    def compute_function_similarity(
        self, functionv1: Function, functionv2: Function
    ) -> float:
        if "/".join(functionv2.id.split("/")[:-1]) in self.inheritance:
            for mapping in self.previous_mappings:
                if (
                    functionv1 in mapping.get_apiv1_elements()
                    and functionv2 in mapping.get_apiv2_elements()
                ):
                    return (
                        self.differ.compute_function_similarity(functionv1, functionv2)
                        * 0.75
                    ) + self.boost_value
        return 0.0

    def compute_parameter_similarity(
        self, parameterv1: Parameter, parameterv2: Parameter
    ) -> float:
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
                                    * 0.75
                                ) + self.boost_value
        return 0.0

    def compute_result_similarity(self, resultv1: Result, resultv2: Result) -> float:
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
                                    * 0.75
                                ) + self.boost_value
        return 0.0

    def get_related_mappings(self) -> Optional[list[Mapping]]:
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
            lambda api: api.attributes(),
            lambda api: api.parameters(),
            lambda api: api.results(),
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
