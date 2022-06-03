from dataclasses import asdict, dataclass
from enum import Enum


@dataclass
class AbstractAnnotation:
    target: str

    def to_json(self) -> dict:
        return asdict(self)


@dataclass
class ConstantAnnotation(AbstractAnnotation):
    defaultType: str
    defaultValue: str


@dataclass
class RemoveAnnotation(AbstractAnnotation):
    pass


@dataclass
class RequiredAnnotation(AbstractAnnotation):
    pass


@dataclass
class OptionalAnnotation(AbstractAnnotation):
    defaultType: str
    defaultValue: str


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
    constants: list[ConstantAnnotation]
    removes: list[RemoveAnnotation]
    requireds: list[RequiredAnnotation]
    optionals: list[OptionalAnnotation]
    boundaries: list[BoundaryAnnotation]
    enums: list[EnumAnnotation]

    def __init__(self):
        self.constants = []
        self.removes = []
        self.requireds = []
        self.optionals = []
        self.boundaries = []
        self.enums = []

    def to_json(self) -> dict:
        return {
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
