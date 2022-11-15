from abc import ABC, abstractmethod

from package_parser.processing.api.model import (
    Class,
    Function,
    Parameter,
    Result,
)


class AbstractDiffer(ABC):
    @abstractmethod
    def diff_classes(self, class_a: Class, class_b: Class) -> float:
        pass

    @abstractmethod
    def diff_attributes(
        self,
        attributes_a: list[str],
        attributes_b: list[str],
    ) -> float:
        pass

    @abstractmethod
    def diff_functions(self, function_a: Function, function_b: Function) -> float:
        pass

    @abstractmethod
    def diff_parameters(
        self, parameter_a: list[Parameter], parameter_b: list[Parameter]
    ) -> float:
        pass

    @abstractmethod
    def diff_return_types(self, result_a: Result, result_b: Result) -> float:
        pass
