# pylint: disable=duplicate-code
import datetime

# apiv2: introduce superclass person with first_name, last_name and address, and get_name(), and participate()
# apiv2: rename LibraryUser to LibraryMember


class Person:
    """A Class for Persons

    Parameters
    ----------
    first_name : str
    last_name : str
    address : str
    """

    first_name: str
    last_name: str
    address: str

    def __init__(self, first_name: str, last_name: str, address: str) -> None:
        self.first_name = first_name
        self.last_name = last_name
        self.address = address

    def get_name(self) -> str:
        """get full name of the person

        Returns
        -------
        full_name : str
        """
        return self.first_name + " " + self.last_name

    def participate(self) -> None:
        pass


class LibraryMember(Person):
    """A Member of the Library extends a Person

    Parameters
    ----------
    first_name : str
    last_name : str
    address : str
    id_number : str
    pending_fees : float
    member_until : date
    """

    id_number: str
    pending_fees: float
    member_until: datetime.date

    def __init__(
        self,
        first_name: str,
        last_name: str,
        id_number: str,
        address: str,
        pending_fees: float,
        member_until: datetime.date,
    ) -> None:
        super().__init__(first_name, last_name, address)
        self.id_number = id_number
        self.pending_fees = pending_fees
        self.member_until = member_until

    def give_back(self, late_fee: float) -> None:
        """Gives book back and add late_fee is it is too late

        Parameters
        ----------
        late_fee : float
            money to be paid by user
        """
        self.pending_fees = self.pending_fees + late_fee

    def extend_membership(self) -> None:
        """Extend membership by one year"""
        self.member_until = self.member_until.replace(year=self.member_until.year + 1)
        # apiv2: change to self.member_until.replace(year=self.member_until.year+1)

    def pay(self, money: float) -> float:
        """pay the library

        Parameters
        ----------
        money : float
        """
        if money > self.pending_fees:
            self.pending_fees = 0
            return money - self.pending_fees
        self.pending_fees = self.pending_fees - money
        return 0.0


class Employee(Person):
    """An Employee of the Library extends a Person

    Parameters
    ----------
    first_name : str
    last_name : str
    address : str
    wage : float
    """

    wage: float

    def __init__(
        self, first_name: str, last_name: str, address: str, wage: float
    ) -> None:
        super().__init__(first_name, last_name, address)
        self.wage = wage
