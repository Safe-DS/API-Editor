from __future__ import annotations

import inspect
from enum import Enum, auto
from typing import Any, Optional

from package_parser.utils import declaration_qname_to_name, parent_qname


class API:
    @staticmethod
    def from_json(json: Any) -> API:
        result = API(json["distribution"], json["package"], json["version"])

        for module_json in json["modules"]:
            result.add_module(Module.from_json(module_json))

        for class_json in json["classes"]:
            result.add_class(Class.from_json(class_json))

        for function_json in json["functions"]:
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
        self.modules[module.name] = module

    def add_class(self, class_: Class) -> None:
        self.classes[class_.qname] = class_

    def add_function(self, function: Function) -> None:
        self.functions[function.qname] = function

    def is_public_class(self, class_qname: str) -> bool:
        return class_qname in self.classes and self.classes[class_qname].is_public

    def is_public_function(self, function_qname: str) -> bool:
        return (
            function_qname in self.functions
            and self.functions[function_qname].is_public
        )

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
                parameter_qname = f"{function.qname}.{parameter.name}"
                result[parameter_qname] = parameter

        return result

    def get_default_value(self, parameter_qname: str) -> Optional[str]:
        function_qname = parent_qname(parameter_qname)
        parameter_name = declaration_qname_to_name(parameter_qname)

        if function_qname not in self.functions:
            return None

        for parameter in self.functions[function_qname].parameters:
            if parameter.name == parameter_name:
                return parameter.default_value

        return None

    def to_json(self) -> Any:
        return {
            "distribution": self.distribution,
            "package": self.package,
            "version": self.version,
            "modules": [
                module.to_json()
                for module in sorted(self.modules.values(), key=lambda it: it.name)
            ],
            "classes": [
                clazz.to_json()
                for clazz in sorted(self.classes.values(), key=lambda it: it.qname)
            ],
            "functions": [
                function.to_json()
                for function in sorted(self.functions.values(), key=lambda it: it.qname)
            ],
        }


class Module:
    @staticmethod
    def from_json(json: Any) -> Module:
        result = Module(
            json["name"],
            [Import.from_json(import_json) for import_json in json["imports"]],
            [
                FromImport.from_json(from_import_json)
                for from_import_json in json["from_imports"]
            ],
        )

        for class_qname in json["classes"]:
            result.add_class(class_qname)

        for function_qname in json["functions"]:
            result.add_function(function_qname)

        return result

    def __init__(
        self, name: str, imports: list[Import], from_imports: list[FromImport]
    ):
        self.name: str = name
        self.imports: list[Import] = imports
        self.from_imports: list[FromImport] = from_imports
        self.classes: list[str] = []
        self.functions: list[str] = []

    def add_class(self, class_qname: str) -> None:
        self.classes.append(class_qname)

    def add_function(self, function_qname: str) -> None:
        self.functions.append(function_qname)

    def to_json(self) -> Any:
        return {
            "name": self.name,
            "imports": [import_.to_json() for import_ in self.imports],
            "from_imports": [
                from_import.to_json() for from_import in self.from_imports
            ],
            "classes": self.classes,
            "functions": self.functions,
        }


class Import:
    @staticmethod
    def from_json(json: Any) -> Import:
        return Import(json["module"], json["alias"])

    def __init__(self, module_name: str, alias: Optional[str]):
        self.module: str = module_name
        self.alias: Optional[str] = alias

    def to_json(self) -> Any:
        return {"module": self.module, "alias": self.alias}


