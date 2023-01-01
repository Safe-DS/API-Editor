from __future__ import annotations

from abc import ABC
from dataclasses import asdict, dataclass
from enum import Enum
from typing import Any, Union

ANNOTATION_SCHEMA_VERSION = 2


class EnumReviewResult(Enum):
    CORRECT = "correct"
    UNSURE = "unsure"
    WRONG = "wrong"
    NONE = ""

    @staticmethod
    def to_json(result: list[tuple[str, Any]]) -> dict[str, Any]:
        for item in result:
            if isinstance(item[1], EnumReviewResult):
                result.append((item[0], item[1].value))
                result.remove(item)
        return dict(result)


@dataclass
class AbstractAnnotation(ABC):
    target: str
    authors: list[str]
    reviewers: list[str]
    comment: str
    reviewResult: EnumReviewResult

    def to_json(self) -> dict:
        return asdict(self, dict_factory=EnumReviewResult.to_json)

    @staticmethod
    def from_json(json: Any) -> AbstractAnnotation:
        review_result = EnumReviewResult(json.get("reviewResult", ""))

        return AbstractAnnotation(
            json["target"],
            json["authors"],
            json["reviewers"],
            json.get("comment", ""),
            review_result,
        )


@dataclass
class RemoveAnnotation(AbstractAnnotation):
    @staticmethod
    def from_json(json: Any) -> RemoveAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return RemoveAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
        )


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
        return Interval(
            json["isDiscrete"],
            json["lowerIntervalLimit"],
            json["lowerLimitType"],
            json["upperIntervalLimit"],
            json["upperLimitType"],
        )

    def __eq__(self, other: Any) -> bool:
        return (
            isinstance(other, Interval)
            and self.isDiscrete == other.isDiscrete
            and self.lowerIntervalLimit == other.lowerIntervalLimit
            and isinstance(self.lowerIntervalLimit, type(self.lowerIntervalLimit))
            and self.lowerLimitType == other.lowerLimitType
            and self.upperIntervalLimit == other.upperIntervalLimit
            and isinstance(self.upperIntervalLimit, type(self.upperIntervalLimit))
            and self.upperLimitType == self.upperLimitType
        )


@dataclass
class BoundaryAnnotation(AbstractAnnotation):
    interval: Interval

    def to_json(self) -> dict:
        return {
            "target": self.target,
            "authors": self.authors,
            "reviewers": self.reviewers,
            "comment": self.comment,
            "reviewResult": self.reviewResult.value,
            "interval": self.interval.to_json(),
        }

    @staticmethod
    def from_json(json: Any) -> BoundaryAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return BoundaryAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
            Interval.from_json(json["interval"]),
        )


@dataclass
class EnumPair:
    stringValue: str
    instanceName: str

    def to_json(self) -> dict:
        return asdict(self)

    @staticmethod
    def from_json(json: Any) -> EnumPair:
        return EnumPair(json["stringValue"], json["instanceName"])

    def __eq__(self, other: Any) -> bool:
        return (
            isinstance(other, EnumPair)
            and self.stringValue == other.stringValue
            and self.instanceName == other.instanceName
        )


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
            "reviewResult": self.reviewResult.value,
            "enumName": self.enumName,
            "pairs": [pair.to_json() for pair in self.pairs],
        }

    @staticmethod
    def from_json(json: Any) -> EnumAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        pairs = [EnumPair.from_json(enum_pair) for enum_pair in json["pairs"]]
        return EnumAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
            json["enumName"],
            pairs,
        )


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
        variant = json["variant"]
        if ValueAnnotation.Variant.CONSTANT.value == variant:
            return ConstantAnnotation.from_json(json)
        if ValueAnnotation.Variant.OMITTED.value == variant:
            return OmittedAnnotation.from_json(json)
        if ValueAnnotation.Variant.OPTIONAL.value == variant:
            return OptionalAnnotation.from_json(json)
        if ValueAnnotation.Variant.REQUIRED.value == variant:
            return RequiredAnnotation.from_json(json)
        raise Exception("unkonwn variant found")


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
            "reviewResult": self.reviewResult.value,
            "variant": self.variant.value,
            "defaultValueType": self.defaultValueType.value,
            "defaultValue": self.defaultValue,
        }

    @staticmethod
    def from_json(json: Any) -> ConstantAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return ConstantAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
            ValueAnnotation.DefaultValueType(json["defaultValueType"]),
            json["defaultValue"],
        )


