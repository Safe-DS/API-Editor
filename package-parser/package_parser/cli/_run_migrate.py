import os
from pathlib import Path
from typing import Optional, Callable

from package_parser.processing.migration import APIMapping, Migration
from package_parser.processing.migration.model import (
    InheritanceDiffer,
    SimpleDiffer,
    StrictDiffer, AbstractDiffer, Mapping,
)

from ._read_and_write_file import (
    _read_annotations_file,
    _read_api_file,
    _write_annotations_file,
)
from package_parser.processing.api.model import API


def _run_migrate_command(
    apiv1_file_path: Path,
    annotations_file_path: Path,
    apiv2_file_path: Path,
    out_dir_path: Path,
) -> None:
    apiv1 = _read_api_file(apiv1_file_path)
    apiv2 = _read_api_file(apiv2_file_path)
    annotationsv1 = _read_annotations_file(annotations_file_path)

    create_next_differ_list = list[Callable[[Optional[AbstractDiffer], list[Mapping], API, API], AbstractDiffer]] = [
        lambda previous_base_differ_, previous_mappings_, apiv1_, apiv2_: SimpleDiffer(apiv1_, apiv2_),
        lambda previous_base_differ_, previous_mappings_, apiv1_, apiv2_: StrictDiffer(previous_base_differ_, previous_mappings_, apiv1_, apiv2_),
        lambda previous_base_differ_, previous_mappings_, apiv1_, apiv2_: InheritanceDiffer(previous_base_differ_, previous_mappings_, apiv1_, apiv2_),
        ]
    previous_base_differ = None
    previous_mappings = None
    for create_next_differ in create_next_differ_list:
        differ = create_next_differ(previous_base_differ, previous_mappings, apiv1, apiv2)
        api_mapping = APIMapping(apiv1, apiv2, differ)
        mappings = api_mapping.map_api()

        print_only_migration = Migration(annotationsv1, mappings)
        print_only_migration.migrate_annotations()
        print_only_migration.print(apiv1, apiv2, True)

        previous_mappings = mappings
        previous_base_differ = differ if differ.get_related_mappings() is None else differ.previous_base_differ

    migration = Migration(annotationsv1, previous_mappings)
    migration.migrate_annotations()
    migration.print(apiv1, apiv2, True)
    migrated_annotations_file = Path(
        os.path.join(out_dir_path, "migrated_annotationsv" + apiv2.version + ".json")
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