class FromImport:
    @staticmethod
    def from_json(json: Any) -> FromImport:
        return FromImport(json["module"], json["declaration"], json["alias"])

    def __init__(self, module_name: str, declaration_name: str, alias: Optional[str]):
        self.module_name: str = module_name
        self.declaration_name: str = declaration_name
        self.alias: Optional[str] = alias

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
            json["qname"],
            json["decorators"],
            json["superclasses"],
            json["is_public"],
            json["description"],
            json["docstring"],
            json["source_code"],
        )

        for method_qname in json["methods"]:
            result.add_method(method_qname)

        return result

    def __init__(
        self,
        qname: str,
        decorators: list[str],
        superclasses: list[str],
        is_public: bool,
        description: str,
        docstring: str,
        source_code: str,
    ) -> None:
        self.qname: str = qname
        self.decorators: list[str] = decorators
        self.superclasses: list[str] = superclasses
        self.methods: list[str] = []
        self.is_public: bool = is_public
        self.description: str = description
        self.docstring: str = docstring
        self.source_code: str = source_code

    @property
    def name(self) -> str:
        return self.qname.split(".")[-1]

    def add_method(self, function_qname: str) -> None:
        self.methods.append(function_qname)

    def to_json(self) -> Any:
        return {
            "name": self.name,
            "qname": self.qname,
            "decorators": self.decorators,
            "superclasses": self.superclasses,
            "methods": self.methods,
            "is_public": self.is_public,
            "description": self.description,
            "docstring": self.docstring,
            "source_code": self.source_code,
        }


class Function:
    @staticmethod
    def from_json(json: Any) -> Function:
        return Function(
            json["qname"],
            json["decorators"],
            [
                Parameter.from_json(parameter_json)
                for parameter_json in json["parameters"]
            ],
            [Result.from_json(result_json) for result_json in json["results"]],
            json["is_public"],
            json["description"],
            json["docstring"],
            json["source_code"],
        )

    def __init__(
        self,
        qname: str,
        decorators: list[str],
        parameters: list[Parameter],
        results: list[Result],
        is_public: bool,
        description: str,
        docstring: str,
        source_code: str,
    ) -> None:
        self.qname: str = qname
        self.decorators: list[str] = decorators
        self.parameters: list[Parameter] = parameters
        self.results: list[Result] = results
        self.is_public: bool = is_public
        self.description: str = description
        self.docstring: str = inspect.cleandoc(docstring or "")
        self.source_code: str = source_code

    @property
    def name(self) -> str:
        return self.qname.split(".")[-1]

    def to_json(self) -> Any:
        return {
            "name": self.name,
            "qname": self.qname,
            "decorators": self.decorators,
            "parameters": [parameter.to_json() for parameter in self.parameters],
            "results": [result.to_json() for result in self.results],
            "is_public": self.is_public,
            "description": self.description,
            "docstring": self.docstring,
            "source_code": self.source_code,
        }


class Parameter:
    @staticmethod
    def from_json(json: Any) -> Parameter:
        return Parameter(
            json["name"],
            json["default_value"],
            json["is_public"],
            ParameterAssignment[json["assigned_by"]],
            ParameterAndResultDocstring.from_json(json["docstring"]),
        )

    def __init__(
        self,
        name: str,
        default_value: Optional[str],
        is_public: bool,
        assigned_by: ParameterAssignment,
        docstring: ParameterAndResultDocstring,
    ) -> None:
        self.name: str = name
        self.default_value: Optional[str] = default_value
        self.is_public: bool = is_public
        self.assigned_by: ParameterAssignment = assigned_by
        self.docstring = docstring

    def to_json(self) -> Any:
        return {
            "name": self.name,
            "default_value": self.default_value,
            "is_public": self.is_public,
            "assigned_by": self.assigned_by.name,
            "docstring": self.docstring.to_json(),
        }


class ParameterAssignment(Enum):
    POSITION_ONLY = (auto(),)
    POSITION_OR_NAME = (auto(),)
    NAME_ONLY = (auto(),)


class Result:
    @staticmethod
    def from_json(json: Any) -> Result:
        return Result(
            json["name"], ParameterAndResultDocstring.from_json(json["docstring"])
        )

    def __init__(self, name: str, docstring: ParameterAndResultDocstring) -> None:
        self.name: str = name
        self.docstring = docstring

    def to_json(self) -> Any:
        return {"name": self.name, "docstring": self.docstring.to_json()}


class ParameterAndResultDocstring:
    @staticmethod
    def from_json(json: Any) -> ParameterAndResultDocstring:
        return ParameterAndResultDocstring(json["type"], json["description"])

    def __init__(
        self,
        type_: str,
        description: str,
    ) -> None:
        self.type: str = type_
        self.description: str = description

    def to_json(self) -> Any:
        return {"type": self.type, "description": self.description}
