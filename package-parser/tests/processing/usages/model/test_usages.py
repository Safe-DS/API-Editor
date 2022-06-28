from typing import Any

import pytest
from package_parser.processing.usages.model import (
    USAGES_SCHEMA_VERSION,
    UsageCountStore,
)


@pytest.fixture
def usage_counts_json() -> Any:
    return {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {"TestClass.test_function.test_parameter": 2},
        "value_counts": {"TestClass.test_function.test_parameter": {"'test'": 2}},
    }


@pytest.fixture
def usage_counts(usage_counts_json) -> UsageCountStore:
    return UsageCountStore.from_json(usage_counts_json)


def test_to_json_is_inverse_of_from_json(usage_counts_json: Any):
    assert UsageCountStore.from_json(usage_counts_json).to_json() == usage_counts_json


def test_from_json_is_inverse_of_to_json(usage_counts: UsageCountStore):
    assert UsageCountStore.from_json(usage_counts.to_json()) == usage_counts


def test_add_class_usage_for_new_class(usage_counts: UsageCountStore):
    usage_counts.add_class_usages("TestClass2")

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {
            "TestClass": 2,
            "TestClass2": 1,
        },
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {"TestClass.test_function.test_parameter": 2},
        "value_counts": {"TestClass.test_function.test_parameter": {"'test'": 2}},
    }


def test_add_class_usage_for_existing_class(usage_counts: UsageCountStore):
    usage_counts.add_class_usages("TestClass", 2)

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 4},
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {"TestClass.test_function.test_parameter": 2},
        "value_counts": {"TestClass.test_function.test_parameter": {"'test'": 2}},
    }


def test_remove_class_for_missing_class(
    usage_counts: UsageCountStore, usage_counts_json: Any
):
    usage_counts.remove_class("TestClass2")

    # Should be unchanged
    assert usage_counts.to_json() == usage_counts_json


def test_remove_class_for_existing_class(usage_counts: UsageCountStore):
    usage_counts.remove_class("TestClass")

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {},
        "function_counts": {},
        "parameter_counts": {},
        "value_counts": {},
    }


def test_add_function_usages_for_new_function(usage_counts: UsageCountStore):
    usage_counts.add_function_usages("TestClass.test_function_2")

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {
            "TestClass.test_function": 2,
            "TestClass.test_function_2": 1,
        },
        "parameter_counts": {"TestClass.test_function.test_parameter": 2},
        "value_counts": {"TestClass.test_function.test_parameter": {"'test'": 2}},
    }


def test_add_function_usages_for_existing_function(usage_counts: UsageCountStore):
    usage_counts.add_function_usages("TestClass.test_function", 2)

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {"TestClass.test_function": 4},
        "parameter_counts": {"TestClass.test_function.test_parameter": 2},
        "value_counts": {"TestClass.test_function.test_parameter": {"'test'": 2}},
    }


def test_remove_function_for_missing_function(
    usage_counts: UsageCountStore, usage_counts_json: Any
):
    usage_counts.remove_function("TestClass.test_function_2")

    # Should be unchanged
    assert usage_counts.to_json() == usage_counts_json


def test_remove_function_for_existing_function(usage_counts: UsageCountStore):
    usage_counts.remove_function("TestClass.test_function")

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {},
        "parameter_counts": {},
        "value_counts": {},
    }


def test_add_parameter_usages_for_new_parameter(usage_counts: UsageCountStore):
    usage_counts.add_parameter_usages("TestClass.test_function.test_parameter_2")

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {
            "TestClass.test_function.test_parameter": 2,
            "TestClass.test_function.test_parameter_2": 1,
        },
        "value_counts": {"TestClass.test_function.test_parameter": {"'test'": 2}},
    }


def test_add_parameter_usages_for_existing_parameter(usage_counts: UsageCountStore):
    usage_counts.add_parameter_usages("TestClass.test_function.test_parameter", 2)

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {"TestClass.test_function.test_parameter": 4},
        "value_counts": {"TestClass.test_function.test_parameter": {"'test'": 2}},
    }


def test_remove_parameter_for_missing_parameter(
    usage_counts: UsageCountStore, usage_counts_json: Any
):
    usage_counts.remove_parameter("TestClass.test_function.test_parameter_2")

    # Should be unchanged
    assert usage_counts.to_json() == usage_counts_json


def test_remove_parameter_for_existing_parameter(usage_counts: UsageCountStore):
    usage_counts.remove_parameter("TestClass.test_function.test_parameter")

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {},
        "value_counts": {},
    }


def test_add_value_usages_for_new_parameter(usage_counts: UsageCountStore):
    usage_counts.add_value_usages("TestClass.test_function.test_parameter_2", "'test'")

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {"TestClass.test_function.test_parameter": 2},
        "value_counts": {
            "TestClass.test_function.test_parameter": {"'test'": 2},
            "TestClass.test_function.test_parameter_2": {"'test'": 1},
        },
    }


