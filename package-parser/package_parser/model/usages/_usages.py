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
            result.add_class_usages(class_qname, count)

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
        self.class_usages: Counter[ClassQName] = Counter()
        self.function_usages: Counter[FunctionQName] = Counter()
        self.parameter_usages: Counter[ParameterQName] = Counter()
        self.value_usages: dict[ParameterQName, Counter[StringifiedValue]] = {}

    def __eq__(self, other: object) -> bool:
        if isinstance(other, UsageCountStore):
            return (
                self.class_usages == other.class_usages
                and self.function_usages == other.function_usages
                and self.parameter_usages == other.parameter_usages
                and self.value_usages == other.value_usages
            )

        return False

    def __hash__(self) -> int:
        return hash(tuple(sorted(self.__dict__.items())))

    def add_class_usages(self, class_qname: ClassQName, count: int = 1) -> None:
        """Increases the usage count of the class with the given name by the given count."""

        self.class_usages[class_qname] += count

    def remove_class(self, class_qname: ClassQName) -> None:
        """Removes all usages of classes with the given name and usages of their methods."""

        if class_qname in self.class_usages:
            del self.class_usages[class_qname]

        for function_qname in list(self.function_usages.keys()):
            if function_qname.startswith(class_qname):
                self.remove_function(function_qname)

    def add_function_usages(
        self, function_qname: FunctionQName, count: int = 1
    ) -> None:
        """Increases the usage count of the function with the given name by the given count."""

        self.function_usages[function_qname] += count

    def remove_function(self, function_qname: FunctionQName) -> None:
        """Removes all usages of functions with the given name and usages of their parameters."""

        if function_qname in self.function_usages:
            del self.function_usages[function_qname]

        for parameter_qname in list(self.parameter_usages.keys()):
            if parameter_qname.startswith(function_qname):
                self.remove_parameter(parameter_qname)

    def add_parameter_usages(
        self, parameter_qname: ParameterQName, count: int = 1
    ) -> None:
        """Increases the usage count of the parameter with the given name by the given count."""

        self.parameter_usages[parameter_qname] += count

    def remove_parameter(self, parameter_qname: ParameterQName) -> None:
        """Removes all parameter and value usages of parameters with the given name."""

        if parameter_qname in self.parameter_usages:
            del self.parameter_usages[parameter_qname]

        if parameter_qname in self.value_usages:
            del self.value_usages[parameter_qname]

    def add_value_usages(
        self, parameter_qname: ParameterQName, value: StringifiedValue, count: int = 1
    ) -> None:
        """Increases the usage count of the given value for the parameter with the given name by the given count."""

        self.init_value(parameter_qname)
        self.value_usages[parameter_qname][value] += count

    def init_value(self, parameter_qname: ParameterQName) -> None:
        """Ensures the dictionary for the value counts has the given parameter name as a key."""

        if parameter_qname not in self.value_usages:
            self.value_usages[parameter_qname] = Counter()

    def n_class_usages(self, class_qname: ClassQName) -> int:
        """Returns how often the class is used, i.e. how often any of its methods are called."""

        return self.class_usages[class_qname]

    def n_function_usages(self, function_qname: FunctionQName) -> int:
        """Returns how often the function is called."""

        return self.function_usages[function_qname]

    def n_parameter_usages(self, parameter_qname: ParameterQName) -> int:
        """Returns how often the parameter is set."""

        return self.parameter_usages[parameter_qname]

    def n_value_usages(self, parameter_qname: ParameterQName, value: str) -> int:
        """Returns how often the parameter with the given name is set to the given value."""

        if parameter_qname in self.value_usages:
            return self.value_usages[parameter_qname][value]

        return 0

    def merge_other_into_self(
        self, other_usage_store: UsageCountStore
    ) -> UsageCountStore:
        """
        Merges the other usage store into this one **in-place** and returns this store.

        :param other_usage_store: The usage store to merge into this one.
        :return: This usage store.
        """

        # Merge class usages
        self.class_usages += other_usage_store.class_usages

        # Merge function usages
        self.function_usages += other_usage_store.function_usages

        # Merge parameter usages
        self.parameter_usages += other_usage_store.parameter_usages

        # Merge value usages
        for parameter_qname, value_usages in other_usage_store.value_usages.items():
            self.init_value(parameter_qname)
            self.value_usages[parameter_qname] += value_usages

        return self

    def to_json(self) -> Any:
        """Converts this class to a dictionary, which can later be serialized as JSON."""

        return {
            "class_counts": {
                class_qname: usage_count
                for class_qname, usage_count in self.class_usages.most_common()
            },
            "function_counts": {
                function_qname: usage_count
                for function_qname, usage_count in self.function_usages.most_common()
            },
            "parameter_counts": {
                parameter_qname: usage_count
                for parameter_qname, usage_count in self.parameter_usages.most_common()
            },
            "value_counts": {
                parameter_qname: {
                    value: usage_count for value, usage_count in values.most_common()
                }
                for parameter_qname, values in self.value_usages.items()
            },
        }
