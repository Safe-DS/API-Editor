from copy import deepcopy
from typing import Optional, TypeVar

from package_parser.processing.api.model import (
    API,
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)

from ._differ import AbstractDiffer
from ._mapping import Mapping, OneToOneMapping


class UnchangedDiffer(AbstractDiffer):
    def __init__(
        self,
        previous_base_differ: Optional[AbstractDiffer],
        previous_mappings: list[Mapping],
        apiv1: API,
        apiv2: API,
    ) -> None:
        super().__init__(previous_base_differ, previous_mappings, apiv1, apiv2)
        self.unchanged_api_mappings: list[Mapping] = []
        for classv1 in apiv1.classes.values():
            classv2 = apiv2.classes.get(classv1.id, None)
            if classv2 is not None and self.have_same_api(classv1, classv2):
                self.unchanged_api_mappings.append(
                    OneToOneMapping(1.0, classv1, classv2)
                )

        for functionv1 in apiv1.functions.values():
            functionv2 = apiv2.functions.get(functionv1.id, None)
            if functionv2 is not None and self.have_same_api(functionv1, functionv2):
                self.unchanged_api_mappings.append(
                    OneToOneMapping(1.0, functionv1, functionv2)
                )

        for parameterv1 in apiv1.parameters().values():
            parameterv2 = apiv2.parameters().get(parameterv1.id, None)
            if parameterv2 is not None and self.have_same_api(parameterv1, parameterv2):
                self.unchanged_api_mappings.append(
                    OneToOneMapping(1.0, parameterv1, parameterv2)
                )

        for attributev1 in apiv1.attributes().values():
            attributev2 = apiv2.attributes().get(
                f"{attributev1.class_id}/{attributev1.name}", None
            )
            if attributev2 is not None and self.have_same_api(attributev1, attributev2):
                self.unchanged_api_mappings.append(
                    OneToOneMapping(1.0, attributev1, attributev2)
                )

        for resultv1 in apiv1.results().values():
            resultv2 = apiv2.results().get(
                f"{resultv1.function_id}/{resultv1.name}", None
            )
            if resultv2 is not None and self.have_same_api(resultv1, resultv2):
                self.unchanged_api_mappings.append(
                    OneToOneMapping(1.0, resultv1, resultv2)
                )

    API_ELEMENTS = TypeVar(
        "API_ELEMENTS", Attribute, Class, Function, Parameter, Result
    )

    def have_same_api(
        self, api_elementv1: API_ELEMENTS, api_elementv2: API_ELEMENTS
    ) -> bool:
        if isinstance(api_elementv1, (Class, Function)):
            api_elementv1 = deepcopy(api_elementv1)
            api_elementv1.code = ""
            api_elementv1.formatted_code = ""
            api_elementv2 = deepcopy(api_elementv2)
            api_elementv2.code = ""
            api_elementv2.formatted_code = ""
        return api_elementv1 == api_elementv2

    def compute_attribute_similarity(
        self, attributev1: Attribute, attributev2: Attribute
    ) -> float:
        return 0.0

    def compute_class_similarity(self, classv1: Class, classv2: Class) -> float:
        return 0.0

    def compute_function_similarity(
        self, functionv1: Function, functionv2: Function
    ) -> float:
        return 0.0

    def compute_parameter_similarity(
        self, parameterv1: Parameter, parameterv2: Parameter
    ) -> float:
        return 0.0

    def compute_result_similarity(self, resultv1: Result, resultv2: Result) -> float:
        return 0.0

    def get_related_mappings(self) -> Optional[list[Mapping]]:
        return []

    def notify_new_mapping(self, mappings: list[Mapping]) -> None:
        pass

    def get_additional_mappings(self) -> list[Mapping]:
        return self.unchanged_api_mappings
