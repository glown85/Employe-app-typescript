import {IEmployee} from './EmployeeOrgApp.types';


// employee class that implements IEmployee. 
// it wasn't necessary to transform this to a class because it didn't implemented any more functions thant the interface
export class Employee implements IEmployee{
    uniqueId: number;
    name: string;
    subordinates: IEmployee[];
    constructor(id:number, name:string, subordinates?:Employee[]){
        this.uniqueId = id;
        this.name = name;
        this.subordinates = subordinates? subordinates: [];
    }
}
