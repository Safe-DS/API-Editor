import dataclasses
from datetime import datetime, timedelta

from .book import Book
from .persons import LibraryUser, Employee


@dataclasses.dataclass
class Library:
    books: list[Book]  # apiv2: add other media -> change genre
    borrowed_books: list[Book]
    users: list[LibraryUser]
    staff: list[Employee]  # apiv2: add Person subclass to User and Personal and Author
    name: str
    is_open: bool = False

    def open_library(self) -> None:
        self.is_open = True

    def close_library(self) -> None:
        self.is_open = False

    def return_book(self, book: Book, user: LibraryUser) -> None:
        if book.borrow_by is not None and book.borrow_until is not None and book.borrow_by == user:  # apiv2: check if book is in borrowed book list
            late_fee = 0.0
            today = datetime.today().date()
            if book.borrow_until > today or (book.borrow_by == today and not self.is_open):
                late_fee = (today - book.borrow_until).days * book.FEE_PER_DAY
                if not self.is_open:
                    late_fee += 1.0
            user.give_back(late_fee)  # apiv2: rename function
            book.borrow_by = None
            book.borrow_until = None
            self.borrowed_books.remove(book)

    def borrow(self, book: Book, user: LibraryUser) -> None:  # apiv2: check if pending_fees are not above 5
        if book in self.books and book not in self.borrowed_books:
            book.borrow_by = user
            book.borrow_until = datetime.today() + timedelta(days=1)

    def add_new_book(self, book: Book) -> None:  # apiv2: check is ISBN is not duplicated
        self.books.append(book)
