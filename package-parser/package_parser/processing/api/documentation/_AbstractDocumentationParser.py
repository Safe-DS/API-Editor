from __future__ import annotations

import dataclasses
from abc import ABC, abstractmethod
from dataclasses import dataclass

import astroid


class AbstractDocumentationParser(ABC):

    @abstractmethod
    def get_class_documentation(self, class_node: astroid.ClassDef) -> ClassDocumentation:
        pass

    @abstractmethod
    def get_function_documentation(self, function_node: astroid.FunctionDef) -> FunctionDocumentation:
        pass

    @abstractmethod
    def get_parameter_documentation(
        self,
        function_node: astroid.FunctionDef,
        parameter_name: str
    ) -> ParameterDocumentation:
        pass


@dataclass
class ClassDocumentation:
    description: str
    full_docstring: str

    @staticmethod
    def from_dict(d: dict) -> ClassDocumentation:
        return ClassDocumentation(
            description=d.get("description", ""),
            full_docstring=d.get("full_docstring", ""),
        )

    def to_dict(self):
        return dataclasses.asdict(self)


@dataclass
class FunctionDocumentation:
    description: str
    full_docstring: str

    @staticmethod
    def from_dict(d: dict) -> FunctionDocumentation:
        return FunctionDocumentation(
            description=d.get("description", ""),
            full_docstring=d.get("full_docstring", ""),
        )

    def to_dict(self):
        return dataclasses.asdict(self)


@dataclass
class ParameterDocumentation:
    type: str
    default_value: str
    description: str

    @staticmethod
    def from_dict(d: dict) -> ParameterDocumentation:
        return ParameterDocumentation(
            type=d.get("type", ""),
            default_value=d.get("default_value", ""),
            description=d.get("description", ""),
        )

    def to_dict(self):
        dataclasses.asdict(self)
