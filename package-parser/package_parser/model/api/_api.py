from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum
from typing import Any, Optional

from package_parser.model.api._types import (
    AbstractType,
    BoundaryType,
    EnumType,
    NamedType,
    UnionType,
)
from package_parser.utils import parent_id

API_SCHEMA_VERSION = 1


class API:
    @staticmethod
    def from_json(json: Any) -> API:
        result = API(json["distribution"], json["package"], json["version"])

        for module_json in json.get("modules", []):
            result.add_module(Module.from_json(module_json))

        for class_json in json.get("classes", []):
            result.add_class(Class.from_json(class_json))

        for function_json in json.get("functions", []):
            result.add_function(Function.from_json(function_json))

        return result

    def __init__(self, distribution: str, package: str, version: str) -> None:
        self.distribution: str = distribution
        self.package: str = package
        self.version: str = version
        self.modules: dict[str, Module] = dict()
        self.classes: dict[str, Class] = dict()
        self.functions: dict[str, Function] = dict()

    def add_module(self, module: Module) -> None:
        self.modules[module.id] = module

    def add_class(self, class_: Class) -> None:
        self.classes[class_.id] = class_

    def add_function(self, function: Function) -> None:
        self.functions[function.id] = function

    def is_public_class(self, class_id: str) -> bool:
        return class_id in self.classes and self.classes[class_id].is_public

    def is_public_function(self, function_id: str) -> bool:
        return function_id in self.functions and self.functions[function_id].is_public

    def class_count(self) -> int:
        return len(self.classes)

    def public_class_count(self) -> int:
        return len([it for it in self.classes.values() if it.is_public])

    def function_count(self) -> int:
        return len(self.functions)

    def public_function_count(self) -> int:
        return len([it for it in self.functions.values() if it.is_public])

    def parameter_count(self) -> int:
        return len(self.parameters())

    def public_parameter_count(self) -> int:
        return len([it for it in self.parameters().values() if it.is_public])

    def parameters(self) -> dict[str, Parameter]:
        result: dict[str, Parameter] = {}

        for function in self.functions.values():
            for parameter in function.parameters:
                parameter_id = f"{function.id}/{parameter.name}"
                result[parameter_id] = parameter

        return result

    def get_default_value(self, parameter_id: str) -> Optional[str]:
        function_id = parent_id(parameter_id)

        if function_id not in self.functions:
            return None

        for parameter in self.functions[function_id].parameters:
            if parameter.id == parameter_id:
                return parameter.default_value

        return None

    def to_json(self) -> Any:
        return {
            "schemaVersion": API_SCHEMA_VERSION,
            "distribution": self.distribution,
            "package": self.package,
            "version": self.version,
            "modules": [
                module.to_json()
                for module in sorted(self.modules.values(), key=lambda it: it.id)
            ],
            "classes": [
                class_.to_json()
                for class_ in sorted(self.classes.values(), key=lambda it: it.id)
            ],
            "functions": [
                function.to_json()
                for function in sorted(self.functions.values(), key=lambda it: it.id)
            ],
        }


class Module:
    @staticmethod
    def from_json(json: Any) -> Module:
        result = Module(
            json["id"],
            json["name"],
            [Import.from_json(import_json) for import_json in json.get("imports", [])],
            [
                FromImport.from_json(from_import_json)
                for from_import_json in json.get("from_imports", [])
            ],
        )

        for class_id in json.get("classes", []):
            result.add_class(class_id)

        for function_id in json.get("functions", []):
            result.add_function(function_id)

        return result

    def __init__(
        self, id_: str, name: str, imports: list[Import], from_imports: list[FromImport]
    ):
        self.id: str = id_
        self.name: str = name
        self.imports: list[Import] = imports
        self.from_imports: list[FromImport] = from_imports
        self.classes: list[str] = []
        self.functions: list[str] = []

    def add_class(self, class_id: str) -> None:
        self.classes.append(class_id)

    def add_function(self, function_id: str) -> None:
        self.functions.append(function_id)

    def to_json(self) -> Any:
        return {
            "id": self.id,
            "name": self.name,
            "imports": [import_.to_json() for import_ in self.imports],
            "from_imports": [
                from_import.to_json() for from_import in self.from_imports
            ],
            "classes": self.classes,
            "functions": self.functions,
        }


