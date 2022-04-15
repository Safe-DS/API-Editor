import pytest
from package_parser.commands.generate_annotations._generate_annotations import generate_annotations
from package_parser.commands.find_usages._model import (
    UsageStore
)

def test_determination_of_constant_parameters():

    usages = UsageStore()
    constant_parameters = __determine_constant_parameters(usages)

