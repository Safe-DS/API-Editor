from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

import astroid


class AbstractDocumentationParsingStrategy(ABC):

    @abstractmethod
    def get_class_documentation(self, class_node: astroid.ClassDef) -> ClassDocumentation:
        pass

    @abstractmethod
    def get_function_documentation(self, function_node: astroid.FunctionDef) -> FunctionDocumentation:
        pass

    @abstractmethod
    def get_parameter_documentation(self, function_node: astroid.FunctionDef,
                                    parameter_name: str) -> ParameterDocumentation:
        pass


@dataclass
class ClassDocumentation:
    description: str
    full_docstring: str


@dataclass
class FunctionDocumentation:
    description: str
    full_docstring: str


@dataclass
class ParameterDocumentation:
    type: str
    description: str


def get_full_docstring(declaration: astroid.ClassDef | astroid.FunctionDef) -> str:
    doc_node = declaration.doc_node
    if doc_node is None:
        return ""
    return doc_node.value