@dataclass
class Import:
    module_name: str
    alias: Optional[str]

    @staticmethod
    def from_json(json: Any) -> Import:
        return Import(json["module"], json["alias"])

    def to_json(self) -> Any:
        return {"module": self.module_name, "alias": self.alias}


@dataclass
class FromImport:
    module_name: str
    declaration_name: str
    alias: Optional[str]

    @staticmethod
    def from_json(json: Any) -> FromImport:
        return FromImport(json["module"], json["declaration"], json["alias"])

    def to_json(self) -> Any:
        return {
            "module": self.module_name,
            "declaration": self.declaration_name,
            "alias": self.alias,
        }


class Class:
    @staticmethod
    def from_json(json: Any) -> Class:
        result = Class(
            json["id"],
            json["qname"],
            json.get("decorators", []),
            json.get("superclasses", []),
            json.get("is_public", True),
            json.get("reexported_by", []),
            json.get("description", ""),
            json.get("docstring", ""),
        )

        for method_id in json["methods"]:
            result.add_method(method_id)

        return result

    def __init__(
        self,
        id_: str,
        qname: str,
        decorators: list[str],
        superclasses: list[str],
        is_public: bool,
        reexported_by: list[str],
        description: str,
        docstring: str,
    ) -> None:
        self.id: str = id_
        self.qname: str = qname
        self.decorators: list[str] = decorators
        self.superclasses: list[str] = superclasses
        self.methods: list[str] = []
        self.is_public: bool = is_public
        self.reexported_by: list[str] = reexported_by
        self.description: str = description
        self.docstring: str = docstring

    @property
    def name(self) -> str:
        return self.qname.split(".")[-1]

    def add_method(self, method_id: str) -> None:
        self.methods.append(method_id)

    def to_json(self) -> Any:
        return {
            "id": self.id,
            "name": self.name,
            "qname": self.qname,
            "decorators": self.decorators,
            "superclasses": self.superclasses,
            "methods": self.methods,
            "is_public": self.is_public,
            "reexported_by": self.reexported_by,
            "description": self.description,
            "docstring": self.docstring,
        }


@dataclass
class Function:
    id: str
    qname: str
    decorators: list[str]
    parameters: list[Parameter]
    results: list[Result]
    is_public: bool
    reexported_by: list[str]
    description: str
    docstring: str

    @staticmethod
    def from_json(json: Any) -> Function:
        return Function(
            json["id"],
            json["qname"],
            json.get("decorators", []),
            [
                Parameter.from_json(parameter_json)
                for parameter_json in json.get("parameters", [])
            ],
            [Result.from_json(result_json) for result_json in json.get("results", [])],
            json.get("is_public", True),
            json.get("reexported_by", []),
            json.get("description", ""),
            json.get("docstring", ""),
        )

    @property
    def name(self) -> str:
        return self.qname.split(".")[-1]

    def to_json(self) -> Any:
        return {
            "id": self.id,
            "name": self.name,
            "qname": self.qname,
            "decorators": self.decorators,
            "parameters": [parameter.to_json() for parameter in self.parameters],
            "results": [result.to_json() for result in self.results],
            "is_public": self.is_public,
            "reexported_by": self.reexported_by,
            "description": self.description,
            "docstring": self.docstring,
        }


