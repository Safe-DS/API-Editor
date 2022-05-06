from package_parser.models.annotation_models import (
    AnnotationStore,
    BaseAnnotation,
    BoundaryAnnotation,
    ConstantAnnotation,
    EnumAnnotation,
    EnumPair,
    Interval,
    OptionalAnnotation,
    RequiredAnnotation,
    UnusedAnnotation,
)


def test_base_annotation_to_json():
    annotation = BaseAnnotation(target="test/test")
    assert annotation.to_json() == {"target": "test/test"}


def test_constant_annotation_to_json():
    annotation = ConstantAnnotation(
        target="test/test", defaultType="string", defaultValue="test"
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "defaultType": "string",
        "defaultValue": "test",
    }


def test_unused_annotation_to_json():
    annotation = UnusedAnnotation(target="test/test")
    assert annotation.to_json() == {"target": "test/test"}


def test_required_annotation_to_json():
    annotation = RequiredAnnotation(target="test/test")
    assert annotation.to_json() == {"target": "test/test"}


def test_optional_annotation_to_json():
    annotation = OptionalAnnotation(
        target="test/test", defaultType="string", defaultValue="test"
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "defaultType": "string",
        "defaultValue": "test",
    }


def test_boundary_annotation_to_json():
    annotation = BoundaryAnnotation(
        target="test/test", defaultType="string", interval=[Interval(False, 0, 0, 0, 0)]
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "defaultType": "string",
        "interval": [
            {
                "isDiscrete": False,
                "lowerIntervalLimit": 0,
                "lowerLimitType": 0,
                "upperIntervalLimit": 0,
                "upperLimitType": 0,
            }
        ],
    }


def test_enum_annotation_to_json():
    annotation = EnumAnnotation(
        target="test/test", enumName="test", pairs=[EnumPair("test", "test")]
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "enumName": "test",
        "pairs": [{"instanceName": "test", "stringValue": "test"}],
    }


def test_annotation_store():
    annotations = AnnotationStore()
    annotations.unused.append(UnusedAnnotation(target="test/unused"))
    annotations.requireds.append(RequiredAnnotation(target="test/required"))
    annotations.optionals.append(
        OptionalAnnotation(
            target="test/optional", defaultType="string", defaultValue="test"
        )
    )
    annotations.constant.append(
        ConstantAnnotation(
            target="test/constant", defaultType="string", defaultValue="test"
        )
    )
    annotations.boundaries.append(
        BoundaryAnnotation(
            target="test/boundary",
            defaultType="string",
            interval=[Interval(False, 0, 0, 0, 0)],
        )
    )
    annotations.enums.append(
        EnumAnnotation(
            target="test/enum", enumName="test", pairs=[EnumPair("test", "test")]
        )
    )
    assert annotations.to_json() == {
        "boundaries": {
            "test/boundary": {
                "defaultType": "string",
                "interval": [
                    {
                        "isDiscrete": False,
                        "lowerIntervalLimit": 0,
                        "lowerLimitType": 0,
                        "upperIntervalLimit": 0,
                        "upperLimitType": 0,
                    }
                ],
                "target": "test/boundary",
            }
        },
        "constant": {
            "test/constant": {
                "defaultType": "string",
                "defaultValue": "test",
                "target": "test/constant",
            }
        },
        "enums": {
            "test/enum": {
                "enumName": "test",
                "pairs": [{"instanceName": "test", "stringValue": "test"}],
                "target": "test/enum",
            }
        },
        "optionals": {
            "test/optional": {
                "defaultType": "string",
                "defaultValue": "test",
                "target": "test/optional",
            }
        },
        "requireds": {"test/required": {"target": "test/required"}},
        "unused": {"test/unused": {"target": "test/unused"}},
    }
