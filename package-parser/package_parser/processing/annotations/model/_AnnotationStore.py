from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ._annotations import (
    ANNOTATION_SCHEMA_VERSION,
    AbstractAnnotation,
    BoundaryAnnotation,
    CalledAfterAnnotation,
    CompleteAnnotation,
    DescriptionAnnotation,
    EnumAnnotation,
    GroupAnnotation,
    MoveAnnotation,
    PureAnnotation,
    RemoveAnnotation,
    RenameAnnotation,
    TodoAnnotation,
    ValueAnnotation,
)


@dataclass
class AnnotationStore:
    boundaryAnnotations: list[BoundaryAnnotation] = field(default_factory=list)
    calledAfterAnnotations: list[CalledAfterAnnotation] = field(default_factory=list)
    completeAnnotations: list[CompleteAnnotation] = field(default_factory=list)
    descriptionAnnotations: list[DescriptionAnnotation] = field(default_factory=list)
    enumAnnotations: list[EnumAnnotation] = field(default_factory=list)
    groupAnnotations: list[GroupAnnotation] = field(default_factory=list)
    moveAnnotations: list[MoveAnnotation] = field(default_factory=list)
    pureAnnotations: list[PureAnnotation] = field(default_factory=list)
    removeAnnotations: list[RemoveAnnotation] = field(default_factory=list)
    renameAnnotations: list[RenameAnnotation] = field(default_factory=list)
    todoAnnotations: list[TodoAnnotation] = field(default_factory=list)
    valueAnnotations: list[ValueAnnotation] = field(default_factory=list)

    @staticmethod
    def from_json(json: Any) -> AnnotationStore:
        if json["schemaVersion"] == 1:
            raise Exception(
                "Incompatible Annotation File: This file is not compatible with the current version."
            )

        boundaryAnnotations = []
        for annotation in json["boundaryAnnotations"].values():
            boundaryAnnotations.append(BoundaryAnnotation.from_json(annotation))

        calledAfterAnnotations = []
        for annotation in json["calledAfterAnnotations"].values():
            calledAfterAnnotations.append(CalledAfterAnnotation.from_json(annotation))

        completeAnnotations = []
        for annotation in json["completeAnnotations"].values():
            completeAnnotations.append(CompleteAnnotation.from_json(annotation))

        descriptionAnnotations = []
        for annotation in json["descriptionAnnotations"].values():
            descriptionAnnotations.append(DescriptionAnnotation.from_json(annotation))

        enumAnnotations = []
        for annotation in json["enumAnnotations"].values():
            enumAnnotations.append(EnumAnnotation.from_json(annotation))

        groupAnnotations = []
        for annotation in json["groupAnnotations"].values():
            groupAnnotations.append(GroupAnnotation.from_json(annotation))

        moveAnnotations = []
        for annotation in json["moveAnnotations"].values():
            moveAnnotations.append(MoveAnnotation.from_json(annotation))

        pureAnnotations = []
        for annotation in json["pureAnnotations"].values():
            pureAnnotations.append(PureAnnotation.from_json(annotation))

        removeAnnotations = []
        for annotation in json["removeAnnotations"].values():
            removeAnnotations.append(RemoveAnnotation.from_json(annotation))

        renameAnnotations = []
        for annotation in json["renameAnnotations"].values():
            renameAnnotations.append(RenameAnnotation.from_json(annotation))

        todoAnnotations = []
        for annotation in json["todoAnnotations"].values():
            todoAnnotations.append(TodoAnnotation.from_json(annotation))

        valueAnnotations = []
        for annotation in json["valueAnnotations"].values():
            valueAnnotations.append(ValueAnnotation.from_json(annotation))

        return AnnotationStore(
            boundaryAnnotations,
            calledAfterAnnotations,
            completeAnnotations,
            descriptionAnnotations,
            enumAnnotations,
            groupAnnotations,
            moveAnnotations,
            pureAnnotations,
            removeAnnotations,
            renameAnnotations,
            todoAnnotations,
            valueAnnotations,
        )

    def add_annotation(self, annotation: AbstractAnnotation) -> None:
        if isinstance(annotation, BoundaryAnnotation):
            self.boundaryAnnotations.append(annotation)
        elif isinstance(annotation, CalledAfterAnnotation):
            self.calledAfterAnnotations.append(annotation)
        elif isinstance(annotation, CompleteAnnotation):
            self.completeAnnotations.append(annotation)
        elif isinstance(annotation, DescriptionAnnotation):
            self.descriptionAnnotations.append(annotation)
        elif isinstance(annotation, EnumAnnotation):
            self.enumAnnotations.append(annotation)
        elif isinstance(annotation, GroupAnnotation):
            self.groupAnnotations.append(annotation)
        elif isinstance(annotation, MoveAnnotation):
            self.moveAnnotations.append(annotation)
        elif isinstance(annotation, PureAnnotation):
            self.pureAnnotations.append(annotation)
        elif isinstance(annotation, RemoveAnnotation):
            self.removeAnnotations.append(annotation)
        elif isinstance(annotation, RenameAnnotation):
            self.renameAnnotations.append(annotation)
        elif isinstance(annotation, TodoAnnotation):
            self.todoAnnotations.append(annotation)
        elif isinstance(annotation, ValueAnnotation):
            self.valueAnnotations.append(annotation)

    def to_json(self) -> dict:
        return {
            "schemaVersion": ANNOTATION_SCHEMA_VERSION,
            "boundaryAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.boundaryAnnotations
            },
            "calledAfterAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.calledAfterAnnotations
            },
            "completeAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.completeAnnotations
            },
            "descriptionAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.descriptionAnnotations
            },
            "enumAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.enumAnnotations
            },
            "groupAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.groupAnnotations
            },
            "moveAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.moveAnnotations
            },
            "pureAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.pureAnnotations
            },
            "renameAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.renameAnnotations
            },
            "removeAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.removeAnnotations
            },
            "todoAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.todoAnnotations
            },
            "valueAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.valueAnnotations
            },
        }
