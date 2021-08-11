# Typescript test: employeeOrgApp


Your task is to create a concrete class called EmployeeOrgApp that implements
IEmployeeOrgApp. The class should be instantiable with the ceo as a constructor
parameter.
E.g. const app = new EmployeeOrgApp(ceo)
The class should:
1. move employee A to become the subordinate of employee B (i.e. B becomes A's
supervisor)
2. undo/redo the move action
ASSUMPTIONS:

You may assume:
- when an employee (e.g. Bob Saget) is moved to a new supervisor (e.g. Georgina), Bob's
existing subordinates (Tina Teff) will become the subordinate of Cassandra, Bob's old
supervisor.
- employees without any subordinates have an empty list for their subordinates property

## Usage

### Install Typscript

```
npm install typescript -g
```

### Start

```
$ npm install # or yarn
$ npm start
```