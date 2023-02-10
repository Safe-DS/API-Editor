import os
from pathlib import Path

from package_parser.processing.migration import APIMapping, Migration
from package_parser.processing.migration.model import SimpleDiffer, StrictDiffer

from ._read_and_write_file import (
    _read_annotations_file,
    _read_api_file,
    _write_annotations_file,
)
from package_parser.processing.migration.model import InheritanceDiffer


def _run_migrate_command(
    apiv1_file_path: Path,
    annotations_file_path: Path,
    apiv2_file_path: Path,
    out_dir_path: Path,
) -> None:
    apiv1 = _read_api_file(apiv1_file_path)
    apiv2 = _read_api_file(apiv2_file_path)
    annotationsv1 = _read_annotations_file(annotations_file_path)
    differ = SimpleDiffer()
    api_mapping = APIMapping(apiv1, apiv2, differ)
    mappings = api_mapping.map_api()

    print_only_migration = Migration(annotationsv1, mappings)
    print_only_migration.migrate_annotations()
    print_only_migration.print(apiv1, apiv2, True)

    strict_differ = StrictDiffer(mappings, differ)
    enhanced_api_mapping = APIMapping(apiv1, apiv2, StrictDiffer(mappings, differ))
    enhanced_mappings = enhanced_api_mapping.map_api()

    print_only_migration = Migration(annotationsv1, enhanced_mappings)
    print_only_migration.migrate_annotations()
    print_only_migration.print(apiv1, apiv2, True)


    inheritance_differ = InheritanceDiffer(enhanced_mappings, strict_differ, apiv1, apiv2)
    api_mapping_including_inheritance = APIMapping(apiv1, apiv2, inheritance_differ)
    enhanced_mappings_with_inheritance = api_mapping_including_inheritance.map_api()

    migration = Migration(annotationsv1, enhanced_mappings_with_inheritance)
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
