from abc import ABC, abstractmethod
from typing import Callable, Optional, TypeVar

from Levenshtein import distance
from package_parser.processing.api.model import (
    AbstractType,
    Attribute,
    Class,
    Function,
    Parameter,
    ParameterAssignment,
    Result,
    UnionType,
)


class AbstractDiffer(ABC):
    @abstractmethod
    def compute_attribute_similarity(
        self,
        attributes_a: Attribute,
        attributes_b: Attribute,
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


X = TypeVar("X")


def distance_elements(
    list_a: list[X],
    list_b: list[X],
    are_similar: Callable[[X, X], bool] = lambda x, y: x == y,
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
    assigned_by_look_up_similarity: dict[
        ParameterAssignment, dict[ParameterAssignment, float]
    ]

    def __init__(self) -> None:
        distance_between_implicit_and_explicit = 0.3
        distance_between_vararg_and_normal = 0.3
        distance_between_position_and_named = 0.3
        distance_between_both_to_one = 0.15
        distance_between_one_to_both = 0.15
        self.assigned_by_look_up_similarity = {
            ParameterAssignment.IMPLICIT: {
                ParameterAssignment.IMPLICIT: 1,
                ParameterAssignment.NAMED_VARARG: 1
                - distance_between_implicit_and_explicit
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
                ParameterAssignment.POSITIONAL_VARARG: 1
                - distance_between_implicit_and_explicit
                - distance_between_vararg_and_normal,
                ParameterAssignment.POSITION_OR_NAME: 1
                - distance_between_implicit_and_explicit,
                ParameterAssignment.NAME_ONLY: 1
                - distance_between_implicit_and_explicit,
                ParameterAssignment.POSITION_ONLY: 1
                - distance_between_implicit_and_explicit,
            },
            ParameterAssignment.NAMED_VARARG: {
                ParameterAssignment.IMPLICIT: 1
                - distance_between_implicit_and_explicit
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
                ParameterAssignment.NAMED_VARARG: 1,
                ParameterAssignment.POSITIONAL_VARARG: 1
                - distance_between_position_and_named,
                ParameterAssignment.POSITION_OR_NAME: 1
                - distance_between_vararg_and_normal
                - distance_between_one_to_both,
                ParameterAssignment.NAME_ONLY: 1 - distance_between_vararg_and_normal,
                ParameterAssignment.POSITION_ONLY: 1
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
            },
            ParameterAssignment.POSITIONAL_VARARG: {
                ParameterAssignment.IMPLICIT: 1
                - distance_between_implicit_and_explicit
                - distance_between_vararg_and_normal,
                ParameterAssignment.NAMED_VARARG: 1
                - distance_between_position_and_named,
                ParameterAssignment.POSITIONAL_VARARG: 1,
                ParameterAssignment.POSITION_OR_NAME: 1
                - distance_between_vararg_and_normal
                - distance_between_one_to_both,
                ParameterAssignment.NAME_ONLY: 1
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
                ParameterAssignment.POSITION_ONLY: 1
                - distance_between_vararg_and_normal,
            },
            ParameterAssignment.POSITION_OR_NAME: {
                ParameterAssignment.IMPLICIT: 1
                - distance_between_implicit_and_explicit,
                ParameterAssignment.NAMED_VARARG: 1
                - distance_between_vararg_and_normal
                - distance_between_both_to_one,
                ParameterAssignment.POSITIONAL_VARARG: 1
                - distance_between_vararg_and_normal
                - distance_between_both_to_one,
                ParameterAssignment.POSITION_OR_NAME: 1,
                ParameterAssignment.NAME_ONLY: 1 - distance_between_both_to_one,
                ParameterAssignment.POSITION_ONLY: 1 - distance_between_both_to_one,
            },
            ParameterAssignment.NAME_ONLY: {
                ParameterAssignment.IMPLICIT: 1
                - distance_between_implicit_and_explicit,
                ParameterAssignment.NAMED_VARARG: 1
                - distance_between_vararg_and_normal,
                ParameterAssignment.POSITIONAL_VARARG: 1
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
                ParameterAssignment.POSITION_OR_NAME: 1 - distance_between_one_to_both,
                ParameterAssignment.NAME_ONLY: 1,
                ParameterAssignment.POSITION_ONLY: 1
                - distance_between_position_and_named,
            },
            ParameterAssignment.POSITION_ONLY: {
                ParameterAssignment.IMPLICIT: 1
                - distance_between_implicit_and_explicit,
                ParameterAssignment.NAMED_VARARG: 1
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
                ParameterAssignment.POSITIONAL_VARARG: 1
                - distance_between_vararg_and_normal,
                ParameterAssignment.POSITION_OR_NAME: 1 - distance_between_one_to_both,
                ParameterAssignment.NAME_ONLY: 1 - distance_between_position_and_named,
                ParameterAssignment.POSITION_ONLY: 1,
            },
        }

    def compute_class_similarity(self, class_a: Class, class_b: Class) -> float:
        name_similarity = self._compute_name_similarity(class_a.name, class_b.name)
        attributes_similarity = distance_elements(
            class_a.instance_attributes, class_b.instance_attributes
        )
        attributes_similarity = attributes_similarity / (
            max(len(class_a.instance_attributes), len(class_b.instance_attributes), 1)
        )
        attributes_similarity = 1 - attributes_similarity

        code_similarity = self._compute_code_similarity(class_a.code, class_b.code)
        return (name_similarity + attributes_similarity + code_similarity) / 3

    def _compute_name_similarity(self, name_a: str, name_b: str) -> float:
        name_similarity = distance(name_a, name_b) / max(len(name_a), len(name_b), 1)
        return 1 - name_similarity

    def compute_attribute_similarity(
        self,
        attributes_a: Attribute,
        attributes_b: Attribute,
    ) -> float:
        name_similarity = self._compute_name_similarity(
            attributes_a.name, attributes_b.name
        )
        type_list_a = [attributes_a.types]
        if attributes_a.types is not None and isinstance(attributes_a, UnionType):
            type_list_a = [attributes_a.types]
        type_list_b = [attributes_b.types]
        if attributes_b.types is not None and isinstance(attributes_b, UnionType):
            type_list_b = [attributes_a.types]
        type_similarity = distance_elements(type_list_a, type_list_b) / max(
            len(type_list_a), len(type_list_b), 1
        )
        type_similarity = 1 - type_similarity
        return (name_similarity + type_similarity) / 2

    def compute_function_similarity(
        self, function_a: Function, function_b: Function
    ) -> float:
        code_similarity = self._compute_code_similarity(
            function_a.code, function_b.code
        )
        name_similarity = self._compute_name_similarity(
            function_a.name, function_b.name
        )

        def are_parameters_similar(
            parameter_a: Parameter, parameter_b: Parameter
        ) -> bool:
            return self.compute_parameter_similarity(parameter_a, parameter_b) == 1

        parameter_similarity = distance_elements(
            function_a.parameters,
            function_b.parameters,
            are_similar=are_parameters_similar,
        ) / max(len(function_a.parameters), len(function_b.parameters), 1)
        parameter_similarity = 1 - parameter_similarity

        return (code_similarity + name_similarity + parameter_similarity) / 3

    def _compute_code_similarity(self, code_a: str, code_b: str) -> float:
        split_a = code_a.split("\n")
        split_b = code_b.split("\n")
        diff_code = distance_elements(split_a, split_b) / max(
            len(split_a), len(split_b), 1
        )
        return 1 - diff_code

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
        if type_a is None:
            if type_b is None:
                return 1
            return 0
        if type_b is None:
            return 0

        def are_types_similar(
            abstract_type_a: AbstractType, abstract_type_b: AbstractType
        ) -> bool:
            return abstract_type_a.to_json() == abstract_type_b.to_json()

        type_list_a = self._create_list_from_type(type_a)
        type_list_b = self._create_list_from_type(type_b)
        diff_elements = distance_elements(
            type_list_a, type_list_b, are_similar=are_types_similar
        ) / max(len(type_list_a), len(type_list_b), 1)
        return 1 - diff_elements

    def _create_list_from_type(self, abstract_type: AbstractType) -> list[AbstractType]:
        if isinstance(abstract_type, UnionType):
            return abstract_type.types
        return [abstract_type]

    def _compute_assignment_similarity(
        self, assigned_by_a: ParameterAssignment, assigned_by_b: ParameterAssignment
    ) -> float:
        return self.assigned_by_look_up_similarity[assigned_by_a][assigned_by_b]

    def compute_result_similarity(self, result_a: Result, result_b: Result) -> float:
        return self._compute_name_similarity(result_a.name, result_b.name)
