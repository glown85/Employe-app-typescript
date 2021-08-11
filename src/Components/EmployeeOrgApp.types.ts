export interface IEmployee {
    uniqueId: number;
    name: string;
    subordinates: IEmployee[];
}

export interface State {
    id:number,
    subordinates:number[]
}

export interface Action{
    employee:State;
    oldSupervisor:State;
    newSupervisor:State;
}

export interface IEmployeeOrgApp {
    ceo: IEmployee;
    /**
    * Moves the employee with employeeID (uniqueId) under a supervisor (another
    employee) that has supervisorID (uniqueId).
    * E.g. move Bob (employeeID) to be subordinate of Georgina (supervisorID).
    * @param employeeID
    * @param supervisorID
    */
    move(employeeID: number, supervisorID: number): void;
    /**
    * Undo last move action
    */
    undo(): void;
    /**
    * Redo last undone action
    */
    redo(): void;
}