from __future__ import annotations
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

    @staticmethod
    def from_json(json: Any) -> (str, list[str], list[str], str):
        return json["target"], json["authors"], json["reviewers"], json["comment"]


@dataclass
class RemoveAnnotation(AbstractAnnotation):

    @staticmethod
    def from_json(json: Any) -> RemoveAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return RemoveAnnotation(target, authors, reviewers, comment)


@dataclass
class Interval:
    isDiscrete: bool
    lowerIntervalLimit: Union[int, float, str]
    lowerLimitType: int
    upperIntervalLimit: Union[int, float, str]
    upperLimitType: int

    def to_json(self) -> dict:
        return asdict(self)

    @staticmethod
    def from_json(json: Any) -> Interval:
        return Interval(json["isDiscrete"], json["lowerIntervalLimit"],
                        json["lowerLimitType"], json["upperIntervalLimit"],
                        json["upperLimitType"])


@dataclass
class BoundaryAnnotation(AbstractAnnotation):
    interval: Interval

    def to_json(self) -> dict:
        return {
            "target": self.target,
            "authors": self.authors,
            "reviewers": self.reviewers,
            "comment": self.comment,
            "interval": self.interval.to_json(),
        }

    @staticmethod
    def from_json(json: Any) -> BoundaryAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return BoundaryAnnotation(target, authors, reviewers, comment, Interval.from_json(json["interval"]))


@dataclass
class EnumPair:
    stringValue: str
    instanceName: str

    def to_json(self) -> dict:
        return asdict(self)

    @staticmethod
    def from_json(json: Any) -> EnumPair:
        return EnumPair(json["stringValue"], json["instanceName"])


@dataclass
class EnumAnnotation(AbstractAnnotation):
    enumName: str
    pairs: list[EnumPair]

    def to_json(self) -> dict:
        return {
            "target": self.target,
            "authors": self.authors,
            "reviewers": self.reviewers,
            "comment": self.comment,
            "enumName": self.enumName,
            "pairs": [pair.to_json() for pair in self.pairs],
        }

    @staticmethod
    def from_json(json: Any) -> EnumAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        pairs = [EnumPair.from_json(enum_pair) for enum_pair in json["pairs"]]
        return EnumAnnotation(target, authors, reviewers, comment, json["enumName"], pairs)


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

    @staticmethod
    def from_json(json: Any) -> ValueAnnotation:
        switcher = {
            ValueAnnotation.Variant.CONSTANT: ConstantAnnotation.from_json(json),
            ValueAnnotation.Variant.OMITTED: OmittedAnnotation.from_json(json),
            ValueAnnotation.Variant.OPTIONAL: OptionalAnnotation.from_json(json),
            ValueAnnotation.Variant.REQUIRED: RequiredAnnotation.from_json(json),
        }
        return switcher.get(json["variant"])


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

    @staticmethod
    def from_json(json: Any) -> ConstantAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return ConstantAnnotation(target, authors, reviewers, comment,
                                  ValueAnnotation.DefaultValueType(json["defaultValueType"]), json["defaultValue"])


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

    @staticmethod
    def from_json(json: Any) -> OmittedAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return OmittedAnnotation(target, authors, reviewers, comment)


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

    @staticmethod
    def from_json(json: Any) -> OptionalAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return OptionalAnnotation(target, authors, reviewers, comment,
                                  ValueAnnotation.DefaultValueType(json["defaultValueType"]), json["defaultValue"])


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

    @staticmethod
    def from_json(json: Any) -> RequiredAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return RequiredAnnotation(target, authors, reviewers, comment)


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


@dataclass
class CalledAfterAnnotation(AbstractAnnotation):
    calledAfterName: str

    @staticmethod
    def from_json(json: Any) -> CalledAfterAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return CalledAfterAnnotation(target, authors, reviewers, comment, json["calledAfterName"])


class CompleteAnnotation(AbstractAnnotation):

    @staticmethod
    def from_json(json: Any) -> CompleteAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return CompleteAnnotation(target, authors, reviewers, comment)


@dataclass
class DescriptionAnnotation(AbstractAnnotation):
    newDescription: str

    @staticmethod
    def from_json(json: Any) -> DescriptionAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return DescriptionAnnotation(target, authors, reviewers, comment, json["newDescription"])


@dataclass
class ExpertAnnotation(AbstractAnnotation):

    @staticmethod
    def from_json(json: Any) -> ExpertAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return ExpertAnnotation(target, authors, reviewers, comment)


@dataclass
class GroupAnnotation(AbstractAnnotation):
    groupName: str
    parameters: list[str]

    @staticmethod
    def from_json(json: Any) -> GroupAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return GroupAnnotation(target, authors, reviewers, comment, json["groupName"], json["parameters"])


@dataclass
class MoveAnnotation(AbstractAnnotation):
    destination: str

    @staticmethod
    def from_json(json: Any) -> MoveAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return MoveAnnotation(target, authors, reviewers, comment, json["destination"])


class PureAnnotation(AbstractAnnotation):

    @staticmethod
    def from_json(json: Any) -> PureAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return PureAnnotation(target, authors, reviewers, comment)


@dataclass
class RenameAnnotation(AbstractAnnotation):
    newName: str

    @staticmethod
    def from_json(json: Any) -> RenameAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return RenameAnnotation(target, authors, reviewers, comment, json["newName"])


@dataclass
class TodoAnnotation(AbstractAnnotation):
    newTodo: str

    @staticmethod
    def from_json(json: Any) -> TodoAnnotation:
        target, authors, reviewers, comment = AbstractAnnotation.from_json(json)
        return TodoAnnotation(target, authors, reviewers, comment, json["newTodo"])
