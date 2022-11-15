from dataclasses import dataclass, field

from package_parser.processing.annotations.model import (
    ANNOTATION_SCHEMA_VERSION,
    BoundaryAnnotation,
    EnumAnnotation,
    RemoveAnnotation,
    ValueAnnotation,
)


@dataclass
class AnnotationStore:
    boundaryAnnotations: list[BoundaryAnnotation] = field(default_factory=list)
    enumAnnotations: list[EnumAnnotation] = field(default_factory=list)
    removeAnnotations: list[RemoveAnnotation] = field(default_factory=list)
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
