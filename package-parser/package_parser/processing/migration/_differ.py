from abc import ABC, abstractmethod

from package_parser.processing.api.model import (
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
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
