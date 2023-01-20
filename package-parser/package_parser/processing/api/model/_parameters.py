from __future__ import annotations

from enum import Enum
from typing import Any, Optional

from ._documentation import ParameterDocumentation
from ._types import AbstractType, create_type


class Parameter:
    @staticmethod
    def from_json(json: Any) -> Parameter:
        return Parameter(
            json["id"],
            json["name"],
            json["qname"],
            json.get("default_value", None),
            ParameterAssignment[json.get("assigned_by", "POSITION_OR_NAME")],
            json.get("is_public", True),
            ParameterDocumentation.from_dict(json.get("docstring", {})),
        )

    def __init__(
        self,
        id_: str,
        name: str,
        qname: str,
        default_value: Optional[str],
        assigned_by: ParameterAssignment,
        is_public: bool,
        documentation: ParameterDocumentation,
    ) -> None:
        self.id: str = id_
        self.name: str = name
        self.qname: str = qname
        self.default_value: Optional[str] = default_value
        self.assigned_by: ParameterAssignment = assigned_by
        self.is_public: bool = is_public
        self.documentation = documentation
        self.type: Optional[AbstractType] = create_type(documentation)

    def is_optional(self) -> bool:
        return self.default_value is not None

    def is_required(self) -> bool:
        return self.default_value is None

    def to_json(self) -> Any:
        return {
            "id": self.id,
            "name": self.name,
            "qname": self.qname,
            "default_value": self.default_value,
            "assigned_by": self.assigned_by.name,
            "is_public": self.is_public,
            "docstring": self.documentation.to_dict(),
            "type": self.type.to_json() if self.type is not None else {},
        }

    def __repr__(self) -> str:
        return "Parameter(id=" + self.id + ")"


class ParameterAssignment(Enum):
    """
    How arguments are assigned to parameters. The parameters must appear exactly in this order in a parameter list.

    IMPLICIT parameters appear on instance methods (usually called "self") and on class methods (usually called "cls").
    POSITION_ONLY parameters precede the "/" in a parameter list. NAME_ONLY parameters follow the "*" or the
    POSITIONAL_VARARGS parameter ("*args"). Between the "/" and the "*" the POSITION_OR_NAME parameters reside. Finally,
    the parameter list might optionally include a NAMED_VARARG parameter ("**kwargs").
    """

    IMPLICIT = "IMPLICIT"
    POSITION_ONLY = "POSITION_ONLY"
    POSITION_OR_NAME = "POSITION_OR_NAME"
    POSITIONAL_VARARG = ("POSITIONAL_VARARG",)
    NAME_ONLY = "NAME_ONLY"
    NAMED_VARARG = "NAMED_VARARG"
