import json
from io import TextIOWrapper
from pathlib import Path
from typing import Any, Union

from package_parser.commands.find_usages import (
    ClassUsage,
    FunctionUsage,
    UsageStore,
    ValueUsage,
)
from package_parser.commands.get_api import API
from package_parser.utils import ensure_file_exists, parent_qname


def suggest_improvements(
    api_file: TextIOWrapper, usages_file: TextIOWrapper, out_dir: Path, min_usages: int
):
    with api_file:
        api_json = json.load(api_file)
        api = API.from_json(api_json)

    with usages_file:
        usages_json = json.load(usages_file)
        usages = UsageStore.from_json(usages_json)

    out_dir.mkdir(parents=True, exist_ok=True)
    base_file_name = api_file.name.replace("__api.json", "")

    __preprocess_usages(usages, api)
    __print_usage_counts(usages, out_dir, base_file_name)
    __create_usage_distributions(usages, out_dir, base_file_name)
    api_size_after_removal = __remove_rarely_used_api_elements(
        usages, min_usages, out_dir, base_file_name
    )
    __write_api_size(api, api_size_after_removal, out_dir, base_file_name)
    __optional_vs_required_parameters(usages, api, out_dir, base_file_name)


def __preprocess_usages(usages: UsageStore, api: API) -> None:
    __remove_internal_usages(usages, api)
    __add_unused_api_elements(usages, api)
    __add_implicit_usages_of_default_value(usages, api)


def __print_usage_counts(usages, out_dir, base_file_name):
    out_file = out_dir.joinpath(f"{base_file_name}__usage_counts.json")
    ensure_file_exists(out_file)
    with out_file.open("w") as f:
        json.dump(usages.to_count_json(), f, indent=2)


def __create_usage_distributions(
    usages: UsageStore, out_dir: Path, base_file_name: str
) -> None:
    class_usage_distribution = __create_class_or_function_usage_distribution(
        usages.class_usages
    )
    with out_dir.joinpath(f"{base_file_name}__class_usage_distribution.json").open(
        "w"
    ) as f:
        json.dump(class_usage_distribution, f, indent=2)

    function_usage_distribution = __create_class_or_function_usage_distribution(
        usages.function_usages
    )
    with out_dir.joinpath(f"{base_file_name}__function_usage_distribution.json").open(
        "w"
    ) as f:
        json.dump(function_usage_distribution, f, indent=2)

    parameter_usage_distribution = __create_parameter_usage_distribution(usages)
    with out_dir.joinpath(f"{base_file_name}__parameter_usage_distribution.json").open(
        "w"
    ) as f:
        json.dump(parameter_usage_distribution, f, indent=2)


def __create_class_or_function_usage_distribution(
    usages: Union[dict[str, list[ClassUsage]], dict[str, list[FunctionUsage]]]
) -> dict[int, int]:
    """
    Creates a dictionary X -> N where N indicates the number of classes/functions that are used at most X times.

    :param usages: Usages of classes/functions.
    :return: The usage distribution.
    """

    result = {}

    max_usages = max(len(it) for it in usages.values())
    for i in range(max_usages + 1):
        result[i] = len([it for it in usages.values() if len(it) >= i])

    return result


def __create_parameter_usage_distribution(usages: UsageStore) -> dict[int, int]:
    """
    Creates a dictionary X -> N where N indicates the number of parameters that are set at most X times to a value other
    than the most commonly used value (which might differ from the default value).

    :param usages: Usage store.
    :return: The usage distribution.
    """

    result = {}

    function_usages = usages.function_usages
    parameter_usages = usages.parameter_usages
    value_usages = usages.value_usages

    max_usages = max(
        __n_not_set_to_most_common_value(it, function_usages, value_usages)
        for it in parameter_usages.keys()
    )

    for i in range(max_usages + 1):
        result[i] = len(
            [
                it
                for it in parameter_usages.keys()
                if usages.n_function_usages(parent_qname(it)) >= i
                and (
                    parent_qname(parent_qname(it)) not in usages.class_usages
                    or usages.n_class_usages(parent_qname(parent_qname(it))) >= i
                )
                and __n_not_set_to_most_common_value(it, function_usages, value_usages)
                >= i
            ]
        )

    return result


