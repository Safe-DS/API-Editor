import pytest
from package_parser.commands.generate_annotations._generate_annotations import generate_annotations
from package_parser.commands.find_usages._model import (
    UsageStore
)

# @Unused annotations should be created for the following declarations:
#
# test.Unused_Class
# test.unused_global_function
# test.Commonly_Used_Class.unused_method
#
# @Constant annotations should be created for the following parameters:
#
# test.commonly_used_global_function.useless_required_parameter (with value 'blup')
# test.commonly_used_global_function.unused_optional_parameter (with value 'bla', i.e. the default value)
# test.commonly_used_global_function.useless_optional_parameter (with value 'bla')


def test_determination_of_constant_parameters():

    expected = {
        ("test.commonly_used_global_function.useless_required_parameter", "blup"),
        ("test.commonly_used_global_function.unused_optional_parameter", "bla"),
        ("test.commonly_used_global_function.useless_optional_parameter", "bla")
    }

    base_path_to_data = "~/."
    usages_file = ""

    with usages_file:
        usages_json = json.load(usages_file)
        usages = UsageStore.from_json(usages_json)

    constant_parameters = __determine_constant_parameters(usages)

    assert constant_parameters == expected