@dataclass
class OmittedAnnotation(ValueAnnotation):
    variant = ValueAnnotation.Variant.OMITTED

    def to_json(self) -> dict:
        return {
            "target": self.target,
            "authors": self.authors,
            "reviewers": self.reviewers,
            "comment": self.comment,
            "reviewResult": self.reviewResult.value,
            "variant": self.variant.value,
        }

    @staticmethod
    def from_json(json: Any) -> OmittedAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return OmittedAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
        )


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
            "reviewResult": self.reviewResult.value,
            "variant": self.variant.value,
            "defaultValueType": self.defaultValueType.value,
            "defaultValue": self.defaultValue,
        }

    @staticmethod
    def from_json(json: Any) -> OptionalAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return OptionalAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
            ValueAnnotation.DefaultValueType(json["defaultValueType"]),
            json["defaultValue"],
        )


@dataclass
class RequiredAnnotation(ValueAnnotation):
    variant = ValueAnnotation.Variant.REQUIRED

    def to_json(self) -> dict:
        return {
            "target": self.target,
            "authors": self.authors,
            "reviewers": self.reviewers,
            "comment": self.comment,
            "reviewResult": self.reviewResult.value,
            "variant": self.variant.value,
        }

    @staticmethod
    def from_json(json: Any) -> RequiredAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return RequiredAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
        )


class ParameterType(Enum):
    Constant = 0
    Optional = 1
    Required = 2
    Unused = 3


class ParameterInfo:
    type: ParameterType
    value: str
    value_type: str

    def __init__(
        self, parameter_type: ParameterType, value: str = "", value_type: str = ""
    ) -> None:
        self.type = parameter_type
        self.value = value
        self.value_type = value_type


@dataclass
class CalledAfterAnnotation(AbstractAnnotation):
    calledAfterName: str

    @staticmethod
    def from_json(json: Any) -> CalledAfterAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return CalledAfterAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
            json["calledAfterName"],
        )


class CompleteAnnotation(AbstractAnnotation):
    @staticmethod
    def from_json(json: Any) -> CompleteAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return CompleteAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
        )


@dataclass
class DescriptionAnnotation(AbstractAnnotation):
    newDescription: str

    @staticmethod
    def from_json(json: Any) -> DescriptionAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return DescriptionAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
            json["newDescription"],
        )


@dataclass
class ExpertAnnotation(AbstractAnnotation):
    @staticmethod
    def from_json(json: Any) -> ExpertAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return ExpertAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
        )


@dataclass
class GroupAnnotation(AbstractAnnotation):
    groupName: str
    parameters: list[str]

    @staticmethod
    def from_json(json: Any) -> GroupAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return GroupAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
            json["groupName"],
            json["parameters"],
        )


@dataclass
class MoveAnnotation(AbstractAnnotation):
    destination: str

    @staticmethod
    def from_json(json: Any) -> MoveAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return MoveAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
            json["destination"],
        )


class PureAnnotation(AbstractAnnotation):
    @staticmethod
    def from_json(json: Any) -> PureAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return PureAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
        )


@dataclass
class RenameAnnotation(AbstractAnnotation):
    newName: str

    @staticmethod
    def from_json(json: Any) -> RenameAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return RenameAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
            json["newName"],
        )


@dataclass
class TodoAnnotation(AbstractAnnotation):
    newTodo: str

    @staticmethod
    def from_json(json: Any) -> TodoAnnotation:
        annotation = AbstractAnnotation.from_json(json)
        return TodoAnnotation(
            annotation.target,
            annotation.authors,
            annotation.reviewers,
            annotation.comment,
            annotation.reviewResult,
            json["newTodo"],
        )
