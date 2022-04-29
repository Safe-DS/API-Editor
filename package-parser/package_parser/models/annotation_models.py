import dataclasses


@dataclasses.dataclass
class BaseAnnotation:
    target: str

    def to_json(self) -> dict:
        return dataclasses.asdict(self)

    def get_type(self) -> str:
        raise NotImplementedError("get_type() is not implemented in BaseAnnotation")
