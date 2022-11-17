from abc import ABC, abstractmethod
from typing import Any, Optional

from package_parser.processing.api.model import (
    AbstractType,
    Class,
    Function,
    InstanceAttribute,
    Parameter,
    ParameterAssignment,
    Result,
    UnionType,
)


class AbstractDiffer(ABC):
    @abstractmethod
    def compute_attribute_similarity(
        self,
        attributes_a: InstanceAttribute,
        attributes_b: InstanceAttribute,
    ) -> float:
        pass

    @abstractmethod
    def compute_class_similarity(self, class_a: Class, class_b: Class) -> float:
        pass

    @abstractmethod
    def compute_function_similarity(
        self, function_a: Function, function_b: Function
    ) -> float:
        pass

    @abstractmethod
    def compute_parameter_similarity(
        self, parameter_a: Parameter, parameter_b: Parameter
    ) -> float:
        pass

    @abstractmethod
    def compute_result_similarity(self, result_a: Result, result_b: Result) -> float:
        pass


def distance_elements(
    list_a: list[Any], list_b: list[Any], are_similar=lambda x, y: x == y
) -> float:
    if len(list_a) == 0:
        return len(list_b)
    if len(list_b) == 0:
        return len(list_a)
    if are_similar(list_a[0], list_b[0]):
        return distance_elements(list_a[1:], list_b[1:])
    return 1 + min(
        distance_elements(list_a[1:], list_b),
        distance_elements(list_a, list_b[1:]),
        distance_elements(list_a[1:], list_b[1:]),
    )


class SimpleDiffer(AbstractDiffer):
    def compute_class_similarity(self, class_a: Class, class_b: Class) -> float:
        name_similarity = self._compute_name_similarity(class_a.name, class_b.name)
        attributes_similarity = distance_elements(
            class_a.instance_attributes, class_b.instance_attributes
        )
        attributes_similarity = attributes_similarity / (
            max(len(class_a.instance_attributes), len(class_b.instance_attributes))
        )
        code_similarity = self._compute_code_similarity(class_a.code, class_b.code)
        return (name_similarity + attributes_similarity + code_similarity) / 3

    def _compute_name_similarity(self, name_a: str, name_b: str) -> float:
        name_similarity = distance_elements([*name_a], [*name_b])
        return name_similarity / max(len(name_a), len(name_b))

    def compute_attribute_similarity(
        self,
        attributes_a: str,
        attributes_b: str,
    ) -> float:
        return self._compute_name_similarity(attributes_a, attributes_b)

    def compute_function_similarity(
        self, function_a: Function, function_b: Function
    ) -> float:
        code_similarity = self._compute_code_similarity(
            function_a.code, function_b.code
        )
        name_similarity = self._compute_name_similarity(
            function_a.name, function_b.name
        )

        def are_parameters_similar(parameter_a: Parameter, parameter_b: Parameter):
            return self.compute_parameter_similarity(parameter_a, parameter_b) == 1

        parameter_similarity = distance_elements(
            function_a.parameters,
            function_b.parameters,
            are_similar=are_parameters_similar,
        )
        return (code_similarity + name_similarity + parameter_similarity) / 3

    def _compute_code_similarity(self, code_a: str, code_b: str) -> float:
        diff_code = distance_elements(code_a.split("\n"), code_b.split("\n"))
        return diff_code

    def compute_parameter_similarity(
        self, parameter_a: Parameter, parameter_b: Parameter
    ) -> float:
        parameter_name_similarity = self._compute_name_similarity(
            parameter_a.name, parameter_b.name
        )
        parameter_type_similarity = self._compute_type_similarity(
            parameter_a.type, parameter_b.type
        )
        parameter_assignment_similarity = self._compute_assignment_similarity(
            parameter_a.assigned_by, parameter_b.assigned_by
        )
        return (
            parameter_name_similarity
            + parameter_type_similarity
            + parameter_assignment_similarity
        ) / 3

    def _compute_type_similarity(
        self, type_a: Optional[AbstractType], type_b: Optional[AbstractType]
    ) -> float:
        if type_a is None and type_b is None:
            return 0
        if type_a is None and type_b is not None:
            return 1
        if type_b is None and type_a is not None:
            return 0

        def are_types_similar(
            abstract_type_a: AbstractType, abstract_type_b: AbstractType
        ):
            return abstract_type_a.to_json() == abstract_type_b.to_json()

        return distance_elements(
            self._create_list_from_type(type_a),
            self._create_list_from_type(type_b),
            are_similar=are_types_similar,
        )

    def _create_list_from_type(self, abstract_type: AbstractType):
        if isinstance(abstract_type, UnionType):
            return abstract_type.types
        return [abstract_type]

    def _compute_assignment_similarity(
        self, assigned_by_a: ParameterAssignment, assigned_by_b: ParameterAssignment
    ) -> float:
        if assigned_by_a == assigned_by_b:
            return 1
        return 0

    def compute_result_similarity(self, result_a: Result, result_b: Result) -> float:
        return self._compute_name_similarity(result_a.name, result_b.name)
