from json import JSONEncoder
from typing import Any


class CustomEncoder(JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o, set):
            return list(o)
        return super().default(o)
