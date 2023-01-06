import datetime


class LibraryUser:
    first_name: str
    last_name: str
    id_number: str
    address: str
    pending_fees: float
    member_until: datetime.date

    def __init__(self, first_name: str, last_name: str, id_number: str, address: str, pending_fees: float, member_until: datetime.date) -> None:
        self.first_name = first_name
        self.last_name = last_name
        self.id_number = id_number
        self.address = address
        self.pending_fees = pending_fees
        self.member_until = member_until

    def give_back(self, late_fee: float) -> None:
        self.pending_fees = self.pending_fees + late_fee

    def extend_membership(self) -> None:
        self.member_until = self.member_until + datetime.timedelta(
            days=365
        )  # apiv2: change to self.member_until.replace(year=self.member_until.year+1)

    def get_name(self) -> str:
        return self.first_name + " " + self.last_name

    def pay(self, money: float) -> float:
        if money > self.pending_fees:
            self.pending_fees = 0
            return money - self.pending_fees
        self.pending_fees = self.pending_fees - money
        return 0.0

class Employee:
    first_name: str
    last_name: str
    address: str
    wage: float

    def __init__(self, first_name: str, last_name: str, address: str, wage: float) -> None:
        self.first_name = first_name
        self.last_name = last_name
        self.address = address
        self.wage = wage

    def get_name(self) -> str:
        return self.first_name + " " + self.last_name