def __remove_internal_usages(usages: UsageStore, api: API) -> None:
    """
    Removes usages of internal parts of the API. It might incorrectly remove some calls to methods that are inherited
    from internal classes into a public class but these are just fit/predict/etc., i.e. something we want to keep
    unchanged anyway.

    :param usages: Usage store
    :param api: Description of the API
    """

    # Internal classes
    for class_qname in list(usages.class_usages.keys()):
        if not api.is_public_class(class_qname):
            print(f"Removing usages of internal class {class_qname}")
            usages.remove_class(class_qname)

    # Internal functions
    for function_qname in list(usages.function_usages.keys()):
        if not api.is_public_function(function_qname):
            print(f"Removing usages of internal function {function_qname}")
            usages.remove_function(function_qname)

    # Internal parameters
    parameter_qnames = set(api.parameters().keys())

    for parameter_qname in list(usages.parameter_usages.keys()):
        function_qname = parent_qname(parameter_qname)
        if parameter_qname not in parameter_qnames or not api.is_public_function(
            function_qname
        ):
            print(f"Removing usages of internal parameter {parameter_qname}")
            usages.remove_parameter(parameter_qname)


def __add_unused_api_elements(usages: UsageStore, api: API) -> None:
    # Public classes
    for class_qname in api.classes:
        if api.is_public_class(class_qname):
            usages.init_class(class_qname)

    # Public functions
    for function in api.functions.values():
        if api.is_public_function(function.qname):
            usages.init_function(function.qname)

            # "Public" parameters
            for parameter in function.parameters:
                parameter_qname = f"{function.qname}.{parameter.name}"
                usages.init_parameter(parameter_qname)
                usages.init_value(parameter_qname)


def __add_implicit_usages_of_default_value(usages: UsageStore, api: API) -> None:
    for parameter_qname, parameter_usage_list in list(usages.parameter_usages.items()):
        default_value = api.get_default_value(parameter_qname)
        if default_value is None:
            continue

        function_qname = parent_qname(parameter_qname)
        function_usage_list = usages.function_usages[function_qname]

        locations_of_implicit_usages_of_default_value = set(
            [it.location for it in function_usage_list]
        ) - set([it.location for it in parameter_usage_list])

        for location in locations_of_implicit_usages_of_default_value:
            usages.add_value_usage(parameter_qname, default_value, location)


def __n_not_set_to_most_common_value(
    parameter_qname: str,
    function_usages: dict[str, list[FunctionUsage]],
    value_usages: dict[str, dict[str, list[ValueUsage]]],
) -> int:
    """Counts how often a parameter is set to a value other than the most commonly used value."""

    n_total_usage = len(function_usages[parent_qname(parameter_qname)])

    # Parameter is unused
    # Checking both conditions even though one implies the other to ensure correctness of the program
    if n_total_usage == 0 and len(value_usages[parameter_qname].values()) == 0:
        return 0

    n_set_to_most_commonly_used_value = max(
        len(it) for it in value_usages[parameter_qname].values()
    )

    return n_total_usage - n_set_to_most_commonly_used_value


