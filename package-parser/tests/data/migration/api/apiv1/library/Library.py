import dataclasses


@dataclasses.dataclass
class Library:
    book: list[Book]
    user: list[LibraryUser]

