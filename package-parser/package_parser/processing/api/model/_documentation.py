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

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, ClassDocumentation)
            and self.description == other.description
            and self.full_docstring == other.full_docstring
        )

    def __hash__(self) -> int:
        return hash((self.description, self.full_docstring))


@dataclass
class FunctionDocumentation:
    description: str = ""
    full_docstring: str = ""

    @staticmethod
    def from_dict(d: dict) -> FunctionDocumentation:
        return FunctionDocumentation(**d)

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, FunctionDocumentation)
            and self.description == other.description
            and self.full_docstring == other.full_docstring
        )

    def __hash__(self) -> int:
        return hash((self.description, self.full_docstring))


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

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, ParameterDocumentation)
            and self.type == other.type
            and self.default_value == other.default_value
            and self.description == other.description
        )

    def __hash__(self) -> int:
        return hash((self.type, self.default_value, self.description))
