# pylint: disable=duplicate-code
from datetime import date
from typing import Optional

from .persons import LibraryMember
from .position import Position

# apiv2: add superclasses and new subclasses


class Media:
    """A Class for all types of Media

    Parameters
    ----------
    borrow_until : Optional[date]
        if it is borrowed: date else None
    borrow_by : Optional[LibraryMember]
    author : str
    release_date : date
    number_of_times_this_book_was_borrowed : int, default=0
        number of borrows
    fee_per_day : float
    position : Position
    """

    def __init__(
        self,
        borrow_until: Optional[date],
        borrow_by: Optional[LibraryMember],
        author: str,
        release_date: date,
        position: Position,
        number_of_times_this_book_was_borrowed: int = 0,
        fee_per_day: float = 1.0,
    ) -> None:
        self.borrow_until = borrow_until
        self.borrow_by = borrow_by
        self.author = author
        self.release_date = release_date
        self.number_of_times_this_book_was_borrowed = (
            number_of_times_this_book_was_borrowed
        )
        self.FEE_PER_DAY = fee_per_day
        self.position = position


class Book(Media):
    """A Class for Books

    Parameters
    ----------
    borrow_until : Optional[date]
        if it is borrowed: date else None
    borrow_by : Optional[LibraryMember]
    genre : str
    author : str
    release_date : date
    isbn :  str
    number_of_times_this_book_was_borrowed : int, default=0
        number of borrows
    """

    def __init__(
        self,
        borrow_until: Optional[date],
        borrow_by: Optional[LibraryMember],
        genre: str,
        author: str,
        release_date: date,
        isbn: str,
        position: Position,
        number_of_times_this_book_was_borrowed: int = 0,
    ) -> None:
        fee_for_each_genre: dict[str, float] = {
            "fiction": 1.0,
            "nonfiction": 2.0,
            "poetry": 1.5,
            "drama": 5.0,
            "high_demand": 10.0,
            "low_demand": 0.5,
            "other": 2.5,
        }
        fee_per_day = fee_for_each_genre.get(genre, fee_for_each_genre["other"])
        super().__init__(
            borrow_until,
            borrow_by,
            author,
            release_date,
            position,
            number_of_times_this_book_was_borrowed,
            fee_per_day=fee_per_day,
        )
        self.isbn = isbn
        self.genre = genre


class CD(Media):
    """A Class for CD

    Parameters
    ----------
    borrow_until : Optional[date]
        if it is borrowed: date else None
    borrow_by : Optional[LibraryMember]
    author : str
    release_date : date
    number_of_times_this_book_was_borrowed : int, default=0
        number of borrows
    """

    def __init__(
        self,
        borrow_until: Optional[date],
        borrow_by: Optional[LibraryMember],
        author: str,
        release_date: date,
        position: Position,
        number_of_times_this_book_was_borrowed: int = 0,
    ) -> None:
        super().__init__(
            borrow_until,
            borrow_by,
            author,
            release_date,
            position,
            number_of_times_this_book_was_borrowed,
            fee_per_day=2.0,
        )


class DVD(Media):
    """A Class for all types of Media

    Parameters
    ----------
    borrow_until : Optional[date]
        if it is borrowed: date else None
    borrow_by : Optional[LibraryMember]
    author : str
    release_date : date
    number_of_times_this_book_was_borrowed : int, default=0
        number of borrows
    """

    def __init__(
        self,
        borrow_until: Optional[date],
        borrow_by: Optional[LibraryMember],
        author: str,
        release_date: date,
        position: Position,
        number_of_times_this_book_was_borrowed: int = 0,
    ) -> None:
        super().__init__(
            borrow_until,
            borrow_by,
            author,
            release_date,
            position,
            number_of_times_this_book_was_borrowed,
            fee_per_day=3.0,
        )