def test_add_value_usages_for_new_value(usage_counts: UsageCountStore):
    usage_counts.add_value_usages("TestClass.test_function.test_parameter", "'test2'")

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {"TestClass.test_function.test_parameter": 2},
        "value_counts": {
            "TestClass.test_function.test_parameter": {"'test'": 2, "'test2'": 1}
        },
    }


def test_add_value_usages_for_existing_parameter_and_value(
    usage_counts: UsageCountStore,
):
    usage_counts.add_value_usages("TestClass.test_function.test_parameter", "'test'", 2)

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {"TestClass.test_function.test_parameter": 2},
        "value_counts": {"TestClass.test_function.test_parameter": {"'test'": 4}},
    }


def test_init_value_for_new_parameter(usage_counts: UsageCountStore):
    usage_counts.init_value("TestClass.test_function.test_parameter_2")

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {"TestClass.test_function.test_parameter": 2},
        "value_counts": {
            "TestClass.test_function.test_parameter": {"'test'": 2},
            "TestClass.test_function.test_parameter_2": {},
        },
    }


def test_init_value_for_existing_parameter(usage_counts: UsageCountStore):
    usage_counts.init_value("TestClass.test_function.test_parameter")

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {"TestClass": 2},
        "function_counts": {"TestClass.test_function": 2},
        "parameter_counts": {"TestClass.test_function.test_parameter": 2},
        "value_counts": {"TestClass.test_function.test_parameter": {"'test'": 2}},
    }


def test_n_class_usages_for_missing_class(usage_counts: UsageCountStore):
    assert usage_counts.n_class_usages("TestClass2") == 0


def test_n_class_usages_for_existing_class(usage_counts: UsageCountStore):
    assert usage_counts.n_class_usages("TestClass") == 2


def test_n_function_usages_for_missing_function(usage_counts: UsageCountStore):
    assert usage_counts.n_function_usages("TestClass.test_function_2") == 0


def test_n_function_usages_for_existing_function(usage_counts: UsageCountStore):
    assert usage_counts.n_function_usages("TestClass.test_function") == 2


def test_n_parameter_usages_for_missing_parameter(usage_counts: UsageCountStore):
    assert (
        usage_counts.n_parameter_usages("TestClass.test_function.test_parameter_2") == 0
    )


def test_n_parameter_usages_for_existing_parameter(usage_counts: UsageCountStore):
    assert (
        usage_counts.n_parameter_usages("TestClass.test_function.test_parameter") == 2
    )


def test_n_value_usages_for_missing_parameter(usage_counts: UsageCountStore):
    assert (
        usage_counts.n_value_usages(
            "TestClass.test_function.test_parameter_2", "'test'"
        )
        == 0
    )


def test_n_value_usages_for_missing_value(usage_counts: UsageCountStore):
    assert (
        usage_counts.n_value_usages("TestClass.test_function.test_parameter", "'bla'")
        == 0
    )


def test_n_value_usages_for_existing_parameter_and_value(usage_counts: UsageCountStore):
    assert (
        usage_counts.n_value_usages("TestClass.test_function.test_parameter", "'test'")
        == 2
    )


def test_most_common_parameter_values_for_missing_parameter(
    usage_counts: UsageCountStore,
):
    assert (
        usage_counts.most_common_parameter_values(
            "TestClass.test_function.test_parameter_2"
        )
        == []
    )


def test_most_common_parameter_values_for_existing_parameter(
    usage_counts: UsageCountStore,
):
    usage_counts.add_value_usages(
        "TestClass.test_function.test_parameter", "'test2'", 1
    )
    usage_counts.add_value_usages(
        "TestClass.test_function.test_parameter", "'test3'", 0
    )

    assert usage_counts.most_common_parameter_values(
        "TestClass.test_function.test_parameter"
    ) == ["'test'", "'test2'"]


def test_merge_other_into_self(usage_counts: UsageCountStore):
    other = UsageCountStore.from_json(
        {
            "class_counts": {
                "TestClass": 2,
                "TestClass2": 1,
            },
            "function_counts": {
                "TestClass.test_function": 2,
                "TestClass2.test_function_2": 1,
            },
            "parameter_counts": {
                "TestClass.test_function.test_parameter": 2,
                "TestClass2.test_function_2.test_parameter_2": 1,
            },
            "value_counts": {
                "TestClass.test_function.test_parameter": {"'test'": 2},
                "TestClass2.test_function_2.test_parameter_2": {"'test2'": 1},
            },
        }
    )

    usage_counts.merge_other_into_self(other)

    assert usage_counts.to_json() == {
        "schemaVersion": USAGES_SCHEMA_VERSION,
        "class_counts": {
            "TestClass": 4,
            "TestClass2": 1,
        },
        "function_counts": {
            "TestClass.test_function": 4,
            "TestClass2.test_function_2": 1,
        },
        "parameter_counts": {
            "TestClass.test_function.test_parameter": 4,
            "TestClass2.test_function_2.test_parameter_2": 1,
        },
        "value_counts": {
            "TestClass.test_function.test_parameter": {"'test'": 4},
            "TestClass2.test_function_2.test_parameter_2": {"'test2'": 1},
        },
    }
