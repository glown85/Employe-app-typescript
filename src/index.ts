import { EmployeeOrgApp } from './Components/EmployeeOrgApp';
import * as ceoJson from './ExampleData/employees.json';
import './style.css';


const app = new EmployeeOrgApp(ceoJson);

//debug on console
app.printOnDocument();

//binding functions to buttons
document.getElementById("undoButton").onclick = app.undoButton;
document.getElementById("redoButton").onclick = app.redoButton;
document.getElementById("moveButton").onclick = app.moveButton;
