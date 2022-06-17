from package_parser.model.api import API
from package_parser.model.usages import UsageCountStore
from package_parser.utils import parent_id


def _preprocess_usages(usages: UsageCountStore, api: API) -> None:
    _add_unused_api_elements(usages, api)
    _add_implicit_usages_of_default_value(usages, api)


def _add_unused_api_elements(usages: UsageCountStore, api: API) -> None:
    """
    Adds unused API elements to the UsageStore. When a class, function or parameter is not used, it is not content of
    the UsageStore, so we need to add it.

    :param usages: Usage store
    :param api: Description of the API
    """

    for class_id in api.classes:
        usages.add_class_usages(class_id, 0)

    for function in api.functions.values():
        usages.add_function_usages(function.id, 0)

        for parameter in function.parameters:
            usages.add_parameter_usages(parameter.id, 0)
            usages.init_value(parameter.id)


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
