from dataclasses import dataclass
from typing import Any, Dict

from package_parser.model.api import Parameter


@dataclass
class Action:
    action: str

    @classmethod
    def from_json(cls, json: Any):
        return cls(json["action"])

    def to_json(self) -> Dict:
        return {"action": self.action}


class RuntimeAction(Action):
    def __init__(self, action: str) -> None:
        super().__init__(action)


class StaticAction(Action):
    def __init__(self, action: str) -> None:
        super().__init__(action)


class ParameterIsIgnored(StaticAction):
    def __init__(self, action: str) -> None:
        super().__init__(action)


class ParameterIsIllegal(StaticAction):
    def __init__(self, action: str) -> None:
        super().__init__(action)


@dataclass
class Condition:
    condition: str

    @classmethod
    def from_json(cls, json: Any):
        return cls(json["condition"])

    def to_json(self) -> Dict:
        return {"condition": self.condition}


class RuntimeCondition(Condition):
    def __init__(self, condition: str) -> None:
        super().__init__(condition)


class StaticCondition(Condition):
    def __init__(self, condition: str) -> None:
        super().__init__(condition)


class ParameterHasValue(StaticCondition):
    def __init__(self, condition: str) -> None:
        super().__init__(condition)


class ParameterIsNone(StaticCondition):
    def __init__(self, condition: str) -> None:
        super().__init__(condition)


@dataclass
class Dependency:
    hasDependentParameter: Parameter
    isDependingOn: Parameter
    hasCondition: Condition
    hasAction: Action

    @classmethod
    def from_json(cls, json: Any):
        return cls(
            Parameter.from_json(json["hasDependentParameter"]),
            Parameter.from_json(json["isDependingOn"]),
            Condition.from_json(json["hasCondition"]),
            Action.from_json(json["hasAction"]),
        )

    def to_json(self) -> dict:
        return {
            "hasDependentParameter": self.hasDependentParameter.to_json(),
            "isDependingOn": self.isDependingOn.to_json(),
            "hasCondition": self.hasCondition.to_json(),
            "hasAction": self.hasAction.to_json(),
        }


@dataclass
class APIDependencies:
    dependencies: Dict

    def to_json(self) -> Dict:
        return {
            function_name: {
                parameter_name: [dependency.to_json() for dependency in dependencies]
                for parameter_name, dependencies in parameter_name.items()
            }
            for function_name, parameter_name in self.dependencies.items()
        }
