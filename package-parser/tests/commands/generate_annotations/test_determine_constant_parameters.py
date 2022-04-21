import json
import os

import pytest
from package_parser.commands.find_usages._model import UsageStore
from package_parser.commands.generate_annotations._generate_annotations import (
    generate_annotations,
)

# Expected output:
# @Unused annotations should be created for the following declarations:
#
# test.Unused_Class
# test.unused_global_function
# test.Commonly_Used_Class.unused_method
#
# @Constant annotations should be created for the following parameters:
#
# test.commonly_used_global_function.useless_required_parameter (with value "'blup'")
# test.commonly_used_global_function.unused_optional_parameter (with value "'bla'", i.e. the default value)
# test.commonly_used_global_function.useless_optional_parameter (with value "'bla'")


def test_determination_of_constant_parameters():

    expected = {
        "test/test/commonly_used_global_function/useless_required_parameter": {
            "target": "test/test/commonly_used_global_function/useless_required_parameter",
            "defaultType": "string",
            "defaultValue": "blup",
        },
        "test/test/commonly_used_global_function/unused_optional_parameter": {
            "target": "test/test/commonly_used_global_function/unused_optional_parameter",
            "defaultType": "string",
            "defaultValue": "bla",
        },
        "test/test/commonly_used_global_function/useless_optional_parameter": {
            "target": "test/test/commonly_used_global_function/useless_optional_parameter",
            "defaultType": "string",
            "defaultValue": "bla",
        },
    }

    api_json_path = os.path.join(
        os.getcwd(), "tests", "data", "constant", "api_data.json"
    )
    usages_json_path = os.path.join(
        os.getcwd(), "tests", "data", "constant", "usage_data.json"
    )

    api_file = open(api_json_path)
    usages_file = open(usages_json_path)

    constant_parameters = generate_annotations(api_file, usages_file, "/.")

    api_file.close()
    usages_file.close()

    assert constant_parameters == expected
