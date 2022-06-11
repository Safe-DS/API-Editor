import logging

from package_parser.model.api import API
from package_parser.model.usages import UsageCountStore
from package_parser.utils import parent_id


def _preprocess_usages(usages: UsageCountStore, api: API) -> None:
    _remove_internal_usages(usages, api)
    _add_unused_api_elements(usages, api)
    _add_implicit_usages_of_default_value(usages, api)


def _remove_internal_usages(usages: UsageCountStore, api: API) -> None:
    """
    Removes usages of internal parts of the API. It might incorrectly remove some calls to methods that are inherited
    from internal classes into a public class but these are just fit/predict/etc., i.e. something we want to keep
    unchanged anyway.

    :param usages: Usage store
    :param api: Description of the API
    """

    # Internal classes
    for class_id in list(usages.class_usages.keys()):
        if not api.is_public_class(class_id):
            logging.info(f"Removing usages of internal class {class_id}")
            usages.remove_class(class_id)

    # Internal functions
    for function_id in list(usages.function_usages.keys()):
        if not api.is_public_function(function_id):
            logging.info(f"Removing usages of internal function {function_id}")
            usages.remove_function(function_id)

    # Internal parameters
    parameter_ids_in_api = set(api.parameters().keys())

    for parameter_id in list(usages.parameter_usages.keys()):
        function_id = parent_id(parameter_id)
        if parameter_id not in parameter_ids_in_api or not api.is_public_function(
            function_id
        ):
            logging.info(f"Removing usages of internal parameter {parameter_id}")
            usages.remove_parameter(parameter_id)


def _add_unused_api_elements(usages: UsageCountStore, api: API) -> None:
    """
    Adds unused API elements to the UsageStore. When a class, function or parameter is not used, it is not content of
    the UsageStore, so we need to add it.

    :param usages: Usage store
    :param api: Description of the API
    """

    # Public classes
    for class_id in api.classes:
        if api.is_public_class(class_id):
            usages.add_class_usages(class_id, 0)

    # Public functions
    for function in api.functions.values():
        if api.is_public_function(function.id):
            usages.add_function_usages(function.id, 0)

            # "Public" parameters
            for parameter in function.parameters:
                usages.init_value(parameter.id)
                usages.add_parameter_usages(parameter.id, 0)


def _add_implicit_usages_of_default_value(usages: UsageCountStore, api: API) -> None:
    """
    Adds the implicit usages of a parameters default value. When a function is called and a parameter is used with its
    default value, that usage of a value is not part of the UsageStore, so  we need to add it.

    :param usages: Usage store
    :param api: Description of the API
    """

    for parameter_id, parameter_usage_count in list(usages.parameter_usages.items()):
        default_value = api.get_default_value(parameter_id)
        if default_value is None:
            continue

        function_id = parent_id(parameter_id)
        function_usage_count = usages.n_function_usages(function_id)

        n_locations_of_implicit_usages_of_default_value = (
            function_usage_count - parameter_usage_count
        )
        usages.add_value_usages(
            parameter_id,
            default_value,
            n_locations_of_implicit_usages_of_default_value,
        )
