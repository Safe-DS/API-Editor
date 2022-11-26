from typing import Optional

from package_parser.processing.annotations.model import RenameAnnotation
from package_parser.processing.annotations.model import EnumReviewResult
from package_parser.processing.migration import Mapping, OneToOneMapping, ManyToOneMapping


def migrate_rename_annotation(rename_annotation: RenameAnnotation, mapping: Mapping) -> Optional[RenameAnnotation]:
    annotation_name = rename_annotation.newName
    if isinstance(mapping, (ManyToOneMapping, OneToOneMapping)):
        element = mapping.get_apiv1_elements()[0]
        if rename_annotation.target != element.id and element.id.split(".")[-1] != annotation_name:
            rename_annotation.reviewResult = EnumReviewResult.UNSURE
        rename_annotation.target = element.id
        return rename_annotation
    else:
        # Can be decided to which apiv2 element a todo annotation or a unsure rename annotation can be placed?
        # Maybe the element with the lowest Levenshtein distance to the annotation target?
        # if it is =0 place the rename annotation there?
        # as long as its unsure what to do:
        return None

