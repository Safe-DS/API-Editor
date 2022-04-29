import json
import os
import pytest

from package_parser.commands.find_usages import UsageStore
from package_parser.commands.generate_annotations.generate_annotations import (
    generate_annotations, __get_unused_annotations, __get_constant_annotations, ____qname_to_target_name,
    _preprocess_usages)
from package_parser.commands.get_api import API

REQUIRED_EXPECTED = {"constant": {
                          'test/test/commonly_used_global_required_and_optional_function/optional_that_should_be_required':
                              {'target': 'test/test/commonly_used_global_required_and_optional_function/optional_that_should_be_required'},
                          'test/test/commonly_used_global_required_and_optional_function/required_that_should_be_required':
                              {'target': 'test/test/commonly_used_global_required_and_optional_function/required_that_should_be_required'},
                          'test/test/commonly_used_global_required_and_optional_function/commonly_used_barely_required':
                              {'target': 'test/test/commonly_used_global_required_and_optional_function/commonly_used_barely_required'}}
                     }


# Reihenfolge ist wichtig, siehe Reihenfolge von annotation_functions in generate_annotations.py
FULL_EXPECTED = {**UNUSED_EXPECTED, **CONSTANT_EXPECTED, **REQUIRED_EXPECTED}

def test_required_annotation():
    pass
