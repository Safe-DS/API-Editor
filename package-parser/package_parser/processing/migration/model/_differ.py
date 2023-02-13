import re
from abc import ABC, abstractmethod
from typing import Callable, Optional, Tuple, TypeVar, Union

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

from ._mapping import Mapping

api_element = Union[Attribute, Class, Function, Parameter, Result]


class AbstractDiffer(ABC):
    @abstractmethod
    def compute_attribute_similarity(
        self,
        attributev1: Attribute,
        attributev2: Attribute,
    ) -> float:
        """
        Computes similarity between attributes from apiv1 and apiv2.
        :param attributev1: attribute from apiv1
        :param attributev2: attribute from apiv2
        :return: value between 0 and 1, where 1 means that the elements are equal
        """

    @abstractmethod
    def compute_class_similarity(self, classv1: Class, classv2: Class) -> float:
        """
        Computes similarity between classes from apiv1 and apiv2.
        :param classv1: attribute from apiv1
        :param classv2: attribute from apiv2
        :return: value between 0 and 1, where 1 means that the elements are equal
        """

    @abstractmethod
    def compute_function_similarity(
        self, functionv1: Function, functionv2: Function
    ) -> float:
        """
        Computes similarity between functions from apiv1 and apiv2.
        :param functionv1: attribute from apiv1
        :param functionv2: attribute from apiv2
        :return: value between 0 and 1, where 1 means that the elements are equal
        """

    @abstractmethod
    def compute_parameter_similarity(
        self, parameterv1: Parameter, parameterv2: Parameter
    ) -> float:
        """
        Computes similarity between parameters from apiv1 and apiv2.
        :param parameterv1: attribute from apiv1
        :param parameterv2: attribute from apiv2
        :return: value between 0 and 1, where 1 means that the elements are equal
        """

    @abstractmethod
    def compute_result_similarity(self, resultv1: Result, resultv2: Result) -> float:
        """
        Computes similarity between results from apiv1 and apiv2.
        :param resultv1: attribute from apiv1
        :param resultv2: attribute from apiv2
        :return: value between 0 and 1, where 1 means that the elements are equal
        """

    @abstractmethod
    def get_related_mappings(
        self,
    ) -> Optional[list[Mapping]]:
        """
        Indicates whether all api elements should be compared with each other or just the ones that are mapped to each other.
        :return: a list of Mappings if only previously mapped api elements should be mapped to each other or else None.
        """

    @abstractmethod
    def notify_new_mapping(self, mappings: list[Mapping]) -> None:
        """
        If previous mappings returns None, the differ will be notified about a new mapping. Thereby the differ can calculate the similarity with more information.
        :param mappings: a list of Mappings if only previously mapped api elements should be mapped to each other or else None.
        """


X = TypeVar("X")


def distance_elements(
    listv1: list[X],
    listv2: list[X],
    are_similar: Callable[[X, X], bool] = lambda x, y: x == y,
) -> float:
    if len(listv1) == 0:
        return len(listv2)
    if len(listv2) == 0:
        return len(listv1)
    if are_similar(listv1[0], listv2[0]):
        return distance_elements(listv1[1:], listv2[1:], are_similar)
    return 1 + min(
        distance_elements(listv1[1:], listv2, are_similar),
        distance_elements(listv1, listv2[1:], are_similar),
        distance_elements(listv1[1:], listv2[1:], are_similar),
    )