class Type:
    def __init__(
        self,
        typestring: ParameterAndResultDocstring,
    ) -> None:
        self.type: Optional[AbstractType] = Type.create_type(typestring)

    @classmethod
    def create_type(
        cls, docstring: ParameterAndResultDocstring
    ) -> Optional[AbstractType]:
        type_string = docstring.type
        types: list[AbstractType] = list()

        # Collapse whitespaces
        type_string = re.sub(r"\s+", " ", type_string)

        # Get boundary from description
        boundary = BoundaryType.from_string(docstring.description)
        if boundary is not None:
            types.append(boundary)

        # Find all enums and remove them from doc_string
        enum_array_matches = re.findall(r"\{.*?}", type_string)
        type_string = re.sub(r"\{.*?}", " ", type_string)
        for enum in enum_array_matches:
            enum_type = EnumType.from_string(enum)
            if enum_type is not None:
                types.append(enum_type)

        # Remove default value from doc_string
        type_string = re.sub("default=.*", " ", type_string)

        # Create a list with all values and types
        # ") or (" must be replaced by a very unlikely string ("&%&") so that it is not removed when filtering out.
        # The string will be replaced by ") or (" again after filtering out.
        type_string = re.sub(r"\) or \(", "&%&", type_string)
        type_string = re.sub(r" ?, ?or ", ", ", type_string)
        type_string = re.sub(r" or ", ", ", type_string)
        type_string = re.sub("&%&", ") or (", type_string)

        brackets = 0
        build_string = ""
        for c in type_string:
            if c == "(":
                brackets += 1
            elif c == ")":
                brackets -= 1

            if brackets > 0:
                build_string += c
                continue

            if brackets == 0 and c != ",":
                build_string += c
            elif brackets == 0 and c == ",":
                # remove leading and trailing whitespaces
                build_string = build_string.strip()
                if build_string != "":
                    named = NamedType.from_string(build_string)
                    types.append(named)
                    build_string = ""

        build_string = build_string.strip()

        # Append the last remaining entry
        if build_string != "":
            named = NamedType.from_string(build_string)
            types.append(named)

        if len(types) == 1:
            return types[0]
        elif len(types) == 0:
            return None
        else:
            return UnionType(types)

    def to_json(self) -> dict[str, Any]:
        if self.type is None:
            return {}
        else:
            return self.type.to_json()


class Parameter:
    @staticmethod
    def from_json(json: Any):
        return Parameter(
            json["id"],
            json["name"],
            json["qname"],
            json.get("default_value", None),
            ParameterAssignment[json.get("assigned_by", "POSITION_OR_NAME")],
            json.get("is_public", True),
            ParameterAndResultDocstring.from_json(json.get("docstring", {})),
        )

    def __init__(
        self,
        id_: str,
        name: str,
        qname: str,
        default_value: Optional[str],
        assigned_by: ParameterAssignment,
        is_public: bool,
        docstring: ParameterAndResultDocstring,
    ) -> None:
        self.id: str = id_
        self.name: str = name
        self.qname: str = qname
        self.default_value: Optional[str] = default_value
        self.assigned_by: ParameterAssignment = assigned_by
        self.is_public: bool = is_public
        self.docstring = docstring
        self.type: Type = Type(docstring)

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
            "docstring": self.docstring.to_json(),
            "type": self.type.to_json(),
        }


class ParameterAssignment(Enum):
    IMPLICIT = "IMPLICIT"
    POSITION_ONLY = "POSITION_ONLY"
    POSITION_OR_NAME = "POSITION_OR_NAME"
    NAME_ONLY = "NAME_ONLY"


@dataclass
class Result:
    name: str
    docstring: ParameterAndResultDocstring

    @staticmethod
    def from_json(json: Any) -> Result:
        return Result(
            json["name"],
            ParameterAndResultDocstring.from_json(json.get("docstring", {})),
        )

    def to_json(self) -> Any:
        return {"name": self.name, "docstring": self.docstring.to_json()}


@dataclass
class ParameterAndResultDocstring:
    type: str
    description: str

    @staticmethod
    def from_json(json: Any):
        return ParameterAndResultDocstring(
            json.get("type", ""),
            json.get("description", ""),
        )

    def to_json(self) -> Any:
        return {"type": self.type, "description": self.description}
