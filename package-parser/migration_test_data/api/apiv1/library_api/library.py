from datetime import date, datetime, timedelta

from .book import Book
from .persons import Employee, LibraryUser
from .send_message_to_person import send_message_to_person


class Library:
    """The Library

    Parameters
    ----------
    books : list[Book]
    borrowed_books : list[Book]
    users : list[LibraryUser]
    staff : list[Employee]
    name : str
    is_open : bool
    """

    books: list[Book]  # apiv2: add other media -> change genre
    borrowed_books: list[Book]
    users: list[LibraryUser]
    staff: list[Employee]  # apiv2: add Person subclass to User and Personal and Author
    name: str
    is_open: bool = False  # apiv2: remove is_open attribute

    def __init__(
        self,
        books: list[Book],
        borrowed_books: list[Book],
        users: list[LibraryUser],
        staff: list[Employee],
        name: str,
        is_open: bool = False,
    ) -> None:
        self.books = books
        self.borrowed_books = borrowed_books
        self.users = users
        self.staff = staff
        self.name = name
        self.is_open = is_open

    def open_library(self) -> None:
        self.is_open = True

    def close_library(self) -> None:
        self.is_open = False

    def return_book(self, book: Book, user: LibraryUser) -> None:
        """Return a book

        Parameters
        ----------
        book : Book
        user : LibraryUser
        """
        if (
            book.borrow_by is not None
            and book.borrow_until is not None
            and book.borrow_by == user
        ):  # apiv2: check if book is in borrowed book list
            late_fee = 0.0
            today = datetime.today().date()
            if book.borrow_until > today or (
                book.borrow_by == today and not self.is_open
            ):
                late_fee = (today - book.borrow_until).days * book.FEE_PER_DAY
                if not self.is_open:
                    late_fee += 1.0
            user.give_back(late_fee)  # apiv2: rename function
            send_message_to_person(
                user.get_name(), user.address, "You need to pay your late fee."
            )
            book.borrow_by = None
            book.borrow_until = None
            self.borrowed_books.remove(book)

    def borrow(
        self, book: Book, user: LibraryUser
    ) -> None:  # apiv2: check if pending_fees are not above 5
        """borrow

        Parameters
        ----------
        book : Book
        user : LibraryUser
        """
        if book in self.books and book not in self.borrowed_books:
            book.borrow_by = user
            book.borrow_until = datetime.today() + timedelta(days=1)

    def add_new_book(
        self, book: Book
    ) -> None:  # apiv2: check if book is not duplicated, rename to add_new_media
        """add a new book

        Parameters
        ----------
        book : Book
        """
        self.books.append(book)

    def let_seminar_room(
        self,
        money: float,
        name: str,
        address: str,
        start_of_renting: date,
        end_of_renting: date,
    ) -> float:  # apiv2: remove rented_date, move to new subclass OurLibrary with additional attributes owner and address
        """rent the seminar room of the library after it closed

        Parameters
        ----------
        money : float
        name : str
        address : str
        start_of_renting : datetime
        end_of_renting : datetime

        Returns
        -------
        exchanged_money_or_money_to_be_paid : float
        """
        if money >= 50 * (end_of_renting - start_of_renting).days:
            send_message_to_person(
                name,
                address,
                f"You rented our seminar room for {money:.2f} € from "
                + str(start_of_renting)
                + " to "
                + str(end_of_renting),
            )
        return money - 50


class City:  # apiv2: remove this class
    """A City class

    Parameters
    ----------
    name : str
    number_of_inhabitants : int
    libraries : list[Library]
    """

    name: str
    number_of_inhabitants: int
    libraries: list[Library]

    def __init__(
        self, name: str, number_of_inhabitants: int, libraries: list[Library]
    ) -> None:
        self.name = name
        self.number_of_inhabitants = number_of_inhabitants
        self.libraries = libraries
