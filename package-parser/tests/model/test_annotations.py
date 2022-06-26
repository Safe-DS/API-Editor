from package_parser.model.annotations import (
    ANNOTATION_SCHEMA_VERSION,
    AbstractAnnotation,
    AnnotationStore,
    BoundaryAnnotation,
    ConstantAnnotation,
    EnumAnnotation,
    EnumPair,
    Interval,
    OptionalAnnotation,
    RemoveAnnotation,
    RequiredAnnotation,
)


def test_base_annotation_to_json():
    annotation = AbstractAnnotation(
        target="test/test", authors=["$autogen$"], reviewers=[]
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
    }


def test_constant_annotation_to_json():
    annotation = ConstantAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        defaultType="string",
        defaultValue="test",
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "defaultType": "string",
        "defaultValue": "test",
    }


def test_remove_annotation_to_json():
    annotation = RemoveAnnotation(
        target="test/test", authors=["$autogen$"], reviewers=[]
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
    }


def test_required_annotation_to_json():
    annotation = RequiredAnnotation(
        target="test/test", authors=["$autogen$"], reviewers=[]
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
    }


def test_optional_annotation_to_json():
    annotation = OptionalAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        defaultType="string",
        defaultValue="test",
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "defaultType": "string",
        "defaultValue": "test",
    }


def test_boundary_annotation_to_json():
    annotation = BoundaryAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        interval=Interval(False, 0, 0, 0, 0),
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "interval": {
            "isDiscrete": False,
            "lowerIntervalLimit": 0,
            "lowerLimitType": 0,
            "upperIntervalLimit": 0,
            "upperLimitType": 0,
        },
    }


def test_enum_annotation_to_json():
    annotation = EnumAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        enumName="test",
        pairs=[EnumPair("test", "test")],
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "enumName": "test",
        "pairs": [{"instanceName": "test", "stringValue": "test"}],
    }


def test_annotation_store():
    annotations = AnnotationStore()
    annotations.removes.append(
        RemoveAnnotation(
            target="test/remove",
            authors=["$autogen$"],
            reviewers=[],
        )
    )
    annotations.requireds.append(
        RequiredAnnotation(
            target="test/required",
            authors=["$autogen$"],
            reviewers=[],
        )
    )
    annotations.optionals.append(
        OptionalAnnotation(
            target="test/optional",
            authors=["$autogen$"],
            reviewers=[],
            defaultType="string",
            defaultValue="test",
        )
    )
    annotations.constants.append(
        ConstantAnnotation(
            target="test/constant",
            authors=["$autogen$"],
            reviewers=[],
            defaultType="string",
            defaultValue="test",
        )
    )
    annotations.boundaries.append(
        BoundaryAnnotation(
            target="test/boundary",
            authors=["$autogen$"],
            reviewers=[],
            interval=Interval(False, 0, 0, 0, 0),
        )
    )
    annotations.enums.append(
        EnumAnnotation(
            target="test/enum",
            authors=["$autogen$"],
            reviewers=[],
            enumName="test",
            pairs=[EnumPair("test", "test")],
        )
    )
    assert annotations.to_json() == {
        "schemaVersion": ANNOTATION_SCHEMA_VERSION,
        "boundaries": {
            "test/boundary": {
                "target": "test/boundary",
                "authors": ["$autogen$"],
                "reviewers": [],
                "interval": {
                    "isDiscrete": False,
                    "lowerIntervalLimit": 0,
                    "lowerLimitType": 0,
                    "upperIntervalLimit": 0,
                    "upperLimitType": 0,
                },
            }
        },
        "constants": {
            "test/constant": {
                "target": "test/constant",
                "authors": ["$autogen$"],
                "reviewers": [],
                "defaultType": "string",
                "defaultValue": "test",
            }
        },
        "enums": {
            "test/enum": {
                "target": "test/enum",
                "authors": ["$autogen$"],
                "reviewers": [],
                "enumName": "test",
                "pairs": [{"instanceName": "test", "stringValue": "test"}],
            }
        },
        "optionals": {
            "test/optional": {
                "target": "test/optional",
                "authors": ["$autogen$"],
                "reviewers": [],
                "defaultType": "string",
                "defaultValue": "test",
            }
        },
        "requireds": {
            "test/required": {
                "target": "test/required",
                "authors": ["$autogen$"],
                "reviewers": [],
            }
        },
        "removes": {
            "test/remove": {
                "target": "test/remove",
                "authors": ["$autogen$"],
                "reviewers": [],
            }
        },
    }
