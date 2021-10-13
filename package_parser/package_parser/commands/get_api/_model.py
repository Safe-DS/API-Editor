from __future__ import annotations

from typing import Any, Optional

from package_parser.utils import declaration_name, parent_qname


class API:

    @staticmethod
    def from_json(json: Any) -> API:
        result = API(
            json["distribution"],
            json["package"],
            json["version"]
        )

        for class_json in json["classes"]:
            result.add_class(Class.from_json(class_json))

        for function_json in json["functions"]:
            result.add_function(Function.from_json(function_json))

        return result

    def __init__(self, distribution: str, package: str, version: str) -> None:
        self.distribution: str = distribution
        self.package: str = package
        self.version: str = version
        self.classes: dict[str, Class] = dict()
        self.functions: dict[str, Function] = dict()

    def add_class(self, clazz: Class) -> None:
        self.classes[clazz.qname] = clazz

    def add_function(self, function: Function) -> None:
        self.functions[function.qname] = function

    def is_public_class(self, class_qname: str) -> bool:
        return class_qname in self.classes and self.classes[class_qname].is_public

    def is_public_function(self, function_qname: str) -> bool:
        return function_qname in self.functions and self.functions[function_qname].is_public

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
        parameter_name = declaration_name(parameter_qname)

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
            "classes": [
                clazz.to_json()
                for clazz in sorted(self.classes.values(), key=lambda it: it.qname)
            ],
            "functions": [
                function.to_json()
                for function in sorted(self.functions.values(), key=lambda it: it.qname)
            ]
        }


class Class:

    @staticmethod
    def from_json(json: Any) -> Class:
        return Class(
            json["qname"],
            json["is_public"]
        )

    def __init__(self, qname: str, is_public: bool) -> None:
        self.qname: str = qname
        self.is_public: bool = is_public

    def to_json(self) -> Any:
        return {
            "qname": self.qname,
            "is_public": self.is_public
        }


class Function:

    @staticmethod
    def from_json(json: Any) -> Function:
        return Function(
            json["qname"],
            [Parameter.from_json(parameter_json) for parameter_json in json["parameters"]],
            json["is_public"]
        )

    def __init__(self, qname: str, parameters: list[Parameter], is_public: bool) -> None:
        self.qname: str = qname
        self.parameters: list[Parameter] = parameters
        self.is_public: bool = is_public

    def to_json(self) -> Any:
        return {
            "qname": self.qname,
            "parameters": [
                parameter.to_json()
                for parameter in self.parameters
            ],
            "is_public": self.is_public
        }


class Parameter:

    @staticmethod
    def from_json(json: Any) -> Parameter:
        return Parameter(
            json["name"],
            json["default_value"],
            json["is_public"]
        )

    def __init__(self, name: str, default_value: Optional[str], is_public: bool) -> None:
        self.name: str = name
        self.default_value: Optional[str] = default_value
        self.is_public: bool = is_public

    def to_json(self) -> Any:
        return {
            "name": self.name,
            "default_value": self.default_value,
            "is_public": self.is_public
        }
