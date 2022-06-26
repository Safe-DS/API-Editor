from dataclasses import asdict, dataclass
from enum import Enum
from typing import Any

ANNOTATION_SCHEMA_VERSION = 1


@dataclass
class AbstractAnnotation:
    target: str
    authors: list[str]
    reviewers: list[str]

    def to_json(self) -> dict:
        return asdict(self)


@dataclass
class ConstantAnnotation(AbstractAnnotation):
    defaultType: str
    defaultValue: Any


@dataclass
class RemoveAnnotation(AbstractAnnotation):
    pass


@dataclass
class RequiredAnnotation(AbstractAnnotation):
    pass


@dataclass
class OptionalAnnotation(AbstractAnnotation):
    defaultType: str
    defaultValue: Any


@dataclass
class Interval:
    isDiscrete: bool
    lowerIntervalLimit: int
    lowerLimitType: int
    upperIntervalLimit: int
    upperLimitType: int

    def to_json(self) -> dict:
        return asdict(self)


@dataclass
class BoundaryAnnotation(AbstractAnnotation):
    interval: Interval


@dataclass
class EnumPair:
    stringValue: str
    instanceName: str

    def to_json(self) -> dict:
        return asdict(self)


@dataclass
class EnumAnnotation(AbstractAnnotation):
    enumName: str
    pairs: list[EnumPair]


@dataclass
class AnnotationStore:
    boundaries: list[BoundaryAnnotation]
    constants: list[ConstantAnnotation]
    enums: list[EnumAnnotation]
    optionals: list[OptionalAnnotation]
    removes: list[RemoveAnnotation]
    requireds: list[RequiredAnnotation]

    def __init__(self):
        self.constants = []
        self.removes = []
        self.requireds = []
        self.optionals = []
        self.boundaries = []
        self.enums = []

    def to_json(self) -> dict:
        return {
            "schemaVersion": ANNOTATION_SCHEMA_VERSION,
            "constants": {
                annotation.target: annotation.to_json() for annotation in self.constants
            },
            "removes": {
                annotation.target: annotation.to_json() for annotation in self.removes
            },
            "requireds": {
                annotation.target: annotation.to_json() for annotation in self.requireds
            },
            "optionals": {
                annotation.target: annotation.to_json() for annotation in self.optionals
            },
            "boundaries": {
                annotation.target: annotation.to_json()
                for annotation in self.boundaries
            },
            "enums": {
                annotation.target: annotation.to_json() for annotation in self.enums
            },
        }


class ParameterType(Enum):
    Constant = 0
    Optional = 1
    Required = 2
    Unused = 3


class ParameterInfo:
    type: ParameterType
    value: str
    value_type: str

    def __init__(self, parameter_type, value="", value_type=""):
        self.type = parameter_type
        self.value = value
        self.value_type = value_type
