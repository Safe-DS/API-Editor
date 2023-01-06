from datetime import date
from typing import Optional

from .persons import LibraryUser


class Book:
    def __init__(
        self,
        borrow_until: Optional[date],
        borrow_by: Optional[LibraryUser],
        genre: str,
        isbn: str,
        author: str,
        release_date: date,
        number_of_times_this_book_was_borrowed: int = 0,
    ) -> None:
        self.borrow_until = borrow_until
        self.borrow_by = borrow_by
        self.genre = genre
        self.isbn = isbn
        self.author = author
        self.release_date = release_date
        self.number_of_times_this_book_was_borrowed = (
            number_of_times_this_book_was_borrowed
        )
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