def __remove_rarely_used_api_elements(
    usages: UsageStore, min_usages: int, out_dir: Path, base_file_name: str
) -> dict[str, Any]:
    """
    Removes API elements that are used fewer than min_usages times.

    :return: The API size after the individual steps.
    """

    rarely_used_classes = __remove_rarely_used_classes(usages, min_usages)
    api_size_after_unused_class_removal = __api_size_to_json(
        len(usages.class_usages),
        len(usages.function_usages),
        len(usages.parameter_usages),
    )
    with out_dir.joinpath(
        f"{base_file_name}__classes_used_fewer_than_{min_usages}_times.json"
    ).open("w") as f:
        json.dump(rarely_used_classes, f, indent=2)

    rarely_used_functions = __remove_rarely_used_functions(usages, min_usages)
    api_size_after_unused_function_removal = __api_size_to_json(
        len(usages.class_usages),
        len(usages.function_usages),
        len(usages.parameter_usages),
    )
    with out_dir.joinpath(
        f"{base_file_name}__functions_used_fewer_than_{min_usages}_times.json"
    ).open("w") as f:
        json.dump(rarely_used_functions, f, indent=2)

    rarely_used_parameters = __remove_rarely_used_parameters(usages, min_usages)
    api_size_after_unused_parameter_removal = __api_size_to_json(
        len(usages.class_usages),
        len(usages.function_usages),
        len(usages.parameter_usages),
    )
    with out_dir.joinpath(
        f"{base_file_name}__parameters_used_fewer_than_{min_usages}_times.json"
    ).open("w") as f:
        json.dump(rarely_used_parameters, f, indent=2)

    mostly_useless_parameters = __remove_mostly_useless_parameters(usages, min_usages)
    api_size_after_useless_parameter_removal = __api_size_to_json(
        len(usages.class_usages),
        len(usages.function_usages),
        len(usages.parameter_usages),
    )
    with out_dir.joinpath(
        f"{base_file_name}__parameters_set_fewer_than_{min_usages}_times_to_value_other_than_most_common.json"
    ).open("w") as f:
        json.dump(mostly_useless_parameters, f, indent=2)

    return {
        "after_unused_class_removal": api_size_after_unused_class_removal,
        "after_unused_function_removal": api_size_after_unused_function_removal,
        "after_unused_parameter_removal": api_size_after_unused_parameter_removal,
        "after_useless_parameter_removal": api_size_after_useless_parameter_removal,
    }


def __remove_rarely_used_classes(usages: UsageStore, min_usages: int) -> list[str]:
    result = []

    for class_qname in list(usages.class_usages.keys()):
        if usages.n_class_usages(class_qname) < min_usages:
            result.append(class_qname)
            usages.remove_class(class_qname)

    return sorted(result)


def __remove_rarely_used_functions(usages: UsageStore, min_usages: int) -> list[str]:
    result = []

    for function_qname in list(usages.function_usages.keys()):
        if usages.n_function_usages(function_qname) < min_usages:
            result.append(function_qname)
            usages.remove_function(function_qname)

    return sorted(result)


def __remove_rarely_used_parameters(usages: UsageStore, min_usages: int) -> list[str]:
    result = []

    for parameter_qname in list(usages.parameter_usages.keys()):
        if usages.n_parameter_usages(parameter_qname) < min_usages:
            result.append(parameter_qname)
            usages.remove_parameter(parameter_qname)

    return sorted(result)


def __remove_mostly_useless_parameters(
    usages: UsageStore, min_usages: int
) -> list[str]:
    result = []

    for parameter_qname in list(usages.parameter_usages.keys()):
        usage_count = __n_not_set_to_most_common_value(
            parameter_qname, usages.function_usages, usages.value_usages
        )

        if usage_count < min_usages:
            result.append(parameter_qname)
            usages.remove_parameter(parameter_qname)

    return sorted(result)


def __write_api_size(
    api: API, api_size_after_removal: dict[str, Any], out_dir: Path, base_file_name: str
) -> None:
    with out_dir.joinpath(f"{base_file_name}__api_size.json").open("w") as f:
        json.dump(
            {
                "full": __api_size_to_json(
                    api.class_count(), api.function_count(), api.parameter_count()
                ),
                "public": __api_size_to_json(
                    api.public_class_count(),
                    api.public_function_count(),
                    api.public_parameter_count(),
                ),
                "after_unused_class_removal": api_size_after_removal[
                    "after_unused_class_removal"
                ],
                "after_unused_function_removal": api_size_after_removal[
                    "after_unused_function_removal"
                ],
                "after_unused_parameter_removal": api_size_after_removal[
                    "after_unused_parameter_removal"
                ],
                "after_useless_parameter_removal": api_size_after_removal[
                    "after_useless_parameter_removal"
                ],
            },
            f,
            indent=2,
        )


def __api_size_to_json(n_classes: int, n_functions: int, n_parameters: int) -> Any:
    return {
        "n_classes": n_classes,
        "n_functions": n_functions,
        "n_parameters": n_parameters,
    }


def __optional_vs_required_parameters(
    usages: UsageStore, public_api: API, out_dir: Path, base_file_name: str
) -> None:
    # TODO: Determine whether parameter should be constant (already removed)/required/optional based on entropy
    # TODO: Use must commonly set value as default

    pass
