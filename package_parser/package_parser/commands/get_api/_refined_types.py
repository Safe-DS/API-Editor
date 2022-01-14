from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Union


@dataclass
class NamedType:
    name: str

    def from_string(self, string: str) -> set[NamedType]:
        pass


@dataclass
class EnumType:
    values: set[str] = field(default_factory=set)

    @classmethod
    def from_string(cls, string: str) -> EnumType:
        def remove_backslash(e: str):
            e = e.replace(r"\"", '"')
            e = e.replace(r"\'", "'")
            return e

        enum_match = re.search(r"{(.*?)}", string)
        values = set()
        quotes = "'\""
        if enum_match:
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

    def update(self, enum: EnumType):
        self.values.update(enum.values)


@dataclass
class BoundaryType:
    base_type: str
    min: float
    max: float
    min_inclusive: bool = False
    max_inclusive: bool = False

    def from_string(self, string: str) -> BoundaryType:
        pass


@dataclass
class UnionType:
    types: set[Union[NamedType, EnumType, BoundaryType]] = field(default_factory=set)
