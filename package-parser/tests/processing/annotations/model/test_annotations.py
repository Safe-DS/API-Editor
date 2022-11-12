from package_parser.processing.annotations.model import (
    ANNOTATION_SCHEMA_VERSION,
    AbstractAnnotation,
    AnnotationStore,
    BoundaryAnnotation,
    CalledAfterAnnotation,
    CompleteAnnotation,
    DescriptionAnnotation,
    ConstantAnnotation,
    EnumAnnotation,
    EnumPair,
    GroupAnnotation,
    Interval,
    MoveAnnotation,
    OmittedAnnotation,
    OptionalAnnotation,
    PureAnnotation,
    RenameAnnotation,
    RemoveAnnotation,
    RequiredAnnotation,
    TodoAnnotation,
    ValueAnnotation,
)


def test_base_annotation_to_json():
    annotation = AbstractAnnotation(
        target="test/test", authors=["$autogen$"], reviewers=[], comment="Autogenerated"
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
    }


def test_boundary_annotation_to_json():
    annotation = BoundaryAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        interval=Interval(False, 0, 0, 0, 0),
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "interval": {
            "isDiscrete": False,
            "lowerIntervalLimit": 0,
            "lowerLimitType": 0,
            "upperIntervalLimit": 0,
            "upperLimitType": 0,
        },
    }


def test_constant_annotation_to_json():
    annotation = ConstantAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        defaultValueType=ValueAnnotation.DefaultValueType.STRING,
        defaultValue="test",
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "variant": "constant",
        "defaultValueType": "string",
        "defaultValue": "test",
    }


def test_enum_annotation_to_json():
    annotation = EnumAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        enumName="test",
        pairs=[EnumPair("test", "test")],
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "enumName": "test",
        "pairs": [{"instanceName": "test", "stringValue": "test"}],
    }


def test_omitted_annotation_to_json():
    annotation = OmittedAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "variant": "omitted",
    }


def test_optional_annotation_to_json():
    annotation = OptionalAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        defaultValueType=ValueAnnotation.DefaultValueType.STRING,
        defaultValue="test",
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "variant": "optional",
        "defaultValueType": "string",
        "defaultValue": "test",
    }


def test_remove_annotation_to_json():
    annotation = RemoveAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
    }


def test_required_annotation_to_json():
    annotation = RequiredAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "variant": "required",
    }

def test_calledafter_annotation_to_json():
    annotation = CalledAfterAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        calledAfterName="functionName")
    assert annotation.to_json() = {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "calledAfterName": "functionName"
    }

def test_annotation_store():
    annotations = AnnotationStore()
    annotations.removeAnnotations.append(
        RemoveAnnotation(
            target="test/remove",
            authors=["$autogen$"],
            reviewers=[],
            comment="Autogenerated",
        )
    )
    annotations.valueAnnotations.append(
        RequiredAnnotation(
            target="test/required",
            authors=["$autogen$"],
            reviewers=[],
            comment="Autogenerated",
        )
    )
    annotations.valueAnnotations.append(
        OptionalAnnotation(
            target="test/optional",
            authors=["$autogen$"],
            reviewers=[],
            comment="Autogenerated",
            defaultValueType=ValueAnnotation.DefaultValueType.STRING,
            defaultValue="test",
        )
    )
    annotations.valueAnnotations.append(
        ConstantAnnotation(
            target="test/constant",
            authors=["$autogen$"],
            reviewers=[],
            comment="Autogenerated",
            defaultValueType=ValueAnnotation.DefaultValueType.STRING,
            defaultValue="test",
        )
    )
    annotations.boundaryAnnotations.append(
        BoundaryAnnotation(
            target="test/boundary",
            authors=["$autogen$"],
            reviewers=[],
            comment="Autogenerated",
            interval=Interval(False, 0, 0, 0, 0),
        )
    )
    annotations.enumAnnotations.append(
        EnumAnnotation(
            target="test/enum",
            authors=["$autogen$"],
            reviewers=[],
            comment="Autogenerated",
            enumName="test",
            pairs=[EnumPair("test", "test")],
        )
    )
    assert annotations.to_json() == {
        "schemaVersion": ANNOTATION_SCHEMA_VERSION,
        "boundaryAnnotations": {
            "test/boundary": {
                "target": "test/boundary",
                "authors": ["$autogen$"],
                "reviewers": [],
                "comment": "Autogenerated",
                "interval": {
                    "isDiscrete": False,
                    "lowerIntervalLimit": 0,
                    "lowerLimitType": 0,
                    "upperIntervalLimit": 0,
                    "upperLimitType": 0,
                },
            }
        },
        "enumAnnotations": {
            "test/enum": {
                "target": "test/enum",
                "authors": ["$autogen$"],
                "reviewers": [],
                "comment": "Autogenerated",
                "enumName": "test",
                "pairs": [{"instanceName": "test", "stringValue": "test"}],
            }
        },
        "removeAnnotations": {
            "test/remove": {
                "target": "test/remove",
                "authors": ["$autogen$"],
                "reviewers": [],
                "comment": "Autogenerated",
            }
        },
        "valueAnnotations": {
            "test/constant": {
                "target": "test/constant",
                "authors": ["$autogen$"],
                "reviewers": [],
                "comment": "Autogenerated",
                "variant": "constant",
                "defaultValueType": "string",
                "defaultValue": "test",
            },
            "test/optional": {
                "target": "test/optional",
                "authors": ["$autogen$"],
                "reviewers": [],
                "comment": "Autogenerated",
                "variant": "optional",
                "defaultValueType": "string",
                "defaultValue": "test",
            },
            "test/required": {
                "target": "test/required",
                "authors": ["$autogen$"],
                "reviewers": [],
                "comment": "Autogenerated",
                "variant": "required",
            },
        },
    }
