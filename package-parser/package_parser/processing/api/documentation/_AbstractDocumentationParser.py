from __future__ import annotations

from abc import ABC, abstractmethod

import astroid

from ._APIElementDocumentation import (
    ClassDocumentation,
    FunctionDocumentation,
    ParameterDocumentation,
)


class AbstractDocumentationParser(ABC):
    @abstractmethod
    def get_class_documentation(
        self, class_node: astroid.ClassDef
    ) -> ClassDocumentation:
        pass

    @abstractmethod
    def get_function_documentation(
        self, function_node: astroid.FunctionDef
    ) -> FunctionDocumentation:
        pass

    @abstractmethod
    def get_parameter_documentation(
        self, function_node: astroid.FunctionDef, parameter_name: str
    ) -> ParameterDocumentation:
        pass
