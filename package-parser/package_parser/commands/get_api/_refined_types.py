from __future__ import annotations

import re
from abc import ABCMeta, abstractmethod
from dataclasses import dataclass, field
from typing import Any, ClassVar, Optional, Union


class AbstractType(metaclass=ABCMeta):
    @abstractmethod
    def to_json(self):
        pass


@dataclass
class NamedType(AbstractType):
    name: str

    @classmethod
    def from_string(cls, string: str) -> NamedType:
        return NamedType(string)

    def to_json(self) -> dict[str, str]:
        return {"kind": self.__class__.__name__, "name": self.name}


@dataclass
class EnumType(AbstractType):
    values: set[str] = field(default_factory=set)

    @classmethod
    def from_string(cls, string: str) -> Optional[EnumType]:
        def remove_backslash(e: str):
            e = e.replace(r"\"", '"')
            e = e.replace(r"\'", "'")
            return e

        enum_match = re.search(r"{(.*?)}", string)
        if enum_match:
            quotes = "'\""
            values = set()
            enum_str = enum_match.group(1)
            value = ""
            inside_value = False
            curr_quote = None
            for i, char in enumerate(enum_str):
                if char in quotes and (i == 0 or (i > 0 and enum_str[i - 1] != "\\")):
                    if inside_value == False:
                        inside_value = True
                        curr_quote = char
                    elif inside_value == True:
                        if curr_quote == char:
                            inside_value = False
                            curr_quote = None
                            values.add(remove_backslash(value))
                            value = ""
                        else:
                            value += char
                elif inside_value:
                    value += char

            return EnumType(values)

        return None

    def update(self, enum: EnumType):
        self.values.update(enum.values)

    def to_json(self) -> dict[str, Any]:
        return {"kind": self.__class__.__name__, "values": self.values}


@dataclass
class BoundaryType(AbstractType):
    NEGATIVE_INFINITY: ClassVar = "NegativeInfinity"
    INFINITY: ClassVar = "Infinity"

    base_type: str
    min: Union[float, int]
    max: Union[float, int, str]
    min_inclusive: bool
    max_inclusive: bool

    @classmethod
    def _is_inclusive(cls, bracket: str) -> bool:
        if bracket == "(" or bracket == ")":
            return False
        elif bracket == "[" or bracket == "]":
            return True
        else:
            raise Exception(f"{bracket} is not one of []()")

    @classmethod
    def from_string(cls, string: str) -> Optional[BoundaryType]:
        pattern = r"""(?P<base_type>float|int)?[ ]  # optional base type of either float or int
                    (in|of)[ ](the[ ])?(range|interval)[ ](of[ ])?  # 'in' or 'of', optional 'the', 'range' or 'interval', optional 'of'
                    `?(?P<min_bracket>\[|\()(?P<min>\d+.?\d*|negative_infinity),[ ]  # left side of the range
                    (?P<max>\d+.?\d*|infinity)(?P<max_bracket>\]|\))`?"""  # right side of the range
        match = re.search(pattern, string, re.VERBOSE)

        if match is not None:
            base_type = match.group("base_type")
            if base_type is None:
                base_type = "float"
            base_type = eval(base_type)

            min_value = match.group("min")
            if min_value != "negative_infinity":
                min_value = base_type(min_value)
            else:
                min_value = BoundaryType.NEGATIVE_INFINITY

            max_value = match.group("max")
            if max_value != "infinity":
                max_value = base_type(max_value)
            else:
                max_value = BoundaryType.INFINITY

            min_bracket = match.group("min_bracket")
            max_bracket = match.group("max_bracket")
            min_inclusive = BoundaryType._is_inclusive(min_bracket)
            max_inclusive = BoundaryType._is_inclusive(max_bracket)

            return BoundaryType(
                base_type.__name__, min_value, max_value, min_inclusive, max_inclusive
            )

        return None

    def __eq__(self, __o: object) -> bool:
        if isinstance(__o, BoundaryType):
            eq = (
                self.base_type == __o.base_type
                and self.min == __o.min
                and self.min_inclusive == __o.min_inclusive
                and self.max == __o.max
            )
            if eq:
                if self.max == BoundaryType.INFINITY:
                    return True
                else:
                    return self.max_inclusive == __o.max_inclusive
            else:
                return False
        else:
            return False

    def to_json(self) -> dict[str, Any]:
        return {
            "kind": self.__class__.__name__,
            "base_type": self.base_type,
            "min": self.min,
            "max": self.max,
            "min_inclusive": self.min_inclusive,
            "max_inclusive": self.max_inclusive,
        }


@dataclass
class UnionType(AbstractType):
    types: list[AbstractType]

    def to_json(self) -> dict[str, Any]:
        type_list = []
        for t in self.types:
            type_list.append(t.to_json())

        return {"kind": self.__class__.__name__, "types": type_list}
