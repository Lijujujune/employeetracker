# Employee Management System

    An Employee Management System command-line application built using Node.js and PostgreSQL. This application allows users to manage an employee database, including viewing departments, roles, employees, and performing CRUD operations such as adding, updating, and deleting records.

# Table of Contents
	•	Useful Links
	•	Installation
	•	Usage
	•	Features
	•	Database Structure
	•	License

# Useful Links
	Github: https://github.com/Lijujujune/employeetracker.git
	Walkthrough video: https://bootcampspot.instructuremedia.com/embed/a22243f4-9c96-4e4e-a3b2-ab9a6cee6b26
# Installation
    
    1.	Clone the repository:
        git clone https://github.com/yourusername/employee-management-system.git
        cd employee-management-system

    2. Install dependencies:
        npm init -y
        npm install

    3. Install PostgreSQL

# Usage
    
    1. Open Intergrated Interminal in db folder
    2. Run "psql -U postgres"
    3. Run the SQL to drop/create database and tables using: "\i schema.sql"
    4. Import seeds data: "\i seeds.sql"
    5. Open Intergrated Interminal in Employeetracker folder
    6. Run "node index"

# Database Structure
The database consists of three main tables:

	1.	departments
	    •	id: Integer, Primary Key
	    •	name: String (30 characters max), Department Name
	2.	roles
	    •	id: Integer, Primary Key
	    •	title: String (30 characters max), Role Title
	    •	salary: Integer, Salary for the Role
	    •	department_id: Integer, Foreign Key referencing departments(id)
	3.	employees
	    •	id: Integer, Primary Key
	    •	first_name: String (30 characters max), Employee’s First Name
	    •	last_name: String (30 characters max), Employee’s Last Name
	    •	role_id: Integer, Foreign Key referencing roles(id)
	    •	manager_id: Integer, Foreign Key referencing employees(id)

# License

This project is licensed under the MIT License. See the LICENSE file for more details.



