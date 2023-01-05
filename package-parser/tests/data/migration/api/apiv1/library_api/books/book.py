from dataclasses import dataclass, field
from datetime import date
from typing import Optional

from ..persons import LibraryUser


@dataclass
class Book:
    FEE_PER_DAY: float = field(init=False)
    borrow_until: Optional[date]
    borrow_by: Optional[LibraryUser]
    genre: str
    isbn: str
    author: str
    release_date: date
    number_of_times_this_book_was_borrowed: int = 0

    def __post_init__(self) -> None:
        fee_for_each_genre: dict[str, float] = {
            "fiction": 1.0,
            "nonfiction": 2.0,
            "poetry": 1.5,
            "drama": 5.0,
            "high_demand": 10.0,
            "low_demand": 0.5,
            "other": 2.5,
        }
        if self.genre in fee_for_each_genre:
            self.FEE_PER_DAY = fee_for_each_genre[self.genre]
        else:
            self.FEE_PER_DAY = fee_for_each_genre["other"]
