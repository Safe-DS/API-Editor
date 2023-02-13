from inspect import cleandoc

import pytest
from package_parser.processing.api.model import API, Class, ClassDocumentation
from package_parser.processing.migration import (
    AbstractDiffer,
    APIMapping,
    ManyToManyMapping,
    ManyToOneMapping,
    OneToManyMapping,
    OneToOneMapping,
)
from test_base_differ import differ_list


@pytest.mark.parametrize(
    "differ",
    differ_list,
)  # type: ignore
def test_one_to_one_mapping(differ: AbstractDiffer) -> None:
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
    mappings = APIMapping(apiv1, apiv2, differ).map_api()

    assert len(mappings) == 1
    assert isinstance(mappings[0], OneToOneMapping)
    assert mappings[0].get_apiv1_elements() == mappings[0].get_apiv2_elements()
    assert mappings[0].get_apiv1_elements() == [class_1]


@pytest.mark.parametrize(
    "differ",
    differ_list,
)  # type: ignore
def test_one_to_many_and_many_to_one_mappings(differ: AbstractDiffer) -> None:
    apiv1, apiv2, class_1, class_2, class_3 = create_apis()

    mappings = APIMapping(apiv1, apiv2, differ).map_api()
    assert len(mappings) == 1
    assert isinstance(mappings[0], OneToManyMapping)
    assert mappings[0].get_apiv1_elements()[0] == class_1
    assert len(mappings[0].get_apiv2_elements()) == 2
    assert set(mappings[0].get_apiv2_elements()) == {class_2, class_3}

    apiv1, apiv2 = apiv2, apiv1
    mappings = APIMapping(apiv1, apiv2, differ).map_api()
    assert len(mappings) == 1
    assert isinstance(mappings[0], ManyToOneMapping)
    assert len(mappings[0].get_apiv1_elements()) == 2
    assert set(mappings[0].get_apiv1_elements()) == {class_2, class_3}
    assert mappings[0].get_apiv2_elements()[0] == class_1


@pytest.mark.parametrize(
    "differ",
    differ_list,
)  # type: ignore
def test_many_to_many_mapping(differ: AbstractDiffer) -> None:
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
    mappings = APIMapping(apiv1, apiv2, differ).map_api()
    assert len(mappings) == 1
    assert isinstance(mappings[0], ManyToManyMapping)
    assert len(mappings[0].get_apiv1_elements()) == 2
    assert len(mappings[0].get_apiv2_elements()) == 2
    assert set(mappings[0].get_apiv1_elements()) == {class_1, class_4}
    assert set(mappings[0].get_apiv2_elements()) == {class_2, class_3}


@pytest.mark.parametrize(
    "differ",
    differ_list,
)  # type: ignore
def test_too_different_mapping(differ: AbstractDiffer) -> None:
    apiv1 = API("test", "test", "1.0")
    class_1 = Class(
        "test/test/Test",
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
        "test/test.test/NotSimilarClass_",
        "NotSimilarClass_",
        [],
        [],
        True,
        [],
        ClassDocumentation(
            "not similar to the other class", "not similar to the other class"
        ),
        cleandoc(
            """

        class NotSimilarClass:
            self.i = 5

            self.d = 12.01

            self.x = "s"

            self.f = ""

            pass

        """
        ),
        [],
    )
    apiv2.add_class(class_2)
    api_mapping = APIMapping(apiv1, apiv2, differ)
    mappings = api_mapping.map_api()
    assert (
        differ.compute_class_similarity(class_1, class_2)
        < api_mapping.threshold_of_similarity_for_creation_of_mappings
    )
    assert len(mappings) == 0


def create_apis() -> tuple[API, API, Class, Class, Class]:
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
