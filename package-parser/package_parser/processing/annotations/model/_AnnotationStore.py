from dataclasses import dataclass, field

from package_parser.processing.annotations.model import (
    ANNOTATION_SCHEMA_VERSION,
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

    def to_json(self) -> dict:
        return {
            "schemaVersion": ANNOTATION_SCHEMA_VERSION,
            "boundaryAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.boundaryAnnotations
            },
            "enumAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.enumAnnotations
            },
            "removeAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.removeAnnotations
            },
            "valueAnnotations": {
                annotation.target: annotation.to_json()
                for annotation in self.valueAnnotations
            },
        }
