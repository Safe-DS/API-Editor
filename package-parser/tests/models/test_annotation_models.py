import pytest
from package_parser.models.annotation_models import BaseAnnotation


def test_base_annotation_get_type():
    annotation = BaseAnnotation(target="")
    with pytest.raises(NotImplementedError):
        annotation.get_type()


def test_base_annotation_to_json():
    annotation = BaseAnnotation(target="test")
    assert annotation.to_json() == {"target": "test"}
