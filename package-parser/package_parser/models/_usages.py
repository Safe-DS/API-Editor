from __future__ import annotations

from collections import Counter
from typing import Any

ClassQName = str
FunctionQName = str
ParameterQName = str
StringifiedValue = str


class UsageCountStore:
    """Counts how often classes, functions, parameters, and parameter values are used."""

    @staticmethod
    def from_json(json: Any) -> UsageCountStore:
        """Creates an instance of this class from a dictionary."""

        result = UsageCountStore()

        # Revive class counts
        class_counts = json["class_counts"]
        for class_qname, count in class_counts.items():
            result.add_class_usage(class_qname, count)

        # Revive function counts
        function_counts = json["function_counts"]
        for function_qname, count in function_counts.items():
            result.add_function_usages(function_qname, count)

        # Revive parameter counts
        parameter_counts = json["parameter_counts"]
        for parameter_qname, count in parameter_counts.items():
            result.add_parameter_usages(parameter_qname, count)

        # Revive value counts
        value_counts = json["value_counts"]
        for parameter_qname, values in value_counts.items():
            for value, count in values.items():
                result.add_value_usages(parameter_qname, value, count)

        return result

    def __init__(self) -> None:
        self.__class_usages: Counter[ClassQName] = Counter()
        self.__function_usages: Counter[FunctionQName] = Counter()
        self.__parameter_usages: Counter[ParameterQName] = Counter()
        self.__value_usages: dict[ParameterQName, Counter[StringifiedValue]] = {}

    def add_class_usage(self, class_qname: ClassQName, count: int = 1) -> None:
        """Increases the usage count of the class with the given name by the given count."""

        self.__class_usages[class_qname] += count

    def remove_class(self, class_qname: ClassQName) -> None:
        """Removes all usages of classes with the given name and usages of their methods."""

        if class_qname in self.__class_usages:
            del self.__class_usages[class_qname]

        for function_qname in list(self.__function_usages.keys()):
            if function_qname.startswith(class_qname):
                self.remove_function(function_qname)

    def add_function_usages(self, function_qname: FunctionQName, count: int = 1) -> None:
        """Increases the usage count of the function with the given name by the given count."""

        self.__function_usages[function_qname] += count

    def remove_function(self, function_qname: FunctionQName) -> None:
        """Removes all usages of functions with the given name and usages of their parameters."""

        if function_qname in self.__function_usages:
            del self.__function_usages[function_qname]

        for parameter_qname in list(self.__parameter_usages.keys()):
            if parameter_qname.startswith(function_qname):
                self.remove_parameter(parameter_qname)

    def add_parameter_usages(self, parameter_qname: ParameterQName, count: int = 1) -> None:
        """Increases the usage count of the parameter with the given name by the given count."""

        self.__parameter_usages[parameter_qname] += count

    def remove_parameter(self, parameter_qname: ParameterQName) -> None:
        """Removes all parameter and value usages of parameters with the given name."""

        if parameter_qname in self.__parameter_usages:
            del self.__parameter_usages[parameter_qname]

        self.remove_value(parameter_qname)

    def add_value_usages(self, parameter_qname: ParameterQName, value: StringifiedValue, count: int = 1) -> None:
        """Increases the usage count of the given value for the parameter with the given name by the given count."""

        if parameter_qname not in self.__value_usages:
            self.__value_usages[parameter_qname] = Counter()

        self.__value_usages[parameter_qname][value] += count

    def remove_value(self, parameter_qname: ParameterQName) -> None:
        """Removes all value usages of parameters with the given name."""

        if parameter_qname in self.__value_usages:
            del self.__value_usages[parameter_qname]

    def n_class_usages(self, class_qname: ClassQName) -> int:
        """Returns how often the class is used, i.e. how often any of its methods are called."""

        return self.__class_usages[class_qname]

    def n_function_usages(self, function_qname: FunctionQName) -> int:
        """Returns how often the function is called."""

        return self.__function_usages[function_qname]

    def n_parameter_usages(self, parameter_qname: ParameterQName) -> int:
        """Returns how often the parameter is set."""

        return self.__parameter_usages[parameter_qname]

    def n_value_usages(self, parameter_qname: ParameterQName, value: str) -> int:
        """Returns how often the parameter with the given name is set to the given value."""

        if parameter_qname in self.__value_usages:
            return self.__value_usages[parameter_qname][value]

        return 0

    def to_json(self) -> Any:
        """Converts this class to a dictionary, which can later be serialized as JSON."""

        return {
            "class_counts": {
                class_qname: usage_count
                for class_qname, usage_count in self.__class_usages.most_common()
            },
            "function_counts": {
                function_qname: usage_count
                for function_qname, usage_count in self.__function_usages.most_common()
            },
            "parameter_counts": {
                parameter_qname: usage_count
                for parameter_qname, usage_count in self.__parameter_usages.most_common()
            },
            "value_counts": {
                parameter_qname: {
                    value: usage_count
                    for value, usage_count in values.most_common()
                }
                for parameter_qname, values in self.__value_usages.items()
            },
        }
