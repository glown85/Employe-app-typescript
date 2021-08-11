import { State, Action, IEmployeeOrgApp } from './EmployeeOrgApp.types';
import { Employee } from './Employee';

export class EmployeeOrgApp implements IEmployeeOrgApp{
    ceo: Employee;
    employees:Map<number,Employee>;  //employees maped for easier acess
    actions:Action[];                //store states for undo redo
    actionIndex:number;              //to control undo redo position on the actions array

    //GUI functions
	undoButton: ()=>void;
	redoButton: ()=>void;
	moveButton: ()=>void;

    constructor(ceo:Employee){
        this.employees = new Map<number,Employee>();

		this.ceo = this.saveEmployee(ceo);
        this.actions = []; 
        this.actionIndex = 0; 

        //binding context
		this.undoButton = () => this.undoGUI();
		this.redoButton = () => this.redoGUI();
		this.moveButton = () => this.moveGUI();
    }


    // #region interface methods
    /**
     * Moves the employee with employeeID (uniqueId) under a supervisor (another
     employee) that has supervisorID (uniqueId).
     * E.g. move Bob (employeeID) to be subordinate of Georgina (supervisorID).
     * @param employeeID
     * @param supervisorID
    */
    move(employeeID: number, supervisorID: number): void{
		//check if its a valid operation, if both id exist and if its not the same id
        if(employeeID == supervisorID || !this.employees.has(employeeID) 
        || !this.employees.has(supervisorID) || employeeID==this.ceo.uniqueId){
            console.error("error - invalid operation");
			return;
        }

        const supervisor = this.employees.get(supervisorID);
        const employee = this.employees.get(employeeID);
        const oldSupervisor = this.getSupervisor(employee.uniqueId);

		//if its trying to move to the same supervisor, abort function
		if(oldSupervisor) if(supervisor.uniqueId == oldSupervisor.uniqueId) return;

		//remove redo actions
        if(this.actionIndex<this.actions.length){
            this.actions.splice(this.actionIndex, this.actions.length - this.actionIndex);
        }

		// save state for undo/redo
        this.actions.push(
            {
                employee:{id:employee.uniqueId, subordinates: employee.subordinates.map(e => {return e.uniqueId})},
                newSupervisor:{id:supervisor.uniqueId, subordinates: supervisor.subordinates.map(e => {return e.uniqueId})},
                oldSupervisor: oldSupervisor? 
                    {id:oldSupervisor.uniqueId, subordinates: oldSupervisor.subordinates.map(e => {return e.uniqueId})}
                    : null,
            }
        );
        this.actionIndex++; 


		//remove employee from old supervisor
        if(oldSupervisor){
            oldSupervisor.subordinates.forEach((element,index)=>{
                if(element.uniqueId==employee.uniqueId) oldSupervisor.subordinates.splice(index,1);
            });

            //move all subordinates from employee to his las superior
            employee.subordinates.forEach((sub)=>{
                oldSupervisor.subordinates.push(sub);
            });
            employee.subordinates = [];
            
		}
		//add employee to supervisors subordinates
		supervisor.subordinates.push(employee);
    }

    /**
     * Undo last move action
     */
     undo(): void{
		//if it doesnt have more undo actions, return
		if(this.actionIndex <=0 ) return;

		//get employee obj and set its subordinates from state
		const getEmployeeFromState = (employeeState:State):Employee =>{
			const employee = this.employees.get(employeeState.id);
			employee.subordinates = employeeState.subordinates.map(e => { return this.employees.get(e)})
	
			return employee;
		}

        this.actionIndex--;

        //get state
        let {employee, oldSupervisor, newSupervisor} = this.actions[this.actionIndex];

        //save employees
        this.employees.set(employee.id, getEmployeeFromState(employee));
        this.employees.set(newSupervisor.id,  getEmployeeFromState(newSupervisor));
        if(oldSupervisor) this.employees.set(oldSupervisor.id,  getEmployeeFromState(oldSupervisor));

    }

    /**
     * redo last move action
     */
	redo(): void{
		if(this.actionIndex >= this.actions.length) return;
        const supervisor = this.employees.get(this.actions[this.actionIndex].newSupervisor.id);
        const employee = this.employees.get(this.actions[this.actionIndex].employee.id);
        const oldSupervisor = this.actions[this.actionIndex].oldSupervisor ? this.employees.get(this.actions[this.actionIndex].oldSupervisor.id): null;

		if(oldSupervisor){
            //remove employee from old supervisor
            oldSupervisor.subordinates.forEach((element,index)=>{
                if(element.uniqueId ==employee.uniqueId) oldSupervisor.subordinates.splice(index,1);
            });

            //move all subordinates from employee to his las superior
            employee.subordinates.forEach((sub)=>{
                oldSupervisor.subordinates.push(sub);
            });
            employee.subordinates = [];
            

            supervisor.subordinates.push(employee);
        }
        else{
            supervisor.subordinates.push(employee);
        }

        this.actionIndex++;
    }  
    
