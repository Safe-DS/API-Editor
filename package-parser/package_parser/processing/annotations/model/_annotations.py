from abc import ABC
from dataclasses import asdict, dataclass
from enum import Enum
from typing import Any, Union

ANNOTATION_SCHEMA_VERSION = 2


@dataclass
class AbstractAnnotation(ABC):
    target: str
    authors: list[str]
    reviewers: list[str]
    comment: str

    def to_json(self) -> dict:
        return asdict(self)


@dataclass
class RemoveAnnotation(AbstractAnnotation):
    pass


@dataclass
class Interval:
    isDiscrete: bool
    lowerIntervalLimit: Union[int, float, str]
    lowerLimitType: int
    upperIntervalLimit: Union[int, float, str]
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


class ValueAnnotation(AbstractAnnotation, ABC):
    class Variant(Enum):
        CONSTANT = "constant"
        OMITTED = "omitted"
        OPTIONAL = "optional"
        REQUIRED = "required"

    class DefaultValueType(Enum):
        BOOLEAN = "boolean"
        NONE = "none"
        NUMBER = "number"
        STRING = "string"

    variant: Variant


@dataclass
class ConstantAnnotation(ValueAnnotation):
    variant = ValueAnnotation.Variant.CONSTANT
    defaultValueType: ValueAnnotation.DefaultValueType
    defaultValue: Any

    def to_json(self) -> dict:
        return {
            "target": self.target,
            "authors": self.authors,
            "reviewers": self.reviewers,
            "comment": self.comment,
            "variant": self.variant.value,
            "defaultValueType": self.defaultValueType.value,
            "defaultValue": self.defaultValue,
        }


@dataclass
class OmittedAnnotation(ValueAnnotation):
    variant = ValueAnnotation.Variant.OMITTED

    def to_json(self) -> dict:
        return {
            "target": self.target,
            "authors": self.authors,
            "reviewers": self.reviewers,
            "comment": self.comment,
            "variant": self.variant.value,
        }


@dataclass
class OptionalAnnotation(ValueAnnotation):
    variant = ValueAnnotation.Variant.OPTIONAL
    defaultValueType: ValueAnnotation.DefaultValueType
    defaultValue: Any

    def to_json(self) -> dict:
        return {
            "target": self.target,
            "authors": self.authors,
            "reviewers": self.reviewers,
            "comment": self.comment,
            "variant": self.variant.value,
            "defaultValueType": self.defaultValueType.value,
            "defaultValue": self.defaultValue,
        }


@dataclass
class RequiredAnnotation(ValueAnnotation):
    variant = ValueAnnotation.Variant.REQUIRED

    def to_json(self) -> dict:
        return {
            "target": self.target,
            "authors": self.authors,
            "reviewers": self.reviewers,
            "comment": self.comment,
            "variant": self.variant.value,
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
