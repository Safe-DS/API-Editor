from package_parser.model.annotations import AnnotationStore
from package_parser.model.api import API
from package_parser.model.usages import UsageCountStore
from package_parser.processing.annotations._generate_boundary_annotations import (
    _generate_boundary_annotations,
)
from package_parser.processing.annotations._generate_enum_annotations import (
    _generate_enum_annotations,
)
from package_parser.processing.annotations._generate_parameter_importance_annotations import (
    _generate_parameter_importance_annotations,
)
from package_parser.processing.annotations._generate_remove_annotations import (
    _generate_remove_annotations,
)
from package_parser.processing.annotations._usages_preprocessor import (
    _preprocess_usages,
)


def generate_annotations(api: API, usages: UsageCountStore) -> AnnotationStore:
    _preprocess_usages(usages, api)

    annotations = AnnotationStore()
    _generate_remove_annotations(api, usages, annotations)
    _generate_parameter_importance_annotations(api, usages, annotations)
    _generate_enum_annotations(api, annotations)
    _generate_boundary_annotations(api, annotations)
    return annotations