    // #endregion

    // #region helper
	/**
	 * get employee supervisor
	 * @param id 
	 * @returns employeeSupervisor: Employee 
	 */
    getSupervisor(id:number):Employee{
        let supervisor:Employee;
        this.employees.forEach(employee => {
            employee.subordinates.forEach(subordinate => {
                if(subordinate.uniqueId == id ){
                    supervisor = employee;
                }
            })
        });
        return supervisor;
    }

    /**
	 * get id by name
	 * @param name 
	 * @returns id: number 
	 */
	getIdByName(name:string):number{
		let id:number;
        this.employees.forEach(employee => {
            employee.subordinates.forEach(subordinate => {
                if(subordinate.name == name ){
                    id = subordinate.uniqueId;
					return id;
                }
            })
        });
        return id;
	}

    
    /**
	 * recursive function to get all the subordinates employees into the app
     * it calls addEmployee function to save into the app
	 * @param employee 
	 * @returns newEmployee: Employee
	 */
	saveEmployee(employee:Employee):Employee{
		const newEmployee = this.addEmployee(employee.uniqueId, employee.name);
		
        //recursion to save subordinates
		let subordinatesArray = [];
		employee.subordinates.forEach(subordinate => {
			subordinatesArray.push(this.saveEmployee(subordinate));
		});

		newEmployee.subordinates = subordinatesArray;
		return newEmployee;
	}

    /**
     * create an employee object and save into the app
     * @param id 
     * @param name 
     * @returns added employee
     */
    addEmployee(id:number, name:string):Employee{
        //check if the id already exist
        if(this.employees.has(id)){
            console.error("error, id already exist");
            return this.employees.get(id);
        }

        const newEmployee = new Employee(id, name);

        this.employees.set(id, newEmployee);

        return newEmployee;
    }
    // #endregion

    // #region DEBUG
	/**
	 * print the tabed organization into the console
	 */
	print():void{
		//recursive function to print the name and the tab indentation
		function printOnArray(employee:Employee, tabIndex:number, printArray:any[]){
			printArray.push([tabIndex, employee.name])
			employee.subordinates.forEach(subordinate => {
				printOnArray(subordinate, tabIndex+1, printArray)
			})
		
		}
		let printArray = [];
		printOnArray(this.ceo, 0, printArray)
		
		let printString = "";
		//concat the tab indentation and the name to printString
		printArray.forEach(element => {
			printString += new Array(element[0]*4).join(" ") + element[1] + '\n';
		});
		
		console.log(printString);

	}
    // #endregion

    //#region  GUI functions

    /**
     * print the tabbed organization of the app into the html element with id 'content'
     */
	printOnDocument():void{
		//recursive function to print the name and the tab indentation
		function printOnArray(employee:Employee, tabIndex:number, printArray:any[]){
			printArray.push([tabIndex, employee.uniqueId + " - " +employee.name])
			employee.subordinates.forEach(subordinate => {
				printOnArray(subordinate, tabIndex+1, printArray)
			})
		
		}
		let printArray = [];
		printOnArray(this.ceo, 0, printArray)
		
		let printString = "";
		//concat the tab indentation and the name to printString
		printArray.forEach(element => {
			printString += new Array(element[0]*8).join("&nbsp") + element[1] + "<br>";
		});
		

		document.getElementById("content").innerHTML = printString;
	}

    /**
     * undo button function
     */
    undoGUI(){
        this.undo();
		this.printOnDocument();
    }

    /**
     * redo button function
     */
    redoGUI(){
        this.redo();
		this.printOnDocument();
    }

    /**
     * move button function
     * get employeeid from employeeInput, get supervison id from supervisorInput
     */    
	moveGUI(){
		const employeeId = (<HTMLInputElement> document.getElementById("employeeInput")).value;
		const supervisorId = (<HTMLInputElement> document.getElementById("supervisorInput")).value;
		this.move(Number.parseFloat(employeeId),Number.parseFloat(supervisorId));
		this.printOnDocument();
	}

    // #endregion
}

