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
    ExpertAnnotation,
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


def test_expert_annotation_to_json():
    annotation = ExpertAnnotation(
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
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "calledAfterName": "functionName"
    }


def test_complete_annotation_to_json():
    annotation = CompleteAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated")
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated"
    }


def test_description_annotation_to_json():
    annotation = DescriptionAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        newDescription="description")
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "newDescription": "description"
    }


def test_group_annotation_to_json():
    annotation = GroupAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        groupName="newParameter",
        parameters=["a", "b", "c"],
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "groupName": "newParameter",
        "parameters": ["a", "b", "c"]
    }


def test_move_annotation_to_json():
    annotation = MoveAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        destination="moved.package",

    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "destination": "moved.package",
    }


def test_pure_annotation_to_json():
    annotation = PureAnnotation(
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


def test_rename_annotation_to_json():
    annotation = RenameAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        newName="testName",
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "newName": "testName",
    }


def test_todo_annotation_to_json():
    annotation = TodoAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        newTodo="TODO replace me",
    )
    assert annotation.to_json() == {
        "target": "test/test",
        "authors": ["$autogen$"],
        "reviewers": [],
        "comment": "Autogenerated",
        "newTodo": "TODO replace me",
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
    annotations.calledAfterAnnotations.append(CalledAfterAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        calledAfterName="functionName"))
    annotations.completeAnnotations.append(CompleteAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated"))
    annotations.descriptionAnnotations.append(DescriptionAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        newDescription="description"))
    annotations.groupAnnotations.append(GroupAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        groupName="newParameter",
        parameters=["a", "b", "c"],
    ))
    annotations.moveAnnotations.append(MoveAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        destination="moved.package",
    ))
    annotations.pureAnnotations.append(PureAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
    ))
    annotations.renameAnnotations.append(RenameAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        newName="testName",
    ))
    annotations.todoAnnotations.append(TodoAnnotation(
        target="test/test",
        authors=["$autogen$"],
        reviewers=[],
        comment="Autogenerated",
        newTodo="TODO replace me",
    ))
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
        'calledAfterAnnotations': {
            'test/test': {'authors': ['$autogen$'],
                        'calledAfterName': 'functionName',
                        'comment': 'Autogenerated',
                        'reviewers': [],
                        'target': 'test/test'}
        },
        'completeAnnotations': {
            'test/test': {'authors': ['$autogen$'],
                        'comment': 'Autogenerated',
                        'reviewers': [],
                        'target': 'test/test'}
        },
        'descriptionAnnotations': {
            'test/test': {'authors': ['$autogen$'],
                          'comment': 'Autogenerated',
                          'newDescription': 'description',
                          'reviewers': [],
                          'target': 'test/test'}
        },
        'groupAnnotations': {'test/test': {'authors': ['$autogen$'],
                                           'comment': 'Autogenerated',
                                           'groupName': 'newParameter',
                                           'parameters': ['a', 'b', 'c'],
                                           'reviewers': [],
                                           'target': 'test/test'}},
        'moveAnnotations': {'test/test': {'authors': ['$autogen$'],
                                          'comment': 'Autogenerated',
                                          'destination': 'moved.package',
                                          'reviewers': [],
                                          'target': 'test/test'}},
        'pureAnnotations': {'test/test': {'authors': ['$autogen$'],
                                          'comment': 'Autogenerated',
                                          'reviewers': [],
                                          'target': 'test/test'}},
        'renameAnnotations': {'test/test': {'authors': ['$autogen$'],
                                            'comment': 'Autogenerated',
                                            'newName': 'testName',
                                            'reviewers': [],
                                            'target': 'test/test'}},
        'todoAnnotations': {'test/test': {'authors': ['$autogen$'],
                                          'comment': 'Autogenerated',
                                          'newTodo': 'TODO replace me',
                                          'reviewers': [],
                                          'target': 'test/test'}},
    }
