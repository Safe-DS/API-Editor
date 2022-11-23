import pytest
from inspect import cleandoc

from package_parser.processing.api.model import API, Class, ClassDocumentation
from package_parser.processing.migration import (
    AbstractDiffer,
    ManyToManyMapping,
    ManyToOneMapping,
    OneToManyMapping,
    OneToOneMapping,
    map_api,
    THRESHOLD_OF_SIMILARITY_FOR_CREATION_OF_MAPPINGS,
)
from test_differ import differ_list


@pytest.mark.parametrize(
    "differ",
    differ_list,
)
def test_one_to_one_mapping(differ: AbstractDiffer):
    apiv1 = API("test", "test", "1.0")
    apiv2 = API("test", "test", "2.0")
    class_1 = Class(
        "test/test.Test",
        "Test",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        "",
        [],
    )
    apiv1.add_class(class_1)
    apiv2.add_class(class_1)
    mappings = map_api(apiv1, apiv2, differ)

    assert len(mappings) == 1
    assert isinstance(mappings[0], OneToOneMapping)
    assert mappings[0].get_apiv1_elements() == mappings[0].get_apiv2_elements()
    assert mappings[0].get_apiv1_elements() == [class_1]


@pytest.mark.parametrize(
    "differ",
    differ_list,
)
def test_one_to_many_and_many_to_one_mappings(differ: AbstractDiffer):
    apiv1, apiv2, class_1, class_2, class_3 = create_apis()

    mappings = map_api(apiv1, apiv2, differ)
    assert len(mappings) == 1
    assert isinstance(mappings[0], OneToManyMapping)
    assert mappings[0].get_apiv1_elements()[0] == class_1
    assert len(mappings[0].get_apiv2_elements()) == 2
    assert set(mappings[0].get_apiv2_elements()) == {class_2, class_3}

    apiv1, apiv2 = apiv2, apiv1
    mappings = map_api(apiv1, apiv2, differ)
    assert len(mappings) == 1
    assert isinstance(mappings[0], ManyToOneMapping)
    assert len(mappings[0].get_apiv1_elements()) == 2
    assert set(mappings[0].get_apiv1_elements()) == {class_2, class_3}
    assert mappings[0].get_apiv2_elements()[0] == class_1


@pytest.mark.parametrize(
    "differ",
    differ_list,
)
def test_many_to_many_mapping(differ: AbstractDiffer):
    apiv1, apiv2, class_1, class_2, class_3 = create_apis()
    class_4 = Class(
        "test/test.TestC",
        "TestC",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        "",
        [],
    )
    apiv1.add_class(class_4)
    mappings = map_api(apiv1, apiv2, differ)
    assert len(mappings) == 1
    assert isinstance(mappings[0], ManyToManyMapping)
    assert len(mappings[0].get_apiv1_elements()) == 2
    assert len(mappings[0].get_apiv2_elements()) == 2
    assert set(mappings[0].get_apiv1_elements()) == {class_1, class_4}
    assert set(mappings[0].get_apiv2_elements()) == {class_2, class_3}


@pytest.mark.parametrize(
    "differ",
    differ_list,
)
def test_too_different_mapping(differ: AbstractDiffer):
    apiv1 = API("test", "test", "1.0")
    class_1 = Class(
        "test/test.Test",
        "Test",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        "",
        [],
    )
    apiv1.add_class(class_1)
    apiv2 = API("test", "test", "2.0")
    class_2 = Class(
        "test/test.NotSimilarClass",
        "NotSimilarClass",
        [],
        [],
        True,
        [],
        ClassDocumentation("not similar to the other class", "not similar to the other class"),
        cleandoc("""
        class NotSimilar:
            pass
        """),
        [],
    )
    apiv2.add_class(class_2)
    mappings = map_api(apiv1, apiv2, differ)
    assert differ.compute_class_similarity(class_1, class_2) < THRESHOLD_OF_SIMILARITY_FOR_CREATION_OF_MAPPINGS
    assert len(mappings) == 0


def create_apis():
    class_1 = Class(
        "test/test.Test",
        "Test",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        "",
        [],
    )
    apiv1 = API("test", "test", "1.0")
    apiv1.add_class(class_1)
    class_2 = Class(
        "test/test.TestA",
        "TestA",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        "",
        [],
    )
    class_3 = Class(
        "test/test.TestB",
        "TestB",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        "",
        [],
    )
    apiv2 = API("test", "test", "2.0")
    apiv2.add_class(class_2)
    apiv2.add_class(class_3)
    return apiv1, apiv2, class_1, class_2, class_3
