import re
from abc import ABC, abstractmethod
from typing import Callable, Optional, Tuple, TypeVar

from black import FileMode, format_str
from black.linegen import CannotSplit
from Levenshtein import distance
from package_parser.processing.api.model import (
    AbstractType,
    Attribute,
    Class,
    Function,
    Parameter,
    ParameterAssignment,
    ParameterDocumentation,
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
        return distance_elements(list_a[1:], list_b[1:], are_similar)
    return 1 + min(
        distance_elements(list_a[1:], list_b, are_similar),
        distance_elements(list_a, list_b[1:], are_similar),
        distance_elements(list_a[1:], list_b[1:], are_similar),
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
                ParameterAssignment.IMPLICIT: 1.0,
                ParameterAssignment.NAMED_VARARG: 1.0
                - distance_between_implicit_and_explicit
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
                ParameterAssignment.POSITIONAL_VARARG: 1.0
                - distance_between_implicit_and_explicit
                - distance_between_vararg_and_normal,
                ParameterAssignment.POSITION_OR_NAME: 1.0
                - distance_between_implicit_and_explicit,
                ParameterAssignment.NAME_ONLY: 1.0
                - distance_between_implicit_and_explicit,
                ParameterAssignment.POSITION_ONLY: 1.0
                - distance_between_implicit_and_explicit,
            },
            ParameterAssignment.NAMED_VARARG: {
                ParameterAssignment.IMPLICIT: 1.0
                - distance_between_implicit_and_explicit
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
                ParameterAssignment.NAMED_VARARG: 1.0,
                ParameterAssignment.POSITIONAL_VARARG: 1.0
                - distance_between_position_and_named,
                ParameterAssignment.POSITION_OR_NAME: 1.0
                - distance_between_vararg_and_normal
                - distance_between_one_to_both,
                ParameterAssignment.NAME_ONLY: 1.0 - distance_between_vararg_and_normal,
                ParameterAssignment.POSITION_ONLY: 1.0
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
            },
            ParameterAssignment.POSITIONAL_VARARG: {
                ParameterAssignment.IMPLICIT: 1.0
                - distance_between_implicit_and_explicit
                - distance_between_vararg_and_normal,
                ParameterAssignment.NAMED_VARARG: 1.0
                - distance_between_position_and_named,
                ParameterAssignment.POSITIONAL_VARARG: 1.0,
                ParameterAssignment.POSITION_OR_NAME: 1.0
                - distance_between_vararg_and_normal
                - distance_between_one_to_both,
                ParameterAssignment.NAME_ONLY: 1.0
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
                ParameterAssignment.POSITION_ONLY: 1.0
                - distance_between_vararg_and_normal,
            },
            ParameterAssignment.POSITION_OR_NAME: {
                ParameterAssignment.IMPLICIT: 1.0
                - distance_between_implicit_and_explicit,
                ParameterAssignment.NAMED_VARARG: 1.0
                - distance_between_vararg_and_normal
                - distance_between_both_to_one,
                ParameterAssignment.POSITIONAL_VARARG: 1.0
                - distance_between_vararg_and_normal
                - distance_between_both_to_one,
                ParameterAssignment.POSITION_OR_NAME: -1.0,
                ParameterAssignment.NAME_ONLY: 1.0 - distance_between_both_to_one,
                ParameterAssignment.POSITION_ONLY: 1.0 - distance_between_both_to_one,
            },
            ParameterAssignment.NAME_ONLY: {
                ParameterAssignment.IMPLICIT: 1.0
                - distance_between_implicit_and_explicit,
                ParameterAssignment.NAMED_VARARG: 1.0
                - distance_between_vararg_and_normal,
                ParameterAssignment.POSITIONAL_VARARG: 1.0
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
                ParameterAssignment.POSITION_OR_NAME: 1.0
                - distance_between_one_to_both,
                ParameterAssignment.NAME_ONLY: 1.0,
                ParameterAssignment.POSITION_ONLY: 1.0
                - distance_between_position_and_named,
            },
            ParameterAssignment.POSITION_ONLY: {
                ParameterAssignment.IMPLICIT: 1.0
                - distance_between_implicit_and_explicit,
                ParameterAssignment.NAMED_VARARG: 1.0
                - distance_between_vararg_and_normal
                - distance_between_position_and_named,
                ParameterAssignment.POSITIONAL_VARARG: 1.0
                - distance_between_vararg_and_normal,
                ParameterAssignment.POSITION_OR_NAME: 1.0
                - distance_between_one_to_both,
                ParameterAssignment.NAME_ONLY: 1.0
                - distance_between_position_and_named,
                ParameterAssignment.POSITION_ONLY: 1.0,
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

        id_similarity = self._compute_id_similarity(class_a.id, class_b.id)

        return (
            name_similarity + attributes_similarity + code_similarity + id_similarity
        ) / 4

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

        id_similarity = self._compute_id_similarity(function_a.id, function_b.id)

        return (
            code_similarity + name_similarity + parameter_similarity + id_similarity
        ) / 4

    def _compute_code_similarity(self, code_a: str, code_b: str) -> float:
        mode = FileMode()
        try:
            code_a = format_str(code_a, mode=mode)
            code_b = format_str(code_b, mode=mode)
        except CannotSplit:
            pass
        split_a = code_a.split("\n")
        split_b = code_b.split("\n")
        diff_code = distance_elements(split_a, split_b) / max(
            len(split_a), len(split_b), 1
        )
        return 1 - diff_code

    def compute_parameter_similarity(
        self, parameter_a: Parameter, parameter_b: Parameter
    ) -> float:
        normalize_similarity = 6
        parameter_name_similarity = self._compute_name_similarity(
            parameter_a.name, parameter_b.name
        )
        parameter_type_similarity = self._compute_type_similarity(
            parameter_a.type, parameter_b.type
        )
        parameter_assignment_similarity = self._compute_assignment_similarity(
            parameter_a.assigned_by, parameter_b.assigned_by
        )
        if parameter_assignment_similarity < 0:
            parameter_assignment_similarity = 0
            normalize_similarity -= 1
        parameter_default_value_similarity = self._compute_default_value_similarity(
            parameter_a.default_value, parameter_b.default_value
        )
        if parameter_default_value_similarity < 0:
            parameter_default_value_similarity = 0
            normalize_similarity -= 1
        parameter_documentation_similarity = (
            self._compute_parameter_documentation_similarity(
                parameter_a.documentation, parameter_b.documentation
            )
        )
        if parameter_documentation_similarity < 0:
            parameter_documentation_similarity = 0
            normalize_similarity -= 1

        id_similarity = self._compute_id_similarity(parameter_a.id, parameter_b.id)

        return (
            parameter_name_similarity
            + parameter_type_similarity
            + parameter_assignment_similarity
            + parameter_default_value_similarity
            + parameter_documentation_similarity
            + id_similarity
        ) / normalize_similarity

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

    def _compute_default_value_similarity(
        self, default_value_a: Optional[str], default_value_b: Optional[str]
    ) -> float:
        if default_value_a is None and default_value_b is None:
            return -1.0
        if default_value_a is None or default_value_b is None:
            return 0.0
        if default_value_a == "None" and default_value_b == "None":
            return 1.0
        try:
            intv1_value = int(default_value_a)
            intv2_value = int(default_value_b)
            if intv1_value == intv2_value:
                return 1.0
            return 0.5
        except ValueError:
            try:
                floatv1_value = float(default_value_a)
                floatv2_value = float(default_value_b)
                if floatv1_value == floatv2_value:
                    return 1.0
            except ValueError:
                try:
                    if float(int(default_value_a)) == float(default_value_b):
                        return 0.75
                except ValueError:
                    try:
                        if float(int(default_value_b)) == float(default_value_a):
                            return 0.75
                    except ValueError:
                        pass
        if default_value_a in (
            "True",
            "False",
        ) and default_value_b in ("True", "False"):
            if bool(default_value_a) == bool(default_value_b):
                return 1.0
            return 0.5
        valuev1_is_in_quotation_marks = (
            default_value_a.startswith("'") and default_value_a.endswith("'")
        ) or (default_value_a.startswith('"') and default_value_a.endswith('"'))
        valuev2_is_in_quotation_marks = (
            default_value_b.startswith("'") and default_value_b.endswith("'")
        ) or (default_value_b.startswith('"') and default_value_b.endswith('"'))
        if valuev1_is_in_quotation_marks and valuev2_is_in_quotation_marks:
            if default_value_a[1:-1] == default_value_b[1:-1]:
                return 1.0
            return 0.5
        return 0.0

    def _compute_parameter_documentation_similarity(
        self,
        documentation_a: ParameterDocumentation,
        documentation_b: ParameterDocumentation,
    ) -> float:
        if len(documentation_a.description) == len(documentation_b.description) == 0:
            return -1.0
        description_a = re.split("[\n ]", documentation_a.description)
        description_b = re.split("[\n ]", documentation_b.description)

        documentation_similarity = distance_elements(
            description_a, description_b
        ) / max(len(description_a), len(description_b))
        return 1 - documentation_similarity

    def _compute_id_similarity(self, id_a: str, id_b: str) -> float:
        module_path_a = id_a.split("/")[1].split(".")
        additional_module_path_a = id_a.split("/")[2:-1]
        if len(additional_module_path_a) > 0:
            module_path_a.extend(additional_module_path_a)
        module_path_b = id_b.split("/")[1].split(".")
        additional_module_path_b = id_b.split("/")[2:-1]
        if len(additional_module_path_b) > 0:
            module_path_b.extend(additional_module_path_b)

        def cost_function(iteration: int, max_iteration: int) -> float:
            return iteration / max_iteration

        total_costs, max_iterations = distance_elements_with_cost_function(
            module_path_a, module_path_b, cost_function, iteration=0
        )
        return 1 - (total_costs / sum(range(1, max_iterations + 1)))


def distance_elements_with_cost_function(
    list_a: list[X],
    list_b: list[X],
    cost_function: Callable[[int, int], float],
    are_similar: Callable[[X, X], bool] = lambda x, y: x == y,
    iteration: int = 0,
) -> Tuple[float, int]:
    if len(list_a) == 0:
        total_costs = 0.0
        max_iterations = iteration + len(list_b)
        for i in range(0, len(list_b)):
            total_costs += cost_function(iteration + i, max_iterations)
        return total_costs, max_iterations
    if len(list_b) == 0:
        total_costs = 0.0
        max_iterations = iteration + len(list_a)
        for i in range(0, len(list_a)):
            total_costs += cost_function(iteration + i, max_iterations)
        return total_costs, max_iterations
    if are_similar(list_a[0], list_b[0]):
        total_costs, max_iterations = distance_elements_with_cost_function(
            list_a[1:], list_b[1:], cost_function, are_similar, iteration + 1
        )
        return total_costs, max_iterations
    recursive_results = [
        distance_elements_with_cost_function(
            list_a[1:], list_b, cost_function, are_similar, iteration + 1
        ),
        distance_elements_with_cost_function(
            list_a, list_b[1:], cost_function, are_similar, iteration + 1
        ),
        distance_elements_with_cost_function(
            list_a[1:], list_b[1:], cost_function, are_similar, iteration + 1
        ),
    ]
    total_costs, max_iterations = sorted(
        recursive_results, key=lambda tuple_: tuple_[0]
    )[0]
    total_costs += cost_function(iteration, max_iterations)
    return total_costs, max_iterations
