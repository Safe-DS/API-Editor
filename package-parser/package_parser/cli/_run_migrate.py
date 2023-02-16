import os
from pathlib import Path
from typing import Any

from package_parser.processing.migration import APIMapping, Migration
from package_parser.processing.migration.model import (
    AbstractDiffer,
    InheritanceDiffer,
    Mapping,
    SimpleDiffer,
    StrictDiffer,
)

from ._read_and_write_file import (
    _read_annotations_file,
    _read_api_file,
    _write_annotations_file,
)


def _run_migrate_command(
    apiv1_file_path: Path,
    annotations_file_path: Path,
    apiv2_file_path: Path,
    out_dir_path: Path,
) -> None:
    apiv1 = _read_api_file(apiv1_file_path)
    apiv2 = _read_api_file(apiv2_file_path)
    annotationsv1 = _read_annotations_file(annotations_file_path)

    differ_init_list: list[tuple[type[AbstractDiffer], dict[str, Any]]] = [
        (SimpleDiffer, {}),
        (StrictDiffer, {}),
        (InheritanceDiffer, {}),
    ]
    previous_base_differ = None
    previous_mappings: list[Mapping] = []

    for differ_init in differ_init_list:
        differ_class, additional_parameters = differ_init
        differ = differ_class(
            previous_base_differ,
            previous_mappings,
            apiv1,
            apiv2,
            **additional_parameters
        )
        api_mapping = APIMapping(apiv1, apiv2, differ)
        mappings = api_mapping.map_api()

        previous_mappings = mappings
        previous_base_differ = (
            differ
            if differ.get_related_mappings() is None
            else differ.previous_base_differ
        )

    if previous_mappings is not None:
        migration = Migration(annotationsv1, previous_mappings)
        migration.migrate_annotations()
        migration.print(apiv1, apiv2)
        migrated_annotations_file = Path(
            os.path.join(
                out_dir_path, "migrated_annotationsv" + apiv2.version + ".json"
            )
        )
        unsure_migrated_annotations_file = Path(
            os.path.join(
                out_dir_path, "unsure_migrated_annotationsv" + apiv2.version + ".json"
            )
        )
        _write_annotations_file(
            migration.migrated_annotation_store, migrated_annotations_file
        )
        _write_annotations_file(
            migration.unsure_migrated_annotation_store, unsure_migrated_annotations_file
        )
