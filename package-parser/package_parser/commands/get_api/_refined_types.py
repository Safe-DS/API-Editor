from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import ClassVar, Optional, Union


@dataclass
class NamedType:
    name: str

    def from_string(self, string: str) -> set[NamedType]:
        pass


@dataclass
class EnumType:
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


@dataclass
class BoundaryType:
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


@dataclass
class UnionType:
    types: list[str]

    @classmethod
    def from_string(cls, type_str: str) -> Optional[UnionType]:
        # Remove all non-necessary whitespaces
        type_str = re.sub("[ ]+", " ", type_str)
        # Find all Enums and remove them from doc_string
        enum_array_matches = re.findall("\{.*?\}", type_str)
        type_str = re.sub("\{.*?\}", " ", type_str)

        # Remove default-Value from doc_string
        type_str = re.sub("default=.*", " ", type_str)

        # Create a list with all values and types
        # elements_raw = re.split(" , or |, or | ,or | or | ,  |, | ,", type_str)
        type_str = re.sub("\) or \(", "&%&", type_str)
        type_str = re.sub(" or ", ", ", type_str)
        type_str = re.sub(" ,[ ]*or ", ", ", type_str)
        type_str = re.sub("&%&", ") or (", type_str)
        elements = []
        brackets = 0
        build_string = ""
        for c in type_str:
            if c == '(':
                brackets += 1
            elif c == ')':
                brackets -= 1

            if brackets > 0:
                build_string += c
                continue

            if brackets == 0 and not c == ',':
                build_string += c
            elif brackets == 0 and c == ",":
                # remove leading and trailing whitespaces
                build_string = re.sub("^[ \t]+|[ \t]+$", "", build_string)
                if build_string != "":
                    elements.append(build_string)
                    build_string = ""
                # re.sub("", "", build_string)
        build_string = re.sub("^[ \t]+|[ \t]+$", "", build_string)
        if build_string != "":
            elements.append(build_string)
        # elements_refined = [element for element in elements_raw if bool(re.search("[^, ]+", element))]
        elements = enum_array_matches + elements

        if len(elements) == 1:
            return UnionType(list())

        return UnionType(elements)

    def as_list(self):
        if self.types is not None:
            return self.types
        return []
