import dataclasses
from enum import Enum


@dataclasses.dataclass
class BaseAnnotation:
    target: str

    def to_json(self) -> dict:
        return dataclasses.asdict(self)


@dataclasses.dataclass
class ConstantAnnotation(BaseAnnotation):
    defaultType: str
    defaultValue: str


@dataclasses.dataclass
class UnusedAnnotation(BaseAnnotation):
    pass


@dataclasses.dataclass
class RequiredAnnotation(BaseAnnotation):
    pass


@dataclasses.dataclass
class OptionalAnnotation(BaseAnnotation):
    defaultType: str
    defaultValue: str


@dataclasses.dataclass
class Interval:
    isDiscrete: bool
    lowerIntervalLimit: int
    lowerLimitType: int
    upperIntervalLimit: int
    upperLimitType: int

    def to_json(self) -> dict:
        return dataclasses.asdict(self)


@dataclasses.dataclass
class BoundaryAnnotation(BaseAnnotation):
    interval: Interval


@dataclasses.dataclass
class EnumPair:
    stringValue: str
    instanceName: str

    def to_json(self) -> dict:
        return dataclasses.asdict(self)


@dataclasses.dataclass
class EnumAnnotation(BaseAnnotation):
    enumName: str
    pairs: list[EnumPair]


@dataclasses.dataclass
class AnnotationStore:
    constant: list[ConstantAnnotation]
    unused: list[UnusedAnnotation]
    requireds: list[RequiredAnnotation]
    optionals: list[OptionalAnnotation]
    boundaries: list[BoundaryAnnotation]
    enums: list[EnumAnnotation]

    def __init__(self):
        self.constant = []
        self.unused = []
        self.requireds = []
        self.optionals = []
        self.boundaries = []
        self.enums = []

    def to_json(self) -> dict:
        return {
            "constant": {
                annotation.target: annotation.to_json() for annotation in self.constant
            },
            "unused": {
                annotation.target: annotation.to_json() for annotation in self.unused
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
