from dataclasses import dataclass, field
from typing import Optional, Union

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    AnnotationStore,
    EnumReviewResult,
)
from package_parser.processing.api.model import (
    API,
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)
from package_parser.processing.migration.annotations import (
    migrate_boundary_annotation,
    migrate_called_after_annotation,
    migrate_description_annotation,
    migrate_enum_annotation,
    migrate_expert_annotation,
    migrate_group_annotation,
    migrate_move_annotation,
    migrate_remove_annotation,
    migrate_rename_annotation,
    migrate_todo_annotation,
    migrate_value_annotation,
)
from package_parser.processing.migration.model import Mapping


@dataclass
class Migration:
    annotationsv1: AnnotationStore
    mappings: list[Mapping]
    reliable_similarity: float = 0.9
    unsure_similarity: float = 0.8
    migrated_annotation_store: AnnotationStore = field(init=False)
    unsure_migrated_annotation_store: AnnotationStore = field(init=False)

    def __post_init__(self) -> None:
        self.migrated_annotation_store = AnnotationStore()
        self.unsure_migrated_annotation_store = AnnotationStore()

    def _get_mapping_from_annotation(
        self, annotation: AbstractAnnotation
    ) -> Optional[Mapping]:
        for mapping in self.mappings:
            for element in mapping.get_apiv1_elements():
                if (
                    not isinstance(element, (Attribute, Result))
                    and element.id == annotation.target
                ):
                    return mapping
        return None

    def migrate_annotations(self) -> None:
        for boundary_annotation in self.annotationsv1.boundaryAnnotations:
            mapping = self._get_mapping_from_annotation(boundary_annotation)
            if mapping is not None:
                for annotation in migrate_boundary_annotation(
                    boundary_annotation, mapping
                ):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for called_after_annotation in self.annotationsv1.calledAfterAnnotations:
            mapping = self._get_mapping_from_annotation(called_after_annotation)
            if mapping is not None:
                for annotation in migrate_called_after_annotation(
                    called_after_annotation, mapping, self.mappings
                ):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for description_annotation in self.annotationsv1.descriptionAnnotations:
            mapping = self._get_mapping_from_annotation(description_annotation)
            if mapping is not None:
                for annotation in migrate_description_annotation(
                    description_annotation, mapping
                ):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for enum_annotation in self.annotationsv1.enumAnnotations:
            mapping = self._get_mapping_from_annotation(enum_annotation)
            if mapping is not None:
                for annotation in migrate_enum_annotation(enum_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for expert_annotation in self.annotationsv1.expertAnnotations:
            mapping = self._get_mapping_from_annotation(expert_annotation)
            if mapping is not None:
                for annotation in migrate_expert_annotation(expert_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for group_annotation in self.annotationsv1.groupAnnotations:
            mapping = self._get_mapping_from_annotation(group_annotation)
            if mapping is not None:
                for annotation in migrate_group_annotation(
                    group_annotation, mapping, self.mappings
                ):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for move_annotation in self.annotationsv1.moveAnnotations:
            mapping = self._get_mapping_from_annotation(move_annotation)
            if mapping is not None:
                for annotation in migrate_move_annotation(move_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for rename_annotation in self.annotationsv1.renameAnnotations:
            mapping = self._get_mapping_from_annotation(rename_annotation)
            if mapping is not None:
                for annotation in migrate_rename_annotation(rename_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for remove_annotation in self.annotationsv1.removeAnnotations:
            mapping = self._get_mapping_from_annotation(remove_annotation)
            if mapping is not None:
                for annotation in migrate_remove_annotation(remove_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for todo_annotation in self.annotationsv1.todoAnnotations:
            mapping = self._get_mapping_from_annotation(todo_annotation)
            if mapping is not None:
                for annotation in migrate_todo_annotation(todo_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for value_annotation in self.annotationsv1.valueAnnotations:
            mapping = self._get_mapping_from_annotation(value_annotation)
            if mapping is not None:
                for annotation in migrate_value_annotation(value_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )
        self._handle_duplicates()

    def add_annotations_based_on_similarity(
        self, annotation: AbstractAnnotation, similarity: float
    ) -> None:
        if similarity >= self.reliable_similarity:
            self.migrated_annotation_store.add_annotation(annotation)
        elif similarity >= self.unsure_similarity:
            annotation.reviewResult = EnumReviewResult.UNSURE
            self.migrated_annotation_store.add_annotation(annotation)
        else:
            self.unsure_migrated_annotation_store.add_annotation(annotation)

    def _get_mappings_for_table(self) -> list[str]:
        table_rows: list[str] = []
        for mapping in self.mappings:

            def print_api_element(
                api_element: Union[Attribute, Class, Function, Parameter, Result]
            ) -> str:
                if isinstance(api_element, Result):
                    return api_element.name
                if isinstance(api_element, Attribute):
                    return str(api_element.class_id) + "/" + api_element.name
                return api_element.id

            apiv1_elements = ", ".join(
                [
                    print_api_element(api_element)
                    for api_element in mapping.get_apiv1_elements()
                ]
            )
            apiv2_elements = ", ".join(
                [
                    print_api_element(api_element)
                    for api_element in mapping.get_apiv2_elements()
                ]
            )
            apiv1_elements = "`" + apiv1_elements + "`"
            apiv2_elements = "`" + apiv2_elements + "`"
            table_rows.append(
                f"{mapping.similarity:.4}|{apiv1_elements}|{apiv2_elements}|"
            )
        return table_rows

    def _get_not_mapped_api_elements_for_table(
        self, apiv1: API, apiv2: API
    ) -> list[str]:
        not_mapped_api_elements: list[str] = []
        not_mapped_apiv1_elements = self._get_not_mapped_api_elements_as_string(apiv1)
        for element_id in not_mapped_apiv1_elements:
            not_mapped_api_elements.append(f"-|`{element_id}`||")
        not_mapped_apiv2_elements = self._get_not_mapped_api_elements_as_string(
            apiv2, print_for_apiv2=True
        )
        for element_id in not_mapped_apiv2_elements:
            not_mapped_api_elements.append(f"-||`{element_id}`|")
        return not_mapped_api_elements

    def _get_not_mapped_api_elements_as_string(
        self, api: API, print_for_apiv2: bool = False
    ) -> list[str]:
        not_mapped_api_elements: list[str] = []

        def is_included(
            api_element: Union[Attribute, Class, Function, Parameter, Result]
        ) -> bool:
            if not print_for_apiv2:
                for mapping in self.mappings:
                    for element in mapping.get_apiv1_elements():
                        if isinstance(api_element, Attribute) and isinstance(
                            element, Attribute
                        ):
                            if element.name == api_element.name and isinstance(
                                element.types, type(api_element.types)
                            ):
                                return True
                        if isinstance(api_element, Result) and isinstance(
                            element, Result
                        ):
                            if (
                                element.name == api_element.name
                                and element.docstring == api_element.docstring
                            ):
                                return True
                        if not isinstance(
                            api_element, (Attribute, Result)
                        ) and not isinstance(element, (Attribute, Result)):
                            if element.id == api_element.id:
                                return True
                return False
            for mapping in self.mappings:
                for element in mapping.get_apiv2_elements():
                    if isinstance(api_element, Attribute) and isinstance(
                        element, Attribute
                    ):
                        if element.name == api_element.name and isinstance(
                            element.types, type(api_element.types)
                        ):
                            return True
                    if isinstance(api_element, Result) and isinstance(element, Result):
                        if (
                            element.name == api_element.name
                            and element.docstring == api_element.docstring
                        ):
                            return True
                    if not isinstance(
                        api_element, (Attribute, Result)
                    ) and not isinstance(element, (Attribute, Result)):
                        if element.id == api_element.id:
                            return True
            return False

        for class_ in api.classes.values():
            if not is_included(class_):
                not_mapped_api_elements.append(class_.id)
        for function in api.functions.values():
            if not is_included(function):
                not_mapped_api_elements.append(function.id)
        for parameter in api.parameters().values():
            if not is_included(parameter):
                not_mapped_api_elements.append(parameter.id)
        for attribute, class_ in [
            (attribute, class_)
            for class_ in api.classes.values()
            for attribute in class_.instance_attributes
        ]:
            if not is_included(attribute):
                not_mapped_api_elements.append(class_.id + "/" + attribute.name)
        for result, function in [
            (result, function)
            for function in api.functions.values()
            for result in function.results
        ]:
            if not is_included(result):
                not_mapped_api_elements.append(function.id + "/" + result.name)
        return not_mapped_api_elements

    def print(self, apiv1: API, apiv2: API) -> None:
        print(
            "**Similarity**|**APIV1**|**APIV2**|**comment**\n:-----:|:-----:|:-----:|:----:|"
        )
        table_body = self._get_mappings_for_table()
        table_body.extend(self._get_not_mapped_api_elements_for_table(apiv1, apiv2))
        table_body.sort(
            key=lambda row: max(len(cell.split("/")) for cell in row.split("|")[:-1])
        )
        print("\n".join(table_body))

    def _handle_duplicates(self) -> None:
        for annotation_type in [
            "boundaryAnnotations",
            "calledAfterAnnotations",
            "descriptionAnnotations",
            "enumAnnotations",
            "expertAnnotations",
            "groupAnnotations",
            "moveAnnotations",
            "pureAnnotations",
            "removeAnnotations",
            "renameAnnotations",
            "todoAnnotations",
            "valueAnnotations",
        ]:
            migrated_annotations = [
                annotation
                for annotation_store in [
                    self.migrated_annotation_store,
                    self.unsure_migrated_annotation_store,
                ]
                for annotation in getattr(annotation_store, annotation_type)
            ]
            duplicates_dict: dict[str, list[AbstractAnnotation]] = {}
            for duplicated_annotations in migrated_annotations:
                if duplicated_annotations.target in duplicates_dict:
                    duplicates_dict[duplicated_annotations.target].append(
                        duplicated_annotations
                    )
                    continue
                for annotation in migrated_annotations:
                    if (
                        duplicated_annotations is annotation
                        or annotation.target in duplicates_dict
                    ):
                        continue
                    if (
                        isinstance(annotation, type(duplicated_annotations))
                        and annotation.target == duplicated_annotations.target
                    ):
                        duplicates = duplicates_dict.get(annotation.target, [])
                        duplicates.append(annotation)
                        duplicates.append(duplicated_annotations)
                        duplicates_dict[duplicated_annotations.target] = duplicates
                        break

            for duplicates in duplicates_dict.values():
                if len(duplicates) > 1:
                    duplicates = sorted(
                        duplicates, key=lambda annotation: annotation.reviewResult.name
                    )
                    different_values = set()
                    first_annotation_and_value: Optional[
                        tuple[AbstractAnnotation, str]
                    ] = None
                    for annotation in duplicates:
                        annotation_dict = annotation.to_json()
                        for key in [
                            "target",
                            "authors",
                            "reviewers",
                            "comment",
                            "reviewResult",
                        ]:
                            del annotation_dict[key]
                        annotation_value = str(annotation_dict)
                        if first_annotation_and_value is None:
                            first_annotation_and_value = annotation, annotation_value
                        different_values.add(annotation_value)

                    if first_annotation_and_value is not None:
                        first_annotation, first_value = first_annotation_and_value
                        if len(different_values) > 1:
                            different_values.remove(first_value)
                            comment = (
                                "Conflicting Attribute during migration: "
                                + ", ".join(sorted(different_values))
                            )
                            first_annotation.comment = (
                                "\n".join([comment, first_annotation.comment])
                                if len(first_annotation.comment) > 0
                                else comment
                            )
                            first_annotation.reviewResult = EnumReviewResult.UNSURE
                        for annotation_store in [
                            self.migrated_annotation_store,
                            self.unsure_migrated_annotation_store,
                        ]:
                            for annotation in duplicates:
                                if annotation is first_annotation:
                                    continue
                                annotations: list[AbstractAnnotation] = getattr(
                                    annotation_store, annotation_type
                                )
                                if annotation in annotations:
                                    annotations.remove(annotation)