class SimpleDiffer(AbstractDiffer):
    SPEED_UP: bool = False
    assigned_by_look_up_similarity: dict[
        ParameterAssignment, dict[ParameterAssignment, float]
    ]
    previous_parameter_similarity: dict[str, dict[str, float]] = {}
    previous_function_similarity: dict[str, dict[str, float]] = {}

    def get_related_mappings(
        self,
    ) -> Optional[list[Mapping]]:
        return None

    def notify_new_mapping(self, mappings: list[Mapping]) -> None:
        return

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

    def compute_class_similarity(self, classv1: Class, classv2: Class) -> float:
        """
        Computes similarity between classes from apiv1 and apiv2 with the respect to their name, id, code, and attributes.
        :param classv1: attribute from apiv1
        :param classv2: attribute from apiv2
        :return: value between 0 and 1, where 1 means that the elements are equal
        """
        name_similarity = self._compute_name_similarity(classv1.name, classv2.name)
        attributes_similarity = distance_elements(
            classv1.instance_attributes, classv2.instance_attributes
        )
        attributes_similarity = attributes_similarity / (
            max(len(classv1.instance_attributes), len(classv2.instance_attributes), 1)
        )
        attributes_similarity = 1 - attributes_similarity

        code_similarity = self._compute_code_similarity(classv1.code, classv2.code)

        id_similarity = self._compute_id_similarity(classv1.id, classv2.id)

        return (
            name_similarity + attributes_similarity + code_similarity + id_similarity
        ) / 4

    def _compute_name_similarity(self, namev1: str, namev2: str) -> float:
        name_similarity = distance(namev1, namev2) / max(len(namev1), len(namev2), 1)
        return 1 - name_similarity

    def compute_attribute_similarity(
        self,
        attributev1: Attribute,
        attributev2: Attribute,
    ) -> float:
        """
        Computes similarity between attributes from apiv1 and apiv2 with the respect to their name and type.
        :param attributev1: attribute from apiv1
        :param attributev2: attribute from apiv2
        :return: value between 0 and 1, where 1 means that the elements are equal
        """
        name_similarity = self._compute_name_similarity(
            attributev1.name, attributev2.name
        )
        type_listv1 = [attributev1.types]
        if attributev1.types is not None and isinstance(attributev1, UnionType):
            type_listv1 = [attributev1.types]
        type_listv2 = [attributev2.types]
        if attributev2.types is not None and isinstance(attributev2, UnionType):
            type_listv2 = [attributev1.types]
        type_similarity = distance_elements(type_listv1, type_listv2) / max(
            len(type_listv1), len(type_listv2), 1
        )
        type_similarity = 1 - type_similarity
        return (name_similarity + type_similarity) / 2

    def compute_function_similarity(
        self, functionv1: Function, functionv2: Function
    ) -> float:
        """
        Computes similarity between functions from apiv1 and apiv2 with the respect to their code, name, id, and parameters.
        :param functionv1: attribute from apiv1
        :param functionv2: attribute from apiv2
        :return: value between 0 and 1, where 1 means that the elements are equal
        """
        if (
            functionv1.id in self.previous_function_similarity
            and functionv2.id in self.previous_function_similarity[functionv1.id]
        ):
            return self.previous_function_similarity[functionv1.id][functionv2.id]

        code_similarity = self._compute_code_similarity(
            functionv1.code, functionv2.code
        )
        name_similarity = self._compute_name_similarity(
            functionv1.name, functionv2.name
        )

        def are_parameters_similar(
            parameterv1: Parameter, parameterv2: Parameter
        ) -> bool:
            return self.compute_parameter_similarity(parameterv1, parameterv2) == 1

        parameter_similarity = distance_elements(
            functionv1.parameters,
            functionv2.parameters,
            are_similar=are_parameters_similar,
        ) / max(len(functionv1.parameters), len(functionv2.parameters), 1)
        parameter_similarity = 1 - parameter_similarity

        id_similarity = self._compute_id_similarity(functionv1.id, functionv2.id)

        result = (
            code_similarity + name_similarity + parameter_similarity + id_similarity
        ) / 4
        if functionv1.id not in self.previous_function_similarity:
            self.previous_function_similarity[functionv1.id] = {}
        self.previous_function_similarity[functionv1.id][functionv2.id] = result
        return result

    def _compute_code_similarity(self, codev1: str, codev2: str) -> float:
        mode = FileMode()
        try:
            codev1_tmp = format_str(codev1, mode=mode)
            codev2_tmp = format_str(codev2, mode=mode)
        except CannotSplit:
            pass
        else:
            codev1 = codev1_tmp
            codev2 = codev2_tmp
        splitv1 = codev1.split("\n")
        splitv2 = codev2.split("\n")
        diff_code = distance(splitv1, splitv2) / max(len(splitv1), len(splitv2), 1)
        return 1 - diff_code

    def compute_parameter_similarity(
        self, parameterv1: Parameter, parameterv2: Parameter
    ) -> float:
        """
        Computes similarity between parameters from apiv1 and apiv2 with the respect to their name, type, assignment, default value, documentation, and id.
        :param parameterv1: attribute from apiv1
        :param parameterv2: attribute from apiv2
        :return: value between 0 and 1, where 1 means that the elements are equal
        """
        if (
            parameterv1.id in self.previous_parameter_similarity
            and parameterv2.id in self.previous_parameter_similarity[parameterv1.id]
        ):
            return self.previous_parameter_similarity[parameterv1.id][parameterv2.id]

        normalize_similarity = 6
        parameter_name_similarity = self._compute_name_similarity(
            parameterv1.name, parameterv2.name
        )
        parameter_type_similarity = self._compute_type_similarity(
            parameterv1.type, parameterv2.type
        )
        parameter_assignment_similarity = self._compute_assignment_similarity(
            parameterv1.assigned_by, parameterv2.assigned_by
        )
        if parameter_assignment_similarity < 0:
            parameter_assignment_similarity = 0
            normalize_similarity -= 1
        parameter_default_value_similarity = self._compute_default_value_similarity(
            parameterv1.default_value, parameterv2.default_value
        )
        if parameter_default_value_similarity < 0:
            parameter_default_value_similarity = 0
            normalize_similarity -= 1
        parameter_documentation_similarity = (
            self._compute_parameter_documentation_similarity(
                parameterv1.documentation, parameterv2.documentation
            )
        )
        if parameter_documentation_similarity < 0:
            parameter_documentation_similarity = 0
            normalize_similarity -= 1

        id_similarity = self._compute_id_similarity(parameterv1.id, parameterv2.id)

        result = (
            parameter_name_similarity
            + parameter_type_similarity
            + parameter_assignment_similarity
            + parameter_default_value_similarity
            + parameter_documentation_similarity
            + id_similarity
        ) / normalize_similarity
        if parameterv1.id not in self.previous_parameter_similarity:
            self.previous_parameter_similarity[parameterv1.id] = {}
        self.previous_parameter_similarity[parameterv1.id][parameterv2.id] = result
        return result

    def _compute_type_similarity(
        self, typev1: Optional[AbstractType], typev2: Optional[AbstractType]
    ) -> float:
        if typev1 is None:
            if typev2 is None:
                return 1
            return 0
        if typev2 is None:
            return 0

        def are_types_similar(
            abstract_typev1: AbstractType, abstract_typev2: AbstractType
        ) -> bool:
            return abstract_typev1.to_json() == abstract_typev2.to_json()

        type_listv1 = self._create_list_from_type(typev1)
        type_listv2 = self._create_list_from_type(typev2)
        diff_elements = distance_elements(
            type_listv1, type_listv2, are_similar=are_types_similar
        ) / max(len(type_listv1), len(type_listv2), 1)
        return 1 - diff_elements

    def _create_list_from_type(self, abstract_type: AbstractType) -> list[AbstractType]:
        if isinstance(abstract_type, UnionType):
            return abstract_type.types
        return [abstract_type]

    def _compute_assignment_similarity(
        self, assigned_byv1: ParameterAssignment, assigned_byv2: ParameterAssignment
    ) -> float:
        return self.assigned_by_look_up_similarity[assigned_byv1][assigned_byv2]

    def compute_result_similarity(self, resultv1: Result, resultv2: Result) -> float:
        """
        Computes similarity between results from apiv1 and apiv2 with the respect to their name.
        :param resultv1: attribute from apiv1
        :param resultv2: attribute from apiv2
        :return: value between 0 and 1, where 1 means that the elements are equal
        """
        return self._compute_name_similarity(resultv1.name, resultv2.name)

    def _compute_default_value_similarity(
        self, default_valuev1: Optional[str], default_valuev2: Optional[str]
    ) -> float:
        if default_valuev1 is None and default_valuev2 is None:
            return -1.0
        if default_valuev1 is None or default_valuev2 is None:
            return 0.0
        if default_valuev1 == "None" and default_valuev2 == "None":
            return 1.0
        try:
            intv1_value = int(default_valuev1)
            intv2_value = int(default_valuev2)
            if intv1_value == intv2_value:
                return 1.0
            return 0.5
        except ValueError:
            try:
                floatv1_value = float(default_valuev1)
                floatv2_value = float(default_valuev2)
                if floatv1_value == floatv2_value:
                    return 1.0
            except ValueError:
                try:
                    if float(int(default_valuev1)) == float(default_valuev2):
                        return 0.75
                except ValueError:
                    try:
                        if float(int(default_valuev2)) == float(default_valuev1):
                            return 0.75
                    except ValueError:
                        pass
        if default_valuev1 in (
            "True",
            "False",
        ) and default_valuev2 in ("True", "False"):
            if bool(default_valuev1) == bool(default_valuev2):
                return 1.0
            return 0.5
        valuev1_is_in_quotation_marks = (
            default_valuev1.startswith("'") and default_valuev1.endswith("'")
        ) or (default_valuev1.startswith('"') and default_valuev1.endswith('"'))
        valuev2_is_in_quotation_marks = (
            default_valuev2.startswith("'") and default_valuev2.endswith("'")
        ) or (default_valuev2.startswith('"') and default_valuev2.endswith('"'))
        if valuev1_is_in_quotation_marks and valuev2_is_in_quotation_marks:
            if default_valuev1[1:-1] == default_valuev2[1:-1]:
                return 1.0
            return 0.5
        return 0.0

    def _compute_parameter_documentation_similarity(
        self,
        documentationv1: ParameterDocumentation,
        documentationv2: ParameterDocumentation,
    ) -> float:
        if len(documentationv1.description) == len(documentationv2.description) == 0:
            return -1.0
        descriptionv1 = re.split("[\n ]", documentationv1.description)
        descriptionv2 = re.split("[\n ]", documentationv2.description)

        documentation_similarity = distance(descriptionv1, descriptionv2) / max(
            len(descriptionv1), len(descriptionv2)
        )
        return 1 - documentation_similarity

    def _compute_id_similarity(self, idv1: str, idv2: str) -> float:
        module_pathv1 = idv1.split("/")[1].split(".")
        additional_module_pathv1 = idv1.split("/")[2:-1]
        if len(additional_module_pathv1) > 0:
            module_pathv1.extend(additional_module_pathv1)
        module_pathv2 = idv2.split("/")[1].split(".")
        additional_module_pathv2 = idv2.split("/")[2:-1]
        if len(additional_module_pathv2) > 0:
            module_pathv2.extend(additional_module_pathv2)

        def cost_function(iteration: int, max_iteration: int) -> float:
            return iteration / max_iteration

        total_costs, max_iterations = distance_elements_with_cost_function(
            module_pathv1, module_pathv2, cost_function, iteration=0
        )
        return 1 - (total_costs / sum(range(1, max_iterations + 1)))


