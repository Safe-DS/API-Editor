from abc import ABC, abstractmethod
from typing import Any, Optional, Tuple

from package_parser.processing.api.model import (
    Class,
    Function,
    Parameter,
    ParameterAssignment,
    Result,
)


class AbstractDiffer(ABC):
    @staticmethod
    @abstractmethod
    def diff_attributes(
        attributes_a: list[str],
        attributes_b: list[str],
    ) -> float:
        pass

    @staticmethod
    @abstractmethod
    def diff_classes(class_a: Class, class_b: Class) -> float:
        pass

    @staticmethod
    @abstractmethod
    def diff_codes(code_a: str, code_b: str) -> float:
        pass

    @staticmethod
    @abstractmethod
    def diff_functions(function_a: Function, function_b: Function) -> float:
        pass

    @staticmethod
    @abstractmethod
    def diff_names(name_a: str, name_b: str) -> float:
        pass

    @staticmethod
    @abstractmethod
    def diff_parameters(
        parameter_a: list[Parameter], parameter_b: list[Parameter]
    ) -> float:
        pass

    @staticmethod
    @abstractmethod
    def diff_return_types(result_a: Result, result_b: Result) -> float:
        pass


def distance_elements(
    list_a: list[Any], list_b: list[Any], filter_function=lambda x: x
) -> float:
    if len(list_a) == 0:
        return len(list_b)
    if len(list_b) == 0:
        return len(list_a)
    if filter_function(list_a[0]) == filter_function(list_b[0]):
        return distance_elements(list_a[1:], list_b[1:])
    return 1 + min(
        distance_elements(list_a[1:], list_b),
        distance_elements(list_a, list_b[1:]),
        distance_elements(list_a[1:], list_b[1:]),
    )


class SimpleDiffer(AbstractDiffer):
    @staticmethod
    def diff_classes(class_a: Class, class_b: Class) -> float:
        name_diff = SimpleDiffer.diff_names(class_a.name, class_b.name)
        attribute_diff = SimpleDiffer.diff_attributes(
            class_a.instance_attributes, class_b.instance_attributes
        )
        return (name_diff + attribute_diff) / 2

    @staticmethod
    def diff_names(name_a: str, name_b: str) -> float:
        name_diff = distance_elements([*name_a], [*name_b])
        return name_diff / max(len(name_a), len(name_b))

    @staticmethod
    def diff_attributes(
        attributes_a: list[str],
        attributes_b: list[str],
    ) -> float:
        attributes_diff = distance_elements(attributes_a, attributes_b)
        return attributes_diff / (max(len(attributes_a), len(attributes_b)))

    @staticmethod
    def diff_functions(function_a: Function, function_b: Function) -> float:
        diff_code = SimpleDiffer.diff_codes(function_a.code, function_b.code)
        diff_name = SimpleDiffer.diff_names(function_a.name, function_b.name)
        diff_param = SimpleDiffer.diff_parameters(
            function_a.parameters, function_b.parameters
        )
        return (diff_code + diff_name + diff_param) / 3

    @staticmethod
    def diff_codes(code_a: str, code_b: str) -> float:
        diff_code = distance_elements(
            code_a.split("\n"), code_b.split("\n")
        )
        return diff_code

    @staticmethod
    def diff_parameters(
        parameter_a: list[Parameter], parameter_b: list[Parameter]
    ) -> float:
        (
            by_position_a,
            by_name_a,
            both_a,
            positional_vararg_a,
            named_vararg_a,
        ) = SimpleDiffer._get_parameter_divided_by_assignment(parameter_a)
        (
            by_position_b,
            by_name_b,
            both_b,
            positional_vararg_b,
            named_vararg_b,
        ) = SimpleDiffer._get_parameter_divided_by_assignment(parameter_b)

        def name_and_type_only(p: Parameter):
            parameter_type = ""
            if p.type is not None:
                parameter_type = "|" + str(p.type.to_json())
            return p.name + parameter_type

        position_diff = distance_elements(
            by_position_a, by_position_b, filter_function=name_and_type_only
        )
        name_diff = distance_elements(
            by_name_a, by_name_b, filter_function=name_and_type_only
        )
        both_diff = distance_elements(
            both_a, both_b, filter_function=name_and_type_only
        )

        total = 4
        position_vararg_diff = 0.0
        named_vararg_diff = 0.0
        if positional_vararg_a is not None or positional_vararg_b is not None:
            total = total + 1
            position_vararg_diff = distance_elements(
                [positional_vararg_a],
                [positional_vararg_b],
                filter_function=name_and_type_only,
            )
        if named_vararg_a is not None or named_vararg_b is not None:
            total = total + 1
            named_vararg_diff = distance_elements(
                [named_vararg_a], [named_vararg_b], filter_function=name_and_type_only
            )
        return (
            position_diff
            + name_diff
            + both_diff
            + position_vararg_diff
            + named_vararg_diff
        ) / total

    @staticmethod
    def _get_parameter_divided_by_assignment(
        parameter_list: list[Parameter],
    ) -> Tuple[
        list[Parameter],
        list[Parameter],
        list[Parameter],
        Optional[Parameter],
        Optional[Parameter],
    ]:
        by_position = []
        by_name = []
        by_name_and_position = []
        positional_vararg = None
        named_vararg = None

        for parameter in parameter_list:
            if parameter.assigned_by == ParameterAssignment.IMPLICIT:
                continue
            if parameter.assigned_by == ParameterAssignment.NAME_ONLY:
                by_name.append(parameter)
            if parameter.assigned_by == ParameterAssignment.POSITION_ONLY:
                by_position.append(parameter)
            if parameter.assigned_by == ParameterAssignment.POSITION_OR_NAME:
                by_name_and_position.append(parameter)
            if parameter.assigned_by == ParameterAssignment.POSITIONAL_VARARG:
                positional_vararg = parameter
            if parameter.assigned_by == ParameterAssignment.NAMED_VARARG:
                named_vararg = parameter
        return (
            by_position,
            by_name,
            by_name_and_position,
            positional_vararg,
            named_vararg,
        )

    @staticmethod
    def diff_return_types(result_a: Result, result_b: Result) -> float:
        return SimpleDiffer.diff_names(result_a.name, result_b.name)
