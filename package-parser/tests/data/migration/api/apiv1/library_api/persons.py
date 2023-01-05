import datetime
from dataclasses import dataclass

from library_api.book import Book


@dataclass
class LibraryUser:
    first_name: str
    last_name: str
    id_number: str
    pending_fees: float
    member_until: datetime.date

    def give_back(self, book: Book, late_fee: float) -> None:
        self.pending_fees = self.pending_fees + late_fee
        book.borrow_by = None
        book.borrow_until = None

    def extend_membership(self) -> None:
        self.member_until = self.member_until + datetime.timedelta(days=365)  # apiv2: change to relativedelta(years=1)


@dataclass
class Employee:
    first_name: str
    last_name: str
    wage: float
