from abc import ABC, abstractmethod

from package_parser.processing.api.model import (
    Class,
    Function,
    Parameter,
    Result,
)


class AbstractDiffer(ABC):
    @staticmethod
    @abstractmethod
    def diff_classes(class_a: Class, class_b: Class) -> float:
        pass

    @staticmethod
    @abstractmethod
    def diff_attributes(
        self,
        attributes_a: list[str],
        attributes_b: list[str],
    ) -> float:
        pass

    @staticmethod
    @abstractmethod
    def diff_functions(function_a: Function, function_b: Function) -> float:
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
