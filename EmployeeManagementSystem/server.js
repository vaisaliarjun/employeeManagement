const express = require("express");
const querystring = require("querystring");
const mysql = require("mysql2");

const app = express();
const PORT = 3001;

const db = mysql.createConnection({
    host: "localhost",
    user: "mysql",
    password: "mysql",
    database: "empdb",
    port: 3306
});

db.query("CREATE DATABASE IF NOT EXISTS empdb;", (err, res) => {
    if (err) {
        console.error("Error connecting to database : ", err);
    } else {
        console.log("Database named 'empdb' created or already exists.");
    }
});

db.connect(err => {
    if (err) {
        console.error("Error connecting to MySQL : ", err);
    } else {
        console.log("Connected to MySQL!");
    }
});

db.query(
    "CREATE TABLE IF NOT EXISTS employees(name VARCHAR(20), email VARCHAR(20), phone VARCHAR(10), empID VARCHAR(4) PRIMARY KEY, dpmt VARCHAR(20), doj DATE, pos VARCHAR(20));",
    (err, res) => {
        if (err) {
            console.error("Error creating the table : ", err);
        } else {
            console.log("Table named 'employees' created or already exists.");
        }
    }
);

app.post("/insert", (req, res) => {
    let query = "";

    req.on("data", chunk => {
        query += chunk;
    });

    req.on("end", () => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(
            "<style> .container { display: flex; justify-content: center; align-items: center; height: 100%;} table, th, td {border: 1px solid black; border-collapse: collapse; padding: 10px;} th {background: grey} *{ font-family: monospace;}</style> <div class='container'><h1 style='text-align: center;'>"
        );
        let queryObj = querystring.parse(query);
        console.log(queryObj);

        const insertQuery = `INSERT INTO employees (name, email, phone, empID, dpmt, doj, pos) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            queryObj.name,
            queryObj.email,
            queryObj.phone,
            queryObj.empID,
            queryObj.dpmt,
            queryObj.doj,
            queryObj.pos
        ];

        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error("Error inserting into employees table:", err);
                res.end(
                    `Error inserting into employees table: ${err}</h1></div>`
                );
            } else {
                res.end(`Inserted into employees table!</h1></div>`);
                console.log("Inserted into employees table:", result);
            }
        });
    });
});

app.post("/update", (req, res) => {
    let query = "";

    req.on("data", chunk => {
        query += chunk;
    });

    req.on("end", () => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(
            "<style> .container { display: flex; justify-content: center; align-items: center; height: 100%;} table, th, td {border: 1px solid black; border-collapse: collapse; padding: 10px;} th {background: grey} *{ font-family: monospace;}</style> <div class='container'><h1 style='text-align: center;'>"
        );
        let queryObj = querystring.parse(query);

        let setClause = "";

        for (const key in queryObj) {
            if (Object.hasOwnProperty.call(queryObj, key)) {
                if (queryObj[key] != "" && key != "empID") {
                    if (setClause == "") {
                        setClause += `${key}='${queryObj[key]}'`;
                    } else {
                        setClause += `, ${key}='${queryObj[key]}'`;
                    }
                }
            }
        }

        let updateQuery = `UPDATE employees SET ${setClause} WHERE empID='${queryObj[
            "empID"
        ]}';`;

        db.query(updateQuery, (err, result) => {
            if (err) {
                console.error("Error updating row in employees table:", err);
                res.end(
                    `Error updating row in employees table: ${err}</h1></div>`
                );
            } else {
                res.end(`Updated row in employees table!</h1></div>`);
                console.log("Updated row in employees table:", result);
            }
        });
    });
});

app.post("/delete", (req, res) => {
    let query = "";
    console.log("triggered");

    req.on("data", chunk => {
        query += chunk;
    });

    req.on("end", () => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(
            "<style> .container { display: flex; justify-content: center; align-items: center; height: 100%;} table, th, td {border: 1px solid black; border-collapse: collapse; padding: 10px;} th {background: grey} *{ font-family: monospace;}</style> <div class='container'><h1 style='text-align: center;'>"
        );
        let queryObj = querystring.parse(query);

        let deleteQuery = `DELETE FROM employees WHERE empID='${queryObj[
            "empID"
        ]}';`;
        console.log(deleteQuery);

        db.query(deleteQuery, (err, result) => {
            if (err) {
                console.error("Error deleting row from employees table:", err);
                res.end(
                    `Error deleting row from employees table: ${err}</h1></div>`
                );
            } else {
                res.end(`Deleted row from employees table!</h1></div>`);
                console.log("Deleted row from employees table:", result);
            }
        });
    });
});

app.get("/select", (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
        res.write(
            "<style> .container { display: flex; justify-content: center; align-items: center; height: 100%;} table, th, td {border: 1px solid black; border-collapse: collapse; padding: 10px;} th {background: grey} *{ font-family: monospace;}</style> <div class='container'>"
        );
    db.query("SELECT * from employees;", (err, result) => {
        if (err) {
            console.error("Error getting data from employees table:", err);
            res.end(
                `Error getting data from employees table: ${err}</h1></div>`
            );
        } else {
            let htmlResponse =
                "<table><tr><th>Name</th><th>Email</th><th>Phone</th><th>Employee ID</th><th>Department</th><th>Date Of Join</th><th>Position</th></tr>";

            result.forEach(row => {
                htmlResponse += `
                    <tr>
                        <td>${row["name"]}</td>
                        <td>${row["email"]}</td>
                        <td>${row["phone"]}</td>
                        <td>${row["empID"]}</td>
                        <td>${row["dpmt"]}</td>
                        <td>${row["doj"].toISOString().split("T")[0]}</td>
                        <td>${row["pos"]}</td>
                    </tr>
                `;
            });

            htmlResponse += "</table></div>";

            res.end(htmlResponse);

            console.log("Data selected from from employees table:", result);
        }
    });
});

app.get("/", (req, res) => {
    res.end("HELLO!");
});

app.listen(PORT, () =>
    console.log(`Server Running on http://localhost:${PORT}`)
);
