from __future__ import annotations

from collections import Counter
from typing import Any

ClassId = str
FunctionId = str
ParameterId = str
StringifiedValue = str


class UsageCountStore:
    """Counts how often classes, functions, parameters, and parameter values are used."""

    @staticmethod
    def from_json(json: Any) -> UsageCountStore:
        """Creates an instance of this class from a dictionary."""

        result = UsageCountStore()

        # Revive class counts
        class_counts = json["class_counts"]
        for class_id, count in class_counts.items():
            result.add_class_usages(class_id, count)

        # Revive function counts
        function_counts = json["function_counts"]
        for function_id, count in function_counts.items():
            result.add_function_usages(function_id, count)

        # Revive parameter counts
        parameter_counts = json["parameter_counts"]
        for parameter_id, count in parameter_counts.items():
            result.add_parameter_usages(parameter_id, count)

        # Revive value counts
        value_counts = json["value_counts"]
        for parameter_id, values in value_counts.items():
            for value, count in values.items():
                result.add_value_usages(parameter_id, value, count)

        return result

    def __init__(self) -> None:
        self.class_usages: Counter[ClassId] = Counter()
        self.function_usages: Counter[FunctionId] = Counter()
        self.parameter_usages: Counter[ParameterId] = Counter()
        self.value_usages: dict[ParameterId, Counter[StringifiedValue]] = {}

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

    def add_class_usages(self, class_id: ClassId, count: int = 1) -> None:
        """Increases the usage count of the class with the given name by the given count."""

        self.class_usages[class_id] += count

    def remove_class(self, class_id: ClassId) -> None:
        """Removes all usages of classes with the given name and usages of their methods."""

        if class_id in self.class_usages:
            del self.class_usages[class_id]

        for function_id in list(self.function_usages.keys()):
            if function_id.startswith(class_id):
                self.remove_function(function_id)

    def add_function_usages(self, function_id: FunctionId, count: int = 1) -> None:
        """Increases the usage count of the function with the given name by the given count."""

        self.function_usages[function_id] += count

    def remove_function(self, function_id: FunctionId) -> None:
        """Removes all usages of functions with the given name and usages of their parameters."""

        if function_id in self.function_usages:
            del self.function_usages[function_id]

        for parameter_id in list(self.parameter_usages.keys()):
            if parameter_id.startswith(function_id):
                self.remove_parameter(parameter_id)

    def add_parameter_usages(self, parameter_id: ParameterId, count: int = 1) -> None:
        """Increases the usage count of the parameter with the given name by the given count."""

        self.parameter_usages[parameter_id] += count

    def remove_parameter(self, parameter_id: ParameterId) -> None:
        """Removes all parameter and value usages of parameters with the given name."""

        if parameter_id in self.parameter_usages:
            del self.parameter_usages[parameter_id]

        if parameter_id in self.value_usages:
            del self.value_usages[parameter_id]

    def add_value_usages(
        self, parameter_id: ParameterId, value: StringifiedValue, count: int = 1
    ) -> None:
        """Increases the usage count of the given value for the parameter with the given name by the given count."""

        self.init_value(parameter_id)
        self.value_usages[parameter_id][value] += count

    def init_value(self, parameter_id: ParameterId) -> None:
        """Ensures the dictionary for the value counts has the given parameter name as a key."""

        if parameter_id not in self.value_usages:
            self.value_usages[parameter_id] = Counter()

    def n_class_usages(self, class_id: ClassId) -> int:
        """Returns how often the class is used, i.e. how often any of its methods are called."""

        return self.class_usages[class_id]

    def n_function_usages(self, function_id: FunctionId) -> int:
        """Returns how often the function is called."""

        return self.function_usages[function_id]

    def n_parameter_usages(self, parameter_id: ParameterId) -> int:
        """Returns how often the parameter is set."""

        return self.parameter_usages[parameter_id]

    def n_value_usages(self, parameter_id: ParameterId, value: str) -> int:
        """Returns how often the parameter with the given name is set to the given value."""

        if parameter_id in self.value_usages:
            return self.value_usages[parameter_id][value]

        return 0

    def most_common_parameter_values(self, parameter_id: ParameterId) -> list[str]:
        """Returns all values that have been set for the parameter with the given name sorted by their count in descending order."""

        if parameter_id in self.value_usages:
            return [
                value
                for value, count in self.value_usages[parameter_id].most_common()
                if count > 0
            ]

        return []

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
        for parameter_id, value_usages in other_usage_store.value_usages.items():
            self.init_value(parameter_id)
            self.value_usages[parameter_id] += value_usages

        return self

    def to_json(self) -> Any:
        """Converts this class to a dictionary, which can later be serialized as JSON."""

        return {
            "class_counts": {
                class_id: usage_count
                for class_id, usage_count in self.class_usages.most_common()
            },
            "function_counts": {
                function_id: usage_count
                for function_id, usage_count in self.function_usages.most_common()
            },
            "parameter_counts": {
                parameter_id: usage_count
                for parameter_id, usage_count in self.parameter_usages.most_common()
            },
            "value_counts": {
                parameter_id: {
                    value: usage_count for value, usage_count in values.most_common()
                }
                for parameter_id, values in self.value_usages.items()
            },
        }
