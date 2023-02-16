from dataclasses import dataclass, field
from typing import Optional, Tuple, Union

from package_parser.processing.annotations import are_semantic_equal
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
        self._remove_duplicates()

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
                return "/".join(api_element.id.split("/")[1:])

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
        print("**Similarity**|**APIV1**|**APIV2**|**comment**")
        print(":-----:|:-----:|:-----:|:----:|")
        table_body = self._get_mappings_for_table()
        table_body.extend(self._get_not_mapped_api_elements_for_table(apiv1, apiv2))
        table_body.sort(
            key=lambda row: max(len(cell.split("/")) for cell in row.split("|")[:-1])
        )
        for row in table_body:
            print(row)

    def _remove_duplicates(self) -> None:
        for annotation_type in [
            "boundaryAnnotations",
            "calledAfterAnnotations",
            "descriptionAnnotations",
            "enumAnnotations",
            "expertAnnotations",
            "groupAnnotations",
            "moveAnnotations",
            "removeAnnotations",
            "renameAnnotations",
            "todoAnnotations",
            "valueAnnotations",
        ]:
            duplicates: list[Tuple[AbstractAnnotation, AbstractAnnotation]] = []
            migrated_annotations = [
                annotation
                for annotation_store in [
                    self.migrated_annotation_store,
                    self.unsure_migrated_annotation_store,
                ]
                for annotation in getattr(annotation_store, annotation_type)
            ]

            for annotation_a in migrated_annotations:
                for annotation_b in migrated_annotations:
                    if annotation_a is annotation_b:
                        continue
                    if (
                        are_semantic_equal(annotation_a, annotation_b)
                        and (annotation_b, annotation_a) not in duplicates
                    ):
                        duplicates.append((annotation_a, annotation_b))
            for annotation_a, annotation_b in duplicates:
                if (
                    annotation_a.reviewResult != annotation_b.reviewResult
                    and EnumReviewResult.UNSURE
                    in (annotation_a.reviewResult, annotation_b.reviewResult)
                ):
                    annotation_a.reviewResult = EnumReviewResult.UNSURE
                    annotation_b.reviewResult = EnumReviewResult.UNSURE
                b_in_migrated_annotation_store = annotation_b in getattr(
                    self.migrated_annotation_store, annotation_type
                )
                b_in_unsure_annotation_store = annotation_b in getattr(
                    self.unsure_migrated_annotation_store, annotation_type
                )
                if annotation_a in getattr(
                    self.migrated_annotation_store, annotation_type
                ):
                    if b_in_migrated_annotation_store:
                        getattr(self.migrated_annotation_store, annotation_type).remove(
                            annotation_b
                        )
                    if b_in_unsure_annotation_store:
                        getattr(
                            self.unsure_migrated_annotation_store, annotation_type
                        ).remove(annotation_b)
                if annotation_a in getattr(
                    self.unsure_migrated_annotation_store, annotation_type
                ):
                    if b_in_migrated_annotation_store:
                        getattr(self.migrated_annotation_store, annotation_type).remove(
                            annotation_b
                        )
                    if b_in_unsure_annotation_store:
                        getattr(
                            self.unsure_migrated_annotation_store, annotation_type
                        ).remove(annotation_b)
