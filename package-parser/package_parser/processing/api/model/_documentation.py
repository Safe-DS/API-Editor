from __future__ import annotations

import dataclasses
from dataclasses import dataclass


@dataclass
class ClassDocumentation:
    description: str = ""
    full_docstring: str = ""

    @staticmethod
    def from_dict(d: dict) -> ClassDocumentation:
        return ClassDocumentation(**d)

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)


@dataclass
class FunctionDocumentation:
    description: str = ""
    full_docstring: str = ""

    @staticmethod
    def from_dict(d: dict) -> FunctionDocumentation:
        return FunctionDocumentation(**d)

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)


@dataclass
class ParameterDocumentation:
    type: str = ""
    default_value: str = ""
    description: str = ""

    @staticmethod
    def from_dict(d: dict) -> ParameterDocumentation:
        return ParameterDocumentation(**d)

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)

    def __hash__(self) -> int:
        return hash((self.type, self.default_value, self.description))
