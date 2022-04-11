import pytest
import json

from package_parser.commands.generate_annotations import create_file

test_unused_dict = {
    "sklearn/sklearn.__check_build/raise_build_error": {
        "target": "sklearn/sklearn.__check_build/raise_build_error"
    }
}

test_constant_dict = {
    "sklearn/sklearn._config/config_context/assume_finite": {
        "target": "sklearn/sklearn._config/config_context/assume_finite",
        "defaultType": "boolean",
        "defaultValue": True
    },
    "sklearn/sklearn._config/config_context/working_memory": {
        "target": "sklearn/sklearn._config/config_context/working_memory",
        "defaultType": "string",
        "defaultValue": "bla"
    },
    "sklearn/sklearn._config/config_context/print_changed_only": {
        "target": "sklearn/sklearn._config/config_context/print_changed_only",
        "defaultType": "none",
        "defaultValue": None
    },
    "sklearn/sklearn._config/config_context/display": {
        "target": "sklearn/sklearn._config/config_context/display",
        "defaultType": "number",
        "defaultValue": "3"
    }
}

test_combined_dict = {
  "unused": {
    "sklearn/sklearn.__check_build/raise_build_error": {
      "target": "sklearn/sklearn.__check_build/raise_build_error"
    }
  },
  "constant": {
    "sklearn/sklearn._config/config_context/assume_finite": {
      "target": "sklearn/sklearn._config/config_context/assume_finite",
      "defaultType": "boolean",
      "defaultValue": true
    },
    "sklearn/sklearn._config/config_context/working_memory": {
      "target": "sklearn/sklearn._config/config_context/working_memory",
      "defaultType": "string",
      "defaultValue": "bla"
    },
    "sklearn/sklearn._config/config_context/print_changed_only": {
      "target": "sklearn/sklearn._config/config_context/print_changed_only",
      "defaultType": "none",
      "defaultValue": null
    },
    "sklearn/sklearn._config/config_context/display": {
      "target": "sklearn/sklearn._config/config_context/display",
      "defaultType": "number",
      "defaultValue": "3"
    }
  }
}


@pytest.mark.parametrize("test_unused, test_combined, expected", [(test_unused_dict, test_constant_dict, test_combined_dict),],)
def test_create_annotations(test_unused, test_constant, expected):
    create_file("tests/commands/generate_annotations", test_unused, test_constant)
    with open("tests/commands/generate_annotations/annotations.json", "r") as file:
        eval_dict = json.load(file)

        assert eval_dict == expected