def distance_elements_with_cost_function(
    listv1: list[X],
    listv2: list[X],
    cost_function: Callable[[int, int], float],
    are_similar: Callable[[X, X], bool] = lambda x, y: x == y,
    iteration: int = 0,
) -> Tuple[float, int]:
    if len(listv1) == 0:
        total_costs = 0.0
        max_iterations = iteration + len(listv2)
        for i in range(0, len(listv2)):
            total_costs += cost_function(iteration + i, max_iterations)
        return total_costs, max_iterations
    if len(listv2) == 0:
        total_costs = 0.0
        max_iterations = iteration + len(listv1)
        for i in range(0, len(listv1)):
            total_costs += cost_function(iteration + i, max_iterations)
        return total_costs, max_iterations
    if are_similar(listv1[0], listv2[0]):
        total_costs, max_iterations = distance_elements_with_cost_function(
            listv1[1:], listv2[1:], cost_function, are_similar, iteration + 1
        )
        return total_costs, max_iterations
    recursive_results = [
        distance_elements_with_cost_function(
            listv1[1:], listv2, cost_function, are_similar, iteration + 1
        ),
        distance_elements_with_cost_function(
            listv1, listv2[1:], cost_function, are_similar, iteration + 1
        ),
        distance_elements_with_cost_function(
            listv1[1:], listv2[1:], cost_function, are_similar, iteration + 1
        ),
    ]
    total_costs, max_iterations = sorted(
        recursive_results, key=lambda tuple_: tuple_[0]
    )[0]
    total_costs += cost_function(iteration, max_iterations)
    return total_costs, max_iterations
