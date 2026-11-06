const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

const jwt = require('jsonwebtoken');
const secrect = 'SoftwareforChallan';

const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage()
});

const PDFDocument = require('pdfkit');

const crypto = require('crypto');
const bcrypt = require('bcrypt');

const mysql = require('mysql');
const { error } = require('console');
const { ppid } = require('process');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'newchallan'
});

connection.connect((err) => {
    if (err) {
        console.error('Error to connecting to the database:', err);
    }
    else {
        console.log('Connected to the MYSQL Database..');
    }
});

function generatePassword() {
    return crypto.randomBytes(8).toString('hex');
}

//All API for Admin
app.post('/Adminlogin', (req, res) => {
    const Username = req.body.Username;
    const Password = req.body.Password;
    const sqll = `select * from admin where Username = ? and Password = ?`;
    connection.query(sqll, [Username, Password], (err, result) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: "Login Again",
                data: []
            })
        } else {
            if (result.length > 0) {
                const Admin = {
                    Admin_id: result[0].Admin_id,
                    Name: result[0].Name,
                    Email: result[0].Email,
                    Username: result[0].Username,
                    Password: result[0].Password,
                    Role: result[0].Role,
                    Address: result[0].Address,
                    Status: result[0].Status,
                    PhoneNo: result[0].PhoneNo,
                    Added_Date: result[0].Added_Date,
                    Updated_Date: result[0].Updated_Date
                }
                const token = jwt.sign(Admin, secrect, { expiresIn: '100d' });
                res.send({
                    success: true,
                    message: 'Login Successfully',
                    data: token
                })
            } else {
                res.status(400).send({
                    success: false,
                    message: 'User Not Found',
                    data: []
                })
            }
        }
    })
});

app.post('/AddAdmin', (req, res) => {
    const Name = req.body.Name;
    const PhoneNo = req.body.PhoneNo;
    const Email = req.body.Email;
    const Username = req.body.Username;
    const Password = generatePassword();
    const Role = req.body.Role;
    const Address = req.body.Address;
    const Status = req.body.Status;

    const Code = `select Code from admin order by Admin_id desc limit 1`;
    connection.query(Code, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Database Query Error');
            return
        }
        let newCode = 'ADM_1';
        if (result.length > 0 && result[0].Code) {
            const lastCode = result[0].Code;
            const numericPart = parseInt(lastCode.slice(4), 10) + 1;
            newCode = 'ADM_' + numericPart.toString().padStart(1, '0');
        }
        const insertquery = `insert into admin (Code,Name,PhoneNo,Email,Username,Password,Role,Address,Added_Date,Updated_Date,Status) values(?,?,?,?,?,?,?,?,NOW(),NOW(),?)`
        connection.query(insertquery, [newCode, Name, PhoneNo, Email, Username, Password, Role, Address, Status], (err, result) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: err.sqlMessage,
                    data: []
                });
            } else {
                res.status(200).send({
                    success: true,
                    message: 'New Admin Added Successfully',
                    data: result
                });
            }
        });
    });
});

app.get('/AllAdminData', (req, res) => {
    const alldata = `select * from admin order by Admin_id desc`;
    connection.query(alldata, (err, result) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Admin Data',
                data: result
            });
        }
    });
});

app.put('/UpdateAdmin/:Admin_id', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({
            success: false,
            message: 'Unauthorized',
            data: []
        })
    } else {
        jwt.verify(token, secrect, (err, decoded) => {
            if (err) {
                res.status(401).send({
                    success: false,
                    message: 'Unauthorized',
                    data: []
                })
            } else {
                if (decoded.Role !== 'Admin') {
                    return res.status(401).send({
                        success: false,
                        message: 'Unauthorized',
                        data: []
                    });
                } else {
                    const Admin_id = req.params.Admin_id;
                    const Name = req.body.Name;
                    const PhoneNo = req.body.PhoneNo;
                    const Email = req.body.Email;
                    const Username = req.body.Username;
                    const Password = req.body.Password;
                    const Role = req.body.Role;
                    const Address = req.body.Address;
                    const Status = req.body.Status;

                    const Updatequery = `update admin set Name=?, PhoneNo= ?, Email=?, Username=?, Password=?, Role=?, Address=?, Updated_Date=NOW(), Status=? where Admin_id=?`;
                    connection.query(Updatequery, [Name, PhoneNo, Email, Username, Password, Role, Address, Status, Admin_id, decoded.Role], (err, result) => {
                        if (err) {
                            res.status(500).send({
                                success: false,
                                message: err.sqlMessage,
                                data: []
                            });
                        } else {
                            res.status(200).send({
                                success: false,
                                message: 'Update a Admin Data',
                                data: result
                            });
                        }
                    });
                }
            }
        });
    }
});

app.post('/DeleteAdminwithReason/:Admin_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const {
        Password,
        Deletion_Reason
    } = req.body;
    const Admin_id = req.params.Admin_id;
    // ==========================================
    // 1. TOKEN VALIDATION
    // ==========================================

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    // ==========================================
    // 2. DELETION REASON VALIDATION
    // ==========================================
    if (!Deletion_Reason || Deletion_Reason.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Deletion reason is required'
        });
    }
    if (Deletion_Reason.trim().length < 5) {

        return res.status(400).json({
            success: false,
            message: 'Please enter a valid deletion reason'
        });

    }
    // ==========================================
    // 3. VERIFY JWT
    // ==========================================
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        // ==========================================
        // 4. ADMIN ROLE CHECK
        // ==========================================
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can delete Vendor'
            });
        }
        // ==========================================
        // 5. GET ADMIN
        // ==========================================
        connection.query(
            'SELECT * FROM admin WHERE Admin_id = ?',
            [decoded.Admin_id],
            (err, adminData) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });
                }
                if (!adminData.length) {
                    return res.status(404).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }
                // ==========================================
                // 6. PASSWORD CHECK
                // ==========================================

                if (adminData[0].Password !== Password) {
                    return res.status(401).json({
                        success: false,
                        message: 'Incorrect Admin Password'
                    });
                }

                const adminName =
                    adminData[0].Name ||
                    adminData[0].Admin_Name ||
                    adminData[0].Username ||
                    'Admin';
                // ==========================================
                // 7. START TRANSACTION
                // ==========================================
                connection.beginTransaction((err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }
                    connection.query(
                        `
                        SELECT *
                        FROM admin
                        WHERE Admin_id = ?
                        `,
                        [Admin_id],
                        (err, adminData) => {
                            if (err) {
                                return rollbackDelete(
                                    res,
                                    err
                                );
                            }
                            if (!adminData.length) {
                                return rollbackDelete(
                                    res,
                                    {
                                        sqlMessage: 'admin not found'
                                    }
                                );
                            }
                            const admin = adminData[0];
                            const Code =
                                admin.Code ||
                                admin.Code ||
                                null;
                            connection.query(
                                `
                                INSERT INTO admin_deletion_history
                                (
                                    Admin_id,
                                    Code,
                                    Deleted_By_Admin_id,
                                    Deleted_By_Admin_Name,
                                    Deletion_Reason,
                                    Deleted_Date,
                                    Admin_Data	
                                )
                                VALUES (?, ?, ?, ?, ?, NOW(), ?)
                                `,

                                [
                                    Admin_id,
                                    Code,
                                    decoded.Admin_id,
                                    adminName,
                                    Deletion_Reason.trim(),
                                    JSON.stringify(admin)
                                ],

                                (err) => {

                                    if (err) {
                                        return rollbackDelete(
                                            res,
                                            err
                                        );
                                    }
                                    connection.query(
                                        `
                                        DELETE FROM admin
                                        WHERE Admin_id = ?
                                        `,
                                        [Admin_id],
                                        (err, deleteResult) => {
                                            if (err) {
                                                return rollbackDelete(
                                                    res,
                                                    err
                                                );
                                            }
                                            if (deleteResult.affectedRows === 0) {
                                                return rollbackDelete(
                                                    res,
                                                    {
                                                        sqlMessage:
                                                            'Admin could not be deleted'
                                                    }
                                                );
                                            }
                                            connection.commit(
                                                (err) => {
                                                    if (err) {
                                                        return rollbackDelete(
                                                            res,
                                                            err
                                                        );
                                                    }
                                                    return res.json({
                                                        success: true,
                                                        message: 'Admin Deleted Successfully'
                                                    });
                                                });
                                        });
                                });
                        });
                });
            });
    });
});

app.get('/GetAdminDeletionHistory', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can view deletion history'
            });
        }
        connection.query(
            ` SELECT *
            FROM admin_deletion_history
            ORDER BY Deleted_Date DESC
            `,
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message: err.sqlMessage

                    });

                }


                return res.json({
                    success: true,
                    data: result
                });

            }
        );

    });
});

app.get('/GetAdminDeletionHistoryById/:AdminDeletion_id',
    (req, res) => {

        const token = req.headers['x-access-token'];

        const AdminDeletion_id =
            req.params.AdminDeletion_id;


        if (!token) {

            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });

        }


        jwt.verify(token, secrect, (err, decoded) => {

            if (err) {

                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });

            }


            if (decoded.Role !== 'Admin') {

                return res.status(403).json({
                    success: false,
                    message:
                        'Only Admin can view deletion history'
                });

            }
            connection.query(
                `
                SELECT *
                FROM admin_deletion_history
                WHERE AdminDeletion_id = ?
                `,

                [AdminDeletion_id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }

                    if (!result.length) {
                        return res.status(404).json({
                            success: false,
                            message: 'Deletion history not found'
                        });
                    }
                    const history = result[0];
                    try {
                        history.Admin_Data =
                            history.Admin_Data
                                ? JSON.parse(
                                    history.Admin_Data
                                )
                                : null;
                    } catch (e) {
                        history.Admin_Data = null;
                    }
                    return res.json({
                        success: true,
                        data: history
                    });

                });
        });
    }
);



// app.post('/DeleteAdmin/:Admin_id', (req, res) => {
//     const token = req.headers['x-access-token'];
//     const { Password } = req.body;

//     if (!token) {
//         return res.status(401).send({
//             success: false,
//             message: "Unauthorized"
//         });
//     }

//     jwt.verify(token, secrect, (err, decoded) => {

//         if (err) {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         connection.query(
//             "SELECT * FROM admin WHERE Admin_id=?",
//             [decoded.Admin_id],
//             (err, data) => {

//                 if (err)
//                     return res.status(500).send(err);

//                 if (data.length == 0) {
//                     return res.send({
//                         success: false,
//                         message: "Admin not found"
//                     });
//                 }

//                 if (data[0].Password != Password) {
//                     return res.send({
//                         success: false,
//                         message: "Incorrect Password Not Authorized person."
//                     });
//                 }
//                 connection.query(
//                     "DELETE FROM admin WHERE Admin_id=?",
//                     [req.params.Admin_id],
//                     (err, result) => {

//                         if (err)
//                             return res.status(500).send(err);

//                         res.send({
//                             success: true,
//                             message: "Admin Deleted Successfully"
//                         });

//                     });

//             });

//     });

// });

app.get('/NumberofAdmin', (req, res) => {
    const countquery = `SELECT COUNT(*) AS TotalAdmin FROM admin`;
    connection.query(countquery, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Total Number of Admin',
                data: data
            })
        }
    });
});

app.post('/AdminDatabydate', (req, res) => {
    const Added_Date = req.body.Added_Date;
    const sqll = `select * from admin where DATE(Added_Date) = ?`;
    connection.query(sqll, [Added_Date], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Admin Data',
                data: data
            });
        }
    });
});

app.post('/AdmindatabyStatus', (req, res) => {
    const Status = req.body.Status;
    const sqll = `select * from admin where Status = ?`;
    connection.query(sqll, [Status], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Admin DAata by status.',
                data: data
            });
        }
    });
});
// Admin API End

// All Customer API 
app.post('/AddCustomer', (req, res) => {
    const Customer_Name = req.body.Customer_Name;
    const Company_Name = req.body.Company_Name;
    const Company_Address = req.body.Company_Address;
    const Delivery_Address = req.body.Delivery_Address;
    const GST_No = req.body.GST_No;
    const Customer_PhoneNo = req.body.Customer_PhoneNo;
    const Customer_Email = req.body.Customer_Email;
    const Customer_Status = req.body.Customer_Status;

    const Customer_Code = `select Customer_Code from customer order by Customer_id desc limit 1`;
    connection.query(Customer_Code, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Database Query Error');
            return
        }
        let newCode = 'CUST_1';
        if (result.length > 0 && result[0].Customer_Code) {
            const lastCode = result[0].Customer_Code;
            const numericPart = parseInt(lastCode.slice(5), 10) + 1;
            newCode = 'CUST_' + numericPart.toString().padStart(1, '0');
        }
        const insertquery = `insert into customer (Customer_Code, Customer_Name, Company_Name, Company_Address, Delivery_Address, GST_No, Customer_PhoneNo,Customer_Email,Customer_Status,Added_Date,Updated_Date) values(?,?,?,?,?,?,?,?,?,NOW(),NOW())`
        connection.query(insertquery, [newCode, Customer_Name, Company_Name, Company_Address, Delivery_Address, GST_No, Customer_PhoneNo, Customer_Email, Customer_Status], (err, result) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: err.sqlMessage,
                    data: []
                });
            } else {
                res.status(200).send({
                    success: true,
                    message: 'New Customer Added Successfully',
                    data: result
                });
            }
        });
    });
});

app.get('/AllCustomerData', (req, res) => {
    const Allcustomerquery = `select * from customer order by Customer_id desc`;
    connection.query(Allcustomerquery, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Customer Details',
                data: data
            });
        }
    });
});

app.get('/Totalnumberofcustomer', (req, res) => {
    const countquery = `select count(*) as Totalnumber from customer`;
    connection.query(countquery, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Number of Customer',
                data: data
            });
        }
    });
});

app.put('/UpdateCustomer/:Customer_id', (req, res) => {
    const Customer_id = req.params.Customer_id;
    const Customer_Name = req.body.Customer_Name;
    const Company_Name = req.body.Company_Name;
    const Company_Address = req.body.Company_Address;
    const Delivery_Address = req.body.Delivery_Address;
    const GST_No = req.body.GST_No;
    const Customer_PhoneNo = req.body.Customer_PhoneNo;
    const Customer_Email = req.body.Customer_Email;
    const Customer_Status = req.body.Customer_Status;

    const Sqlquery = `update customer set Customer_Name=?, Company_Name=?, Company_Address=?, Delivery_Address=?, GST_No=?, Customer_PhoneNo=?,  Customer_Email=?, Customer_Status=?,Updated_Date=NOW()  where Customer_id=?`;
    connection.query(Sqlquery, [Customer_Name, Company_Name, Company_Address, Delivery_Address, GST_No, Customer_PhoneNo, Customer_Email, Customer_Status, Customer_id], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Customer Updated Successfully',
                data: data
            });
        }
    });
});

app.post('/DeleteCustomerwithReason/:Customer_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const {
        Password,
        Deletion_Reason
    } = req.body;
    const Customer_id = req.params.Customer_id;
    // ==========================================
    // 1. TOKEN VALIDATION
    // ==========================================

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    // ==========================================
    // 2. DELETION REASON VALIDATION
    // ==========================================
    if (!Deletion_Reason || Deletion_Reason.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Deletion reason is required'
        });
    }
    if (Deletion_Reason.trim().length < 5) {

        return res.status(400).json({
            success: false,
            message: 'Please enter a valid deletion reason'
        });

    }
    // ==========================================
    // 3. VERIFY JWT
    // ==========================================
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        // ==========================================
        // 4. ADMIN ROLE CHECK
        // ==========================================
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can delete Vendor'
            });
        }
        // ==========================================
        // 5. GET ADMIN
        // ==========================================
        connection.query(
            'SELECT * FROM admin WHERE Admin_id = ?',
            [decoded.Admin_id],
            (err, adminData) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });
                }
                if (!adminData.length) {
                    return res.status(404).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }
                // ==========================================
                // 6. PASSWORD CHECK
                // ==========================================

                if (adminData[0].Password !== Password) {
                    return res.status(401).json({
                        success: false,
                        message: 'Incorrect Admin Password'
                    });
                }

                const adminName =
                    adminData[0].Name ||
                    adminData[0].Admin_Name ||
                    adminData[0].Username ||
                    'Admin';
                // ==========================================
                // 7. START TRANSACTION
                // ==========================================
                connection.beginTransaction((err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }
                    connection.query(
                        `
                        SELECT *
                        FROM customer
                        WHERE Customer_id = ?
                        `,
                        [Customer_id],
                        (err, CustomerData) => {
                            if (err) {
                                return rollbackDelete(
                                    res,
                                    err
                                );
                            }
                            if (!CustomerData.length) {
                                return rollbackDelete(
                                    res,
                                    {
                                        sqlMessage: 'Vendor not found'
                                    }
                                );
                            }
                            const customer = CustomerData[0];
                            const Customer_Code =
                                customer.Customer_Code ||
                                customer.Customer_Code ||
                                null;
                            connection.query(
                                `
                                INSERT INTO customer_deletion_history
                                (
                                    Customer_id	,
                                    Customer_Code,
                                    Deleted_By_Admin_id,
                                    Deleted_By_Admin_Name,
                                    Deletion_Reason,
                                    Deleted_Date,
                                    Customer_Data	
                                )
                                VALUES (?, ?, ?, ?, ?, NOW(), ?)
                                `,

                                [
                                    Customer_id,
                                    Customer_Code,
                                    decoded.Admin_id,
                                    adminName,
                                    Deletion_Reason.trim(),
                                    JSON.stringify(customer)
                                ],

                                (err) => {

                                    if (err) {
                                        return rollbackDelete(
                                            res,
                                            err
                                        );
                                    }
                                    connection.query(
                                        `
                                        DELETE FROM customer
                                        WHERE Customer_id = ?
                                        `,
                                        [Customer_id],
                                        (err, deleteResult) => {
                                            if (err) {
                                                return rollbackDelete(
                                                    res,
                                                    err
                                                );
                                            }
                                            if (deleteResult.affectedRows === 0) {
                                                return rollbackDelete(
                                                    res,
                                                    {
                                                        sqlMessage:
                                                            'Customer could not be deleted'
                                                    }
                                                );
                                            }
                                            connection.commit(
                                                (err) => {
                                                    if (err) {
                                                        return rollbackDelete(
                                                            res,
                                                            err
                                                        );
                                                    }
                                                    return res.json({
                                                        success: true,
                                                        message: 'Customer Deleted Successfully'
                                                    });
                                                });
                                        });
                                });
                        });
                });
            });
    });
});


// app.post('/Deletecustomer/:Customer_id', (req, res) => {
//     const token = req.headers['x-access-token'];
//     const { Password } = req.body;

//     if (!token) {
//         return res.status(401).send({
//             success: false,
//             message: 'Unauthorized'
//         });
//     }

//     jwt.verify(token, secrect, (err, decoded) => {

//         if (err) {
//             return res.status(401).send({
//                 success: false,
//                 message: 'Unauthorized'
//             });
//         }

//         if (decoded.Role !== "Admin") {
//             return res.status(403).send({
//                 success: false,
//                 message: 'Only Admin can delete customers.'
//             });
//         }

//         // Get logged-in admin details
//         connection.query(
//             "SELECT * FROM admin WHERE Admin_id = ?",
//             [decoded.Admin_id],
//             async (err, adminData) => {

//                 if (err) {
//                     return res.status(500).send({
//                         success: false,
//                         message: err.sqlMessage
//                     });
//                 }

//                 if (adminData.length === 0) {
//                     return res.status(404).send({
//                         success: false,
//                         message: "Admin not found."
//                     });
//                 }

//                 // Verify password
//                 if (adminData[0].Password !== Password) {
//                     return res.status(401).send({
//                         success: false,
//                         message: "Incorrect Admin Password"
//                     });
//                 }

//                 // Delete customer
//                 connection.query(
//                     "DELETE FROM customer WHERE Customer_id = ?",
//                     [req.params.Customer_id],
//                     (err, result) => {

//                         if (err) {
//                             return res.status(500).send({
//                                 success: false,
//                                 message: err.sqlMessage
//                             });
//                         }

//                         return res.send({
//                             success: true,
//                             message: "Customer Deleted Successfully"
//                         });

//                     });

//             });

//     });

// });

app.delete('/Deletecustomer/:Customer_id', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({
            success: false,
            message: 'unathorized',
            data: []
        })
    }
    else {
        jwt.verify(token, secrect, (err, decoded) => {
            if (err) {
                res.status(401).send({
                    success: false,
                    message: 'unathorized',
                    data: []
                })
            } else {
                const Customer_id = req.params.Customer_id;
                const deletesql = `delete from customer where Customer_id =?`;

                if (req.decoded.Role == "Admin") {
                    connection.query(deletesql, [Customer_id, decoded.Admin_id], (err, data) => {
                        if (err) {
                            res.status(500).send({
                                success: false,
                                message: err.sqlMessage,
                                data: []
                            })
                        } else {
                            res.status(200).send({
                                success: true,
                                message: 'Admin Deleted',
                                data: data
                            })
                        }
                    })
                } else {
                    res.status(401).send({
                        success: false,
                        message: 'unathorized',
                        data: []
                    })
                }
            }
        })

    }
});

app.post('/SearchbyCustomerName', (req, res) => {
    const Customer_Name = req.body.Customer_Name;
    const searchquery = `select * from customer where Customer_Name = ?`;
    connection.query(searchquery, [Customer_Name], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Customer Details',
                data: data
            });
        }
    });
});

app.post('/SerchCustomerbyCompanyname', (req, res) => {
    const Company_Name = req.body.Company_Name;
    const Searchquery = `select * from customer where Company_Name=?`;
    connection.query(Searchquery, [Company_Name], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Customer Details',
                data: data
            });
        }
    });
});

app.post('/Searchbydate', (req, res) => {
    const Added_Date = req.body.Added_Date;
    const searchquery = `select * from customer where  DATE(Added_Date)= ?`;
    connection.query(searchquery, [Added_Date], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Customer Details',
                data: data
            });
        }
    });
});

app.post('/DatabetweenDate', (req, res) => {
    const { fromdate, todate } = req.body;
    const datequery = `select * from customer where date(Added_Date) between ? and ?`;
    connection.query(datequery, [fromdate, todate], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Customer Details',
                data: data
            });
        }
    });
});

app.post('/SearchbyStatus', (req, res) => {
    const Customer_Status = req.body.Customer_Status;
    const statusquery = `select * from customer where Customer_Status=?`;
    connection.query(statusquery, [Customer_Status], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Customer Details',
                data: data
            });
        }
    });
});


app.get('/GetCustomerDeletionHistory', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can view deletion history'
            });
        }
        connection.query(
            `
            SELECT *
            FROM customer_deletion_history
            ORDER BY Deleted_Date DESC
            `,

            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });
                }
                return res.json({
                    success: true,
                    data: result
                });

            }
        );

    });
});

app.get('/GetCustomerDeletionHistoryById/:CustomerDeletion_id',
    (req, res) => {
        const token = req.headers['x-access-token'];
        const CustomerDeletion_id = req.params.CustomerDeletion_id;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        jwt.verify(token, secrect, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }
            if (decoded.Role !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message:
                        'Only Admin can view deletion history'
                });

            }
            connection.query(
                `
                SELECT *
                FROM customer_deletion_history
                WHERE CustomerDeletion_id = ?
                `,

                [CustomerDeletion_id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }

                    if (!result.length) {
                        return res.status(404).json({
                            success: false,
                            message: 'Deletion history not found'
                        });
                    }
                    const history = result[0];
                    try {
                        history.Customer_Data =
                            history.Customer_Data
                                ? JSON.parse(history.Customer_Data)
                                : null;
                    } catch (e) {
                        history.Customer_Data = null;
                    }
                    return res.json({
                        success: true,
                        data: history
                    });
                });
        });
    }
);
// Customer API End

// Vendor Challan
app.post('/AddVendor', (req, res) => {
    const Vendor_Name = req.body.Vendor_Name;
    const Vendor_CompanyName = req.body.Vendor_CompanyName;
    const VendorGST_No = req.body.VendorGST_No;
    const Vendor_Phoneno = req.body.Vendor_Phoneno;
    const Vendor_Email = req.body.Vendor_Email;
    const Vendor_CompanyAddress = req.body.Vendor_CompanyAddress;
    const Vendor_Status = req.body.Vendor_Status;

    const Vendor_Code = `select Vendor_Code from vendor order by Vendor_id desc limit 1`;
    connection.query(Vendor_Code, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Database Query Error');
            return
        }
        let newCode = 'VENDOR_1';
        if (result.length > 0 && result[0].Vendor_Code) {
            const lastCode = result[0].Vendor_Code;
            const numericPart = parseInt(lastCode.slice(7), 10) + 1;
            newCode = 'VENDOR_' + numericPart.toString().padStart(1, '0');
        }
        const insertquery = `insert into vendor (Vendor_Code, Vendor_Name, Vendor_CompanyName, VendorGST_No, Vendor_Phoneno,Vendor_Email,Vendor_CompanyAddress, Vendor_Status,Added_Date,Updated_Date) values(?,?,?,?,?,?,?,?,NOW(),NOW())`
        connection.query(insertquery, [newCode, Vendor_Name, Vendor_CompanyName, VendorGST_No, Vendor_Phoneno, Vendor_Email, Vendor_CompanyAddress, Vendor_Status], (err, result) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: err.sqlMessage,
                    data: []
                });
            } else {
                res.status(200).send({
                    success: true,
                    message: 'New Vendor Added Successfully',
                    data: result
                });
            }
        });
    });
});

app.get('/Allvendorsdata', (req, res) => {
    const Allvendorquery = `select * from vendor order by Vendor_id desc`;
    connection.query(Allvendorquery, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Vendor Details',
                data: data
            });
        }
    });
});

app.get('/Totalnumberofvendor', (req, res) => {
    const countquery = `select count(*) as Totalvendor from vendor`;
    connection.query(countquery, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Number of vendor',
                data: data
            });
        }
    });
});

app.put('/UpdateVendor/:Vendor_id', (req, res) => {
    const Vendor_id = req.params.Vendor_id;
    const Vendor_Name = req.body.Vendor_Name;
    const Vendor_CompanyName = req.body.Vendor_CompanyName;
    const VendorGST_No = req.body.VendorGST_No;
    const Vendor_Phoneno = req.body.Vendor_Phoneno;
    const Vendor_Email = req.body.Vendor_Email;
    const Vendor_CompanyAddress = req.body.Vendor_CompanyAddress;
    const Vendor_Status = req.body.Vendor_Status;

    const Sqlquery = `update vendor set Vendor_Name=?, Vendor_CompanyName=?, VendorGST_No=?, Vendor_Phoneno=?,Vendor_Email=?, Vendor_CompanyAddress=?, Updated_Date=NOW(), Vendor_Status=?  where Vendor_id=?`;
    connection.query(Sqlquery, [Vendor_Name, Vendor_CompanyName, VendorGST_No, Vendor_Phoneno, Vendor_Email, Vendor_CompanyAddress, Vendor_Status, Vendor_id], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Vendor Updated Successfully',
                data: data
            });
        }
    });
});

app.post('/Deletevendor/:Vendor_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const { Password } = req.body;

    if (!token) {
        return res.status(401).send({
            success: false,
            message: 'Unauthorized'
        });
    }

    jwt.verify(token, secrect, (err, decoded) => {

        if (err) {
            return res.status(401).send({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (decoded.Role !== "Admin") {
            return res.status(403).send({
                success: false,
                message: 'Only Admin can delete customers.'
            });
        }

        // Get logged-in admin details
        connection.query(
            "SELECT * FROM admin WHERE Admin_id = ?",
            [decoded.Admin_id],
            async (err, adminData) => {

                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: err.sqlMessage
                    });
                }

                if (adminData.length === 0) {
                    return res.status(404).send({
                        success: false,
                        message: "Admin not found."
                    });
                }

                // Verify password
                if (adminData[0].Password !== Password) {
                    return res.status(401).send({
                        success: false,
                        message: "Incorrect Admin Password"
                    });
                }

                // Delete customer
                connection.query(
                    "DELETE FROM vendor WHERE Vendor_id = ?",
                    [req.params.Vendor_id],
                    (err, result) => {

                        if (err) {
                            return res.status(500).send({
                                success: false,
                                message: err.sqlMessage
                            });
                        }

                        return res.send({
                            success: true,
                            message: "Vendor Deleted Successfully"
                        });

                    });

            });

    });

});

app.post('/DeletevendorwithReason/:Vendor_id', (req, res) => {

    const token = req.headers['x-access-token'];

    const {
        Password,
        Deletion_Reason
    } = req.body;

    const Vendor_id = req.params.Vendor_id;


    // ==========================================
    // 1. TOKEN VALIDATION
    // ==========================================

    if (!token) {

        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });

    }


    // ==========================================
    // 2. DELETION REASON VALIDATION
    // ==========================================

    if (!Deletion_Reason || Deletion_Reason.trim() === '') {

        return res.status(400).json({
            success: false,
            message: 'Deletion reason is required'
        });

    }


    if (Deletion_Reason.trim().length < 5) {

        return res.status(400).json({
            success: false,
            message: 'Please enter a valid deletion reason'
        });

    }


    // ==========================================
    // 3. VERIFY JWT
    // ==========================================

    jwt.verify(token, secrect, (err, decoded) => {

        if (err) {

            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });

        }


        // ==========================================
        // 4. ADMIN ROLE CHECK
        // ==========================================

        if (decoded.Role !== 'Admin') {

            return res.status(403).json({
                success: false,
                message: 'Only Admin can delete Vendor'
            });

        }


        // ==========================================
        // 5. GET ADMIN
        // ==========================================

        connection.query(
            'SELECT * FROM admin WHERE Admin_id = ?',
            [decoded.Admin_id],

            (err, adminData) => {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });

                }


                if (!adminData.length) {

                    return res.status(404).json({
                        success: false,
                        message: 'Admin not found'
                    });

                }


                // ==========================================
                // 6. PASSWORD CHECK
                // ==========================================

                if (adminData[0].Password !== Password) {

                    return res.status(401).json({
                        success: false,
                        message: 'Incorrect Admin Password'
                    });

                }


                const adminName =
                    adminData[0].Name ||
                    adminData[0].Admin_Name ||
                    adminData[0].Username ||
                    'Admin';


                // ==========================================
                // 7. START TRANSACTION
                // ==========================================

                connection.beginTransaction((err) => {

                    if (err) {

                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });

                    }
                    connection.query(
                        `
                        SELECT *
                        FROM vendor
                        WHERE Vendor_id = ?
                        `,
                        [Vendor_id],
                        (err, vendorData) => {
                            if (err) {
                                return rollbackDelete(
                                    res,
                                    err
                                );
                            }
                            if (!vendorData.length) {
                                return rollbackDelete(
                                    res,
                                    {
                                        sqlMessage: 'Vendor not found'
                                    }
                                );
                            }
                            const vendor = vendorData[0];
                            const vendorCode =
                                vendor.Vendor_Code ||
                                vendor.VendorCode ||
                                null;
                            connection.query(
                                `
                                INSERT INTO vendor_deletion_history
                                (
                                    Vendor_id,
                                    Vendor_Code,
                                    Deleted_By_Admin_id,
                                    Deleted_By_Admin_Name,
                                    Deletion_Reason,
                                    Deleted_Date,
                                    Vendor_Data
                                )
                                VALUES (?, ?, ?, ?, ?, NOW(), ?)
                                `,

                                [
                                    Vendor_id,

                                    vendorCode,

                                    decoded.Admin_id,

                                    adminName,

                                    Deletion_Reason.trim(),

                                    JSON.stringify(vendor)
                                ],

                                (err) => {

                                    if (err) {

                                        return rollbackDelete(
                                            res,
                                            err
                                        );

                                    }
                                    connection.query(
                                        `
                                        DELETE FROM vendor
                                        WHERE Vendor_id = ?
                                        `,
                                        [Vendor_id],
                                        (err, deleteResult) => {
                                            if (err) {
                                                return rollbackDelete(
                                                    res,
                                                    err
                                                );
                                            }
                                            if (deleteResult.affectedRows === 0) {
                                                return rollbackDelete(
                                                    res,
                                                    {
                                                        sqlMessage:
                                                            'Vendor could not be deleted'
                                                    }
                                                );
                                            }
                                            connection.commit(
                                                (err) => {
                                                    if (err) {
                                                        return rollbackDelete(
                                                            res,
                                                            err
                                                        );
                                                    }
                                                    return res.json({

                                                        success: true,

                                                        message:
                                                            'Vendor Deleted Successfully'

                                                    });
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            });
    });
});

// app.post('/DeletevendorwithReason/:Vendor_id', (req, res) => {
//     const token = req.headers['x-access-token'];
//     const { Password, Deletion_Reason } = req.body;
//     const Vendor_id = req.params.Vendor_id;
//     // -----------------------------------
//     // 1. Validate Token
//     // -----------------------------------
//     if (!token) {
//         return res.status(401).json({
//             success: false,
//             message: 'Unauthorized'
//         });
//     }
//     // -----------------------------------
//     // 2. Validate Deletion Reason
//     // -----------------------------------
//     if (!Deletion_Reason || Deletion_Reason.trim() === '') {
//         return res.status(400).json({
//             success: false,
//             message: 'Deletion reason is required'
//         });
//     }
//     if (Deletion_Reason.trim().length < 5) {
//         return res.status(400).json({
//             success: false,
//             message: 'Please enter a valid deletion reason'
//         });
//     }
//     // -----------------------------------
//     // 3. Verify JWT
//     // ----------------------------------
//     jwt.verify(token, secrect, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Unauthorized'
//             });
//         }
//         // -----------------------------------
//         // 4. Check Admin Role
//         // -----------------------------------
//         if (decoded.Role !== 'Admin') {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Only Admin can delete Challan'
//             });
//         }
//         // -----------------------------------
//         // 5. Get Admin
//         // -----------------------------------
//         connection.query(
//             'SELECT * FROM admin WHERE Admin_id = ?',
//             [decoded.Admin_id],
//             (err, adminData) => {
//                 if (err) {
//                     return res.status(500).json({
//                         success: false,
//                         message: err.sqlMessage
//                     });
//                 }
//                 if (!adminData.length) {
//                     return res.status(404).json({
//                         success: false,
//                         message: 'Admin not found'
//                     });
//                 }
//                 // -----------------------------------
//                 // 6. Check Password
//                 // -----------------------------------
//                 if (adminData[0].Password !== Password) {
//                     return res.status(401).json({
//                         success: false,
//                         message: 'Incorrect Admin Password'
//                     });
//                 }
//                 const adminName =
//                     adminData[0].Name ||
//                     adminData[0].Admin_Name ||
//                     adminData[0].Username ||
//                     'Admin';
//                 // -----------------------------------
//                 // 7. Start Transaction
//                 // -----------------------------------
//                 connection.beginTransaction((err) => {
//                     if (err) {
//                         return res.status(500).json({
//                             success: false,
//                             message: err.sqlMessage
//                         });
//                     }
//                     // -----------------------------------
//                     // 8. Get Challan Data
//                     // -----------------------------------
//                     connection.query(
//                         `
//                         SELECT *
//                         FROM vendor
//                         WHERE Vendor_id = ?
//                         `,
//                         [Vendor_id],
//                         (err, challanData) => {
//                             if (err) {
//                                 return rollbackDelete(
//                                     res,
//                                     err
//                                 );
//                             }

//                             if (!challanData.length) {
//                                 return rollbackDelete(
//                                     res,
//                                     {
//                                         sqlMessage: 'Vendor not found'
//                                     }
//                                 );
//                             }

//                             connection.query(
//                                 `
//                                                         DELETE FROM vendor
//                                                         WHERE Vendor_id = ?
//                                                         `,
//                                 [Vendor_id],
//                                 (err) => {
//                                     if (err) {
//                                         return rollbackDelete(
//                                             res,
//                                             err
//                                         );
//                                     }
//                                     // -----------------------------------
//                                     // 13. Delete Challan
//                                     // -----------------------------------

//                                     connection.query(
//                                         `  DELETE FROM vendor
//                                                         WHERE Vendor_id = ?
//                                                                 `,
//                                         [Vendor_id],

//                                         (err) => {

//                                             if (err) {
//                                                 return rollbackDelete(
//                                                     res,
//                                                     err
//                                                 );
//                                             }
//                                             // -----------------------------------
//                                             // 14. Commit Transaction
//                                             // -----------------------------------
//                                             connection.commit(
//                                                 (err) => {
//                                                     if (err) {
//                                                         return rollbackDelete(
//                                                             res,
//                                                             err
//                                                         );
//                                                     }
//                                                     // -----------------------------------
//                                                     // SUCCESS
//                                                     // -----------------------------------
//                                                     res.json({
//                                                         success: true,
//                                                         message:
//                                                             'Vendor Deleted Successfully'
//                                                     });
//                                                 });
//                                         });
//                                 });

//                         });
//                 });
//             });
//     });
// });

app.delete('/Deletevendor/:Vendor_id', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).send({
            success: false,
            message: 'unathorized',
            data: []
        })
    }
    else {
        jwt.verify(token, secrect, (err, decoded) => {
            if (err) {
                res.status(401).send({
                    success: false,
                    message: 'unathorized',
                    data: []
                })
            } else {
                const Vendor_id = req.params.Vendor_id;
                const deletesql = `delete from vendor where Vendor_id =?`;

                if (req.decoded.Role == "Admin") {
                    connection.query(deletesql, [Vendor_id, decoded.Admin_id], (err, data) => {
                        if (err) {
                            res.status(500).send({
                                success: false,
                                message: err.sqlMessage,
                                data: []
                            })
                        } else {
                            res.status(200).send({
                                success: true,
                                message: 'Admin Deleted',
                                data: data
                            })
                        }
                    })
                } else {
                    res.status(401).send({
                        success: false,
                        message: 'unathorized',
                        data: []
                    })
                }
            }
        })

    }
});

app.post('/SearchbyvendorName', (req, res) => {
    const Vendor_Name = req.body.Vendor_Name;
    const searchquery = `select * from vendor where Vendor_Name = ?`;
    connection.query(searchquery, [Vendor_Name], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'vendor Details',
                data: data
            });
        }
    });
});

app.post('/SerchvendorbyCompanyname', (req, res) => {
    const Vendor_CompanyName = req.body.Vendor_CompanyName;
    const Searchquery = `select * from vendor where Vendor_CompanyName=?`;
    connection.query(Searchquery, [Vendor_CompanyName], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Customer Details',
                data: data
            });
        }
    });
});

app.post('/SearchVendorbydate', (req, res) => {
    const Added_Date = req.body.Added_Date;
    const searchquery = `select * from vendor where DATE(Added_Date)= ?`;
    connection.query(searchquery, [Added_Date], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Customer Details',
                data: data
            });
        }
    });
});

app.post('/VendorDatabetweenDate', (req, res) => {
    const { fromdate, todate } = req.body;
    const datequery = `select * from vendor where date(Added_Date) between ? and ?`;
    connection.query(datequery, [fromdate, todate], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Vendor Details',
                data: data
            });
        }
    });
});

app.post('/SearchVendorbyStatus', (req, res) => {
    const Vendor_Status = req.body.Vendor_Status;
    const statusquery = `select * from vendor where Vendor_Status=?`;
    connection.query(statusquery, [Vendor_Status], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Vendor Details',
                data: data
            });
        }
    });
});
// Vendor Challan End

// Inlet challan API
// app.post("/AddInletchallan", (req, res) => {
//     const {
//         Customer_Name,
//         Company_Name,
//         Company_Address,
//         GST_No,
//         Delivery_Address,

//         Mode_of_Transport,
//         Transporter_Name,
//         Vehicle_Number,
//         Remark,
//         Work_Status,
//         Delivery_Status,
//         Challan_Status,
//         Discount_Amount = 0,
//         items
//     } = req.body;

//     if (!items || !items.length) {
//         return res.status(400).json({ message: "Products Required" });
//     }

//     // const datePart = Challan_Code.split("_")[0];
//     const today = new Date();

//     const datePart =
//         today.getFullYear().toString() +
//         String(today.getMonth() + 1).padStart(2, "0")
//     // const datePart =
//     //     today.getFullYear().toString() +
//     //     String(today.getMonth() + 1).padStart(2, "0") +
//     //     String(today.getDate()).padStart(2, "0");

//     const qNoSql = `
//                     SELECT Challan_Code 
//                     FROM inletchallan 
//                     WHERE Challan_Code LIKE 'CH_${datePart}_%' 
//                     ORDER BY Challan_id DESC
//                     LIMIT 1
//                     `;
//     connection.query(qNoSql, (err, result) => {
//         if (err) return res.status(500).send(err);
//         let NewCode = `CH_${datePart}_01`;
//         if (result.length) {
//             const last = parseInt(result[0].Challan_Code.split("_")[2]);
//             const next = String(last + 1).padStart(2, "0");
//             NewCode = `CH_${datePart}_${next}`;
//         }
//         console.log("New Challan :", NewCode);
//         let SubTotal = 0;
//         items.forEach(i => {
//             SubTotal += i.Rate * i.Product_Quantity;
//         });
//         const Total_Amount = SubTotal - Discount_Amount;
//         const CGST_amount = Total_Amount * 0.09;
//         const SGST_amount = Total_Amount * 0.09;
//         const Grand_Total =
//             Total_Amount + CGST_amount + SGST_amount;
//         const InletSql = `
//       INSERT INTO inletchallan
//       (Challan_Code, Customer_Name, Company_Name, Company_Address, GST_No, Delivery_Address,
//         Sub_Total, Total_Amount, Discount_Amount, CGST_amount, SGST_amount, Grand_Total,
//        Mode_of_Transport,Transporter_Name,  Vehicle_Number, Remark, Work_Status, Delivery_Status, Challan_Status, Added_Date,Updated_Date)
//       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
//     `;
//         const inletValues = [
//             NewCode,
//             Customer_Name,
//             Company_Name,
//             Company_Address,
//             GST_No,
//             Delivery_Address,
//             SubTotal,
//             Total_Amount,
//             Discount_Amount,
//             CGST_amount,
//             SGST_amount,
//             Grand_Total,
//             Mode_of_Transport,
//             Transporter_Name,
//             Vehicle_Number,
//             Remark,
//             Work_Status,
//             Delivery_Status,
//             Challan_Status,
//         ];

//         connection.query(InletSql, inletValues, (err, qResult) => {
//             if (err) return res.status(500).send(err);
//             const Challan_id = qResult.insertId;
//             const itemSql = `INSERT INTO inletproducts
//         (Challan_id, Product_Name, HSN_Code,
//          Product_Quantity, Rate, SubTotal)
//         VALUES ?`;
//             const itemValues = items.map(i => [
//                 Challan_id,
//                 i.Product_Name,
//                 i.HSN_Code,
//                 i.Product_Quantity,
//                 i.Rate,
//                 i.Rate * i.Product_Quantity
//             ]);
//             connection.query(itemSql, [itemValues], err => {
//                 if (err) return res.status(500).send(err);
//                 res.json({
//                     success: true,
//                     message: "Inlet Challan with multiple products Added",
//                     Challan_Code: NewCode
//                 });
//             });
//         });
//     });
// });

// app.post("/AddInletchallan", (req, res) => {
//     const {

//         Sales_Order_Number,

//         Customer_Name,
//         Company_Name,
//         Company_Address,
//         GST_No,
//         Delivery_Address,

//         Mode_of_Transport,
//         Transporter_Name,
//         Vehicle_Number,
//         Remark,
//         Work_Status,
//         Delivery_Status,
//         Challan_Status,
//         Discount_Amount = 0,
//         items
//     } = req.body;

//     if (!items || !items.length) {
//         return res.status(400).json({ message: "Products Required" });
//     }

//     // const datePart = Challan_Code.split("_")[0];
//     const today = new Date();

//     const datePart = today.getFullYear().toString() + String(today.getMonth() + 1).padStart(2, "0")
//     // const datePart =
//     //     today.getFullYear().toString() +
//     //     String(today.getMonth() + 1).padStart(2, "0") +
//     //     String(today.getDate()).padStart(2, "0");

//     const qNoSql = `
//                     SELECT Challan_Code 
//                     FROM inletchallan 
//                     WHERE Challan_Code LIKE 'CH_${datePart}_%' 
//                     ORDER BY Challan_id DESC
//                     LIMIT 1
//                     `;
//     connection.query(qNoSql, (err, result) => {
//         if (err) return res.status(500).send(err);
//         let NewCode = `CH_${datePart}_01`;
//         if (result.length) {
//             const last = parseInt(result[0].Challan_Code.split("_")[2]);
//             const next = String(last + 1).padStart(2, "0");
//             NewCode = `CH_${datePart}_${next}`;
//         }
//         console.log("New Challan :", NewCode);
//         let SubTotal = 0;
//         items.forEach(i => {
//             SubTotal += i.Rate * i.Product_Quantity;
//         });
//         const Total_Amount = SubTotal - Discount_Amount;
//         const CGST_amount = Total_Amount * 0.09;
//         const SGST_amount = Total_Amount * 0.09;
//         const Grand_Total =
//             Total_Amount + CGST_amount + SGST_amount;
//         const InletSql = `
//       INSERT INTO inletchallan
//       (Challan_Code, Sales_Order_Number, Customer_Name, Company_Name, Company_Address, GST_No, Delivery_Address,
//         Sub_Total, Total_Amount, Discount_Amount, CGST_amount, SGST_amount, Grand_Total,
//        Mode_of_Transport,Transporter_Name,  Vehicle_Number, Remark, Work_Status, Delivery_Status, Challan_Status, Added_Date,Updated_Date)
//       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
//     `;
//         const inletValues = [
//             NewCode,
//             Sales_Order_Number,
//             Customer_Name,
//             Company_Name,
//             Company_Address,
//             GST_No,
//             Delivery_Address,
//             SubTotal,
//             Total_Amount,
//             Discount_Amount,
//             CGST_amount,
//             SGST_amount,
//             Grand_Total,
//             Mode_of_Transport,
//             Transporter_Name,
//             Vehicle_Number,
//             Remark,
//             Work_Status,
//             Delivery_Status,
//             Challan_Status,
//         ];

//         connection.query(InletSql, inletValues, (err, qResult) => {
//             if (err) return res.status(500).send(err);
//             const Challan_id = qResult.insertId;

//             const itemSql = `
//   INSERT INTO inletproducts
//     (
//       Challan_id,
//       SalesOrderItem_id,
//       Product_Name,
//       HSN_Code,
//       Product_Quantity,
//       Rate,
//       SubTotal
//     )
//   VALUES ?
// `;
//             const itemValues = items.map(i => [
//                 Challan_id,
//                 i.SalesOrderItem_id || null,
//                 i.Product_Name,
//                 i.HSN_Code,
//                 Number(i.Product_Quantity),
//                 Number(i.Rate),
//                 Number(i.Product_Quantity) * Number(i.Rate)
//             ]);

//             //     const itemSql = `INSERT INTO inletproducts
//             // (Challan_id, Product_Name, HSN_Code,
//             //  Product_Quantity, Rate, SubTotal)
//             // VALUES ?`;
//             //     const itemValues = items.map(i => [
//             //         Challan_id,
//             //         i.Product_Name,
//             //         i.HSN_Code,
//             //         i.Product_Quantity,
//             //         i.Rate,
//             //         i.Rate * i.Product_Quantity
//             //     ]);
//             connection.query(itemSql, [itemValues], err => {
//                 if (err) return res.status(500).send(err);
//                 res.json({
//                     success: true,
//                     message: "Inlet Challan with multiple products Added",
//                     Challan_Code: NewCode
//                 });

//             });

//         });
//     });
// });

// app.post("/AddInletchallan", (req, res) => {
//     const {
//         Sales_Order_Number,
//         Customer_Name,
//         Company_Name,
//         Company_Address,
//         GST_No,
//         Delivery_Address,
//         Mode_of_Transport,
//         Transporter_Name,
//         Vehicle_Number,
//         Remark,
//         Work_Status,
//         Delivery_Status,
//         Challan_Status,
//         Discount_Amount = 0,
//         items
//     } = req.body;

//     if (!items || !items.length) {
//         return res.status(400).json({
//             success: false,
//             message: "Products Required"
//         });
//     }

//     const today = new Date();

//     const datePart =
//         today.getFullYear().toString() +
//         String(today.getMonth() + 1).padStart(2, "0");

//     const qNoSql = `
//         SELECT Challan_Code
//         FROM inletchallan
//         WHERE Challan_Code LIKE ?
//         ORDER BY Challan_id DESC
//         LIMIT 1
//     `;

//     connection.query(
//         qNoSql,
//         [`CH_${datePart}_%`],
//         (err, result) => {
//             if (err) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Failed to generate Challan Code",
//                     error: err.message
//                 });
//             }

//             let NewCode = `CH_${datePart}_01`;

//             if (result.length) {
//                 const last = parseInt(
//                     result[0].Challan_Code.split("_")[2],
//                     10
//                 );

//                 NewCode =
//                     `CH_${datePart}_${String(last + 1).padStart(2, "0")}`;
//             }

//             let SubTotal = 0;

//             items.forEach(i => {
//                 SubTotal +=
//                     Number(i.Rate) * Number(i.Product_Quantity);
//             });

//             const Total_Amount =
//                 SubTotal - Number(Discount_Amount);

//             const CGST_amount = Total_Amount * 0.09;
//             const SGST_amount = Total_Amount * 0.09;

//             const Grand_Total =
//                 Total_Amount + CGST_amount + SGST_amount;

//             const InletSql = `
//                 INSERT INTO inletchallan
//                 (
//                     Challan_Code,
//                     Sales_Order_Number,
//                     Customer_Name,
//                     Company_Name,
//                     Company_Address,
//                     GST_No,
//                     Delivery_Address,
//                     Sub_Total,
//                     Total_Amount,
//                     Discount_Amount,
//                     CGST_amount,
//                     SGST_amount,
//                     Grand_Total,
//                     Mode_of_Transport,
//                     Transporter_Name,
//                     Vehicle_Number,
//                     Remark,
//                     Work_Status,
//                     Delivery_Status,
//                     Challan_Status,
//                     Added_Date,
//                     Updated_Date
//                 )
//                 VALUES (
//                     ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
//                     ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
//                 )
//             `;

//             const inletValues = [
//                 NewCode,
//                 Sales_Order_Number || null,
//                 Customer_Name,
//                 Company_Name,
//                 Company_Address,
//                 GST_No,
//                 Delivery_Address,
//                 SubTotal,
//                 Total_Amount,
//                 Discount_Amount,
//                 CGST_amount,
//                 SGST_amount,
//                 Grand_Total,
//                 Mode_of_Transport,
//                 Transporter_Name,
//                 Vehicle_Number,
//                 Remark,
//                 Work_Status,
//                 Delivery_Status,
//                 Challan_Status
//             ];
//             // Check status BEFORE inserting the Inlet Challan.
//             const checkOrderSql = `
//     SELECT Sales_Order_Status
//     FROM salesorder
//     WHERE Sales_Order_Number = ?
//     LIMIT 1
// `;

//             connection.query(
//                 checkOrderSql,
//                 [Sales_Order_Number],
//                 (statusErr, orders) => {
//                     if (statusErr) {
//                         return res.status(500).json({
//                             success: false,
//                             message: 'Failed to check Sales Order status.'
//                         });
//                     }

//                     if (!orders.length) {
//                         return res.status(404).json({
//                             success: false,
//                             message: 'Sales Order not found.'
//                         });
//                     }

//                     if (orders[0].Sales_Order_Status !== 'Confirm') {
//                         return res.status(400).json({
//                             success: false,
//                             message:
//                                 'Please confirm the Sales Order before creating an Inlet Challan.'
//                         });
//                     }
//                 })
//             connection.query(
//                 InletSql,
//                 inletValues,
//                 (err, qResult) => {
//                     if (err) {
//                         return res.status(500).json({
//                             success: false,
//                             message: "Failed to create Inlet Challan",
//                             error: err.message
//                         });
//                     }

//                     const Challan_id = qResult.insertId;

//                     // Validate and prepare ALL products in the challan.
//                     const productValues = [];

//                     for (const item of items) {
//                         const ordered = Number(item.Ordered_Quantity ?? item.Product_Quantity) || 0;
//                         const productQuantity = Number(item.Product_Quantity) || 0;
//                         const produced = Number(item.Produced_Quantity) || 0;
//                         const damaged = Number(item.Damaged_Quantity) || 0;
//                         const faulty = Number(item.Faulty_Quantity) || 0;
//                         const rate = Number(item.Rate) || 0;

//                         // Validate quantities and rate.
//                         const quantities = [
//                             ordered,
//                             productQuantity,
//                             produced,
//                             damaged,
//                             faulty
//                         ];

//                         if (
//                             quantities.some(q => !Number.isFinite(q) || q < 0 || !Number.isInteger(q)) ||
//                             !Number.isFinite(rate) ||
//                             rate < 0
//                         ) {
//                             return res.status(400).json({
//                                 success: false,
//                                 message: `Invalid quantity or rate for ${item.Product_Name}`
//                             });
//                         }

//                         if (damaged + faulty > produced) {
//                             return res.status(400).json({
//                                 success: false,
//                                 message: `Damaged and faulty quantities cannot exceed produced quantity for ${item.Product_Name}`
//                             });
//                         }

//                         const good = produced - damaged - faulty;
//                         const extra = Math.max(good - ordered, 0);
//                         const productSubtotal = productQuantity * rate;

//                         productValues.push([
//                             Challan_id,
//                             item.SalesOrderItem_id || null,
//                             item.Product_Name,
//                             item.HSN_Code || null,
//                             productQuantity,
//                             ordered,
//                             produced,
//                             damaged,
//                             faulty,
//                             good,
//                             extra,
//                             rate,
//                             productSubtotal
//                         ]);
//                     }

//                     if (productValues.length === 0) {
//                         return res.status(400).json({
//                             success: false,
//                             message: "Please add at least one product."
//                         });
//                     }

//                     // IMPORTANT: Use VALUES ? for multiple rows.
//                     // Pass [productValues], because productValues is an array of rows.
//                     const itemSql = `
//     INSERT INTO inletproducts (
//         Challan_id,
//         SalesOrderItem_id,
//         Product_Name,
//         HSN_Code,
//         Product_Quantity,
//         Ordered_Quantity,
//         Produced_Quantity,
//         Damaged_Quantity,
//         Faulty_Quantity,
//         Good_Quantity,
//         Extra_Quantity,
//         Rate,
//         SubTotal
//     )
//     VALUES ?
// `;
//                     connection.query(itemSql, [productValues], (err) => {
//                         if (err) {
//                             console.error("Inlet product insertion failed:", err);

//                             return res.status(500).json({
//                                 success: false,
//                                 message: "Challan created, but product insertion failed",
//                                 error: err.message
//                             });
//                         }

//                         function updateExtraStocks(index) {
//                             if (index >= items.length) {
//                                 // All products have been checked and their extra
//                                 // stock has been updated.

//                                 if (!Sales_Order_Number) {
//                                     return res.json({
//                                         success: true,
//                                         message: "Inlet Challan and extra stock updated successfully.",
//                                         Challan_Code: NewCode,
//                                         Challan_id
//                                     });
//                                 }

//                                 const updateOrderSql = `
//             UPDATE salesorder
//             SET Sales_Order_Status = 'In Production'
//             WHERE Sales_Order_Number = ?
//               AND Sales_Order_Status = 'Confirm'
//         `;

//                                 return connection.query(
//                                     updateOrderSql,
//                                     [Sales_Order_Number],
//                                     (updateErr, updateResult) => {
//                                         if (updateErr) {
//                                             return res.status(500).json({
//                                                 success: false,
//                                                 message: "Challan created, but Sales Order update failed.",
//                                                 error: updateErr.message
//                                             });
//                                         }

//                                         return res.json({
//                                             success: true,
//                                             message: "Inlet Challan and extra stock updated successfully.",
//                                             Challan_Code: NewCode,
//                                             Challan_id,
//                                             Sales_Order_Status:
//                                                 updateResult.affectedRows > 0
//                                                     ? "In Production"
//                                                     : "Unchanged"
//                                         });
//                                     }
//                                 );
//                             }

//                             const product = items[index];
//                             const extra = Number(product.Extra_Quantity) || 0;

//                             // Nothing extra to add for this product.
//                             if (extra <= 0) {
//                                 return updateExtraStocks(index + 1);
//                             }

//                             const alreadyPosted =
//                                 Number(product.ExtraStock_Posted_Quantity) || 0;

//                             const pendingExtra = Math.max(
//                                 0,
//                                 extra - alreadyPosted
//                             );

//                             if (pendingExtra === 0) {
//                                 return res.json({
//                                     success: true,
//                                     message: "Production updated successfully",
//                                     Good_Quantity: good,
//                                     Extra_Quantity: extra
//                                 });
//                             }
// const newExtraToPost = Math.max(
//     0,
//     extra - Number(existingProduct.ExtraStock_Posted_Quantity || 0)
// );




//                             addExtraStock(
//                                 {
//                                     Product_id: existingProduct.Product_id,
//                                     Product_Name: existingProduct.Product_Name,
//                                     HSN_Code: existingProduct.HSN_Code
//                                 },
//                                 newExtraToPost,
//                                 connection,
//                                 (err) => {
//                                     if (err) {
//                                         return connection.rollback(() => {
//                                             connection.release();
//                                             res.status(500).json({
//                                                 success: false,
//                                                 message: "Error updating extra stock",
//                                                 error: err
//                                             });
//                                         });
//                                     }

//                                     // Update the inlet product after stock is successfully updated.
//                                     const updateProductSql = `
//             UPDATE inletproducts
//             SET
//                 Produced_Quantity = ?,
//                 Damaged_Quantity = ?,
//                 Faulty_Quantity = ?,
//                 Good_Quantity = ?,
//                 Extra_Quantity = ?,
//                 ExtraStock_Posted_Quantity =
//                     ExtraStock_Posted_Quantity + ?
//             WHERE InletProduct_id = ?
//         `;

//                                     connection.query(
//                                         updateProductSql,
//                                         [
//                                             produced,
//                                             damaged,
//                                             faulty,
//                                             good,
//                                             extra,
//                                             newExtraToPost,
//                                             existingProduct.InletProduct_id
//                                         ],
//                                         (updateErr) => {
//                                             if (updateErr) {
//                                                 return connection.rollback(() => {
//                                                     connection.release();
//                                                     res.status(500).json({
//                                                         success: false,
//                                                         message: "Production update failed"
//                                                     });
//                                                 });
//                                             }

//                                             connection.commit((commitErr) => {
//                                                 connection.release();

//                                                 if (commitErr) {
//                                                     return res.status(500).json({
//                                                         success: false,
//                                                         message: "Transaction commit failed"
//                                                     });
//                                                 }

//                                                 res.json({
//                                                     success: true,
//                                                     message: "Production and extra stock updated successfully",
//                                                     Good_Quantity: good,
//                                                     Extra_Quantity: extra,
//                                                     Added_To_Stock: newExtraToPost
//                                                 });
//                                             });
//                                         }
//                                     );
//                                 }
//                             );

//                             // addExtraStock(product, extra, (stockErr) => {
//                             //     if (stockErr) {
//                             //         console.error("Extra stock update failed:", stockErr);

//                             //         return res.status(500).json({
//                             //             success: false,
//                             //             message: "Challan products were added, but extra stock could not be updated.",
//                             //             Challan_Code: NewCode,
//                             //             Challan_id,
//                             //             error: stockErr.message
//                             //         });
//                             //     }

//                             //     updateExtraStocks(index + 1);
//                             // });
//                         }



//                         updateExtraStocks(0);

//                         // Update the sales order only after every product is inserted.
//                         if (!Sales_Order_Number) {
//                             return res.json({
//                                 success: true,
//                                 message: "Inlet Challan with multiple products added successfully.",
//                                 Challan_Code: NewCode,
//                                 Challan_id
//                             });
//                         }

//                         const updateOrderSql = `
//         UPDATE salesorder
//         SET Sales_Order_Status = 'In Production'
//         WHERE Sales_Order_Number = ?
//           AND Sales_Order_Status = 'Confirm'
//     `;

//                         connection.query(
//                             updateOrderSql,
//                             [Sales_Order_Number],
//                             (updateErr, updateResult) => {
//                                 if (updateErr) {
//                                     console.error("Sales order update failed:", updateErr);

//                                     return res.status(500).json({
//                                         success: false,
//                                         message: "Challan and products created, but Sales Order status update failed.",
//                                         Challan_Code: NewCode,
//                                         Challan_id,
//                                         error: updateErr.message
//                                     });
//                                 }

//                                 return res.json({
//                                     success: true,
//                                     message: "Inlet Challan created successfully.",
//                                     Challan_Code: NewCode,
//                                     Challan_id,
//                                     Sales_Order_Status: updateResult.affectedRows > 0
//                                         ? "In Production"
//                                         : "Unchanged"
//                                 });
//                             }
//                         );
//                     });
//                 }
//             );
//         }
//     );
// });

// Promise helper for your existing mysql.createConnection() connection.
function queryAsync(conn, sql, values = []) {
    return new Promise((resolve, reject) => {
        conn.query(sql, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function beginTransactionAsync(conn) {
    return new Promise((resolve, reject) => {
        conn.beginTransaction(err => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function commitAsync(conn) {
    return new Promise((resolve, reject) => {
        conn.commit(err => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function rollbackAsync(conn) {
    return new Promise(resolve => {
        conn.rollback(() => resolve());
    });
}
async function updateManufacturedExtraStock(conn, item) {

    const newExtra = Number(item.Extra_Quantity) || 0;

    const oldPostedExtra =
        Number(item.ExtraStock_Posted_Quantity) || 0;

    const difference = newExtra - oldPostedExtra;

    if (difference === 0) {
        return;
    }

    const stockSql = `
        UPDATE product_excess_stock
        SET Available_Quantity = Available_Quantity + ?
        WHERE Product_Name = ?
          AND (
              HSN_Code = ?
              OR (HSN_Code IS NULL AND ? IS NULL)
          )
    `;

    await queryAsync(conn, stockSql, [
        difference,
        item.Product_Name,
        item.HSN_Code,
        item.HSN_Code
    ]);

    if (difference < 0) {
        // The UPDATE above must not leave negative stock.
        const checkSql = `
            SELECT Available_Quantity
            FROM product_excess_stock
            WHERE Product_Name = ?
              AND (
                  HSN_Code = ?
                  OR (HSN_Code IS NULL AND ? IS NULL)
              )
            FOR UPDATE
        `;

        const result = await queryAsync(conn, checkSql, [
            item.Product_Name,
            item.HSN_Code,
            item.HSN_Code
        ]);

        if (!result.length ||
            Number(result[0].Available_Quantity) < 0) {
            throw new Error(
                'Cannot reduce extra stock because it has already been consumed'
            );
        }
    }
}

// CREATE INLET CHALLAN
app.post("/AddInletchallan", async (req, res) => {

    const {
        Sales_Order_Number,
        Customer_Name,
        Company_Name,
        Company_Address,
        GST_No,
        Delivery_Address,
        Mode_of_Transport,
        Transporter_Name,
        Vehicle_Number,
        Remark,
        Work_Status = "In Queue",
        Delivery_Status = "Not Delivered",
        Challan_Status = "Open",
        Discount_Amount = 0,
        items
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Products Required"
        });
    }

    const discount = Number(Discount_Amount);

    if (!Number.isFinite(discount) || discount < 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid discount amount"
        });
    }

    // Validate all products before starting database changes.
    for (const item of items) {
        const productName = String(item.Product_Name || "").trim();
        const ordered = Number(
            item.Ordered_Quantity ?? item.Product_Quantity
        );
        const productQty = Number(item.Product_Quantity);
        const rate = Number(item.Rate);

        if (
            !productName ||
            !Number.isInteger(ordered) ||
            ordered <= 0 ||
            !Number.isInteger(productQty) ||
            productQty <= 0 ||
            !Number.isFinite(rate) ||
            rate < 0
        ) {
            return res.status(400).json({
                success: false,
                message: `Invalid product, quantity or rate for ${productName || "product"}`
            });
        }
    }

    // IMPORTANT:
    // Use the existing mysql.createConnection() connection.
    // Do not call getConnection() or release() here.
    const conn = connection;

    try {
        await beginTransactionAsync(conn);

        // 1. Check Sales Order status inside the transaction.
        if (Sales_Order_Number) {
            const orders = await queryAsync(
                conn,
                `SELECT Sales_Order_Status
                 FROM salesorder
                 WHERE Sales_Order_Number = ?
                 FOR UPDATE`,
                [Sales_Order_Number]
            );

            if (!orders.length) {
                throw new Error("Sales Order not found.");
            }

            if (orders[0].Sales_Order_Status !== "Confirm") {
                throw new Error(
                    "Please confirm the Sales Order before creating an Inlet Challan."
                );
            }
        }

        // 2. Generate Challan Code.
        const today = new Date();

        const datePart =
            today.getFullYear().toString() +
            String(today.getMonth() + 1).padStart(2, "0");

        const lastCodeRows = await queryAsync(
            conn,
            `SELECT Challan_Code
             FROM inletchallan
             WHERE Challan_Code LIKE ?
             ORDER BY Challan_id DESC
             LIMIT 1
             FOR UPDATE`,
            [`CH_${datePart}_%`]
        );

        let nextNumber = 1;

        if (lastCodeRows.length) {
            const lastNumber = Number(
                lastCodeRows[0].Challan_Code.split("_")[2]
            );

            nextNumber = lastNumber + 1;
        }

        const NewCode =
            `CH_${datePart}_${String(nextNumber).padStart(2, "0")}`;

        // 3. Calculate totals.
        const SubTotal = items.reduce((sum, item) => {
            return sum +
                Number(item.Rate) * Number(item.Product_Quantity);
        }, 0);

        const Total_Amount = SubTotal - discount;

        if (Total_Amount < 0) {
            throw new Error("Discount cannot exceed subtotal.");
        }

        const CGST_amount = Total_Amount * 0.09;
        const SGST_amount = Total_Amount * 0.09;
        const Grand_Total =
            Total_Amount + CGST_amount + SGST_amount;

        // 4. Insert the challan.
        const inletResult = await queryAsync(
            conn,
            `INSERT INTO inletchallan (
                Challan_Code,
                Sales_Order_Number,
                Customer_Name,
                Company_Name,
                Company_Address,
                GST_No,
                Delivery_Address,
                Sub_Total,
                Total_Amount,
                Discount_Amount,
                CGST_amount,
                SGST_amount,
                Grand_Total,
                Mode_of_Transport,
                Transporter_Name,
                Vehicle_Number,
                Remark,
                Work_Status,
                Delivery_Status,
                Challan_Status,
                Added_Date,
                Updated_Date
            )
            VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
            )`,
            [
                NewCode,
                Sales_Order_Number || null,
                Customer_Name,
                Company_Name,
                Company_Address,
                GST_No,
                Delivery_Address,
                SubTotal,
                Total_Amount,
                discount,
                CGST_amount,
                SGST_amount,
                Grand_Total,
                Mode_of_Transport,
                Transporter_Name,
                Vehicle_Number,
                Remark,
                Work_Status,
                Delivery_Status,
                Challan_Status
            ]
        );

        const Challan_id = inletResult.insertId;

        const productValues = [];
        const stockDetails = [];

        // 5. Lock and deduct stock for each product.
        for (const item of items) {

            const productName = String(item.Product_Name).trim();
            const hsn = String(item.HSN_Code || "").trim();

            const ordered = Number(
                item.Ordered_Quantity ?? item.Product_Quantity
            );

            const productQty = Number(item.Product_Quantity);
            const rate = Number(item.Rate);

            // Always initialize production at zero during challan creation.
            const produced = 0;
            const damaged = 0;
            const faulty = 0;
            const good = 0;
            const extra = 0;

            // Ensure a stock row exists.
            // This requires the unique Product_Name + HSN_Code key.
            await queryAsync(
                conn,
                `INSERT IGNORE INTO product_excess_stock
                 (Product_Name, HSN_Code, Available_Quantity)
                 VALUES (?, ?, 0)`,
                [productName, hsn]
            );

            // Lock the stock row so it cannot be deducted concurrently.
            const stockRows = await queryAsync(
                conn,
                `SELECT ExcessStock_id, Available_Quantity
                 FROM product_excess_stock
                 WHERE Product_Name = ?
                   AND HSN_Code = ?
                 FOR UPDATE`,
                [productName, hsn]
            );

            if (!stockRows.length) {
                throw new Error(
                    `Could not find stock record for ${productName}.`
                );
            }

            const stockRow = stockRows[0];
            const available = Math.max(
                0,
                Number(stockRow.Available_Quantity) || 0
            );

            // Deduct only the quantity available.
            const stockUsed = Math.min(ordered, available);
            const manufacturingRequired = ordered - stockUsed;

            if (stockUsed > 0) {
                const deduction = await queryAsync(
                    conn,
                    `UPDATE product_excess_stock
                     SET Available_Quantity = Available_Quantity - ?
                     WHERE ExcessStock_id = ?
                       AND Available_Quantity >= ?`,
                    [
                        stockUsed,
                        stockRow.ExcessStock_id,
                        stockUsed
                    ]
                );

                if (deduction.affectedRows !== 1) {
                    throw new Error(
                        `Stock deduction failed for ${productName}.`
                    );
                }
            }
            const productSubtotal = productQty * rate;

            // Match the column order to your inletproducts schema.
            productValues.push([
                Challan_id,
                item.SalesOrderItem_id || null,
                productName,
                hsn || null,
                productQty,
                ordered,
                available,
                stockUsed,
                manufacturingRequired,
                produced,
                damaged,
                faulty,
                good,
                extra,
                0, // ExtraStock_Posted_Quantity
                rate,
                productSubtotal
            ]);

            stockDetails.push({
                Product_Name: productName,
                Available_Extra_Stock: available,
                Stock_Used: stockUsed,
                Manufacturing_Required: manufacturingRequired,
                Remaining_Stock: available - stockUsed
            });
        }

        // 6. Insert every product.
        await queryAsync(
            conn,
            `INSERT INTO inletproducts (
                Challan_id,
                SalesOrderItem_id,
                Product_Name,
                HSN_Code,
                Product_Quantity,
                Ordered_Quantity,
                Available_Extra_Stock,
                Stock_Used,
                Manufacturing_Required,
                Produced_Quantity,
                Damaged_Quantity,
                Faulty_Quantity,
                Good_Quantity,
                Extra_Quantity,
                ExtraStock_Posted_Quantity,
                Rate,
                SubTotal
            )
            VALUES ?`,
            [productValues]
        );

        // 7. Update Sales Order only after products are inserted.
        if (Sales_Order_Number) {
            const orderUpdate = await queryAsync(
                conn,
                `UPDATE salesorder
                 SET Sales_Order_Status = 'In Production'
                 WHERE Sales_Order_Number = ?
                   AND Sales_Order_Status = 'Confirm'`,
                [Sales_Order_Number]
            );

            if (orderUpdate.affectedRows !== 1) {
                throw new Error(
                    "Sales Order status could not be updated."
                );
            }
        }

        // 8. Commit challan, products and stock deductions together.
        await commitAsync(conn);

        return res.status(201).json({
            success: true,
            message: "Inlet Challan created successfully.",
            Challan_Code: NewCode,
            Challan_id,
            Sales_Order_Status: Sales_Order_Number
                ? "In Production"
                : null,
            stockDetails
        });

    } catch (error) {

        await rollbackAsync(conn);

        console.error("AddInletchallan error:", error);

        return res.status(500).json({
            success: false,
            message: error.message ||
                "Failed to create Inlet Challan."
        });
    }
});

app.put("/UpdateInletProductProduction/:InletProduct_id", async (req, res) => {
    let conn;

    try {
        const InletProduct_id = Number(req.params.InletProduct_id);

        const produced = Number(req.body.Produced_Quantity) || 0;
        const damaged = Number(req.body.Damaged_Quantity) || 0;
        const faulty = Number(req.body.Faulty_Quantity) || 0;

        if (
            !Number.isInteger(InletProduct_id) ||
            InletProduct_id <= 0 ||
            ![produced, damaged, faulty].every(
                q => Number.isInteger(q) && q >= 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or production quantities."
            });
        }

        if (damaged + faulty > produced) {
            return res.status(400).json({
                success: false,
                message: "Damaged and faulty quantities cannot exceed produced quantity."
            });
        }

        conn = await getConnectionAsync();
        await beginTransactionAsync(conn);

        // Lock the inlet product so concurrent updates cannot post
        // the same extra quantity twice.
        const rows = await queryAsync(
            conn,
            `SELECT
                InletProduct_id,
                Product_id,
                Product_Name,
                HSN_Code,
                Manufacturing_Required,
                ExtraStock_Posted_Quantity
             FROM inletproducts
             WHERE InletProduct_id = ?
             FOR UPDATE`,
            [InletProduct_id]
        );

        if (!rows.length) {
            throw new Error("Inlet product not found.");
        }

        const existingProduct = rows[0];

        const manufacturingRequired =
            Number(existingProduct.Manufacturing_Required) || 0;

        const previousPosted =
            Number(existingProduct.ExtraStock_Posted_Quantity) || 0;

        const good = produced - damaged - faulty;

        const extra = Math.max(
            0,
            good - manufacturingRequired
        );

        // Positive delta = add more stock.
        // Negative delta = reverse previously posted stock.
        const stockDifference = extra - previousPosted;

        const productName = existingProduct.Product_Name;
        const hsn = String(existingProduct.HSN_Code || "").trim();

        if (stockDifference !== 0) {
            await queryAsync(
                conn,
                `INSERT IGNORE INTO product_excess_stock
                 (Product_id, Product_Name, HSN_Code, Available_Quantity)
                 VALUES (?, ?, ?, 0)`,
                [
                    existingProduct.Product_id || null,
                    productName,
                    hsn
                ]
            );

            const stockRows = await queryAsync(
                conn,
                `SELECT ExcessStock_id, Available_Quantity
                 FROM product_excess_stock
                 WHERE Product_Name = ? AND HSN_Code = ?
                 FOR UPDATE`,
                [productName, hsn]
            );

            if (!stockRows.length) {
                throw new Error(`Stock record not found for ${productName}`);
            }

            const available = Number(
                stockRows[0].Available_Quantity
            ) || 0;

            if (stockDifference > 0) {
                // New extra production: increase stock.
                await queryAsync(
                    conn,
                    `UPDATE product_excess_stock
                     SET Available_Quantity = Available_Quantity + ?
                     WHERE ExcessStock_id = ?`,
                    [stockDifference, stockRows[0].ExcessStock_id]
                );

            } else {
                // Production was edited and extra quantity decreased.
                const quantityToRemove = Math.abs(stockDifference);

                if (available < quantityToRemove) {
                    throw new Error(
                        `Cannot reduce extra quantity. Only ${available} pieces of ${productName} are currently available in stock.`
                    );
                }

                await queryAsync(
                    conn,
                    `UPDATE product_excess_stock
                     SET Available_Quantity = Available_Quantity - ?
                     WHERE ExcessStock_id = ?
                       AND Available_Quantity >= ?`,
                    [
                        quantityToRemove,
                        stockRows[0].ExcessStock_id,
                        quantityToRemove
                    ]
                );
            }
        }

        // Save production and the exact total extra quantity already posted.
        await queryAsync(
            conn,
            `UPDATE inletproducts
             SET
                Produced_Quantity = ?,
                Damaged_Quantity = ?,
                Faulty_Quantity = ?,
                Good_Quantity = ?,
                Extra_Quantity = ?,
                ExtraStock_Posted_Quantity = ?
             WHERE InletProduct_id = ?`,
            [
                produced,
                damaged,
                faulty,
                good,
                extra,
                extra,
                InletProduct_id
            ]
        );

        await commitAsync(conn);

        return res.json({
            success: true,
            message: "Production and extra stock updated successfully.",
            InletProduct_id,
            Manufacturing_Required: manufacturingRequired,
            Produced_Quantity: produced,
            Damaged_Quantity: damaged,
            Faulty_Quantity: faulty,
            Good_Quantity: good,
            Extra_Quantity: extra,
            Added_To_Stock: Math.max(stockDifference, 0),
            Removed_From_Stock: Math.max(-stockDifference, 0)
        });

    } catch (error) {
        if (conn) {
            await rollbackAsync(conn);
        }

        console.error("Update production error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Production update failed."
        });

    } finally {
        if (conn) conn.release();
    }
});

app.put("/UpdateaChallan/:Challan_id", (req, res) => {
    const Challan_id = Number(req.params.Challan_id);
    const token = req.headers["x-access-token"];

    if (!Number.isInteger(Challan_id) || Challan_id <= 0) {
        return res.status(400).json({ success: false, message: "Invalid Challan_id." });
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    jwt.verify(token, secrect, (authErr, decoded) => {
        if (authErr || decoded.Role !== "Admin") {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        const {
            Customer_Name, Company_Name, Company_Address, GST_No, Delivery_Address,
            Mode_of_Transport, Transporter_Name, Vehicle_Number, Remark,
            Work_Status, Delivery_Status, Challan_Status,
            Discount_Amount = 0, items
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Products are required." });
        }

        const discount = Number(Discount_Amount);
        if (!Number.isFinite(discount) || discount < 0) {
            return res.status(400).json({ success: false, message: "Invalid Discount_Amount." });
        }

        const subtotal = items.reduce((sum, p) => {
            const qty = Number(p.Product_Quantity);
            const rate = Number(p.Rate);
            return sum + qty * rate;
        }, 0);

        if (items.some(p =>
            !String(p.Product_Name || "").trim() ||
            !Number.isFinite(Number(p.Product_Quantity)) ||
            Number(p.Product_Quantity) < 0 ||
            !Number.isFinite(Number(p.Rate)) ||
            Number(p.Rate) < 0
        )) {
            return res.status(400).json({ success: false, message: "Invalid product name, quantity, or rate." });
        }

        const Total_Amount = subtotal - discount;
        const CGST_amount = Total_Amount * 0.09;
        const SGST_amount = Total_Amount * 0.09;
        const Grand_Total = Total_Amount + CGST_amount + SGST_amount;

        connection.beginTransaction(err => {
            if (err) return res.status(500).json({ success: false, message: "Could not start transaction." });

            const rollback = (status, message) =>
                connection.rollback(() => res.status(status).json({ success: false, message }));

            connection.query(
                "SELECT Challan_id FROM inletchallan WHERE Challan_id=? FOR UPDATE",
                [Challan_id],
                (err, challans) => {
                    if (err) return rollback(500, "Could not read challan.");
                    if (!challans.length) return rollback(404, "Challan not found.");

                    const headerSql = `
            UPDATE inletchallan SET
              Customer_Name=?, Company_Name=?, Company_Address=?, GST_No=?, Delivery_Address=?,
              Sub_Total=?, Total_Amount=?, Discount_Amount=?, CGST_amount=?, SGST_amount=?, Grand_Total=?,
              Mode_of_Transport=?, Transporter_Name=?, Vehicle_Number=?, Remark=?,
              Work_Status=?, Delivery_Status=?, Challan_Status=?, Updated_Date=NOW()
            WHERE Challan_id=?`;

                    const headerValues = [
                        Customer_Name, Company_Name, Company_Address, GST_No, Delivery_Address,
                        subtotal, Total_Amount, discount, CGST_amount, SGST_amount, Grand_Total,
                        Mode_of_Transport, Transporter_Name, Vehicle_Number, Remark,
                        Work_Status, Delivery_Status, Challan_Status, Challan_id
                    ];

                    connection.query(headerSql, headerValues, err => {
                        if (err) return rollback(500, err.sqlMessage || "Could not update challan.");

                        connection.query(
                            `SELECT
                                InletProduct_id,
                                Product_Name,
                                HSN_Code,
                                Product_Quantity,
                                Ordered_Quantity,
                                Available_Extra_Stock,
                                Stock_Used,
                                Manufacturing_Required,
                                Produced_Quantity,
                                Damaged_Quantity,
                                Faulty_Quantity,
                                Good_Quantity,
                                Extra_Quantity,
                                ExtraStock_Posted_Quantity
                             FROM inletproducts
                             WHERE Challan_id = ?
                             FOR UPDATE`,
                            //                 `SELECT InletProduct_id, Product_Name, HSN_Code, Ordered_Quantity,
                            //           ExtraStock_Posted_Quantity
                            //    FROM inletproducts WHERE Challan_id=? FOR UPDATE`,
                            [Challan_id],
                            (err, oldProducts) => {
                                if (err) return rollback(500, "Could not load challan products.");

                                const oldById = new Map(oldProducts.map(p => [Number(p.InletProduct_id), p]));
                                const retainedIds = new Set();
                                const changes = [];
                                let index = 0;

                                function saveNext() {
                                    if (index >= items.length) return deleteOmitted();

                                    const p = items[index++];
                                    const rowId = Number(p.InletProduct_id) || 0;
                                    const qty = Number(p.Product_Quantity);
                                    const rate = Number(p.Rate);
                                    const lineSubtotal = qty * rate;
                                    const produced = Number(p.Produced_Quantity ?? 0);
                                    const damaged = Number(p.Damaged_Quantity ?? 0);
                                    const faulty = Number(p.Faulty_Quantity ?? 0);

                                    if (![produced, damaged, faulty].every(Number.isSafeInteger) ||
                                        produced < 0 || damaged < 0 || faulty < 0 ||
                                        damaged + faulty > produced) {
                                        return rollback(400, `Invalid production quantities for ${p.Product_Name}.`);
                                    }

                                    //   const good = produced - damaged - faulty;
                                    //   const extra = Math.max(good - qty, 0);
                                    //   const old = rowId ? oldById.get(rowId) : null;
                                    const old = rowId ? oldById.get(rowId) : null;

                                    if (rowId && !old) {
                                        return rollback(
                                            400,
                                            `InletProduct_id ${rowId} does not belong to this challan.`
                                        );
                                    }

                                    const ordered = qty;

                                    // Preserve the original manufacturing requirement.
                                    const manufacturingRequired = Number(
                                        old?.Manufacturing_Required ?? ordered
                                    );

                                    // Production calculation.
                                    const good = produced - damaged - faulty;

                                    const extra = Math.max(
                                        0,
                                        good - manufacturingRequired
                                    );
                                    if (rowId && !old) {
                                        return rollback(400, `InletProduct_id ${rowId} does not belong to this challan.`);
                                    }

                                    const values = [
                                        String(p.Product_Name).trim(), p.HSN_Code ?? null, qty, rate, lineSubtotal,
                                        produced, damaged, faulty, good, extra
                                    ];

                                    const done = (saveErr, savedId) => {
                                        if (saveErr) return rollback(500, saveErr.sqlMessage || "Could not save product.");
                                        if (savedId) retainedIds.add(Number(savedId));

                                        const previousExtra = Number(old?.ExtraStock_Posted_Quantity || 0);
                                        changes.push({
                                            id: Number(savedId || rowId),
                                            name: String(p.Product_Name).trim(),
                                            hsn: p.HSN_Code ?? null,
                                            extra,
                                            delta: extra - previousExtra
                                        });
                                        saveNext();
                                    };

                                    const sql = rowId
                                        ? `UPDATE inletproducts SET Product_Name=?, HSN_Code=?, Product_Quantity=?,
                         Rate=?, SubTotal=?, Produced_Quantity=?, Damaged_Quantity=?,
                         Faulty_Quantity=?, Good_Quantity=?, Extra_Quantity=?,
                         ExtraStock_Posted_Quantity=?
                       WHERE InletProduct_id=? AND Challan_id=?`
                                        : `INSERT INTO inletproducts
                         (Challan_id, Product_Name, HSN_Code, Product_Quantity, Rate, SubTotal,
                          Produced_Quantity, Damaged_Quantity, Faulty_Quantity, Good_Quantity,
                          Extra_Quantity, ExtraStock_Posted_Quantity)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                                    const args = rowId
                                        ? [...values, extra, rowId, Challan_id]
                                        : [Challan_id, ...values, extra];
                                    connection.query(sql, args, (err, result) =>
                                        done(err, rowId || result?.insertId)
                                    );
                                }

                                function deleteOmitted() {
                                    const deleteIds = oldProducts
                                        .map(p => Number(p.InletProduct_id))
                                        .filter(id => !retainedIds.has(id));
                                    if (!deleteIds.length) return updateStock(0);
                                    connection.query(
                                        "DELETE FROM inletproducts WHERE Challan_id=? AND InletProduct_id IN (?)",
                                        [Challan_id, deleteIds],
                                        err => err ? rollback(500, "Could not remove omitted products.") : updateStock(0)
                                    );
                                }
                                function updateStock(i) {
                                    if (i >= changes.length) {
                                        return connection.query(
                                            "UPDATE inletchallan SET Updated_Date=NOW() WHERE Challan_id=?",
                                            [Challan_id],
                                            err => {
                                                if (err) return rollback(500, "Could not finish challan update.");
                                                connection.commit(err => {
                                                    if (err) return connection.rollback(() =>
                                                        res.status(500).json({ success: false, message: "Could not save challan." })
                                                    );
                                                    res.json({ success: true, message: "Challan updated successfully." });
                                                });
                                            }
                                        );
                                    }

                                    const c = changes[i];
                                    if (c.delta === 0) return updateStock(i + 1);

                                    connection.query(
                                        `INSERT INTO product_excess_stock
                       (Product_Name, HSN_Code, Available_Quantity, Updated_Date)
                     VALUES (?, ?, ?, NOW())
                     ON DUPLICATE KEY UPDATE
                       Available_Quantity=Available_Quantity + VALUES(Available_Quantity),
                       Updated_Date=NOW()`,
                                        [c.name, c.hsn, c.delta],
                                        err => err ? rollback(500, err.sqlMessage || "Could not update excess stock.")
                                            : updateStock(i + 1)
                                    );
                                }
                                saveNext();
                            }
                        );
                    });
                }
            );
        });
    });
});


function updateStock(i) {

    if (i >= changes.length) {
        return connection.query(
            "UPDATE inletchallan SET Updated_Date=NOW() WHERE Challan_id=?",
            [Challan_id],
            err => {
                if (err) {
                    return rollback(500, "Could not finish challan update.");
                }

                connection.commit(err => {
                    if (err) {
                        return connection.rollback(() =>
                            res.status(500).json({
                                success: false,
                                message: "Could not save challan."
                            })
                        );
                    }

                    return res.json({
                        success: true,
                        message: "Challan and extra stock updated successfully."
                    });
                });
            }
        );
    }

    const c = changes[i];

    if (c.delta === 0) {
        return updateStock(i + 1);
    }

    // Create stock record if it does not exist.
    connection.query(
        `INSERT INTO product_excess_stock
            (Product_Name, HSN_Code, Available_Quantity, Updated_Date)
         VALUES (?, ?, 0, NOW())
         ON DUPLICATE KEY UPDATE
            Updated_Date = NOW()`,
        [c.name, c.hsn],
        err => {

            if (err) {
                return rollback(
                    500,
                    err.sqlMessage || "Could not create stock record."
                );
            }

            // Lock the stock record before calculating the balance.
            connection.query(
                `SELECT ExcessStock_id, Available_Quantity
                 FROM product_excess_stock
                 WHERE Product_Name = ?
                   AND HSN_Code <=> ?
                 FOR UPDATE`,
                [c.name, c.hsn],
                (err, stockRows) => {

                    if (err) {
                        return rollback(500, "Could not read extra stock.");
                    }

                    if (!stockRows.length) {
                        return rollback(404, "Product stock not found.");
                    }

                    const stock = stockRows[0];

                    const currentStock =
                        Number(stock.Available_Quantity) || 0;

                    const updatedStock = currentStock + c.delta;

                    // Do not allow negative stock.
                    if (updatedStock < 0) {
                        return rollback(
                            400,
                            "Cannot reduce extra stock because some of it has already been used."
                        );
                    }

                    // Update the final stock balance.
                    connection.query(
                        `UPDATE product_excess_stock
                         SET Available_Quantity = ?,
                             Updated_Date = NOW()
                         WHERE ExcessStock_id = ?`,
                        [updatedStock, stock.ExcessStock_id],
                        err => {

                            if (err) {
                                return rollback(
                                    500,
                                    "Could not update extra stock."
                                );
                            }

                            updateStock(i + 1);
                        }
                    );
                }
            );
        }
    );
}

// app.put(
//     "/UpdateInletChallanProduction/:Challan_id",
//     (req, res) => {
//         const Challan_id = Number(req.params.Challan_id);
//         const { items } = req.body;

//         if (
//             !Number.isInteger(Challan_id) ||
//             Challan_id <= 0 ||
//             !Array.isArray(items) ||
//             items.length === 0
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid Challan ID and products are required."
//             });
//         }

//         // Reject duplicate product-row IDs in the request.
//         const ids = items.map(
//             item => Number(item.InletProduct_id)
//         );

//         if (
//             ids.some(id => !Number.isInteger(id) || id <= 0) ||
//             new Set(ids).size !== ids.length
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid or duplicate InletProduct_id."
//             });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Could not start transaction."
//                 });
//             }

//             const rollback = (status, message) => {
//                 return connection.rollback(() => {
//                     res.status(status).json({
//                         success: false,
//                         message
//                     });
//                 });
//             };

//             // Lock the challan header while production is updated.
//             connection.query(
//                 `SELECT Challan_id, Work_Status
//                  FROM inletchallan
//                  WHERE Challan_id = ?
//                  FOR UPDATE`,
//                 [Challan_id],
//                 (err, challans) => {
//                     if (err) {
//                         return rollback(
//                             500,
//                             "Failed to read Inlet Challan."
//                         );
//                     }

//                     if (!challans.length) {
//                         return rollback(404, "Inlet Challan not found.");
//                     }

//                     if (challans[0].Work_Status === "Completed") {
//                         // Permit safe retries/corrections using the
//                         // posted-quantity difference calculated below.
//                     }

//                     connection.query(
//                         `SELECT
//                             InletProduct_id,
//                             Product_id,
//                             Product_Name,
//                             HSN_Code,
//                             Ordered_Quantity,
//                             Produced_Quantity,
//                             Damaged_Quantity,
//                             Faulty_Quantity,
//                             Good_Quantity,
//                             Extra_Quantity,
//                             ExtraStock_Posted_Quantity
//                          FROM inletproducts
//                          WHERE Challan_id = ?
//                          FOR UPDATE`,
//                         [Challan_id],
//                         (err, products) => {
//                             if (err) {
//                                 return rollback(
//                                     500,
//                                     "Failed to load challan products."
//                                 );
//                             }

//                             // Require every challan product to be updated.
//                             if (
//                                 products.length !== items.length ||
//                                 products.some(
//                                     p => !ids.includes(
//                                         Number(p.InletProduct_id)
//                                     )
//                                 )
//                             ) {
//                                 return rollback(
//                                     400,
//                                     "Submit every product in this challan exactly once."
//                                 );
//                             }

//                             const requested = new Map(
//                                 items.map(item => [
//                                     Number(item.InletProduct_id),
//                                     item
//                                 ])
//                             );

//                             const updates = [];

//                             for (const product of products) {
//                                 const input = requested.get(
//                                     Number(product.InletProduct_id)
//                                 );

//                                 const produced =
//                                     Number(input.Produced_Quantity);

//                                 const damaged =
//                                     Number(input.Damaged_Quantity);

//                                 const faulty =
//                                     Number(input.Faulty_Quantity);

//                                 const ordered =
//                                     Number(product.Ordered_Quantity);

//                                 const quantities = [
//                                     produced, damaged, faulty, ordered
//                                 ];

//                                 if (
//                                     quantities.some(
//                                         q => !Number.isSafeInteger(q) || q < 0
//                                     ) ||
//                                     damaged + faulty > produced
//                                 ) {
//                                     return rollback(
//                                         400,
//                                         `Invalid production quantities for ${product.Product_Name}.`
//                                     );
//                                 }

//                                 if (
//                                     !Number.isInteger(Number(product.Product_id)) ||
//                                     Number(product.Product_id) <= 0
//                                 ) {
//                                     return rollback(
//                                         400,
//                                         `Missing Product_id for ${product.Product_Name}.`
//                                     );
//                                 }

//                                 const good =
//                                     produced - damaged - faulty;

//                                 const extra = Math.max(
//                                     good - ordered,
//                                     0
//                                 );

//                                 const previouslyPosted =
//                                     Number(
//                                         product.ExtraStock_Posted_Quantity
//                                     ) || 0;

//                                 updates.push({
//                                     product,
//                                     produced,
//                                     damaged,
//                                     faulty,
//                                     good,
//                                     extra,
//                                     delta: extra - previouslyPosted
//                                 });
//                             }

//                             // Process products sequentially inside the
//                             // same transaction.
//                             function saveProduct(index) {
//                                 if (index >= updates.length) {
//                                     return connection.query(
//                                         `UPDATE inletchallan
//                                          SET Work_Status = 'Completed',
//                                              Updated_Date = NOW()
//                                          WHERE Challan_id = ?`,
//                                         [Challan_id],
//                                         err => {
//                                             if (err) {
//                                                 return rollback(
//                                                     500,
//                                                     "Failed to complete challan."
//                                                 );
//                                             }

//                                             connection.commit(err => {
//                                                 if (err) {
//                                                     return connection.rollback(
//                                                         () => res.status(500).json({
//                                                             success: false,
//                                                             message: "Failed to save production and stock."
//                                                         })
//                                                     );
//                                                 }

//                                                 return res.json({
//                                                     success: true,
//                                                     message: "Production completed and excess stock updated successfully.",
//                                                     Challan_id,
//                                                     products: updates.map(u => ({
//                                                         InletProduct_id:
//                                                             u.product.InletProduct_id,
//                                                         Product_Name:
//                                                             u.product.Product_Name,
//                                                         Produced_Quantity:
//                                                             u.produced,
//                                                         Damaged_Quantity:
//                                                             u.damaged,
//                                                         Faulty_Quantity:
//                                                             u.faulty,
//                                                         Good_Quantity:
//                                                             u.good,
//                                                         Extra_Quantity:
//                                                             u.extra
//                                                     }))
//                                                 });
//                                             });
//                                         }
//                                     );
//                                 }

//                                 const u = updates[index];
//                                 const p = u.product;

//                                 const updateProductSql = `
//                                     UPDATE inletproducts
//                                     SET Produced_Quantity = ?,
//                                         Damaged_Quantity = ?,
//                                         Faulty_Quantity = ?,
//                                         Good_Quantity = ?,
//                                         Extra_Quantity = ?,
//                                         ExtraStock_Posted_Quantity = ?
//                                     WHERE InletProduct_id = ?
//                                       AND Challan_id = ?
//                                 `;

//                                 connection.query(
//                                     updateProductSql,
//                                     [
//                                         u.produced,
//                                         u.damaged,
//                                         u.faulty,
//                                         u.good,
//                                         u.extra,
//                                         u.extra,
//                                         p.InletProduct_id,
//                                         Challan_id
//                                     ],
//                                     err => {
//                                         if (err) {
//                                             return rollback(
//                                                 500,
//                                                 "Failed to update production quantities."
//                                             );
//                                         }

//                                         updateStock(u, stockErr => {
//                                             if (stockErr) {
//                                                 return rollback(
//                                                     500,
//                                                     stockErr.message
//                                                 );
//                                             }

//                                             saveProduct(index + 1);
//                                         });
//                                     }
//                                 );
//                             }

//                             function updateStock(u, callback) {
//                                 const p = u.product;

//                                 // A repeated request posts only the
//                                 // difference, not the full extra quantity.
//                                 if (u.delta === 0) {
//                                     return callback(null);
//                                 }

//                                 connection.query(
//                                     `SELECT Available_Quantity
//                                      FROM product_excess_stock
//                                      WHERE Product_id = ?
//                                      FOR UPDATE`,
//                                     [p.Product_id],
//                                     (err, stockRows) => {
//                                         if (err) {
//                                             return callback(err);
//                                         }

//                                         const available = stockRows.length
//                                             ? Number(
//                                                 stockRows[0].Available_Quantity
//                                               )
//                                             : 0;

//                                         if (available + u.delta < 0) {
//                                             return callback(
//                                                 new Error(
//                                                     `Cannot reduce ${p.Product_Name} stock below zero.`
//                                                 )
//                                             );
//                                         }

//                                         if (!stockRows.length && u.delta < 0) {
//                                             return callback(
//                                                 new Error(
//                                                     `No excess stock record exists for ${p.Product_Name}.`
//                                                 )
//                                             );
//                                         }

//                                         const stockSql = `
//                                             INSERT INTO product_excess_stock
//                                             (
//                                                 Product_id,
//                                                 Product_Name,
//                                                 HSN_Code,
//                                                 Available_Quantity,
//                                                 Updated_Date
//                                             )
//                                             VALUES (?, ?, ?, ?, NOW())
//                                             ON DUPLICATE KEY UPDATE
//                                                 Product_Name = VALUES(Product_Name),
//                                                 HSN_Code = VALUES(HSN_Code),
//                                                 Available_Quantity =
//                                                     Available_Quantity +
//                                                     VALUES(Available_Quantity),
//                                                 Updated_Date = NOW()
//                                         `;

//                                         connection.query(
//                                             stockSql,
//                                             [
//                                                 p.Product_id,
//                                                 p.Product_Name,
//                                                 p.HSN_Code,
//                                                 u.delta
//                                             ],
//                                             callback
//                                         );
//                                     }
//                                 );
//                             }

//                             saveProduct(0);
//                         }
//                     );
//                 }
//             );
//         });
//     }
// );

// app.put('/UpdateaChallan/:Challan_id', (req, res) => {
//     const token = req.headers['x-access-token'];
//     if (!token) {
//         return res.status(401).send({
//             success: false,
//             message: "Unauthorized"
//         });
//     }

//     jwt.verify(token, secrect, (err, decoded) => {

//         if (err) {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         if (decoded.Role !== "Admin") {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         const Challan_id = req.params.Challan_id;

//         const {

//             Customer_Name,
//             Company_Name,
//             Company_Address,
//             GST_No,
//             Delivery_Address,

//             Mode_of_Transport,
//             Transporter_Name,
//             Vehicle_Number,
//             Remark,
//             Work_Status,
//             Delivery_Status,
//             Challan_Status,

//             Discount_Amount = 0,

//             items

//         } = req.body;

//         if (!items || items.length == 0) {

//             return res.status(400).send({

//                 success: false,

//                 message: "Products Required"

//             });

//         }

//         //-------------------------
//         // Calculate Amount
//         //-------------------------

//         let SubTotal = 0;

//         items.forEach(i => {
//             SubTotal += Number(i.Product_Quantity) * Number(i.Rate);
//         });
//         const Total_Amount = SubTotal - Number(Discount_Amount);
//         const CGST_amount = Total_Amount * 0.09;
//         const SGST_amount = Total_Amount * 0.09;
//         const Grand_Total =

//             Total_Amount + CGST_amount + SGST_amount;

//         //-------------------------
//         // Update Header
//         //-------------------------

//         const UpdateSql = `
//         UPDATE inletchallan
//         SET

//         Customer_Name=?,
//         Company_Name=?,
//         Company_Address=?,
//         GST_No=?,
//         Delivery_Address=?,

//         Sub_Total=?,
//         Total_Amount=?,
//         Discount_Amount=?,
//         CGST_amount=?,
//         SGST_amount=?,
//         Grand_Total=?,

//         Mode_of_Transport=?,
//         Transporter_Name=?,
//         Vehicle_Number=?,
//         Remark=?,

//         Work_Status=?,
//         Delivery_Status=?,
//         Challan_Status=?,

//         Updated_Date=NOW()

//         WHERE Challan_id=?
//         `;

//         const HeaderValues = [

//             Customer_Name,
//             Company_Name,
//             Company_Address,
//             GST_No,
//             Delivery_Address,

//             SubTotal,
//             Total_Amount,
//             Discount_Amount,
//             CGST_amount,
//             SGST_amount,
//             Grand_Total,

//             Mode_of_Transport,
//             Transporter_Name,
//             Vehicle_Number,
//             Remark,

//             Work_Status,
//             Delivery_Status,
//             Challan_Status,

//             Challan_id
//         ];

//         connection.query(UpdateSql, HeaderValues, (err) => {
//             if (err) {
//                 return res.status(500).send({
//                     success: false,
//                     message: err.sqlMessage
//                 });
//             }
//             connection.query(
//                 "SELECT InletProduct_id FROM inletproducts WHERE Challan_id=?",
//                 [Challan_id],
//                 (err, oldProducts) => {

//                     if (err) {
//                         return res.status(500).send({
//                             success: false,
//                             message: err.sqlMessage
//                         });
//                     }

//                     let existingIds = [];
//                     let i = 0;

//                     function saveProduct() {

//                         if (i >= items.length) {

//                             const deleteIds = oldProducts
//                                 .map(x => x.InletProduct_id)
//                                 .filter(id => !existingIds.includes(id));

//                             if (deleteIds.length == 0) {

//                                 return res.send({
//                                     success: true,
//                                     message: "Challan Updated Successfully"
//                                 });

//                             }

//                             connection.query(
//                                 "DELETE FROM inletproducts WHERE InletProduct_id IN (?)",
//                                 [deleteIds],
//                                 (err) => {

//                                     if (err) {

//                                         return res.status(500).send({
//                                             success: false,
//                                             message: err.sqlMessage
//                                         });

//                                     }

//                                     res.send({
//                                         success: true,
//                                         message: "Challan Updated Successfully"
//                                     });

//                                 });

//                             return;

//                         }

//                         const p = items[i];

//                         const subtotal =
//                             Number(p.Product_Quantity) * Number(p.Rate);

//                         if (p.InletProduct_id && p.InletProduct_id > 0) {

//                             existingIds.push(p.InletProduct_id);

//                             connection.query(
//                                 `UPDATE inletproducts
//                      SET
//                      Product_Name=?,
//                      HSN_Code=?,
//                      Product_Quantity=?,
//                      Rate=?,
//                      SubTotal=?
//                      WHERE InletProduct_id=?`,
//                                 [
//                                     p.Product_Name,
//                                     p.HSN_Code,
//                                     p.Product_Quantity,
//                                     p.Rate,
//                                     subtotal,
//                                     p.InletProduct_id
//                                 ],
//                                 (err) => {

//                                     if (err) {
//                                         return res.status(500).send({
//                                             success: false,
//                                             message: err.sqlMessage
//                                         });
//                                     }

//                                     i++;
//                                     saveProduct();

//                                 });

//                         }
//                         else {

//                             connection.query(
//                                 `INSERT INTO inletproducts
//                     (
//                         Challan_id,
//                         Product_Name,
//                         HSN_Code,
//                         Product_Quantity,
//                         Rate,
//                         SubTotal
//                     )
//                     VALUES (?,?,?,?,?,?)`,
//                                 [
//                                     Challan_id,
//                                     p.Product_Name,
//                                     p.HSN_Code,
//                                     p.Product_Quantity,
//                                     p.Rate,
//                                     subtotal
//                                 ],
//                                 (err) => {

//                                     if (err) {
//                                         return res.status(500).send({
//                                             success: false,
//                                             message: err.sqlMessage
//                                         });
//                                     }
//                                     i++;
//                                     saveProduct();

//                                 });
//                         }
//                     }
//                     saveProduct();
//                 }
//             );

//         });
//     });
// });

// app.put('/UpdateaChallan/:Challan_id', (req, res) => {

//     const token = req.headers['x-access-token'];

//     if (!token) {
//         return res.status(401).send({
//             success: false,
//             message: "Unauthorized"
//         });
//     }

//     jwt.verify(token, secrect, (err, decoded) => {

//         if (err) {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         if (decoded.Role !== "Admin") {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         const Challan_id = req.params.Challan_id;

//         const {

//             Customer_Name,
//             Company_Name,
//             Company_Address,
//             GST_No,
//             Delivery_Address,

//             Mode_of_Transport,
//             Transporter_Name,
//             Vehicle_Number,
//             Remark,
//             Work_Status,
//             Delivery_Status,
//             Challan_Status,

//             Discount_Amount = 0,

//             items

//         } = req.body;

//         if (!items || items.length == 0) {

//             return res.status(400).send({

//                 success: false,

//                 message: "Products Required"

//             });

//         }

//         //-------------------------
//         // Calculate Amount
//         //-------------------------

//         let SubTotal = 0;

//         items.forEach(i => {
//             SubTotal += Number(i.Product_Quantity) * Number(i.Rate);
//         });
//         const Total_Amount = SubTotal - Number(Discount_Amount);
//         const CGST_amount = Total_Amount * 0.09;
//         const SGST_amount = Total_Amount * 0.09;
//         const Grand_Total =

//             Total_Amount + CGST_amount + SGST_amount;

//         //-------------------------
//         // Update Header
//         //-------------------------

//         const UpdateSql = `
//         UPDATE inletchallan
//         SET

//         Customer_Name=?,
//         Company_Name=?,
//         Company_Address=?,
//         GST_No=?,
//         Delivery_Address=?,

//         Sub_Total=?,
//         Total_Amount=?,
//         Discount_Amount=?,
//         CGST_amount=?,
//         SGST_amount=?,
//         Grand_Total=?,

//         Mode_of_Transport=?,
//         Transporter_Name=?,
//         Vehicle_Number=?,
//         Remark=?,

//         Work_Status=?,
//         Delivery_Status=?,
//         Challan_Status=?,

//         Updated_Date=NOW()

//         WHERE Challan_id=?
//         `;

//         const HeaderValues = [

//             Customer_Name,
//             Company_Name,
//             Company_Address,
//             GST_No,
//             Delivery_Address,

//             SubTotal,
//             Total_Amount,
//             Discount_Amount,
//             CGST_amount,
//             SGST_amount,
//             Grand_Total,

//             Mode_of_Transport,
//             Transporter_Name,
//             Vehicle_Number,
//             Remark,

//             Work_Status,
//             Delivery_Status,
//             Challan_Status,

//             Challan_id
//         ];

//         connection.query(UpdateSql, HeaderValues, (err) => {
//             if (err) {
//                 return res.status(500).send({
//                     success: false,
//                     message: err.sqlMessage
//                 });
//             }

//             const HistorySql = `
// INSERT INTO inletproducts_history
// (
//     Challan_id,
//     InletProduct_id,
//     old_product,
//     Updated_Date
// )
// SELECT
//     Challan_id,
//     InletProduct_id,
//     JSON_OBJECT(
//         'Product_Name', Product_Name,
//         'HSN_Code', HSN_Code,
//         'Product_Quantity', Product_Quantity,
//         'Rate', Rate,
//         'SubTotal', SubTotal
//     ),
//     NOW()
// FROM inletproducts
// WHERE Challan_id = ?;
// `;

//             connection.query(HistorySql, [Challan_id], (err) => {
//                 if (err) return res.status(500).send(err);

//                 // Then DELETE

//                 //-------------------------
//                 // Delete Old Products
//                 //-------------------------
//                 connection.query(
//                     "DELETE FROM inletproducts WHERE Challan_id=?",
//                     [Challan_id],
//                     (err) => {
//                         if (err) {
//                             return res.status(500).send({
//                                 success: false,
//                                 message: err.sqlMessage
//                             });
//                         }
//                         //-------------------------
//                         // Insert Products Again
//                         //-------------------------
//                         const InsertProductSql = `
//                     INSERT INTO inletproducts
//                     (
//                     Challan_id,
//                     Product_Name,
//                     HSN_Code,
//                     Product_Quantity,
//                     Rate,
//                     SubTotal
//                     )
//                     VALUES ?
//                     `;

//                         const ProductValues = items.map(i => [
//                             Challan_id,
//                             i.Product_Name,
//                             i.HSN_Code,
//                             i.Product_Quantity,
//                             i.Rate,
//                             Number(i.Product_Quantity) * Number(i.Rate)
//                         ]);

//                         connection.query(
//                             InsertProductSql,
//                             [ProductValues],
//                             (err) => {
//                                 if (err) {
//                                     return res.status(500).send({
//                                         success: false,
//                                         message: err.sqlMessage
//                                     });
//                                 }
//                                 const NewHistorySql = `
//     INSERT INTO inletproducts_history
//     (
//         Challan_id,
//         InletProduct_id,
//         new_product,
//         Updated_Date
//     )
//     SELECT
//         Challan_id,
//         InletProduct_id,
//         JSON_OBJECT(
//             'Product_Name', Product_Name,
//             'HSN_Code', HSN_Code,
//             'Product_Quantity', Product_Quantity,
//             'Rate', Rate,
//             'SubTotal', SubTotal
//         ),
//         NOW()
//     FROM inletproducts
//     WHERE Challan_id = ?`;

//                                 connection.query(NewHistorySql, [Challan_id], (err) => {

//                                     if (err) {
//                                         return res.status(500).send(err);
//                                     }

//                                     res.send({
//                                         success: true,
//                                         message: "Challan Updated Successfully"
//                                     });

//                                 });
//                             });
//                     });
//             });

//         });
//     });
// });

// app.put('/UpdateaChallan/:Challan_id', (req, res) => {
//     const token = req.headers['x-access-token'];
//     if (!token) {
//         res.status(401).send({
//             success: false,
//             message: 'Unauthorized',
//             data: []
//         })
//     } else {
//         jwt.verify(token, secrect, (err, decoded) => {
//             if (err) {
//                 res.status(401).send({
//                     success: false,
//                     message: 'Unauthorized',
//                     data: []
//                 })
//             } else {
//                 if (decoded.Role !== 'Admin') {
//                     return res.status(401).send({
//                         success: false,
//                         message: 'Unauthorized',
//                         data: []
//                     });
//                 } else {
//                     const {
//                         Customer_Name,
//                         Company_Name,
//                         Company_Address,
//                         GST_No,
//                         Delivery_Address,

//                         Mode_of_Transport,
//                         Transporter_Name,
//                         Vehicle_Number,
//                         Remark,
//                         Work_Status,
//                         Delivery_Status,
//                         Challan_Status,
//                         Discount_Amount = 0,
//                         items
//                     } = req.body;

//                     const Updatequery = `UPDATE inletchallan
// SET
// Customer_Name=?,
// Company_Name=?,
// Company_Address=?,
// GST_No=?,
// Delivery_Address=?,
// Sub_Total=?,
// Total_Amount=?,
// Discount_Amount=?,
// CGST_amount=?,
// SGST_amount=?,
// Grand_Total=?,
// Mode_of_Transport=?,
// Transporter_Name=?,
// Vehicle_Number=?,
// Remark=?,
// Work_Status=?,
// Delivery_Status=?,
// Challan_Status=?,
// Updated_Date=NOW()
// WHERE Challan_id=?`;
//                     const inletValues = [
//                         NewCode,
//                         Customer_Name,
//                         Company_Name,
//                         Company_Address,
//                         GST_No,
//                         Delivery_Address,

//                         SubTotal,
//                         Total_Amount,
//                         Discount_Amount,
//                         CGST_amount,
//                         SGST_amount,
//                         Grand_Total,
//                         Mode_of_Transport,
//                         Transporter_Name,
//                         Vehicle_Number,
//                         Remark,
//                         Work_Status,
//                         Delivery_Status,
//                         Challan_Status,
//                     ];
//                     connection.query(Updatequery, [inletValues], (err, result) => {
//                         if (err) {
//                             res.status(500).send({
//                                 success: false,
//                                 message: err.sqlMessage,
//                                 data: []
//                             });
//                         } else {
//                             res.status(200).send({
//                                 success: false,
//                                 message: 'Update a Challan Data',
//                                 data: result
//                             });
//                         }
//                     });
//                 }
//             }
//         });
//     }
// });

app.get('/AllChallan', (req, res) => {
    // const newquery = `select * from inletchallan`;
    const newquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    ORDER BY challan.Challan_id DESC`;

    connection.query(newquery, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.sqlMessage });
        }
        if (!rows.length) {
            return res.json({ success: true, data: [] });
        }
        const result = {};
        rows.forEach(row => {

            if (!result[row.Challan_id]) {
                result[row.Challan_id] = {
                    Challan_id: row.Challan_id,
                    Challan_Code: row.Challan_Code,
                    Customer_Name: row.Customer_Name,
                    Company_Name: row.Company_Name,
                    Company_Address: row.Company_Address,
                    Client_Address: row.Client_Address,
                    GST_No: row.GST_No,
                    Delivery_Address: row.Delivery_Address,
                    Sub_Total: row.Sub_Total,
                    Total_Amount: row.Total_Amount,
                    Discount_Amount: row.Discount_Amount,
                    CGST_amount: row.CGST_amount,
                    SGST_amount: row.SGST_amount,
                    Grand_Total: row.Grand_Total,
                    Mode_of_Transport: row.Mode_of_Transport,
                    Transporter_Name: row.Transporter_Name,
                    Vehicle_Number: row.Vehicle_Number,
                    Remark: row.Remark,
                    Work_Status: row.Work_Status,
                    Delivery_Status: row.Delivery_Status,
                    Challan_Status: row.Challan_Status,
                    Added_Date: row.Added_Date,
                    Updated_Date: row.Updated_Date,
                    items: []
                };
            }

            result[row.Challan_id].items.push({
                InletProduct_id: row.InletProduct_id,
                Product_Name: row.Product_Name,
                HSN_Code: row.HSN_Code,
                Product_Quantity: row.Product_Quantity,
                Ordered_Quantity: row.Ordered_Quantity,
                Produced_Quantity: row.Produced_Quantity,
                Damaged_Quantity: row.Damaged_Quantity,
                Faulty_Quantity: row.Faulty_Quantity,
                Good_Quantity: row.Good_Quantity,
                Extra_Quantity: row.Extra_Quantity,
                ExtraStock_Posted_Quantity: row.ExtraStock_Posted_Quantity,
                Rate: row.Rate,
                SubTotal: row.SubTotal,
            });

        });

        // ✅ SORT AFTER GROUPING
        const finalData = Object.values(result).sort(
            (a, b) => new Date(b.Added_Date) - new Date(a.Added_Date)
        );

        res.json({
            success: true,
            data: finalData
        });

    });

});

app.get('/LimitedChallan', (req, res) => {
    const newquery = `SELECT * FROM inletchallan ORDER BY Challan_id DESC LIMIT 3;`;
    //     const newquery = `SELECT challan.Challan_id, challan.*, iproduct.*
    // FROM inletchallan challan
    // JOIN inletproducts iproduct
    // ON challan.Challan_id = iproduct.Challan_id
    // ORDER BY challan.Challan_id DESC
    // LIMIT 3;`;
    // const newquery = `SELECT challan.*, iproduct.*
    // FROM inletchallan challan
    // JOIN inletproducts iproduct 
    // ON challan.Challan_id = iproduct.Challan_id
    // LIMIT challan.3`;

    connection.query(newquery, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.sqlMessage });
        }
        if (!rows.length) {
            return res.json({ success: true, data: [] });
        }
        const result = {};
        rows.forEach(row => {

            if (!result[row.Challan_id]) {
                result[row.Challan_id] = {
                    Challan_id: row.Challan_id,
                    Challan_Code: row.Challan_Code,
                    Customer_Name: row.Customer_Name,
                    Company_Name: row.Company_Name,
                    Company_Address: row.Company_Address,
                    Client_Address: row.Client_Address,
                    GST_No: row.GST_No,
                    Delivery_Address: row.Delivery_Address,
                    Sub_Total: row.Sub_Total,
                    Total_Amount: row.Total_Amount,
                    Discount_Amount: row.Discount_Amount,
                    CGST_amount: row.CGST_amount,
                    SGST_amount: row.SGST_amount,
                    Grand_Total: row.Grand_Total,
                    Mode_of_Transport: row.Mode_of_Transport,
                    Transporter_Name: row.Transporter_Name,
                    Vehicle_Number: row.Vehicle_Number,
                    Remark: row.Remark,
                    Work_Status: row.Work_Status,
                    Delivery_Status: row.Delivery_Status,
                    Challan_Status: row.Challan_Status,
                    Added_Date: row.Added_Date,
                    Updated_Date: row.Updated_Date,
                    items: []
                };
            }

            result[row.Challan_id].items.push({
                InletProduct_id: row.InletProduct_id,
                Product_Name: row.Product_Name,
                HSN_Code: row.HSN_Code,
                Product_Quantity: row.Product_Quantity,
                Rate: row.Rate,
                SubTotal: row.SubTotal,
            });

        });

        // ✅ SORT AFTER GROUPING
        const finalData = Object.values(result).sort(
            (a, b) => new Date(b.Added_Date) - new Date(a.Added_Date)
        );

        res.json({
            success: true,
            data: finalData
        });

    });

});

app.get('/TotalNumberofChallan', (req, res) => {
    const countquery = `select count(*) as Totalchallan from inletchallan`;
    connection.query(countquery, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Number of Challan',
                data: data
            });
        }
    });
});

app.get('/ChallanByDeliverystatus', (req, res) => {
    const bystatusquery = `select count(*) as deliverystatus from inletchallan where Delivery_Status='Delivered'`;
    connection.query(bystatusquery, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Delivered Challan..',
                data: data
            });
        }
    });
});

app.get('/ChallanbyChallanid/:Challan_id', (req, res) => {
    const Challan_id = req.params.Challan_id;
    // const challanquery = `select * from inletchallan where Challan_id = ?`;
    const challanquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    WHERE challan.Challan_id=?`;

    connection.query(challanquery, [Challan_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.sqlMessage });
        }
        if (!rows.length) {
            return res.json({ success: true, data: [] });
        }
        const result = {};
        rows.forEach(row => {

            if (!result[row.Challan_id]) {
                result[row.Challan_id] = {
                    Challan_id: row.Challan_id,
                    Challan_Code: row.Challan_Code,
                    Customer_Name: row.Customer_Name,
                    Company_Name: row.Company_Name,
                    Company_Address: row.Company_Address,
                    Client_Address: row.Client_Address,
                    GST_No: row.GST_No,
                    Delivery_Address: row.Delivery_Address,
                    Sub_Total: row.Sub_Total,
                    Total_Amount: row.Total_Amount,
                    Discount_Amount: row.Discount_Amount,
                    CGST_amount: row.CGST_amount,
                    SGST_amount: row.SGST_amount,
                    Grand_Total: row.Grand_Total,
                    Mode_of_Transport: row.Mode_of_Transport,
                    Transporter_Name: row.Transporter_Name,
                    Vehicle_Number: row.Vehicle_Number,
                    Remark: row.Remark,
                    Work_Status: row.Work_Status,
                    Delivery_Status: row.Delivery_Status,
                    Challan_Status: row.Challan_Status,
                    Added_Date: row.Added_Date,
                    Updated_Date: row.Updated_Date,
                    items: []
                };
            }

            result[row.Challan_id].items.push({
                InletProduct_id: row.InletProduct_id,
                Product_Name: row.Product_Name,
                HSN_Code: row.HSN_Code,
                Product_Quantity: row.Product_Quantity,
                Ordered_Quantity: row.Ordered_Quantity,
                Produced_Quantity: row.Produced_Quantity,
                Damaged_Quantity: row.Damaged_Quantity,
                Faulty_Quantity: row.Faulty_Quantity,
                Good_Quantity: row.Good_Quantity,
                Extra_Quantity: row.Extra_Quantity,
                Rate: row.Rate,
                SubTotal: row.SubTotal,
            });

        });

        // ✅ SORT AFTER GROUPING
        const finalData = Object.values(result).sort(
            (a, b) => new Date(b.Added_Date) - new Date(a.Added_Date)
        );

        res.json({
            success: true,
            data: finalData
        });

    });
});

app.post('/DeleteChallan/:Challan_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const { Password } = req.body;

    if (!token) {
        return res.status(401).send({
            success: false,
            message: "Unauthorized"
        });
    }

    jwt.verify(token, secrect, (err, decoded) => {

        if (err) {
            return res.status(401).send({
                success: false,
                message: "Unauthorized"
            });
        }

        if (decoded.Role !== "Admin") {
            return res.status(403).send({
                success: false,
                message: "Only Admin can delete Challan"
            });
        }

        connection.query(
            "SELECT * FROM admin WHERE Admin_id=?",
            [decoded.Admin_id],
            (err, adminData) => {

                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: err.sqlMessage
                    });
                }

                if (adminData.length == 0) {
                    return res.status(404).send({
                        success: false,
                        message: "Admin not found"
                    });
                }

                if (adminData[0].Password !== Password) {
                    return res.status(401).send({
                        success: false,
                        message: "Incorrect Admin Password"
                    });
                }

                const Challan_id = req.params.Challan_id;

                connection.beginTransaction(err => {

                    if (err) {
                        return res.status(500).send(err);
                    }

                    // Delete Products
                    connection.query(
                        "DELETE FROM inletproducts WHERE Challan_id=?",
                        [Challan_id],
                        (err) => {

                            if (err) {
                                return connection.rollback(() => {
                                    res.status(500).send({
                                        success: false,
                                        message: err.sqlMessage
                                    });
                                });
                            }

                            // Delete Challan
                            connection.query(
                                "DELETE FROM inletchallan WHERE Challan_id=?",
                                [Challan_id],
                                (err) => {

                                    if (err) {
                                        return connection.rollback(() => {
                                            res.status(500).send({
                                                success: false,
                                                message: err.sqlMessage
                                            });
                                        });
                                    }

                                    connection.commit(err => {

                                        if (err) {
                                            return connection.rollback(() => {
                                                res.status(500).send({
                                                    success: false,
                                                    message: err.sqlMessage
                                                });
                                            });
                                        }

                                        res.send({
                                            success: true,
                                            message: "Challan Deleted Successfully"
                                        });

                                    });

                                });
                        });
                });
            });
    });
});

app.post('/DeleteInletChallanbyDelationReason/:Challan_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const { Password, Deletion_Reason } = req.body;
    const Challan_id = req.params.Challan_id;
    // -----------------------------------
    // 1. Validate Token
    // -----------------------------------
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    // -----------------------------------
    // 2. Validate Deletion Reason
    // -----------------------------------
    if (!Deletion_Reason || Deletion_Reason.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Deletion reason is required'
        });
    }
    if (Deletion_Reason.trim().length < 5) {
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid deletion reason'
        });
    }
    // -----------------------------------
    // 3. Verify JWT
    // ----------------------------------
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        // -----------------------------------
        // 4. Check Admin Role
        // -----------------------------------
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can delete Challan'
            });
        }
        // -----------------------------------
        // 5. Get Admin
        // -----------------------------------
        connection.query(
            'SELECT * FROM admin WHERE Admin_id = ?',
            [decoded.Admin_id],
            (err, adminData) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });
                }
                if (!adminData.length) {
                    return res.status(404).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }
                // -----------------------------------
                // 6. Check Password
                // -----------------------------------
                if (adminData[0].Password !== Password) {
                    return res.status(401).json({
                        success: false,
                        message: 'Incorrect Admin Password'
                    });
                }
                const adminName =
                    adminData[0].Name ||
                    adminData[0].Admin_Name ||
                    adminData[0].Username ||
                    'Admin';
                // -----------------------------------
                // 7. Start Transaction
                // -----------------------------------
                connection.beginTransaction((err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }
                    // -----------------------------------
                    // 8. Get Challan Data
                    // -----------------------------------
                    connection.query(
                        `
                        SELECT *
                        FROM inletchallan
                        WHERE Challan_id = ?
                        `,
                        [Challan_id],
                        (err, challanData) => {
                            if (err) {
                                return rollbackDelete(
                                    res,
                                    err
                                );
                            }

                            if (!challanData.length) {
                                return rollbackDelete(
                                    res,
                                    {
                                        sqlMessage: 'Challan not found'
                                    }
                                );
                            }
                            // -----------------------------------
                            // 9. Get Product Data
                            // -----------------------------------
                            connection.query(
                                `SELECT * FROM inletproducts WHERE Challan_id = ?`,
                                [Challan_id],
                                (err, productData) => {
                                    if (err) {
                                        return rollbackDelete(
                                            res,
                                            err
                                        );
                                    }
                                    // -----------------------------------
                                    // 10. Insert Deletion History
                                    // -----------------------------------

                                    const Challan_Code =
                                        challanData[0].Challan_Code ||
                                        challanData[0].Challan_Code ||
                                        null;


                                    connection.query(
                                        `
                                        INSERT INTO inletchallan_deletion_history
                                        (
                                            Challan_id,
                                            Challan_Code,
                                            Deleted_By_Admin_id,
                                            Deleted_By_Admin_Name,
                                            Deletion_Reason,
                                            Deleted_Date,
                                            Challan_Data,
                                            Product_Data
                                        )
                                        VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)
                                        `,
                                        [
                                            Challan_id,
                                            Challan_Code,
                                            decoded.Admin_id,
                                            adminName,
                                            Deletion_Reason.trim(),
                                            JSON.stringify(challanData[0]),
                                            JSON.stringify(productData)
                                        ],

                                        (err) => {
                                            if (err) {
                                                return rollbackDelete(
                                                    res,
                                                    err
                                                );
                                            }
                                            // -----------------------------------
                                            // 11. Delete Operations
                                            // -----------------------------------


                                            connection.query(
                                                `
                                                        DELETE FROM inletproducts
                                                        WHERE Challan_id = ?
                                                        `,
                                                [Challan_id],
                                                (err) => {
                                                    if (err) {
                                                        return rollbackDelete(
                                                            res,
                                                            err
                                                        );
                                                    }
                                                    // -----------------------------------
                                                    // 13. Delete Challan
                                                    // -----------------------------------

                                                    connection.query(
                                                        `DELETE
                                                                FROM inletchallan
                                                                WHERE Challan_id = ?
                                                                `,
                                                        [Challan_id],

                                                        (err) => {

                                                            if (err) {
                                                                return rollbackDelete(
                                                                    res,
                                                                    err
                                                                );
                                                            }
                                                            // -----------------------------------
                                                            // 14. Commit Transaction
                                                            // -----------------------------------
                                                            connection.commit(
                                                                (err) => {
                                                                    if (err) {
                                                                        return rollbackDelete(
                                                                            res,
                                                                            err
                                                                        );
                                                                    }
                                                                    // -----------------------------------
                                                                    // SUCCESS
                                                                    // -----------------------------------
                                                                    res.json({
                                                                        success: true,
                                                                        message:
                                                                            'Challan Deleted Successfully'
                                                                    });
                                                                });
                                                        });
                                                });

                                        });
                                });
                        });
                });
            });
    });
});

app.post('/AllChallanbyChallan_code', (req, res) => {
    const Challan_Code = req.body.Challan_Code;
    const Sqlquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    WHERE challan.Challan_Code = ?
    GROUP BY challan.Challan_id;`;
    connection.query(Sqlquery, [Challan_Code], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/AllChallanbyDate', (req, res) => {
    const Added_Date = req.body.Added_Date;
    const Sqlquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    WHERE DATE(challan.Added_Date)= ?
    GROUP BY challan.Challan_id;`;
    connection.query(Sqlquery, [Added_Date], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/ChallanbyWorkStatus', (req, res) => {
    const Work_Status = req.body.Work_Status;
    const Sqlquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    WHERE challan.Work_Status= ?
    GROUP BY challan.Challan_id;`;
    connection.query(Sqlquery, [Work_Status], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/ChallanbyChallanStatus', (req, res) => {
    const Challan_Status = req.body.Challan_Status;
    const Sqlquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    WHERE challan.Challan_Status= ? 
    GROUP BY challan.Challan_id;`;
    connection.query(Sqlquery, [Challan_Status], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/ChallanbyDeliveryStatus', (req, res) => {
    const Delivery_Status = req.body.Delivery_Status;
    const Sqlquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    WHERE challan.Delivery_Status= ?
    GROUP BY challan.Challan_id;`;
    connection.query(Sqlquery, [Delivery_Status], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/ChallanbyCustomername', (req, res) => {
    const Customer_Name = req.body.Customer_Name;
    const Sqlquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    WHERE challan.Customer_Name= ?
    GROUP BY challan.Challan_id;`;
    connection.query(Sqlquery, [Customer_Name], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/ChallanbyCompanyName', (req, res) => {
    const Company_Name = req.body.Company_Name;
    const Sqlquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    WHERE challan.Company_Name= ?
    GROUP BY challan.Challan_id;`;
    connection.query(Sqlquery, [Company_Name], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});


function box(doc, x, y, w, h) {
    doc.rect(x, y, w, h).stroke();
}

function cell(doc, text, x, y, w, h, size = 9, align = "left") {
    box(doc, x, y, w, h);
    doc.fontSize(size)
        .text(text || "", x + 5, y + 8, { width: w - 10, align });
}

app.get('/PrintInletchallan/:Challan_id', (req, res) => {
    const Challan_id = req.params.Challan_id;

    const challanquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    WHERE challan.Challan_id=?`;
    connection.query(challanquery, [Challan_id], (err, data) => {
        if (err) return res.status(500).send(err);
        if (!data.length) return res.send("No data found");
        const q = data[0];
        const doc = new PDFDocument({
            size: "A4",
            margin: 20,
            bufferPages: true
        });
        res.setHeader("Content-Type", "application/pdf");

        res.setHeader(
            "Content-Disposition",
            `inline; filename=Challan_${q.Challan_Code}.pdf`
        );

        doc.pipe(res);

        let y = 215;
        const rowHeight = 30;

        function drawHeader() {

            box(doc, 20, 20, 555, 90);

            doc.fontSize(8).text("Challan", 50, 22);

            doc.fontSize(18).text("Riya Enterprises", 200, 30);

            doc.fontSize(9).text(
                "Gala No.38, Pawana Industrial Complex, MIDC Bhosari Pune-411026", 150, 55
            );

            doc.text(
                "Phone: 9999999999 Email: manufacture@gmail.com", 170, 75
            );

            doc.text(
                "GSTIN: 27AQPBO184J1Z5 PAN: AAICP0247K", 160, 95
            );

            box(doc, 20, 115, 555, 90);

            doc.fontSize(9);
            doc.text(`Name : ${q.Customer_Name}`, 30, 125);
            doc.text(`Company Name : ${q.Company_Name}`, 30, 145);
            doc.text(`Address : ${q.Company_Address}`, 30, 165);
            doc.text(`Delivery Address : ${q.Delivery_Address}`, 30, 185);
            doc.text(`Challan Date : ${new Date(q.Added_Date).toLocaleDateString("en-IN")} `, 410, 125);
            doc.text(`Challan Code  : ${q.Challan_Code}`, 410, 145);
            doc.text(`SalesOrder Number : ${q.Sales_Order_Number}`, 410, 165);
            doc.text(`GST No : ${q.GST_No}`, 410, 185);
        }

        const cols = [
            { t: "Sr No", w: 40 },
            { t: "Product Name", w: 150 },
            { t: "HSN Code", w: 90 },
            { t: "Product Quantity", w: 110 },
            { t: "Rate", w: 80 },
            { t: "Total", w: 85 }
        ];

        function drawTableHeader() {
            let x = 20;
            cols.forEach(c => {
                cell(doc, c.t, x, y, c.w, rowHeight, 9, "center");
                x += c.w;
            });
        }

        drawHeader();

        drawTableHeader();

        y += rowHeight;

        let pageSubtotal = 0;

        const maxY = 720;

        data.forEach((item, i) => {

            if (y + rowHeight > maxY) {

                doc.text(`Subtotal : Rs ${pageSubtotal}`, 420, y + 10);

                doc.addPage();

                drawHeader();

                y = 215;

                drawTableHeader();

                y += rowHeight;

                pageSubtotal = 0;
            }

            let x = 20;

            cell(doc, i + 1, x, y, 40, rowHeight); x += 40;

            cell(doc, item.Product_Name, x, y, 150, rowHeight); x += 150;

            cell(doc, item.HSN_Code, x, y, 90, rowHeight); x += 90;

            cell(doc, item.Product_Quantity, x, y, 110, rowHeight); x += 110;

            cell(doc, item.Rate, x, y, 80, rowHeight); x += 80;

            cell(doc, item.SubTotal, x, y, 85, rowHeight);

            pageSubtotal += Number(item.SubTotal);

            y += rowHeight;

        });

        doc.text(`Page Subtotal : Rs ${pageSubtotal}`, 420, y + 10);
        // move down a little after table
        y += 30;

        // check if enough space exists
        if (y + 220 > doc.page.height - 50) {
            doc.addPage();
            drawHeader();
            y = 215;
        }

        box(doc, 20, y, 555, 130);

        doc.fontSize(9);

        doc.text(`Sub Total : Rs ${q.Sub_Total}`, 420, y + 10);
        doc.text(`Discount Amount : Rs ${q.Discount_Amount}`, 420, y + 30);
        doc.text(`Total Amount : Rs ${q.Total_Amount}`, 420, y + 50);
        doc.text(`CGST Amount : Rs ${q.CGST_amount}`, 420, y + 70);
        doc.text(`SGST Amount : Rs ${q.SGST_amount}`, 420, y + 90);

        doc.fontSize(11)
            .text(`Grand Total : Rs ${q.Grand_Total}`, 420, y + 110);

        /* ===== PROCESS & REMARK ===== */

        box(doc, 20, y + 130, 555, 70);

        doc.fontSize(9);

        doc.text(`Remark  : ${q.Remark}`, 30, y + 140);
        // doc.text(`Payment Term : ${q.Payment_term}`, 30, y + 135);
        // doc.text(`Payment Method : ${q.Payment_Method}`, 30, y + 155);
        // doc.text(`Shipping Method : ${q.Shipping_Method || "-"}`, 30, y + 175);
        // doc.text(`Delivery Address : ${q.Delivery_Address}`, 400, y + 175);

        /* ===== TRANSPORT + SIGNATURE ===== */
        box(doc, 20, y + 200, 350, 80);
        box(doc, 370, y + 200, 205, 80);

        doc.text(`Mode of Transport : ${q.Mode_of_Transport}`, 30, y + 215);
        doc.text(`Name of Transporter : ${q.Transporter_Name || "-"}`, 30, y + 235);
        doc.text(`Vehicle No : ${q.Vehicle_Number || "-"}`, 30, y + 255);
        // doc.text(`Remark  : ${q.Remark}`, 30, y + 265);
        doc.text("Receiver's Name & Signature", 250, y + 265);

        doc.text("Authorised Signatory", 400, y + 265);

        const range = doc.bufferedPageRange();

        for (let i = 0; i < range.count; i++) {

            doc.switchToPage(i);

            doc.fontSize(8).text(
                "This is a system-generated Challan.",
                0,
                doc.page.height - 55,
                { align: "center" }
            );

            doc.text(
                `Page ${i + 1} of ${range.count}`,
                0,
                doc.page.height - 40,
                { align: "center" }
            );
        }
        doc.end();
    });
});
// Inlet challan API ends

// Outward Challan

app.post("/NEWAddvendorchallan", (req, res) => {

    const {
        Vendor_Name,
        Vendor_CompanyName,
        Vendor_CompanyAddress,
        VendorGST_No,
        Vendor_Phoneno,
        Vendor_Email,

        Mode_of_Transport,
        Transporter_Name,
        Vehicle_Number,
        Remark,
        Product_Status,
        Delivery_Status,
        Challan_Status,

        vendoritems
    } = req.body;

    if (!vendoritems || vendoritems.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Products Required"
        });
    }

    const today = new Date();

    const datePart =
        today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, "0");
    // const datePart =
    //     today.getFullYear().toString() +
    //     String(today.getMonth() + 1).padStart(2, "0") +
    //     String(today.getDate()).padStart(2, "0");

    const codeSql = `
    SELECT VendorChallan_Code
    FROM vendorchallan
    WHERE VendorChallan_Code LIKE ?
    ORDER BY VendorChallan_id DESC
    LIMIT 1
    `;

    connection.query(
        codeSql,
        [`VC_${datePart}_%`],
        (err, result) => {

            if (err)
                return res.status(500).json(err);

            let NewCode = `VC_${datePart}_01`;

            if (result.length > 0) {

                const last = parseInt(result[0].VendorChallan_Code.split("_")[2]);

                NewCode = `VC_${datePart}_${String(last + 1).padStart(2, "0")}`;
            }

            let SubTotal = 0;

            vendoritems.forEach(item => {

                SubTotal += Number(item.Rate) * Number(item.Product_Quantity);

            });

            const Total_Amount = SubTotal;
            const CGST_amount = Total_Amount * 0.09;
            const SGST_amount = Total_Amount * 0.09;
            const Grand_Total = Total_Amount + CGST_amount + SGST_amount;

            const challanSql = `
            INSERT INTO vendorchallan
            (
                VendorChallan_Code,
                Vendor_Name,
                Vendor_CompanyName,
                Vendor_CompanyAddress,
                VendorGST_No,
                Vendor_Phoneno,
                Vendor_Email,

                Sub_Total,
                Total_Amount,
                CGST_amount,
                SGST_amount,
                Grand_Total,

                Mode_of_Transport,
                Transporter_Name,
                Vehicle_Number,
                Remark,

                Product_Status,
                Delivery_Status,
                Challan_Status,

                Added_Date,
                Updated_Date
            )
            VALUES
            (
                ?,?,?,?,?,?,
                ?,?,?,?,?,?,
                ?,?,?,?,
                ?,?,?,
                NOW(),
                NOW()
            )
            `;

            connection.query(
                challanSql,
                [
                    NewCode,
                    Vendor_Name,
                    Vendor_CompanyName,
                    Vendor_CompanyAddress,
                    VendorGST_No,
                    Vendor_Phoneno,
                    Vendor_Email,

                    SubTotal,
                    Total_Amount,
                    CGST_amount,
                    SGST_amount,
                    Grand_Total,

                    Mode_of_Transport,
                    Transporter_Name,
                    Vehicle_Number,
                    Remark,

                    Product_Status,
                    Delivery_Status,
                    Challan_Status
                ],
                (err, challanResult) => {

                    if (err)
                        return res.status(500).json(err);

                    const VendorChallan_id = challanResult.insertId;

                    insertProducts(0);

                    function insertProducts(index) {

                        if (index >= vendoritems.length) {

                            return res.json({
                                success: true,
                                message: "Vendor Challan Added Successfully",
                                VendorChallan_Code: NewCode
                            });

                        }

                        const item = vendoritems[index];

                        const productSql = `
                        INSERT INTO vendorproducts
                        (
                            VendorChallan_id,
                            Product_Name,
                            HSN_Code,
                            Product_Quantity,
                            Rate,
                            SubTotal
                        )
                        VALUES (?,?,?,?,?,?)
                        `;

                        connection.query(
                            productSql,
                            [
                                VendorChallan_id,
                                item.Product_Name,
                                item.HSN_Code,
                                item.Product_Quantity,
                                item.Rate,
                                item.Product_Quantity * item.Rate
                            ],
                            (err, productResult) => {

                                if (err)
                                    return res.status(500).json(err);

                                const VendorProduct_id = productResult.insertId;

                                if (item.operations && item.operations.length > 0) {

                                    const operationValues = item.operations.map(op => [

                                        VendorProduct_id,

                                        op.Operation_Name,

                                        op.Rate

                                    ]);

                                    const operationSql = `
        INSERT INTO vendorproduct_operations
        (
            VendorProduct_id,
            Operation_Name,
            Rate
        )
        VALUES ?
    `;

                                    connection.query(operationSql, [operationValues], (err) => {

                                        if (err) {
                                            console.log(err);
                                            return res.status(500).json(err);
                                        }

                                        insertProducts(index + 1);

                                    });

                                }
                                else {

                                    insertProducts(index + 1);

                                }
                                // if (
                                //     item.Operation_Perform &&
                                //     item.Operation_Perform.length > 0
                                // ) {

                                //     const operationValues = item.Operation_Perform.map(op => [
                                //         VendorProduct_id,
                                //         op
                                //     ]);

                                //     const operationSql = `
                                //     INSERT INTO vendorproduct_operations
                                //     (
                                //         VendorProduct_id,
                                //         Operation_Name,
                                //         Rate
                                //     )
                                //     VALUES ?
                                //     `;
                                //     connection.query(
                                //         operationSql,
                                //         [operationValues],
                                //         (err) => {
                                //             if (err)
                                //                 return res.status(500).json(err);
                                //             insertProducts(index + 1);
                                //         }
                                //     );
                                // }
                                // else {
                                //     insertProducts(index + 1);
                                // }
                            });
                    }
                });
        });
});

app.post("/Addvendorchallan", (req, res) => {
    const {
        Vendor_Name,
        Vendor_CompanyName,
        Vendor_CompanyAddress,
        VendorGST_No,
        Vendor_Phoneno,
        Vendor_Email,

        Mode_of_Transport,
        Transporter_Name,
        Vehicle_Number,
        Remark,
        Product_Status,
        Delivery_Status,
        Challan_Status,

        vendoritems
    } = req.body;

    if (!vendoritems || !vendoritems.length) {
        return res.status(400).json({ message: "Products Required" });
    }

    // const datePart = Challan_Code.split("_")[0];
    const today = new Date();

    const datePart =
        today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, "0") +
        String(today.getDate()).padStart(2, "0");

    const qNoSql = `
SELECT VendorChallan_Code 
FROM vendorchallan 
WHERE VendorChallan_Code LIKE 'VC_${datePart}_%' 
ORDER BY VendorChallan_id DESC
LIMIT 1
`;

    connection.query(qNoSql, (err, result) => {
        if (err) return res.status(500).send(err);

        let NewCode = `VC_${datePart}_01`;

        if (result.length) {
            const last = parseInt(result[0].VendorChallan_Code.split("_")[2]);
            const next = String(last + 1).padStart(2, "0");
            NewCode = `VC_${datePart}_${next}`;
        }
        console.log("New Challan :", NewCode);

        let SubTotal = 0;
        vendoritems.forEach(i => {
            SubTotal += i.Rate * i.Product_Quantity;
        });
        const Total_Amount = SubTotal;
        const CGST_amount = Total_Amount * 0.09;
        const SGST_amount = Total_Amount * 0.09;
        const Grand_Total =
            Total_Amount + CGST_amount + SGST_amount;

        const VendorSql = `
      INSERT INTO vendorchallan
      (VendorChallan_Code, Vendor_Name, Vendor_CompanyName, Vendor_CompanyAddress,VendorGST_No, Vendor_Phoneno, Vendor_Email,
        Sub_Total, Total_Amount, CGST_amount, SGST_amount, Grand_Total,Mode_of_Transport,Transporter_Name,  
        Vehicle_Number, Remark, Product_Status, Delivery_Status, Challan_Status, Added_Date, Updated_Date)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
    `;

        const inletValues = [
            NewCode,
            Vendor_Name,
            Vendor_CompanyName,
            Vendor_CompanyAddress,
            VendorGST_No,
            Vendor_Phoneno,
            Vendor_Email,

            SubTotal,
            Total_Amount,
            CGST_amount,
            SGST_amount,
            Grand_Total,
            Mode_of_Transport,
            Transporter_Name,
            Vehicle_Number,
            Remark,
            Product_Status,
            Delivery_Status,
            Challan_Status,
        ];

        connection.query(VendorSql, inletValues, (err, qResult) => {
            if (err) return res.status(500).send(err);

            const VendorChallan_id = qResult.insertId;

            const itemSql = `
        INSERT INTO vendorproducts
        (VendorChallan_id, Product_Name, HSN_Code,
        Operation_Perform, Product_Quantity,Rate, SubTotal)
        VALUES ?
      `;

            const itemValues = vendoritems.map(i => [

                VendorChallan_id,

                i.Product_Name,
                i.HSN_Code,
                i.Operation_Perform,
                i.Product_Quantity,
                i.Rate,
                i.Rate * i.Product_Quantity
            ]);

            connection.query(itemSql, [itemValues], err => {
                if (err) return res.status(500).send(err);

                res.json({
                    success: true,
                    message: "Outward Vendor Challan with multiple products Added",
                    VendorChallan_Code: NewCode
                });
            });
        });
    });
});

// app.put('/UpdateVendorChallan/:VendorChallan_id', (req, res) => {

//     const token = req.headers['x-access-token'];

//     if (!token) {
//         return res.status(401).send({
//             success: false,
//             message: "Unauthorized"
//         });
//     }

//     jwt.verify(token, secrect, (err, decoded) => {

//         if (err) {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         if (decoded.Role !== "Admin") {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         const VendorChallan_id = req.params.VendorChallan_id;

//         const {
//             Vendor_Name,
//             Vendor_CompanyName,
//             Vendor_CompanyAddress,
//             VendorGST_No,
//             Vendor_Phoneno,
//             Vendor_Email,

//             Mode_of_Transport,
//             Transporter_Name,
//             Vehicle_Number,
//             Remark,
//             Product_Status,
//             Delivery_Status,
//             Challan_Status,

//             vendoritems
//         } = req.body;

//         if (!vendoritems || vendoritems.length == 0) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Products Required"
//             });
//         }

//         //-------------------------
//         // Calculate Amount
//         //-------------------------

//         let SubTotal = 0;
//         vendoritems.forEach(i => {
//             SubTotal += Number(i.Product_Quantity) * Number(i.Rate);
//         });
//         const Total_Amount = SubTotal;
//         const CGST_amount = Total_Amount * 0.09;
//         const SGST_amount = Total_Amount * 0.09;
//         const Grand_Total =
//             Total_Amount + CGST_amount + SGST_amount;

//         //-------------------------
//         // Update Header
//         //-------------------------

//         const UpdateSql = `
//         UPDATE vendorchallan
//         SET

//         Vendor_Name=?,
//         Vendor_CompanyName	=?,
//         Vendor_CompanyAddress=?,
//         VendorGST_No=?,
//         Vendor_Phoneno=?,
//         Vendor_Email=?,

//         Sub_Total=?,
//         Total_Amount=?,
//         CGST_amount=?,
//         SGST_amount=?,
//         Grand_Total=?,

//         Mode_of_Transport=?,
//         Transporter_Name=?,
//         Vehicle_Number=?,
//         Remark=?,

//         Product_Status=?,
//         Delivery_Status=?,
//         Challan_Status=?,

//         Updated_Date=NOW()
//         WHERE VendorChallan_id=?
//         `;

//         const HeaderValues = [

//             Vendor_Name,
//             Vendor_CompanyName,
//             Vendor_CompanyAddress,
//             VendorGST_No,
//             Vendor_Phoneno,
//             Vendor_Email,

//             SubTotal,
//             Total_Amount,
//             CGST_amount,
//             SGST_amount,
//             Grand_Total,

//             Mode_of_Transport,
//             Transporter_Name,
//             Vehicle_Number,
//             Remark,

//             Product_Status,
//             Delivery_Status,
//             Challan_Status,

//             VendorChallan_id
//         ];

//         connection.query(UpdateSql, HeaderValues, (err) => {
//             if (err) {
//                 return res.status(500).send({
//                     success: false,
//                     message: err.sqlMessage
//                 });
//             }
//             //-------------------------
//             // Delete Old Products
//             //-------------------------
//             connection.query(
//                 "DELETE FROM vendorproducts WHERE VendorChallan_id=?",
//                 [VendorChallan_id],
//                 (err) => {
//                     if (err) {
//                         return res.status(500).send({
//                             success: false,
//                             message: err.sqlMessage
//                         });
//                     }
//                     //-------------------------
//                     // Insert Products Again
//                     //-------------------------
//                     const InsertProductSql = `
//                     INSERT INTO vendorproducts
//                     (
//                     VendorChallan_id,
//                     Product_Name,
//                     HSN_Code,
//                     Operation_Perform,
//                     Product_Quantity,
//                     Rate,
//                     SubTotal
//                     )
//                     VALUES ?
//                     `;

//                     const ProductValues = vendoritems.map(i => [
//                         VendorChallan_id,
//                         i.Product_Name,
//                         i.HSN_Code,
//                         i.Operation_Perform,
//                         i.Product_Quantity,
//                         i.Rate,
//                         Number(i.Product_Quantity) * Number(i.Rate)
//                     ]);

//                     connection.query(

//                         InsertProductSql,
//                         [ProductValues],
//                         (err) => {
//                             if (err) {
//                                 return res.status(500).send({
//                                     success: false,
//                                     message: err.sqlMessage
//                                 });
//                             }
//                             res.send({
//                                 success: true,
//                                 message: "Vendor Challan Updated Successfully"
//                             });
//                         });
//                 });
//         });
//     });
// });

// app.put('/UpdateVendorChallan/:VendorChallan_id', (req, res) => {
//     const token = req.headers['x-access-token'];

//     if (!token) {
//         return res.status(401).send({
//             success: false,
//             message: "Unauthorized"
//         });
//     }

//     jwt.verify(token, secrect, (err, decoded) => {

//         if (err) {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         if (decoded.Role !== "Admin") {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         const VendorChallan_id = req.params.VendorChallan_id;

//         const {
//             Vendor_Name,
//             Vendor_CompanyName,
//             Vendor_CompanyAddress,
//             VendorGST_No,
//             Vendor_Phoneno,
//             Vendor_Email,

//             Mode_of_Transport,
//             Transporter_Name,
//             Vehicle_Number,
//             Remark,
//             Product_Status,
//             Delivery_Status,
//             Challan_Status,

//             vendoritems
//         } = req.body;

//         if (!vendoritems || vendoritems.length == 0) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Products Required"
//             });
//         }

//         //-------------------------
//         // Calculate Amount
//         //-------------------------

//         let SubTotal = 0;
//         vendoritems.forEach(i => {
//             SubTotal += Number(i.Product_Quantity) * Number(i.Rate);
//         });
//         const Total_Amount = SubTotal;
//         const CGST_amount = Total_Amount * 0.09;
//         const SGST_amount = Total_Amount * 0.09;
//         const Grand_Total =
//             Total_Amount + CGST_amount + SGST_amount;

//         //-------------------------
//         // Update Header
//         //-------------------------

//         const UpdateSql = `
//         UPDATE vendorchallan
//         SET

//         Vendor_Name=?,
//         Vendor_CompanyName	=?,
//         Vendor_CompanyAddress=?,
//         VendorGST_No=?,
//         Vendor_Phoneno=?,
//         Vendor_Email=?,

//         Sub_Total=?,
//         Total_Amount=?,
//         CGST_amount=?,
//         SGST_amount=?,
//         Grand_Total=?,

//         Mode_of_Transport=?,
//         Transporter_Name=?,
//         Vehicle_Number=?,
//         Remark=?,

//         Product_Status=?,
//         Delivery_Status=?,
//         Challan_Status=?,

//         Updated_Date=NOW()
//         WHERE VendorChallan_id=?
//         `;

//         const HeaderValues = [

//             Vendor_Name,
//             Vendor_CompanyName,
//             Vendor_CompanyAddress,
//             VendorGST_No,
//             Vendor_Phoneno,
//             Vendor_Email,

//             SubTotal,
//             Total_Amount,
//             CGST_amount,
//             SGST_amount,
//             Grand_Total,

//             Mode_of_Transport,
//             Transporter_Name,
//             Vehicle_Number,
//             Remark,

//             Product_Status,
//             Delivery_Status,
//             Challan_Status,

//             VendorChallan_id
//         ];

//         connection.query(UpdateSql, HeaderValues, (err) => {
//             if (err) {
//                 return res.status(500).send({
//                     success: false,
//                     message: err.sqlMessage
//                 });
//             }
//             connection.query(
//                 "SELECT VendorProduct_id FROM vendorproducts WHERE VendorChallan_id=?",
//                 [VendorChallan_id],
//                 (err, oldProducts) => {

//                     if (err) {
//                         return res.status(500).send({
//                             success: false,
//                             message: err.sqlMessage
//                         });
//                     }

//                     let existingIds = [];
//                     let i = 0;

//                     function saveProduct() {

//                         if (i >= vendoritems.length) {

//                             const deleteIds = oldProducts
//                                 .map(x => x.VendorProduct_id)
//                                 .filter(id => !existingIds.includes(id));

//                             if (deleteIds.length == 0) {

//                                 return res.send({
//                                     success: true,
//                                     message: "Challan Updated Successfully"
//                                 });
//                             }

//                             connection.query(
//                                 "DELETE FROM vendorproducts WHERE VendorProduct_id IN (?)",
//                                 [deleteIds],
//                                 (err) => {

//                                     if (err) {

//                                         return res.status(500).send({
//                                             success: false,
//                                             message: err.sqlMessage
//                                         });
//                                     }

//                                     res.send({
//                                         success: true,
//                                         message: "Challan Updated Successfully"
//                                     });

//                                 });

//                             return;

//                         }

//                         const p = vendoritems[i];

//                         const subtotal =
//                             Number(p.Product_Quantity) * Number(p.Rate);

//                         if (p.VendorProduct_id && p.VendorProduct_id > 0) {

//                             existingIds.push(p.VendorProduct_id);

//                             connection.query(
//                                 `UPDATE vendorproducts
//                      SET
//                      Product_Name=?,
//                      HSN_Code=?,
//                      Product_Quantity=?,
//                      Rate=?,
//                      SubTotal=?
//                      WHERE VendorProduct_id=?`,
//                                 [
//                                     p.Product_Name,
//                                     p.HSN_Code,
//                                     p.Product_Quantity,
//                                     p.Rate,
//                                     subtotal,
//                                     p.VendorProduct_id
//                                 ],
//                                 (err) => {

//                                     if (err) {
//                                         return res.status(500).send({
//                                             success: false,
//                                             message: err.sqlMessage
//                                         });
//                                     }

//                                     i++;
//                                     saveProduct();

//                                 });


//                             function saveOperations() {

//                                 let k = 0;

//                                 function insertOperation() {

//                                     if (k >= p.operations.length) {

//                                         i++;

//                                         return saveProduct();

//                                     }

//                                     const op = p.operations[k];

//                                     connection.query(

//                                         `INSERT INTO vendorproduct_operations
//         (
//             VendorProduct_id,
//             Operation_Name,
//             Rate
//         )
//         VALUES(?,?,?)`,

//                                         [

//                                             p.VendorProduct_id,

//                                             op.Operation_Name,

//                                             op.Rate

//                                         ],

//                                         (err) => {

//                                             if (err) {

//                                                 return res.status(500).send({
//                                                     success: false,
//                                                     message: err.sqlMessage
//                                                 });

//                                             }

//                                             k++;

//                                             insertOperation();

//                                         });

//                                 }

//                                 insertOperation();

//                             }
//                         }
//                         else {

//                             connection.query(
//                                 `INSERT INTO vendorproducts
//                     (
//                         VendorChallan_id,
//                         Product_Name,
//                         HSN_Code,
//                         Product_Quantity,
//                         Rate,
//                         SubTotal
//                     )
//                     VALUES (?,?,?,?,?,?)`,
//                                 [
//                                     VendorChallan_id,
//                                     p.Product_Name,
//                                     p.HSN_Code,
//                                     p.Product_Quantity,
//                                     p.Rate,
//                                     subtotal
//                                 ],
//                                 (err) => {

//                                     if (err) {
//                                         return res.status(500).send({
//                                             success: false,
//                                             message: err.sqlMessage
//                                         });
//                                     }
//                                     i++;
//                                     saveProduct();

//                                 });
//                         }
//                     }
//                     saveProduct();
//                 }
//             );

//         });
//     });
// });

app.get('/TotalNumberofVendorChallan', (req, res) => {
    const countquery = `select count(*) as TotalVendorChallan from vendorchallan`;
    connection.query(countquery, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Number of Vendor Challan',
                data: data
            });
        }
    });
});

// app.get('/AllVendorChallan', (req, res) => {
//     const newquery = ` SELECT 
//       vc.*,
//       vp.VendorProduct_id,
//       vp.Product_Name,
//       vp.HSN_Code,
//       vp.Product_Quantity,
//       vp.Rate AS Product_Rate,
//       vp.SubTotal,
//       vo.Operation_id,
//       vo.Operation_Name,
//       vo.Rate AS Operation_Rate
//     FROM vendorchallan vc
//     LEFT JOIN vendorproducts vp 
//       ON vc.VendorChallan_id = vp.VendorChallan_id
//     LEFT JOIN vendorproduct_operations vo 
//       ON vp.VendorProduct_id = vo.VendorProduct_id
//     ORDER BY vp.VendorProduct_id, vo.Operation_id`;

//     connection.query(newquery, (err, rows) => {

//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: err.sqlMessage
//             });
//         }

//         if (!rows.length) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Vendor Challan not found'
//             });
//         }

//         const first = rows[0];

//         const challan = {
//             VendorChallan_id: first.VendorChallan_id,
//             VendorChallan_Code: first.VendorChallan_Code,
//             Vendor_Name: first.Vendor_Name,
//             Vendor_CompanyName: first.Vendor_CompanyName,
//             Vendor_CompanyAddress: first.Vendor_CompanyAddress,
//             VendorGST_No: first.VendorGST_No,
//             Vendor_Phoneno: first.Vendor_Phoneno,
//             Vendor_Email: first.Vendor_Email,
//             Sub_Total: first.Sub_Total,
//             Total_Amount: first.Total_Amount,
//             CGST_amount: first.CGST_amount,
//             SGST_amount: first.SGST_amount,
//             Grand_Total: first.Grand_Total,
//             Mode_of_Transport: first.Mode_of_Transport,
//             Transporter_Name: first.Transporter_Name,
//             Vehicle_Number: first.Vehicle_Number,
//             Remark: first.Remark,
//             Product_Status: first.Product_Status,
//             Delivery_Status: first.Delivery_Status,
//             Challan_Status: first.Challan_Status,
//             Added_Date: first.Added_Date,
//             Updated_Date: first.Updated_Date,
//             vendoritems: []
//         };

//         const productMap = {};

//         rows.forEach(row => {
//             if (!row.VendorProduct_id) return;

//             if (!productMap[row.VendorProduct_id]) {
//                 productMap[row.VendorProduct_id] = {
//                     VendorProduct_id: row.VendorProduct_id,
//                     Product_Name: row.Product_Name,
//                     HSN_Code: row.HSN_Code,
//                     Product_Quantity: row.Product_Quantity,
//                     Rate: row.Product_Rate,
//                     SubTotal: row.SubTotal,
//                     operations: []
//                 };

//                 challan.vendoritems.push(productMap[row.VendorProduct_id]);
//             }

//             if (row.Operation_id) {
//                 productMap[row.VendorProduct_id].operations.push({
//                     Operation_id: row.Operation_id,
//                     Operation_Name: row.Operation_Name,
//                     Rate: row.Operation_Rate
//                 });
//             }
//         });

//         res.json({
//             success: true,
//             data: challan
//         });

//         // if (err) {
//         //     return res.status(500).json({
//         //         success: false,
//         //         message: err.sqlMessage
//         //     });
//         // }

//         // const challans = {};

//         // rows.forEach(row => {

//         //     if (!challans[row.VendorChallan_id]) {

//         //         challans[row.VendorChallan_id] = {

//         //             VendorChallan_id: row.VendorChallan_id,
//         //             VendorChallan_Code: row.VendorChallan_Code,
//         //             Vendor_Name: row.Vendor_Name,
//         //             Vendor_CompanyName: row.Vendor_CompanyName,
//         //             Vendor_CompanyAddress: row.Vendor_CompanyAddress,
//         //             VendorGST_No: row.VendorGST_No,
//         //             Vendor_Phoneno: row.Vendor_Phoneno,
//         //             Vendor_Email: row.Vendor_Email,

//         //             Sub_Total: row.Sub_Total,
//         //             Total_Amount: row.Total_Amount,
//         //             CGST_amount: row.CGST_amount,
//         //             SGST_amount: row.SGST_amount,
//         //             Grand_Total: row.Grand_Total,

//         //             Mode_of_Transport: row.Mode_of_Transport,
//         //             Transporter_Name: row.Transporter_Name,
//         //             Vehicle_Number: row.Vehicle_Number,
//         //             Remark: row.Remark,

//         //             Product_Status: row.Product_Status,
//         //             Delivery_Status: row.Delivery_Status,
//         //             Challan_Status: row.Challan_Status,

//         //             Added_Date: row.Added_Date,
//         //             Updated_Date: row.Updated_Date,

//         //             vendoritems: []
//         //         };
//         //     }

//         //     let product = challans[row.VendorChallan_id].vendoritems.find(
//         //         p => p.VendorProduct_id === row.VendorProduct_id
//         //     );

//         //     if (!product) {

//         //         // product = {
//         //         //     VendorProduct_id: row.VendorProduct_id,
//         //         //     Product_Name: row.Product_Name,
//         //         //     HSN_Code: row.HSN_Code,
//         //         //     Product_Quantity: row.Product_Quantity,
//         //         //     Rate: row.Rate,
//         //         //     SubTotal: row.SubTotal,

//         //         //     Operation_Perform: []
//         //         // };
//         //         product = {

//         //             VendorProduct_id: row.VendorProduct_id,
//         //             Product_Name: row.Product_Name,
//         //             HSN_Code: row.HSN_Code,
//         //             Product_Quantity: row.Product_Quantity,
//         //             Rate: row.Rate,
//         //             SubTotal: row.SubTotal,

//         //             // GROUP_CONCAT already returns a comma-separated string
//         //             Operation_Perform: row.Operation_Perform || ""
//         //         };

//         //         challans[row.VendorChallan_id].vendoritems.push(product);
//         //     }

//         //     if (row.Operation_Name) {
//         //         product.Operation_Perform.push(row.Operation_Name);
//         //     }

//         // });

//         // res.json({
//         //     success: true,
//         //     data: Object.values(challans)
//         // });

//     });
// });


// app.get('/AllVendorChallan', (req, res) => {
//     const newquery = `SELECT vchallan.*, vproduct.*
//     FROM vendorchallan vchallan
//     JOIN vendorproducts vproduct 
//     ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
//     ORDER BY vchallan.VendorChallan_id DESC`;

//     connection.query(newquery, (err, rows) => {
//         if (err) {
//             return res.status(500).json({ success: false, message: err.sqlMessage });
//         }
//         if (!rows.length) {
//             return res.json({ success: true, data: [] });
//         }
//         const result = {};
//         rows.forEach(row => {

//             if (!result[row.VendorChallan_id]) {
//                 result[row.VendorChallan_id] = {
//                     VendorChallan_id: row.VendorChallan_id,
//                     VendorChallan_Code: row.VendorChallan_Code,
//                     Vendor_Name: row.Vendor_Name,
//                     Vendor_CompanyName: row.Vendor_CompanyName,
//                     Vendor_CompanyAddress: row.Vendor_CompanyAddress,
//                     VendorGST_No: row.VendorGST_No,
//                     Vendor_Phoneno: row.Vendor_Phoneno,
//                     Vendor_Email: row.Vendor_Email,
//                     Sub_Total: row.Sub_Total,
//                     Total_Amount: row.Total_Amount,
//                     CGST_amount: row.CGST_amount,
//                     SGST_amount: row.SGST_amount,
//                     Grand_Total: row.Grand_Total,
//                     Mode_of_Transport: row.Mode_of_Transport,
//                     Transporter_Name: row.Transporter_Name,
//                     Vehicle_Number: row.Vehicle_Number,
//                     Remark: row.Remark,
//                     Product_Status: row.Product_Status,
//                     Delivery_Status: row.Delivery_Status,
//                     Challan_Status: row.Challan_Status,
//                     Added_Date: row.Added_Date,
//                     Updated_Date: row.Updated_Date,
//                     vendoritems: []
//                 };
//             }

//             result[row.VendorChallan_id].vendoritems.push({
//                 VendorProduct_id: row.VendorProduct_id,
//                 Product_Name: row.Product_Name,
//                 HSN_Code: row.HSN_Code,
//                 Operation_Perform: row.Operation_Perform,
//                 Product_Quantity: row.Product_Quantity,
//                 Rate: row.Rate,
//                 SubTotal: row.SubTotal,
//             });

//         });

//         // ✅ SORT AFTER GROUPING
//         const finalData = Object.values(result).sort(
//             (a, b) => new Date(b.Added_Date) - new Date(a.Added_Date)
//         );

//         res.json({
//             success: true,
//             data: finalData
//         });

//     });
// });


app.get('/AllVendorChallan', (req, res) => {

    const query = `
        SELECT
            vc.*,
            vp.VendorProduct_id,
            vp.Product_Name,
            vp.HSN_Code,
            vp.Product_Quantity,
            vp.Rate AS Product_Rate,
            vp.SubTotal,

            vo.Operation_id,
            vo.Operation_Name,
            vo.Rate AS Operation_Rate

        FROM vendorchallan vc

        LEFT JOIN vendorproducts vp
            ON vc.VendorChallan_id = vp.VendorChallan_id

        LEFT JOIN vendorproduct_operations vo
            ON vp.VendorProduct_id = vo.VendorProduct_id

        ORDER BY
            vc.VendorChallan_id DESC,
            vp.VendorProduct_id,
            vo.Operation_id;
                `;

    connection.query(query, (err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.sqlMessage
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Vendor Challan Found"
            });
        }

        const challans = {};

        rows.forEach(row => {

            // Create Challan
            if (!challans[row.VendorChallan_id]) {

                challans[row.VendorChallan_id] = {

                    VendorChallan_id: row.VendorChallan_id,
                    VendorChallan_Code: row.VendorChallan_Code,

                    Vendor_Name: row.Vendor_Name,
                    Vendor_CompanyName: row.Vendor_CompanyName,
                    Vendor_CompanyAddress: row.Vendor_CompanyAddress,
                    VendorGST_No: row.VendorGST_No,
                    Vendor_Phoneno: row.Vendor_Phoneno,
                    Vendor_Email: row.Vendor_Email,

                    Sub_Total: row.Sub_Total,
                    Total_Amount: row.Total_Amount,
                    CGST_amount: row.CGST_amount,
                    SGST_amount: row.SGST_amount,
                    Grand_Total: row.Grand_Total,

                    Mode_of_Transport: row.Mode_of_Transport,
                    Transporter_Name: row.Transporter_Name,
                    Vehicle_Number: row.Vehicle_Number,
                    Remark: row.Remark,

                    Product_Status: row.Product_Status,
                    Delivery_Status: row.Delivery_Status,
                    Challan_Status: row.Challan_Status,

                    Added_Date: row.Added_Date,
                    Updated_Date: row.Updated_Date,

                    vendoritems: []
                };
            }

            const challan = challans[row.VendorChallan_id];

            // Find Product
            let product = challan.vendoritems.find(
                p => p.VendorProduct_id == row.VendorProduct_id
            );

            // Create Product
            if (!product && row.VendorProduct_id) {

                product = {

                    VendorProduct_id: row.VendorProduct_id,
                    Product_Name: row.Product_Name,
                    HSN_Code: row.HSN_Code,
                    Product_Quantity: row.Product_Quantity,
                    Rate: row.Product_Rate,
                    SubTotal: row.SubTotal,

                    operations: []
                };

                challan.vendoritems.push(product);
            }

            // Add Operation
            if (product && row.Operation_id) {

                product.operations.push({

                    Operation_id: row.Operation_id,
                    Operation_Name: row.Operation_Name,
                    Rate: row.Operation_Rate

                });

            }

        });

        res.json({

            success: true,
            data: Object.values(challans)

        });

    });

});

app.get('/LimitedVendorChallan', (req, res) => {
    const newquery = `SELECT * FROM vendorchallan ORDER BY VendorChallan_id DESC LIMIT 3;`;

    //     const newquery = `SELECT vchallan.VendorChallan_id, vchallan.*, vproduct.*
    // FROM vendorchallan vchallan
    // JOIN vendorproducts vproduct
    // ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
    // ORDER BY vchallan.VendorChallan_id DESC
    // LIMIT 3;`;
    // const newquery = `SELECT vchallan.*, vproduct.*
    // FROM vendorchallan vchallan
    // JOIN vendorproducts vproduct 
    // ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
    // LIMIT 3`;

    connection.query(newquery, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.sqlMessage });
        }
        if (!rows.length) {
            return res.json({ success: true, data: [] });
        }
        const result = {};
        rows.forEach(row => {

            if (!result[row.VendorChallan_id]) {
                result[row.VendorChallan_id] = {
                    VendorChallan_id: row.VendorChallan_id,
                    VendorChallan_Code: row.VendorChallan_Code,
                    Vendor_Name: row.Vendor_Name,
                    Vendor_CompanyName: row.Vendor_CompanyName,
                    Vendor_CompanyAddress: row.Vendor_CompanyAddress,
                    VendorGST_No: row.VendorGST_No,
                    Vendor_Phoneno: row.Vendor_Phoneno,
                    Vendor_Email: row.Vendor_Email,
                    Sub_Total: row.Sub_Total,
                    Total_Amount: row.Total_Amount,
                    CGST_amount: row.CGST_amount,
                    SGST_amount: row.SGST_amount,
                    Grand_Total: row.Grand_Total,
                    Mode_of_Transport: row.Mode_of_Transport,
                    Transporter_Name: row.Transporter_Name,
                    Vehicle_Number: row.Vehicle_Number,
                    Remark: row.Remark,
                    Product_Status: row.Product_Status,
                    Delivery_Status: row.Delivery_Status,
                    Challan_Status: row.Challan_Status,
                    Added_Date: row.Added_Date,
                    Updated_Date: row.Updated_Date,
                    vendoritems: []
                };
            }

            result[row.VendorChallan_id].vendoritems.push({
                VendorProduct_id: row.VendorProduct_id,
                Product_Name: row.Product_Name,
                HSN_Code: row.HSN_Code,
                Operation_Perform: row.Operation_Perform,
                Product_Quantity: row.Product_Quantity,
                Rate: row.Rate,
                SubTotal: row.SubTotal,
            });

        });

        // ✅ SORT AFTER GROUPING
        const finalData = Object.values(result).sort(
            (a, b) => new Date(b.Added_Date) - new Date(a.Added_Date)
        );

        res.json({
            success: true,
            data: finalData
        });

    });
});

app.put('/UpdateVendorChallan/:VendorChallan_id', (req, res) => {
    const VendorChallan_id = req.params.VendorChallan_id;

    const {
        Vendor_Name,
        Vendor_CompanyName,
        Vendor_CompanyAddress,
        VendorGST_No,
        Vendor_Phoneno,
        Vendor_Email,
        Mode_of_Transport,
        Transporter_Name,
        Vehicle_Number,
        Remark,
        Product_Status,
        Delivery_Status,
        Challan_Status,
        vendoritems
    } = req.body;

    if (!vendoritems || vendoritems.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Products Required'
        });
    }

    let Sub_Total = 0;

    // vendoritems.forEach(item => {
    //     Sub_Total += Number(item.Product_Quantity || 0) * Number(item.Rate || 0);
    // });
    vendoritems.forEach(item => {
        const operationRate = (item.operations || []).reduce((sum, op) => {
            return sum + Number(op.Rate || 0);
        }, 0);

        item.Rate = operationRate;
        item.SubTotal = Number(item.Product_Quantity || 0) * operationRate;

        Sub_Total += item.SubTotal;
    });

    const Total_Amount = Sub_Total;
    const CGST_amount = Total_Amount * 0.09;
    const SGST_amount = Total_Amount * 0.09;
    const Grand_Total = Total_Amount + CGST_amount + SGST_amount;

    connection.beginTransaction(err => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.sqlMessage
            });
        }

        const updateChallanSql = `
      UPDATE vendorchallan
      SET
        Vendor_Name = ?,
        Vendor_CompanyName = ?,
        Vendor_CompanyAddress = ?,
        VendorGST_No = ?,
        Vendor_Phoneno = ?,
        Vendor_Email = ?,
        Sub_Total = ?,
        Total_Amount = ?,
        CGST_amount = ?,
        SGST_amount = ?,
        Grand_Total = ?,
        Mode_of_Transport = ?,
        Transporter_Name = ?,
        Vehicle_Number = ?,
        Remark = ?,
        Product_Status = ?,
        Delivery_Status = ?,
        Challan_Status = ?,
        Updated_Date = NOW()
      WHERE VendorChallan_id = ?
    `;

        const challanValues = [
            Vendor_Name,
            Vendor_CompanyName,
            Vendor_CompanyAddress,
            VendorGST_No,
            Vendor_Phoneno,
            Vendor_Email,
            Sub_Total,
            Total_Amount,
            CGST_amount,
            SGST_amount,
            Grand_Total,
            Mode_of_Transport,
            Transporter_Name,
            Vehicle_Number,
            Remark,
            Product_Status,
            Delivery_Status,
            Challan_Status,
            VendorChallan_id
        ];

        connection.query(updateChallanSql, challanValues, err => {
            if (err) return rollback(res, err);

            connection.query(
                'SELECT VendorProduct_id FROM vendorproducts WHERE VendorChallan_id = ?',
                [VendorChallan_id],
                (err, oldProducts) => {
                    if (err) return rollback(res, err);

                    const savedProductIds = [];
                    let index = 0;

                    function saveNextProduct() {
                        if (index >= vendoritems.length) {
                            const oldIds = oldProducts.map(p => p.VendorProduct_id);
                            const deleteIds = oldIds.filter(id => !savedProductIds.includes(id));

                            if (deleteIds.length === 0) {
                                return commit(res);
                            }

                            connection.query(
                                'DELETE FROM vendorproduct_operations WHERE VendorProduct_id IN (?)',
                                [deleteIds],
                                err => {
                                    if (err) return rollback(res, err);

                                    connection.query(
                                        'DELETE FROM vendorproducts WHERE VendorProduct_id IN (?)',
                                        [deleteIds],
                                        err => {
                                            if (err) return rollback(res, err);
                                            commit(res);
                                        }
                                    );
                                }
                            );

                            return;
                        }

                        const product = vendoritems[index];
                        const productSubtotal =
                            Number(product.Product_Quantity || 0) * Number(product.Rate || 0);

                        if (product.VendorProduct_id) {
                            savedProductIds.push(product.VendorProduct_id);

                            const updateProductSql = `
                UPDATE vendorproducts
                SET
                  Product_Name = ?,
                  HSN_Code = ?,
                  Product_Quantity = ?,
                  Rate = ?,
                  SubTotal = ?
                WHERE VendorProduct_id = ?
              `;

                            connection.query(
                                updateProductSql,
                                [
                                    product.Product_Name,
                                    product.HSN_Code,
                                    product.Product_Quantity,
                                    product.Rate,
                                    productSubtotal,
                                    product.VendorProduct_id
                                ],
                                err => {
                                    if (err) return rollback(res, err);
                                    saveOperations(product.VendorProduct_id, product.operations || []);
                                }
                            );
                        } else {
                            const insertProductSql = `
                INSERT INTO vendorproducts
                (
                  VendorChallan_id,
                  Product_Name,
                  HSN_Code,
                  Product_Quantity,
                  Rate,
                  SubTotal
                )
                VALUES (?, ?, ?, ?, ?, ?)
              `;

                            connection.query(
                                insertProductSql,
                                [
                                    VendorChallan_id,
                                    product.Product_Name,
                                    product.HSN_Code,
                                    product.Product_Quantity,
                                    product.Rate,
                                    productSubtotal
                                ],
                                (err, result) => {
                                    if (err) return rollback(res, err);

                                    const newProductId = result.insertId;
                                    savedProductIds.push(newProductId);

                                    saveOperations(newProductId, product.operations || []);
                                }
                            );
                        }
                    }
                    function saveOperations(VendorProduct_id, operations) {
                        connection.query(
                            'SELECT Operation_id FROM vendorproduct_operations WHERE VendorProduct_id = ?',
                            [VendorProduct_id],
                            (err, oldOperations) => {
                                if (err) return rollback(res, err);

                                const savedOperationIds = [];
                                let opIndex = 0;

                                function saveNextOperation() {
                                    if (opIndex >= operations.length) {
                                        const oldIds = oldOperations.map(o => o.Operation_id);
                                        const deleteIds = oldIds.filter(id => !savedOperationIds.includes(id));

                                        if (deleteIds.length === 0) {
                                            index++;
                                            return saveNextProduct();
                                        }

                                        connection.query(
                                            'DELETE FROM vendorproduct_operations WHERE Operation_id IN (?)',
                                            [deleteIds],
                                            err => {
                                                if (err) return rollback(res, err);
                                                index++;
                                                saveNextProduct();
                                            }
                                        );

                                        return;
                                    }

                                    const op = operations[opIndex];

                                    if (op.Operation_id && op.Operation_id != 0) {
                                        savedOperationIds.push(op.Operation_id);

                                        connection.query(
                                            `
                        UPDATE vendorproduct_operations
                        SET Operation_Name = ?, Rate = ?
                        WHERE Operation_id = ?
                        `,
                                            [op.Operation_Name, op.Rate, op.Operation_id],
                                            err => {
                                                if (err) return rollback(res, err);
                                                opIndex++;
                                                saveNextOperation();
                                            }
                                        );
                                    } else {
                                        connection.query(
                                            `
                        INSERT INTO vendorproduct_operations
                        (VendorProduct_id, Operation_Name, Rate)
                        VALUES (?, ?, ?)
                        `,
                                            [VendorProduct_id, op.Operation_Name, op.Rate],
                                            (err, result) => {
                                                if (err) return rollback(res, err);
                                                savedOperationIds.push(result.insertId);
                                                opIndex++;
                                                saveNextOperation();
                                            }
                                        );
                                    }
                                }

                                saveNextOperation();
                            }
                        );
                    }
                    //     function saveOperations(VendorProduct_id, operations) {
                    //         connection.query(
                    //             'DELETE FROM vendorproduct_operations WHERE VendorProduct_id = ?',
                    //             [VendorProduct_id],
                    //             err => {
                    //                 if (err) return rollback(res, err);

                    //                 if (!operations.length) {
                    //                     index++;
                    //                     return saveNextProduct();
                    //                 }

                    //                 const values = operations.map(op => [
                    //                     VendorProduct_id,
                    //                     op.Operation_Name,
                    //                     op.Rate
                    //                 ]);

                    //                 connection.query(
                    //                     `
                    //     INSERT INTO vendorproduct_operations
                    //     (VendorProduct_id, Operation_Name, Rate)
                    //     VALUES ?
                    //   `,
                    //                     [values],
                    //                     err => {
                    //                         if (err) return rollback(res, err);

                    //                         index++;
                    //                         saveNextProduct();
                    //                     }
                    //                 );
                    //             }
                    //         );
                    //     }

                    saveNextProduct();
                }
            );
        });
    });
});

function rollback(res, err) {
    connection.rollback(() => {
        res.status(500).json({
            success: false,
            message: err.sqlMessage || err.message
        });
    });
}

function commit(res) {
    connection.commit(err => {
        if (err) return rollback(res, err);

        res.json({
            success: true,
            message: 'Challan Updated Successfully'
        });
    });
}

app.get('/VendorchallanbyChallanid/:VendorChallan_id', (req, res) => {
    const VendorChallan_id = req.params.VendorChallan_id;

    const sql = `
    SELECT 
      vc.*,
      vp.VendorProduct_id,
      vp.Product_Name,
      vp.HSN_Code,
      vp.Product_Quantity,
      vp.Rate AS Product_Rate,
      vp.SubTotal,
      vo.Operation_id,
      vo.Operation_Name,
      vo.Rate AS Operation_Rate
    FROM vendorchallan vc
    LEFT JOIN vendorproducts vp 
      ON vc.VendorChallan_id = vp.VendorChallan_id
    LEFT JOIN vendorproduct_operations vo 
      ON vp.VendorProduct_id = vo.VendorProduct_id
    WHERE vc.VendorChallan_id = ?
    ORDER BY vp.VendorProduct_id, vo.Operation_id
  `;

    connection.query(sql, [VendorChallan_id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.sqlMessage
            });
        }

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: 'Vendor Challan not found'
            });
        }

        const first = rows[0];

        const challan = {
            VendorChallan_id: first.VendorChallan_id,
            VendorChallan_Code: first.VendorChallan_Code,
            Vendor_Name: first.Vendor_Name,
            Vendor_CompanyName: first.Vendor_CompanyName,
            Vendor_CompanyAddress: first.Vendor_CompanyAddress,
            VendorGST_No: first.VendorGST_No,
            Vendor_Phoneno: first.Vendor_Phoneno,
            Vendor_Email: first.Vendor_Email,
            Sub_Total: first.Sub_Total,
            Total_Amount: first.Total_Amount,
            CGST_amount: first.CGST_amount,
            SGST_amount: first.SGST_amount,
            Grand_Total: first.Grand_Total,
            Mode_of_Transport: first.Mode_of_Transport,
            Transporter_Name: first.Transporter_Name,
            Vehicle_Number: first.Vehicle_Number,
            Remark: first.Remark,
            Product_Status: first.Product_Status,
            Delivery_Status: first.Delivery_Status,
            Challan_Status: first.Challan_Status,
            Added_Date: first.Added_Date,
            Updated_Date: first.Updated_Date,
            vendoritems: []
        };

        const productMap = {};

        rows.forEach(row => {
            if (!row.VendorProduct_id) return;

            if (!productMap[row.VendorProduct_id]) {
                productMap[row.VendorProduct_id] = {
                    VendorProduct_id: row.VendorProduct_id,
                    Product_Name: row.Product_Name,
                    HSN_Code: row.HSN_Code,
                    Product_Quantity: row.Product_Quantity,
                    Rate: row.Product_Rate,
                    SubTotal: row.SubTotal,
                    operations: []
                };

                challan.vendoritems.push(productMap[row.VendorProduct_id]);
            }

            if (row.Operation_id) {
                productMap[row.VendorProduct_id].operations.push({
                    Operation_id: row.Operation_id,
                    Operation_Name: row.Operation_Name,
                    Rate: row.Operation_Rate
                });
            }
        });

        res.json({
            success: true,
            data: challan
        });
    });
});

// app.get('/VendorchallanbyChallanid/:VendorChallan_id', async (req, res) => {
//     const VendorChallan_id = req.params.VendorChallan_id;

//     const sql = `
//     SELECT
//       vc.*,
//       vp.VendorProduct_id,
//       vp.Product_Name,
//       vp.HSN_Code,
//       vp.Product_Quantity,
//       vp.Rate AS Product_Rate,
//       vp.SubTotal AS Product_SubTotal,
//       vo.Operation_id,
//       vo.Operation_Name,
//       vo.Rate AS Operation_Rate
//     FROM vendorchallan vc
//     LEFT JOIN vendorproducts vp
//       ON vc.VendorChallan_id = vp.VendorChallan_id
//     LEFT JOIN vendorproduct_operations vo
//       ON vp.VendorProduct_id = vo.VendorProduct_id
//     WHERE vc.VendorChallan_id = ?
//     ORDER BY vp.VendorProduct_id, vo.Operation_id
//   `;

//     connection.query(sql, [VendorChallan_id], (err, rows) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: err.sqlMessage
//             });
//         }

//         if (!rows.length) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Challan not found'
//             });
//         }

//         const first = rows[0];

//         const challan = {
//             VendorChallan_id: first.VendorChallan_id,
//             VendorChallan_Code: first.VendorChallan_Code,
//             Vendor_Name: first.Vendor_Name,
//             Vendor_CompanyName: first.Vendor_CompanyName,
//             Vendor_CompanyAddress: first.Vendor_CompanyAddress,
//             VendorGST_No: first.VendorGST_No,
//             Vendor_Phoneno: first.Vendor_Phoneno,
//             Vendor_Email: first.Vendor_Email,
//             Sub_Total: first.Sub_Total,
//             Total_Amount: first.Total_Amount,
//             CGST_amount: first.CGST_amount,
//             SGST_amount: first.SGST_amount,
//             Grand_Total: first.Grand_Total,
//             Mode_of_Transport: first.Mode_of_Transport,
//             Transporter_Name: first.Transporter_Name,
//             Vehicle_Number: first.Vehicle_Number,
//             Remark: first.Remark,
//             Product_Status: first.Product_Status,
//             Delivery_Status: first.Delivery_Status,
//             Challan_Status: first.Challan_Status,
//             vendoritems: []
//         };

//         const productMap = {};

//         rows.forEach(row => {
//             if (!row.VendorProduct_id) return;

//             if (!productMap[row.VendorProduct_id]) {
//                 productMap[row.VendorProduct_id] = {
//                     VendorProduct_id: row.VendorProduct_id,
//                     Product_Name: row.Product_Name,
//                     HSN_Code: row.HSN_Code,
//                     Product_Quantity: row.Product_Quantity,
//                     Rate: row.Product_Rate,
//                     SubTotal: row.Product_SubTotal,
//                     operations: []
//                 };

//                 challan.vendoritems.push(productMap[row.VendorProduct_id]);
//             }

//             if (row.Operation_id) {
//                 productMap[row.VendorProduct_id].operations.push({
//                     Operation_id: row.Operation_id,
//                     Operation_Name: row.Operation_Name,
//                     Rate: row.Operation_Rate
//                 });
//             }
//         });

//         res.json({
//             success: true,
//             data: challan
//         });
//     });
// });

// app.get('/VendorchallanbyChallanid/:VendorChallan_id', (req, res) => {
//     const VendorChallan_id = req.params.VendorChallan_id;
//     // const challanquery = `select * from inletchallan where Challan_id = ?`;
//     const challanquery = `SELECT vc.*, vp.*,
//     GROUP_CONCAT( CONCAT(vo.Operation_Name, ' (', vo.Rate, ')') ORDER BY vo.Operation_Name SEPARATOR ', ' ) AS Operation_Perform 
//     FROM vendorchallan vc 
//     JOIN vendorproducts vp ON vc.VendorChallan_id = vp.VendorChallan_id
//     LEFT JOIN vendorproduct_operations vo ON vp.VendorProduct_id = vo.VendorProduct_id 
//     WHERE vc.VendorChallan_id = ? 
//     GROUP BY vp.VendorProduct_id 
//     ORDER BY vc.VendorChallan_id DESC;`;

//     //     const challanquery = `SELECT
//     //     vc.*,
//     //     vp.*,
//     //     GROUP_CONCAT(vpo.Operation_Name ORDER BY vpo.Operation_Name SEPARATOR ', ') AS Operation_Perform
//     // FROM vendorchallan vc
//     // JOIN vendorproducts vp
//     //     ON vc.VendorChallan_id = vp.VendorChallan_id
//     // LEFT JOIN vendorproduct_operations vpo
//     //     ON vp.VendorProduct_id = vpo.VendorProduct_id
//     // WHERE vc.VendorChallan_id = ?
//     // GROUP BY vp.VendorProduct_id
//     // ORDER BY vp.VendorProduct_id`;
//     // const challanquery = `SELECT vchallan.*, vproduct.*
//     // FROM vendorchallan vchallan
//     // JOIN vendorproducts vproduct 
//     // ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
//     // WHERE vchallan.VendorChallan_id=?`;

//     connection.query(challanquery, [VendorChallan_id], (err, rows) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: err.sqlMessage
//             });
//         }

//         const challans = {};

//         rows.forEach(row => {

//             if (!challans[row.VendorChallan_id]) {

//                 challans[row.VendorChallan_id] = {

//                     VendorChallan_id: row.VendorChallan_id,
//                     VendorChallan_Code: row.VendorChallan_Code,
//                     Vendor_Name: row.Vendor_Name,
//                     Vendor_CompanyName: row.Vendor_CompanyName,
//                     Vendor_CompanyAddress: row.Vendor_CompanyAddress,
//                     VendorGST_No: row.VendorGST_No,
//                     Vendor_Phoneno: row.Vendor_Phoneno,
//                     Vendor_Email: row.Vendor_Email,

//                     Sub_Total: row.Sub_Total,
//                     Total_Amount: row.Total_Amount,
//                     CGST_amount: row.CGST_amount,
//                     SGST_amount: row.SGST_amount,
//                     Grand_Total: row.Grand_Total,

//                     Mode_of_Transport: row.Mode_of_Transport,
//                     Transporter_Name: row.Transporter_Name,
//                     Vehicle_Number: row.Vehicle_Number,
//                     Remark: row.Remark,

//                     Product_Status: row.Product_Status,
//                     Delivery_Status: row.Delivery_Status,
//                     Challan_Status: row.Challan_Status,

//                     Added_Date: row.Added_Date,
//                     Updated_Date: row.Updated_Date,

//                     vendoritems: []
//                 };
//             }

//             let product = challans[row.VendorChallan_id].vendoritems.find(
//                 p => p.VendorProduct_id === row.VendorProduct_id
//             );

//             if (!product) {
//                 product = {

//                     VendorProduct_id: row.VendorProduct_id,
//                     Product_Name: row.Product_Name,
//                     HSN_Code: row.HSN_Code,
//                     Product_Quantity: row.Product_Quantity,
//                     Rate: row.Rate,
//                     SubTotal: row.SubTotal,

//                     // GROUP_CONCAT already returns a comma-separated string
//                     Operation_Perform: row.Operation_Perform || ""
//                 };

//                 challans[row.VendorChallan_id].vendoritems.push(product);

//             }

//             if (row.Operation_Name) {
//                 product.Operation_Perform.push(row.Operation_Name);
//             }

//         });

//         res.json({
//             success: true,
//             data: Object.values(challans)
//         });

//     });
// });

// app.post('/DeleteVendorChallan/:VendorChallan_id', (req, res) => {
//     const token = req.headers['x-access-token'];
//     const { Password } = req.body;

//     if (!token) {
//         return res.status(401).send({
//             success: false,
//             message: "Unauthorized"
//         });
//     }

//     jwt.verify(token, secrect, (err, decoded) => {

//         if (err) {
//             return res.status(401).send({
//                 success: false,
//                 message: "Unauthorized"
//             });
//         }

//         if (decoded.Role !== "Admin") {
//             return res.status(403).send({
//                 success: false,
//                 message: "Only Admin can delete Vendor Challan"
//             });
//         }

//         connection.query(
//             "SELECT * FROM admin WHERE Admin_id=?",
//             [decoded.Admin_id],
//             (err, adminData) => {

//                 if (err) {
//                     return res.status(500).send({
//                         success: false,
//                         message: err.sqlMessage
//                     });
//                 }

//                 if (adminData.length == 0) {
//                     return res.status(404).send({
//                         success: false,
//                         message: "Admin not found"
//                     });
//                 }

//                 if (adminData[0].Password !== Password) {
//                     return res.status(401).send({
//                         success: false,
//                         message: "Incorrect Admin Password"
//                     });
//                 }

//                 const VendorChallan_id = req.params.VendorChallan_id;

//                 connection.beginTransaction(err => {

//                     if (err) {
//                         return res.status(500).send(err);
//                     }

//                     // Delete Products
//                     connection.query(
//                         "DELETE FROM vendorproducts WHERE VendorChallan_id=?",
//                         [VendorChallan_id],
//                         (err) => {

//                             if (err) {
//                                 return connection.rollback(() => {
//                                     res.status(500).send({
//                                         success: false,
//                                         message: err.sqlMessage
//                                     });
//                                 });
//                             }

//                             // Delete Challan
//                             connection.query(
//                                 "DELETE FROM vendorchallan WHERE VendorChallan_id=?",
//                                 [VendorChallan_id],
//                                 (err) => {

//                                     if (err) {
//                                         return connection.rollback(() => {
//                                             res.status(500).send({
//                                                 success: false,
//                                                 message: err.sqlMessage
//                                             });
//                                         });
//                                     }

//                                     connection.commit(err => {

//                                         if (err) {
//                                             return connection.rollback(() => {
//                                                 res.status(500).send({
//                                                     success: false,
//                                                     message: err.sqlMessage
//                                                 });
//                                             });
//                                         }

//                                         res.send({
//                                             success: true,
//                                             message: "Vendor Challan Deleted Successfully"
//                                         });

//                                     });

//                                 });
//                         });
//                 });
//             });
//     });
// });

app.post('/DeletevendorchallanbyDelationReason/:VendorChallan_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const { Password, Deletion_Reason } = req.body;
    const VendorChallan_id = req.params.VendorChallan_id;
    // -----------------------------------
    // 1. Validate Token
    // -----------------------------------
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    // -----------------------------------
    // 2. Validate Deletion Reason
    // -----------------------------------
    if (!Deletion_Reason || Deletion_Reason.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Deletion reason is required'
        });
    }
    if (Deletion_Reason.trim().length < 5) {
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid deletion reason'
        });
    }
    // -----------------------------------
    // 3. Verify JWT
    // ----------------------------------
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        // -----------------------------------
        // 4. Check Admin Role
        // -----------------------------------
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can delete Vendor Challan'
            });
        }
        // -----------------------------------
        // 5. Get Admin
        // -----------------------------------
        connection.query(
            'SELECT * FROM admin WHERE Admin_id = ?',
            [decoded.Admin_id],
            (err, adminData) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });
                }
                if (!adminData.length) {
                    return res.status(404).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }
                // -----------------------------------
                // 6. Check Password
                // -----------------------------------
                if (adminData[0].Password !== Password) {
                    return res.status(401).json({
                        success: false,
                        message: 'Incorrect Admin Password'
                    });
                }
                const adminName =
                    adminData[0].Name ||
                    adminData[0].Admin_Name ||
                    adminData[0].Username ||
                    'Admin';
                // -----------------------------------
                // 7. Start Transaction
                // -----------------------------------
                connection.beginTransaction((err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }
                    // -----------------------------------
                    // 8. Get Challan Data
                    // -----------------------------------
                    connection.query(
                        `
                        SELECT *
                        FROM vendorchallan
                        WHERE VendorChallan_id = ?
                        `,
                        [VendorChallan_id],
                        (err, challanData) => {
                            if (err) {
                                return rollbackDelete(
                                    res,
                                    err
                                );
                            }

                            if (!challanData.length) {
                                return rollbackDelete(
                                    res,
                                    {
                                        sqlMessage: 'Vendor Challan not found'
                                    }
                                );
                            }
                            // -----------------------------------
                            // 9. Get Product Data
                            // -----------------------------------
                            connection.query(
                                `SELECT * FROM vendorproducts WHERE VendorChallan_id = ?`,
                                [VendorChallan_id],
                                (err, productData) => {
                                    if (err) {
                                        return rollbackDelete(
                                            res,
                                            err
                                        );
                                    }
                                    // -----------------------------------
                                    // 10. Insert Deletion History
                                    // -----------------------------------

                                    const VendorChallan_Code =
                                        challanData[0].VendorChallan_Code ||
                                        challanData[0].VendorChallan_Code ||
                                        null;


                                    connection.query(
                                        `
                                        INSERT INTO vendorchallan_deletion_history
                                        (
                                            VendorChallan_id,
                                            VendorChallan_Code,
                                            Deleted_By_Admin_id,
                                            Deleted_By_Admin_Name,
                                            Deletion_Reason,
                                            Deleted_Date,
                                            Challan_Data,
                                            Product_Data
                                        )
                                        VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)
                                        `,
                                        [
                                            VendorChallan_id,
                                            VendorChallan_Code,
                                            decoded.Admin_id,
                                            adminName,
                                            Deletion_Reason.trim(),
                                            JSON.stringify(challanData[0]),
                                            JSON.stringify(productData)
                                        ],

                                        (err) => {
                                            if (err) {
                                                return rollbackDelete(
                                                    res,
                                                    err
                                                );
                                            }
                                            // -----------------------------------
                                            // 11. Delete Operations
                                            // -----------------------------------

                                            connection.query(
                                                `
                                                DELETE vo
                                                FROM vendorproduct_operations vo
                                                INNER JOIN vendorproducts vp
                                                    ON vo.VendorProduct_id =
                                                       vp.VendorProduct_id
                                                WHERE vp.VendorChallan_id = ?
                                                `,
                                                [VendorChallan_id],
                                                (err) => {
                                                    if (err) {
                                                        return rollbackDelete(
                                                            res,
                                                            err
                                                        );
                                                    }
                                                    // -----------------------------------
                                                    // 12. Delete Products
                                                    // -----------------------------------

                                                    connection.query(
                                                        `
                                                        DELETE FROM vendorproducts
                                                        WHERE VendorChallan_id = ?
                                                        `,
                                                        [VendorChallan_id],
                                                        (err) => {
                                                            if (err) {
                                                                return rollbackDelete(
                                                                    res,
                                                                    err
                                                                );
                                                            }
                                                            // -----------------------------------
                                                            // 13. Delete Challan
                                                            // -----------------------------------

                                                            connection.query(
                                                                `DELETE
                                                                FROM vendorchallan
                                                                WHERE VendorChallan_id = ?
                                                                `,
                                                                [VendorChallan_id],

                                                                (err) => {

                                                                    if (err) {
                                                                        return rollbackDelete(
                                                                            res,
                                                                            err
                                                                        );
                                                                    }
                                                                    // -----------------------------------
                                                                    // 14. Commit Transaction
                                                                    // -----------------------------------
                                                                    connection.commit(
                                                                        (err) => {
                                                                            if (err) {
                                                                                return rollbackDelete(
                                                                                    res,
                                                                                    err
                                                                                );
                                                                            }
                                                                            // -----------------------------------
                                                                            // SUCCESS
                                                                            // -----------------------------------
                                                                            res.json({
                                                                                success: true,
                                                                                message:
                                                                                    'Vendor Challan Deleted Successfully'
                                                                            });
                                                                        });
                                                                });
                                                        });
                                                });
                                        });
                                });
                        });
                });
            });
    });
});

app.post('/DeleteVendorChallan/:VendorChallan_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const { Password } = req.body;
    const VendorChallan_id = req.params.VendorChallan_id;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }

    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can delete Vendor Challan'
            });
        }

        connection.query(
            'SELECT * FROM admin WHERE Admin_id = ?',
            [decoded.Admin_id],
            (err, adminData) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });
                }

                if (!adminData.length) {
                    return res.status(404).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }

                if (adminData[0].Password !== Password) {
                    return res.status(401).json({
                        success: false,
                        message: 'Incorrect Admin Password'
                    });
                }

                connection.beginTransaction(err => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }

                    connection.query(
                        ` DELETE vo
              FROM vendorproduct_operations vo
              INNER JOIN vendorproducts vp
                ON vo.VendorProduct_id = vp.VendorProduct_id
              WHERE vp.VendorChallan_id = ?
            `,
                        [VendorChallan_id],
                        err => {
                            if (err) return rollbackDelete(res, err);

                            connection.query(
                                'DELETE FROM vendorproducts WHERE VendorChallan_id = ?',
                                [VendorChallan_id],
                                err => {
                                    if (err) return rollbackDelete(res, err);

                                    connection.query(
                                        'DELETE FROM vendorchallan WHERE VendorChallan_id = ?',
                                        [VendorChallan_id],
                                        err => {
                                            if (err) return rollbackDelete(res, err);

                                            connection.commit(err => {
                                                if (err) return rollbackDelete(res, err);

                                                res.json({
                                                    success: true,
                                                    message: 'Vendor Challan Deleted Successfully'
                                                });
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            }
        );
    });
});

function rollbackDelete(res, err) {
    connection.rollback(() => {
        res.status(500).json({
            success: false,
            message: err.sqlMessage || err.message
        });
    });
}

app.get('/PrintVendorchallan/:VendorChallan_id', (req, res) => {
    const VendorChallan_id = req.params.VendorChallan_id;

    const challanquery = `
    SELECT 
      vc.*,
      vp.VendorProduct_id,
      vp.Product_Name,
      vp.HSN_Code,
      vp.Product_Quantity,
      vp.Rate AS Product_Rate,
      vp.SubTotal,
      GROUP_CONCAT(
        CONCAT(vo.Operation_Name, ' - ', vo.Rate)
        ORDER BY vo.Operation_id
        SEPARATOR '\n'
      ) AS Operations
    FROM vendorchallan vc
    LEFT JOIN vendorproducts vp
      ON vc.VendorChallan_id = vp.VendorChallan_id
    LEFT JOIN vendorproduct_operations vo
      ON vp.VendorProduct_id = vo.VendorProduct_id
    WHERE vc.VendorChallan_id = ?
    GROUP BY vp.VendorProduct_id
    ORDER BY vp.VendorProduct_id
  `;

    connection.query(challanquery, [VendorChallan_id], (err, data) => {
        if (err) return res.status(500).send(err);

        if (!data.length) {
            return res.status(404).send('No data found');
        }

        const q = data[0];

        const doc = new PDFDocument({
            size: 'A4',
            margin: 20,
            bufferPages: true
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename=VendorChallan_${q.VendorChallan_Code}.pdf`
        );

        doc.pipe(res);

        let y = 215;

        function drawHeader() {
            box(doc, 20, 20, 555, 90);

            doc.fontSize(8).text('Vendor Challan', 50, 22);
            doc.fontSize(18).text('Riya Enterprises', 200, 30);

            doc.fontSize(9).text(
                'Gala No.38, Pawana Industrial Complex, MIDC Bhosari Pune-411026',
                150,
                55
            );

            doc.text('Phone: 9999999999 Email: manufacture@gmail.com', 170, 75);
            doc.text('GSTIN: 27AQPBO184J1Z5 PAN: AAICP0247K', 160, 95);

            box(doc, 20, 115, 555, 90);

            doc.fontSize(9);
            doc.text(`Name : ${q.Vendor_Name}`, 30, 125);
            doc.text(`Company Name : ${q.Vendor_CompanyName}`, 30, 145);
            doc.text(`Address : ${q.Vendor_CompanyAddress}`, 30, 165);

            doc.text(
                `Challan Date : ${new Date(q.Added_Date).toLocaleDateString('en-IN')}`,
                400,
                125
            );

            doc.text(`Challan Code : ${q.VendorChallan_Code}`, 400, 150);
            doc.text(`GST No : ${q.VendorGST_No}`, 400, 175);
        }

        const cols = [
            { t: 'Sr No', w: 40 },
            { t: 'Product Name', w: 105 },
            { t: 'HSN Code', w: 70 },
            { t: 'Operation - Rate', w: 125 },
            { t: 'Rate', w: 65 },
            { t: 'Qty', w: 65 },
            { t: 'Total', w: 85 }
        ];

        function drawTableHeader() {
            let x = 20;

            cols.forEach(c => {
                cell(doc, c.t, x, y, c.w, 30, 9, 'center');
                x += c.w;
            });
        }

        drawHeader();
        drawTableHeader();

        y += 30;

        let pageSubtotal = 0;
        const maxY = 720;

        data.forEach((item, i) => {
            const operationText = item.Operations || '-';
            const operationLines = operationText.split('\n').length;
            const rowHeight = Math.max(30, operationLines * 15);

            if (y + rowHeight > maxY) {
                doc.text(`Page Subtotal : Rs ${pageSubtotal}`, 400, y + 10);

                doc.addPage();
                drawHeader();

                y = 215;
                drawTableHeader();
                y += 30;

                pageSubtotal = 0;
            }

            let x = 20;

            cell(doc, i + 1, x, y, 40, rowHeight);
            x += 40;

            cell(doc, item.Product_Name, x, y, 105, rowHeight);
            x += 105;

            cell(doc, item.HSN_Code, x, y, 70, rowHeight);
            x += 70;

            cell(doc, operationText, x, y, 125, rowHeight);
            x += 125;

            cell(doc, item.Product_Rate, x, y, 65, rowHeight);
            x += 65;

            cell(doc, item.Product_Quantity, x, y, 65, rowHeight);
            x += 65;

            cell(doc, item.SubTotal, x, y, 85, rowHeight);

            pageSubtotal += Number(item.SubTotal || 0);
            y += rowHeight;
        });
        doc.text(`Page Subtotal : Rs ${pageSubtotal}`, 400, y + 10);
        y += 35;
        if (y + 280 > doc.page.height - 50) {
            doc.addPage();
            drawHeader();
            y = 215;
        }
        box(doc, 20, y, 555, 130);
        doc.fontSize(9);
        doc.text(`Sub Total : Rs ${q.Sub_Total}`, 400, y + 10);
        doc.text(`Total Amount : Rs ${q.Total_Amount}`, 400, y + 30);
        doc.text(`CGST Amount : Rs ${q.CGST_amount}`, 400, y + 50);
        doc.text(`SGST Amount : Rs ${q.SGST_amount}`, 400, y + 70);

        doc.fontSize(11).text(`Grand Total : Rs ${q.Grand_Total}`, 400, y + 100);

        box(doc, 20, y + 130, 555, 70);

        doc.fontSize(9);
        doc.text(`Remark : ${q.Remark || '-'}`, 30, y + 145);

        box(doc, 20, y + 200, 350, 80);
        box(doc, 370, y + 200, 205, 80);

        doc.text(`Mode of Transport : ${q.Mode_of_Transport || '-'}`, 30, y + 215);
        doc.text(`Name of Transporter : ${q.Transporter_Name || '-'}`, 30, y + 235);
        doc.text(`Vehicle No : ${q.Vehicle_Number || '-'}`, 30, y + 255);

        doc.text("Receiver's Name & Signature", 210, y + 265);
        doc.text('Authorised Signatory', 400, y + 265);

        const range = doc.bufferedPageRange();

        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i);

            doc.fontSize(8).text(
                'This is a system-generated Challan.',
                0,
                doc.page.height - 55,
                { align: 'center' }
            );

            doc.text(
                `Page ${i + 1} of ${range.count}`,
                0,
                doc.page.height - 40,
                { align: 'center' }
            );
        }

        doc.end();
    });
});

// app.get('/PrintVendorchallan/:VendorChallan_id', (req, res) => {
//     const VendorChallan_id = req.params.VendorChallan_id;

//     const challanquery = `SELECT vchallan.*, vproduct.*
//     FROM vendorchallan vchallan
//     JOIN vendorproducts vproduct 
//     ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
//     WHERE vchallan.VendorChallan_id=?`;


//     connection.query(challanquery, [VendorChallan_id], (err, data) => {

//         if (err) return res.status(500).send(err);
//         if (!data.length) return res.send("No data found");

//         const q = data[0];

//         const doc = new PDFDocument({
//             size: "A4",
//             margin: 20,
//             bufferPages: true
//         });

//         res.setHeader("Content-Type", "application/pdf");

//         res.setHeader(
//             "Content-Disposition",
//             `inline; filename=Challan_${q.VendorChallan_Code}.pdf`
//         );

//         doc.pipe(res);

//         let y = 215;
//         const rowHeight = 30;

//         function drawHeader() {

//             box(doc, 20, 20, 555, 90);

//             doc.fontSize(8).text("Vendor Challan", 50, 22);

//             doc.fontSize(18).text("Riya Enterprises", 200, 30);

//             doc.fontSize(9).text(
//                 "Gala No.38, Pawana Industrial Complex, MIDC Bhosari Pune-411026",
//                 150, 55
//             );

//             doc.text(
//                 "Phone: 9999999999 Email: manufacture@gmail.com",
//                 170, 75
//             );

//             doc.text(
//                 "GSTIN: 27AQPBO184J1Z5 PAN: AAICP0247K",
//                 160,
//                 95
//             );

//             box(doc, 20, 115, 555, 90);

//             doc.fontSize(9);

//             doc.text(`Name : ${q.Vendor_Name}`, 30, 125);

//             doc.text(`Company Name : ${q.Vendor_CompanyName}`, 30, 145);

//             doc.text(`Address : ${q.Vendor_CompanyAddress}`, 30, 165);

//             // doc.text(`Delivery Address : ${q.Delivery_Address}`, 30, 185);

//             doc.text(`Challan Date : ${new Date(q.Added_Date).toLocaleDateString("en-IN")} `, 430, 125);

//             doc.text(
//                 `Challan Code  : ${q.VendorChallan_Code}`,
//                 430,
//                 150
//             );

//             doc.text(
//                 `GST No : ${q.VendorGST_No}`, 430, 175
//             );

//         }

//         const cols = [
//             { t: "Sr No", w: 40 },
//             { t: "Product Name", w: 110 },
//             { t: "HSN Code", w: 80 },
//             { t: "Operation Perform", w: 90 },
//             { t: "Product Quantity", w: 90 },
//             { t: "Rate", w: 60 },
//             { t: "Total", w: 75 }
//         ];
//         function drawTableHeader() {
//             let x = 20;
//             cols.forEach(c => {
//                 cell(doc, c.t, x, y, c.w, rowHeight, 9, "center");
//                 x += c.w;
//             });
//         }
//         drawHeader();
//         drawTableHeader();
//         y += rowHeight;
//         let pageSubtotal = 0;
//         const maxY = 720;
//         data.forEach((item, i) => {

//             if (y + rowHeight > maxY) {

//                 doc.text(`Subtotal : Rs ${pageSubtotal}`, 420, y + 10);

//                 doc.addPage();

//                 drawHeader();

//                 y = 215;

//                 drawTableHeader();

//                 y += rowHeight;

//                 pageSubtotal = 0;
//             }

//             let x = 20;

//             cell(doc, i + 1, x, y, 40, rowHeight); x += 40;

//             cell(doc, item.Product_Name, x, y, 110, rowHeight); x += 110;

//             cell(doc, item.HSN_Code, x, y, 80, rowHeight); x += 80;

//             cell(doc, item.Operation_Perform, x, y, 90, rowHeight); x += 90;

//             cell(doc, item.Product_Quantity, x, y, 90, rowHeight); x += 90;

//             cell(doc, item.Rate, x, y, 60, rowHeight); x += 60;

//             cell(doc, item.SubTotal, x, y, 75, rowHeight);

//             pageSubtotal += Number(item.SubTotal);

//             y += rowHeight;

//         });

//         doc.text(`Page Subtotal : Rs ${pageSubtotal}`, 420, y + 10);
//         // move down a little after table
//         y += 30;

//         // check if enough space exists
//         if (y + 220 > doc.page.height - 50) {
//             doc.addPage();
//             drawHeader();
//             y = 215;
//         }

//         box(doc, 20, y, 555, 130);

//         doc.fontSize(9);

//         doc.text(`Sub Total : Rs ${q.Sub_Total}`, 420, y + 10);
//         // doc.text(`Discount Amount : Rs ${q.Discount_Amount}`, 420, y + 30);
//         doc.text(`Total Amount : Rs ${q.Total_Amount}`, 420, y + 30);
//         doc.text(`CGST Amount : Rs ${q.CGST_amount}`, 420, y + 50);
//         doc.text(`SGST Amount : Rs ${q.SGST_amount}`, 420, y + 70);

//         doc.fontSize(11)
//             .text(`Grand Total : Rs ${q.Grand_Total}`, 420, y + 100);

//         /* ===== PROCESS & REMARK ===== */

//         box(doc, 20, y + 130, 555, 70);

//         doc.fontSize(9);

//         doc.text(`Remark  : ${q.Remark}`, 30, y + 140);
//         // doc.text(`Payment Term : ${q.Payment_term}`, 30, y + 135);
//         // doc.text(`Payment Method : ${q.Payment_Method}`, 30, y + 155);
//         // doc.text(`Shipping Method : ${q.Shipping_Method || "-"}`, 30, y + 175);
//         // doc.text(`Delivery Address : ${q.Delivery_Address}`, 400, y + 175);

//         /* ===== TRANSPORT + SIGNATURE ===== */
//         box(doc, 20, y + 200, 350, 80);
//         box(doc, 370, y + 200, 205, 80);

//         doc.text(`Mode of Transport : ${q.Mode_of_Transport}`, 30, y + 215);
//         doc.text(`Name of Transporter : ${q.Transporter_Name || "-"}`, 30, y + 235);
//         doc.text(`Vehicle No : ${q.Vehicle_Number || "-"}`, 30, y + 255);
//         // doc.text(`Remark  : ${q.Remark}`, 30, y + 265);
//         doc.text("Receiver's Name & Signature", 250, y + 265);

//         doc.text("Authorised Signatory", 400, y + 265);

//         const range = doc.bufferedPageRange();

//         for (let i = 0; i < range.count; i++) {

//             doc.switchToPage(i);

//             doc.fontSize(8).text(
//                 "This is a system-generated Challan.",
//                 0,
//                 doc.page.height - 55,
//                 { align: "center" }
//             );

//             doc.text(
//                 `Page ${i + 1} of ${range.count}`,
//                 0,
//                 doc.page.height - 40,
//                 { align: "center" }
//             );
//         }
//         doc.end();
//     });
// });

app.post('/VendorChallanbyChallan_code', (req, res) => {
    const VendorChallan_Code = req.body.VendorChallan_Code;

    const Sqlquery = `SELECT 
      vc.*,
      vp.VendorProduct_id,
      vp.Product_Name,
      vp.HSN_Code,
      vp.Product_Quantity,
      vp.Rate AS Product_Rate,
      vp.SubTotal,
      vo.Operation_id,
      vo.Operation_Name,
      vo.Rate AS Operation_Rate
    FROM vendorchallan vc
    LEFT JOIN vendorproducts vp 
      ON vc.VendorChallan_id = vp.VendorChallan_id
    LEFT JOIN vendorproduct_operations vo 
      ON vp.VendorProduct_id = vo.VendorProduct_id
    WHERE vc.VendorChallan_Code = ?
    ORDER BY vp.VendorProduct_id, vo.Operation_id`

    // const Sqlquery = `SELECT vchallan.*, vproduct.*
    // FROM vendorchallan vchallan
    // JOIN vendorproducts vproduct 
    // ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
    // WHERE vchallan.VendorChallan_Code = ?
    // GROUP BY vchallan.VendorChallan_id;`;
    connection.query(Sqlquery, [VendorChallan_Code], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/VendorChallanbyDate', (req, res) => {
    const Added_Date = req.body.Added_Date;
    const Sqlquery = `SELECT vchallan.*, vproduct.*
    FROM vendorchallan vchallan
    JOIN vendorproducts vproduct 
    ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
    WHERE DATE(vchallan.Added_Date)= ?
    GROUP BY vchallan.VendorChallan_id;`;
    connection.query(Sqlquery, [Added_Date], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/VendorChallanbyProductStatus', (req, res) => {
    const Product_Status = req.body.Product_Status;
    const Sqlquery = `SELECT 
      vc.*,
      vp.VendorProduct_id,
      vp.Product_Name,
      vp.HSN_Code,
      vp.Product_Quantity,
      vp.Rate AS Product_Rate,
      vp.SubTotal,
      vo.Operation_id,
      vo.Operation_Name,
      vo.Rate AS Operation_Rate
    FROM vendorchallan vc
    LEFT JOIN vendorproducts vp 
      ON vc.VendorChallan_id = vp.VendorChallan_id
    LEFT JOIN vendorproduct_operations vo 
      ON vp.VendorProduct_id = vo.VendorProduct_id
    WHERE vc.Product_Status = ?
    ORDER BY vc.VendorChallan_id`;
    // const Sqlquery = `SELECT vchallan.*, vproduct.*
    // FROM vendorchallan vchallan
    // JOIN vendorproducts vproduct 
    // ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
    // WHERE vchallan.Product_Status= ?
    // GROUP BY vchallan.VendorChallan_id;`;
    connection.query(Sqlquery, [Product_Status], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/VEndorchallanbyChallanStatus', (req, res) => {
    const Challan_Status = req.body.Challan_Status;
    const Sqlquery = `SELECT vchallan.*, vproduct.*
    FROM vendorchallan vchallan
    JOIN vendorproducts vproduct 
    ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
    WHERE vchallan.Challan_Status= ?
    GROUP BY vchallan.VendorChallan_id;`;
    connection.query(Sqlquery, [Challan_Status], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/VendorChallanbyDeliveryStatus', (req, res) => {
    const Delivery_Status = req.body.Delivery_Status;
    const Sqlquery = `SELECT vchallan.*, vproduct.*
    FROM vendorchallan vchallan
    JOIN vendorproducts vproduct 
    ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
    WHERE vchallan.Delivery_Status= ?
    GROUP BY vchallan.VendorChallan_id;`;
    connection.query(Sqlquery, [Delivery_Status], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/ChallanbyVendorname', (req, res) => {
    const Vendor_Name = req.body.Vendor_Name;
    const Sqlquery = `SELECT vchallan.*, vproduct.*
    FROM vendorchallan vchallan
    JOIN vendorproducts vproduct 
    ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
    WHERE vchallan.Vendor_Name= ?
    GROUP BY vchallan.VendorChallan_id;`;
    connection.query(Sqlquery, [Vendor_Name], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.post('/VendorChallanbyCompanyName', (req, res) => {
    const Vendor_CompanyName = req.body.Vendor_CompanyName;
    const Sqlquery = `SELECT vchallan.*, vproduct.*
    FROM vendorchallan vchallan
    JOIN vendorproducts vproduct
    ON vchallan.VendorChallan_id = vproduct.VendorChallan_id
    WHERE vchallan.Vendor_CompanyName= ?
    GROUP BY vchallan.VendorChallan_id;`;
    connection.query(Sqlquery, [Vendor_CompanyName], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Challan Data',
                data: data
            });
        }
    });
});

app.get('/GetInletHistory/:Challan_id', (req, res) => {
    const Challan_id = req.params.Challan_id;
    const headerSql = `
        SELECT *
        FROM inletchallan_history
        WHERE Challan_id=?
        ORDER BY History_Id DESC
    `;

    const productSql = `
        SELECT *
        FROM inletproducts_history
        WHERE Challan_id=?
        ORDER BY History_Id DESC
    `;

    connection.query(headerSql, [Challan_id], (err, headers) => {

        if (err) {
            return res.status(500).send(err);
        }

        connection.query(productSql, [Challan_id], (err, products) => {

            if (err) {
                return res.status(500).send(err);
            }

            res.send({
                success: true,
                headerHistory: headers,
                productHistory: products
            });

        });

    });

});

// app.get('/GetInletHistory/:Challan_id', (req, res) => {
//     const Challan_id = req.params.Challan_id;
//     connection.query(
// //         `SELECT *
// // FROM inletchallan_history
// // WHERE Challan_id=?
// // ORDER BY History_Id DESC`,

//        `SELECT inlethistory.*, iproducthistory.*
//         FROM inletchallan_history inlethistory
//         JOIN inletproducts_history iproducthistory 
//         ON inlethistory.Challan_id = iproducthistory.Challan_id
//         WHERE inlethistory.Challan_id= ?`,

//         [Challan_id],
//         (err, result) => {
//             if (err)
//                 return res.status(500).json(err);
//             res.json(result);
//         });
// });

app.get('/GetVendorChallanHistory/:VendorChallan_id', (req, res) => {
    const VendorChallan_id = req.params.VendorChallan_id;

    const headerSql = `
        SELECT *
        FROM vendorchallan_history
        WHERE VendorChallan_id=?
        ORDER BY History_Id DESC
    `;

    const productSql = `
        SELECT *
        FROM vendorproduct_history
        WHERE VendorChallan_id=?
        ORDER BY History_Id DESC
    `;

    const operationSql = `
        SELECT oh.*
        FROM operations_history oh
        JOIN vendorproducts vp 
            ON vp.VendorProduct_id = oh.VendorProduct_id
        WHERE vp.VendorChallan_id = ?
        ORDER BY oh.History_Id DESC
    `;

    connection.query(headerSql, [VendorChallan_id], (err, headers) => {
        if (err) return res.status(500).send(err);

        connection.query(productSql, [VendorChallan_id], (err, products) => {
            if (err) return res.status(500).send(err);

            connection.query(operationSql, [VendorChallan_id], (err, operations) => {
                if (err) return res.status(500).send(err);

                res.send({
                    success: true,
                    headerHistory: headers,
                    productHistory: products,
                    operationHistory: operations
                });
            });
        });
    });
});

// app.get('/GetVendorChallanHistory/:VendorChallan_id', (req, res) => {
//     const VendorChallan_id = req.params.VendorChallan_id;
//     const headerSql = `
//         SELECT *
//         FROM vendorchallan_history
//         WHERE VendorChallan_id=?
//         ORDER BY History_Id DESC
//     `;

//     const productSql = `
//         SELECT *
//         FROM vendorproduct_history
//         WHERE VendorChallan_id=?
//         ORDER BY History_Id DESC
//     `;

//     connection.query(headerSql, [VendorChallan_id], (err, headers) => {

//         if (err) {
//             return res.status(500).send(err);
//         }

//         connection.query(productSql, [VendorChallan_id], (err, products) => {

//             if (err) {
//                 return res.status(500).send(err);
//             }

//             res.send({
//                 success: true,
//                 headerHistory: headers,
//                 productHistory: products
//             });
//         });
//     });

//     //     connection.query(
//     //         `SELECT *
//     // FROM vendorchallan_history
//     // WHERE VendorChallan_id=?
//     // ORDER BY History_Id DESC`,

//     //         //     `SELECT inlethistory.*, iproducthistory.*
//     //         // FROM inletchallan_history inlethistory
//     //         // JOIN inletproducts_history iproducthistory 
//     //         // ON inlethistory.Challan_id = iproducthistory.Challan_id
//     //         // WHERE inlethistory.Challan_id= ?`

//     //         [VendorChallan_id],
//     //         (err, result) => {
//     //             if (err)
//     //                 return res.status(500).json(err);
//     //             res.json(result);
//     //         });
// });

app.get('/GetVendorChallanDeletionHistory', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can view deletion history'
            });
        }
        connection.query(
            `
            SELECT
               *
            FROM vendorchallan_deletion_history
            ORDER BY Deleted_Date DESC
            `,
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });
                }
                return res.json({
                    success: true,
                    data: result
                });
            });
    });
});

app.get('/GetVendorChallanDeletionHistorybyid/:DeletionHistory_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const DeletionHistory_id = req.params.DeletionHistory_id;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message:
                    'Only Admin can view deletion history'
            });
        }
        connection.query(
            `  SELECT *
                FROM vendorchallan_deletion_history
                WHERE DeletionHistory_id = ?
                `,
            [DeletionHistory_id],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });
                }
                if (!result.length) {
                    return res.status(404).json({
                        success: false,
                        message: 'Deletion history not found'
                    });
                }
                const history = result[0];
                // Convert JSON strings back to objects
                try {
                    history.Challan_Data = JSON.parse(history.Challan_Data);
                } catch (e) {
                    history.Challan_Data = [];
                }
                try {
                    history.Product_Data =
                        JSON.parse(history.Product_Data);
                } catch (e) {
                    history.Product_Data = [];
                }
                return res.json({
                    success: true,
                    data: history
                });
            });
    });
});

app.get('/GetInletChallanDeletionHistory', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can view deletion history'
            });
        }
        connection.query(
            `
            SELECT
               *
            FROM inletchallan_deletion_history
            ORDER BY Deleted_Date DESC
            `,
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });
                }
                return res.json({
                    success: true,
                    data: result
                });
            });
    });
});

app.get('/GetInletChallanDeletionHistorybyid/:Deletionchallan_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const Deletionchallan_id = req.params.Deletionchallan_id;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message:
                    'Only Admin can view deletion history'
            });
        }


        connection.query(
            `SELECT * FROM inletchallan_deletion_history WHERE Deletionchallan_id = ?`,
            [Deletionchallan_id],

            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message: err.sqlMessage

                    });

                }


                if (!result.length) {

                    return res.status(404).json({

                        success: false,

                        message: 'Deletion history not found'

                    });

                }


                const history = result[0];


                // Convert JSON strings back to objects
                try {

                    history.Challan_Data =
                        JSON.parse(history.Challan_Data);

                } catch (e) {

                    history.Challan_Data = [];

                }


                try {
                    history.Product_Data =
                        JSON.parse(history.Product_Data);
                } catch (e) {
                    history.Product_Data = [];
                }

                return res.json({
                    success: true,
                    data: history
                });
            });
    });
});

app.get('/GetVendorDeletionHistory', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can view deletion history'
            });
        }
        connection.query(
            `
            SELECT
                VendorDeletion_id,
                Vendor_id,
                Vendor_Code,
                Deleted_By_Admin_id,
                Deleted_By_Admin_Name,
                Deletion_Reason,
                Deleted_Date
            FROM vendor_deletion_history
            ORDER BY Deleted_Date DESC
            `,

            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message: err.sqlMessage

                    });

                }


                return res.json({
                    success: true,
                    data: result
                });

            }
        );

    });
});

app.get('/GetVendorDeletionHistoryById/:VendorDeletion_id', (req, res) => {
        const token = req.headers['x-access-token'];
        const VendorDeletion_id = req.params.VendorDeletion_id;
        if (!token) {

            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        jwt.verify(token, secrect, (err, decoded) => {
            if (err) {

                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }
            if (decoded.Role !== 'Admin') {

                return res.status(403).json({
                    success: false,
                    message:
                        'Only Admin can view deletion history'
                });
            }
            connection.query(
                `
                SELECT *
                FROM vendor_deletion_history
                WHERE VendorDeletion_id = ?
                `,

                [VendorDeletion_id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }

                    if (!result.length) {
                        return res.status(404).json({
                            success: false,
                            message: 'Deletion history not found'
                        });
                    }
                    const history = result[0];
                    try {
                        history.Vendor_Data =
                            history.Vendor_Data
                                ? JSON.parse(
                                    history.Vendor_Data
                                )
                                : null;

                    } catch (e) {
                        history.Vendor_Data = null;
                    }

                    return res.json({
                        success: true,
                        data: history
                    });

                });
        });
    }
);

app.post("/AddSalesOrder", (req, res) => {
    const {
        Customer_Name,
        Company_Name,
        Company_Address,
        GST_No,
        Delivery_Address,

        Discount_Amount = 0,
        Remark = "",
        items
    } = req.body;

    if (!items || !items.length) {
        return res.status(400).json({
            success: false,
            message: "Products Required"
        });
    }

    const today = new Date();

    const datePart =
        today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, "0")

    const numberSql = `
        SELECT Sales_Order_Number
        FROM salesorder
        WHERE Sales_Order_Number LIKE 'SO_${datePart}_%'
        ORDER BY SalesOrder_id DESC
        LIMIT 1
    `;

    connection.query(numberSql, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error generating Sales Order Number",
                error: err
            });
        }

        let Sales_Order_Number =
            `SO_${datePart}_01`;

        if (result.length > 0) {

            const last =
                parseInt(
                    result[0]
                        .Sales_Order_Number
                        .split("_")[2]
                );

            Sales_Order_Number =
                `SO_${datePart}_${String(last + 1).padStart(2, "0")}`;
        }

        let Sub_Total = 0;

        items.forEach(item => {

            const qty =
                Number(item.Ordered_Quantity) || 0;

            const rate =
                Number(item.Rate) || 0;

            Sub_Total += qty * rate;
        });

        const Discount = Number(Discount_Amount) || 0;
        const Total_Amount = Sub_Total - Discount;
        const CGST_amount = Total_Amount * 0.09;
        const SGST_amount = Total_Amount * 0.09;
        const Grand_Total = Total_Amount + CGST_amount + SGST_amount;

        const orderSql = `
            INSERT INTO salesorder
            (
                Sales_Order_Number,
                Customer_Name,
                Company_Name,
                Company_Address,
                GST_No,
                Delivery_Address,
                Sub_Total,
                Discount_Amount,
                Total_Amount,
                CGST_amount,
                SGST_amount,
                Grand_Total,
                Remark,
                Sales_Order_Status
            )
            VALUES (?, ?, ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, 'Draft')
        `;

        const values = [
            Sales_Order_Number,
            Customer_Name,
            Company_Name,
            Company_Address,
            GST_No,
            Delivery_Address,
            Sub_Total,
            Discount,
            Total_Amount,
            CGST_amount,
            SGST_amount,
            Grand_Total,
            Remark
        ];

        connection.query(
            orderSql,
            values,
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Sales Order creation failed",
                        error: err
                    });
                }
                const SalesOrder_id = result.insertId;
                const itemSql = `
                    INSERT INTO salesorderitems
                    (
                        SalesOrder_id,
                        Product_Name,
                        HSN_Code,
                        Ordered_Quantity,
                        Rate,
                        SubTotal
                    )
                    VALUES ?
                `;

                const itemValues =
                    items.map(item => [
                        SalesOrder_id,
                        item.Product_Name,
                        item.HSN_Code,
                        Number(item.Ordered_Quantity) || 0,
                        Number(item.Rate) || 0,
                        (Number(item.Ordered_Quantity) || 0) *
                        (Number(item.Rate) || 0)
                    ]);
                connection.query(itemSql, [itemValues],
                    err => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: "Sales Order products failed",
                                error: err
                            });
                        }
                        res.json({
                            success: true,
                            message: "Sales Order Created Successfully",
                            SalesOrder_id,
                            Sales_Order_Number
                        });
                    });
            });
    });
});

app.get('/AllSalesOrder', (req, res) => {
    const newquery = `SELECT saleorder.*, saleproduct.*
    FROM salesorder saleorder
    JOIN salesorderitems saleproduct 
    ON saleorder.SalesOrder_id = saleproduct.SalesOrder_id
    ORDER BY saleorder.SalesOrder_id DESC`;
    connection.query(newquery, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.sqlMessage });
        }
        if (!rows.length) {
            return res.json({ success: true, data: [] });
        }
        const result = {};
        rows.forEach(row => {
            if (!result[row.SalesOrder_id]) {
                result[row.SalesOrder_id] = {
                    SalesOrder_id: row.SalesOrder_id,
                    Sales_Order_Number: row.Sales_Order_Number,
                    Customer_Name: row.Customer_Name,
                    Company_Name: row.Company_Name,
                    Company_Address: row.Company_Address,
                    Client_Address: row.Client_Address,
                    GST_No: row.GST_No,
                    Delivery_Address: row.Delivery_Address,
                    Sub_Total: row.Sub_Total,
                    Total_Amount: row.Total_Amount,
                    Discount_Amount: row.Discount_Amount,
                    CGST_amount: row.CGST_amount,
                    SGST_amount: row.SGST_amount,
                    Grand_Total: row.Grand_Total,
                    Remark: row.Remark,
                    Sales_Order_Status: row.Sales_Order_Status,
                    Added_Date: row.Added_Date,
                    Updated_Date: row.Updated_Date,
                    items: []
                };
            }
            result[row.SalesOrder_id].items.push({
                SalesOrderItem_id: row.SalesOrderItem_id,
                Product_Name: row.Product_Name,
                HSN_Code: row.HSN_Code,
                Ordered_Quantity: row.Ordered_Quantity,
                Rate: row.Rate,
                SubTotal: row.SubTotal,
            });
        });
        // ✅ SORT AFTER GROUPING
        const finalData = Object.values(result).sort((a, b) => new Date(b.Added_Date) - new Date(a.Added_Date));
        res.json({
            success: true,
            data: finalData
        });
    });
});

// app.get('/SalesOrderbyId/:SalesOrder_id', (req, res) => {
//     const { SalesOrder_id } = req.params;

//     const sql = `   
//         SELECT
//             so.*,
//             soi.SalesOrderItem_id,
//             soi.Product_Name,
//             soi.HSN_Code,
//             soi.Ordered_Quantity,
//             soi.Rate,
//             soi.SubTotal,
//             COALESCE(stock.Available_Quantity, 0) AS Available_Extra_Stock
//         FROM salesorder so
//         LEFT JOIN salesorderitems soi
//             ON soi.SalesOrder_id = so.SalesOrder_id
//         LEFT JOIN product_excess_stock stock
//             ON TRIM(LOWER(stock.Product_Name)) =
//                TRIM(LOWER(soi.Product_Name))
//            AND (
//                stock.HSN_Code = soi.HSN_Code
//                OR (
//                    stock.HSN_Code IS NULL
//                    AND soi.HSN_Code IS NULL
//                )
//            )
//         WHERE so.SalesOrder_id = ?
//     `;

//     connection.query(sql, [SalesOrder_id], (err, rows) => {
//         if (err) {
//             console.error('Sales order fetch error:', err);
//             return res.status(500).json({
//                 success: false,
//                 message: 'Failed to fetch sales order details'
//             });
//         }

//         if (!rows.length) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Sales order not found'
//             });
//         }

//         const order = { ...rows[0] };

//         order.items = rows
//             .filter(row => row.SalesOrderItem_id != null)
//             .map(row => ({
//                 SalesOrderItem_id: row.SalesOrderItem_id,
//                 Product_Name: row.Product_Name,
//                 HSN_Code: row.HSN_Code,
//                 Ordered_Quantity: Number(row.Ordered_Quantity) || 0,
//                 Rate: Number(row.Rate) || 0,
//                 SubTotal: Number(row.SubTotal) || 0,
//                 Available_Extra_Stock:
//                     Number(row.Available_Extra_Stock) || 0
//             }));

//         res.json({
//             success: true,
//             data: order
//         });
//     });
// });


// app.get('/SalesOrderbyId/:SalesOrder_id', (req, res) => {
//     const { SalesOrder_id } = req.params;

//     const sql = `
//         SELECT
//             so.*,
//             soi.SalesOrderItem_id,
//             soi.Product_Name,
//             soi.HSN_Code,
//             soi.Ordered_Quantity,
//             soi.Rate,
//             soi.SubTotal,
//             COALESCE(stock.Available_Quantity, 0) AS Available_Extra_Stock
//         FROM salesorder so
//         LEFT JOIN salesorderitems soi
//             ON soi.SalesOrder_id = so.SalesOrder_id
//         LEFT JOIN product_excess_stock stock
//             ON TRIM(LOWER(stock.Product_Name)) =
//                TRIM(LOWER(soi.Product_Name))
//            AND (
//                stock.HSN_Code = soi.HSN_Code
//                OR (
//                    stock.HSN_Code IS NULL
//                    AND soi.HSN_Code IS NULL
//                )
//            )
//         WHERE so.SalesOrder_id = ?
//     `;

//     connection.query(sql, [SalesOrder_id], (err, rows) => {
//         if (err) {
//             console.error('Sales order fetch error:', err);
//             return res.status(500).json({
//                 success: false,
//                 message: 'Failed to fetch sales order details'
//             });
//         }

//         if (!rows.length) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Sales order not found'
//             });
//         }

//         const order = { ...rows[0] };

//         order.items = rows
//             .filter(row => row.SalesOrderItem_id != null)
//             .map(row => ({
//                 SalesOrderItem_id: row.SalesOrderItem_id,
//                 Product_Name: row.Product_Name,
//                 HSN_Code: row.HSN_Code,
//                 Ordered_Quantity: Number(row.Ordered_Quantity) || 0,
//                 Rate: Number(row.Rate) || 0,
//                 SubTotal: Number(row.SubTotal) || 0,
//                 Available_Extra_Stock:
//                     Number(row.Available_Extra_Stock) || 0
//             }));

//         res.json({
//             success: true,
//             data: order
//         });
//     });
// });


app.get('/SalesOrderbyId/:SalesOrder_id', (req, res) => {
    const { SalesOrder_id } = req.params;
    const orderSql = `
        SELECT *
        FROM salesorder
        WHERE SalesOrder_id = ?
    `;
    connection.query(orderSql, [SalesOrder_id], (err, orderResult) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching sales order'
            });
        }

        if (!orderResult.length) {
            return res.status(404).json({
                success: false,
                message: 'Sales order not found'
            });
        }

        const order = orderResult[0];

        const itemsSql = `
            SELECT
                soi.*,
                COALESCE(stock.Available_Quantity, 0)
                    AS Available_Extra_Stock
            FROM salesorderitems soi
            LEFT JOIN product_excess_stock stock
                ON LOWER(TRIM(stock.Product_Name)) =
                   LOWER(TRIM(soi.Product_Name))
                AND (
                    stock.HSN_Code = soi.HSN_Code
                    OR (
                        stock.HSN_Code IS NULL
                        AND soi.HSN_Code IS NULL
                    )
                )
            WHERE soi.SalesOrder_id = ?
        `;

        connection.query(itemsSql, [SalesOrder_id], (err, itemsResult) => {

            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching product details'
                });
            }

            order.items = itemsResult.map(item => ({
                ...item,
                Ordered_Quantity: Number(item.Ordered_Quantity) || 0,
                Rate: Number(item.Rate) || 0,
                Available_Extra_Stock:
                    Number(item.Available_Extra_Stock) || 0
            }));

            return res.status(200).json({
                success: true,
                data: order
            });
        });
    });
});

app.get('/TotalNumberofSalesorder', (req, res) => {
    const countquery = `select count(*) as TotalSalesorder from salesorder`;
    connection.query(countquery, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Number of SalesOrder',
                data: data
            });
        }
    });
});

app.put('/UpdateaSalesOrder/:SalesOrder_id', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send({
            success: false,
            message: "Unauthorized"
        });
    }
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                success: false,
                message: "Unauthorized"
            });
        }
        if (decoded.Role !== "Admin") {
            return res.status(401).send({
                success: false,
                message: "Unauthorized"
            });
        }

        const SalesOrder_id = req.params.SalesOrder_id;

        const {
            Customer_Name,
            Company_Name,
            Company_Address,
            GST_No,
            Delivery_Address,
            Remark,
            Sales_Order_Status,

            Discount_Amount = 0,

            itemsupdate

        } = req.body;

        if (!itemsupdate || itemsupdate.length == 0) {

            return res.status(400).send({

                success: false,

                message: "Products Required"

            });

        }

        //-------------------------
        // Calculate Amount
        //-------------------------

        let SubTotal = 0;

        itemsupdate.forEach(i => {
            SubTotal += Number(i.Ordered_Quantity) * Number(i.Rate);
        });
        const Total_Amount = SubTotal - Number(Discount_Amount);
        const CGST_amount = Total_Amount * 0.09;
        const SGST_amount = Total_Amount * 0.09;
        const Grand_Total =

            Total_Amount + CGST_amount + SGST_amount;

        //-------------------------
        // Update Header
        //-------------------------

        const UpdateSql = `
        UPDATE salesorder
        SET
        Customer_Name=?,
        Company_Name=?,
        Company_Address=?,
        GST_No=?,
        Delivery_Address=?,
        Sub_Total=?,
        Discount_Amount=?,
        Total_Amount=?,
        CGST_amount=?,
        SGST_amount=?,
        Grand_Total=?,
        Remark=?,
        Sales_Order_Status=?,
        Updated_Date = NOW()
        WHERE SalesOrder_id=? `;

        const HeaderValues = [

            Customer_Name,
            Company_Name,
            Company_Address,
            GST_No,
            Delivery_Address,

            SubTotal,
            Discount_Amount,
            Total_Amount,
            CGST_amount,
            SGST_amount,
            Grand_Total,

            Remark,
            Sales_Order_Status,

            SalesOrder_id
        ];

        connection.query(UpdateSql, HeaderValues, (err) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: err.sqlMessage
                });
            }
            connection.query(
                "SELECT SalesOrderItem_id FROM salesorderitems WHERE SalesOrder_id=?",
                [SalesOrder_id],
                (err, oldProducts) => {

                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: err.sqlMessage
                        });
                    }

                    let existingIds = [];
                    let i = 0;

                    function saveProduct() {

                        if (i >= itemsupdate.length) {

                            const deleteIds = oldProducts
                                .map(x => x.SalesOrderItem_id)
                                .filter(id => !existingIds.includes(id));

                            if (deleteIds.length == 0) {

                                return res.send({
                                    success: true,
                                    message: "SalesOrder Updated Successfully"
                                });

                            }

                            connection.query(
                                "DELETE FROM salesorderitems WHERE SalesOrderItem_id IN (?)",
                                [deleteIds],
                                (err) => {

                                    if (err) {

                                        return res.status(500).send({
                                            success: false,
                                            message: err.sqlMessage
                                        });

                                    }

                                    res.send({
                                        success: true,
                                        message: "SalesOrder Updated Successfully"
                                    });

                                });

                            return;

                        }

                        const p = itemsupdate[i];

                        const subtotal =
                            Number(p.Ordered_Quantity) * Number(p.Rate);

                        if (p.SalesOrderItem_id && p.SalesOrderItem_id > 0) {

                            existingIds.push(p.SalesOrderItem_id);

                            connection.query(
                                `UPDATE salesorderitems
                     SET
                     Product_Name=?,
                     HSN_Code=?,
                     Ordered_Quantity=?,
                     Rate=?,
                     SubTotal=?
                     WHERE SalesOrderItem_id=?`,
                                [
                                    p.Product_Name,
                                    p.HSN_Code,
                                    p.Ordered_Quantity,
                                    p.Rate,
                                    subtotal,
                                    p.SalesOrderItem_id
                                ],
                                (err) => {
                                    if (err) {
                                        return res.status(500).send({
                                            success: false,
                                            message: err.sqlMessage
                                        });
                                    }
                                    i++;
                                    saveProduct();
                                });
                        }
                        else {
                            connection.query(
                                `INSERT INTO salesorderitems
                    (
                        SalesOrder_id,
                        Product_Name,
                        HSN_Code,
                        Ordered_Quantity,
                        Rate,
                        SubTotal
                    )
                    VALUES (?,?,?,?,?,?)`,
                                [
                                    SalesOrder_id,
                                    p.Product_Name,
                                    p.HSN_Code,
                                    p.Ordered_Quantity,
                                    p.Rate,
                                    subtotal
                                ],
                                (err) => {
                                    if (err) {
                                        return res.status(500).send({
                                            success: false,
                                            message: err.sqlMessage
                                        });
                                    }
                                    i++;
                                    saveProduct();
                                });
                        }
                    }
                    saveProduct();
                }
            );

        });
    });
});

app.post("/ConfirmSalesOrder/:SalesOrder_id", (req, res) => {
    const SalesOrder_id = req.params.SalesOrder_id;

    connection.beginTransaction(err => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Transaction could not start",
                error: err
            });
        }

        // -----------------------------------------
        // 1. GET SALES ORDER
        // -----------------------------------------

        const orderSql = `
            SELECT *
            FROM salesorder
            WHERE SalesOrder_id = ?
            FOR UPDATE
        `;

        connection.query(
            orderSql,
            [SalesOrder_id],
            (err, orderResult) => {
                if (err) {
                    return rollback(
                        connection,
                        res,
                        err
                    );
                }
                if (!orderResult.length) {

                    return rollback(
                        connection,
                        res,
                        {
                            message: "Sales Order not found"
                        },
                        404
                    );
                }

                const order = orderResult[0];

                if (
                    order.Sales_Order_Status !== "Draft"
                ) {

                    return rollback(
                        connection,
                        res,
                        {
                            message:
                                "Only Draft Sales Order can be confirmed"
                        },
                        400
                    );
                }

                // -----------------------------------------
                // 2. GET SALES ORDER ITEMS
                // -----------------------------------------

                const itemSql = `
                    SELECT *
                    FROM salesorderitems
                    WHERE SalesOrder_id = ?
                `;

                connection.query(
                    itemSql,
                    [SalesOrder_id],
                    (err, items) => {

                        if (err) {
                            return rollback(
                                connection,
                                res,
                                err
                            );
                        }

                        if (!items.length) {

                            return rollback(
                                connection,
                                res,
                                {
                                    message:
                                        "Sales Order has no products"
                                },
                                400
                            );
                        }

                        // -----------------------------------------
                        // 3. CHECK EXCESS STOCK
                        // -----------------------------------------

                        const processItems = [];
                        let completed = 0;

                        items.forEach(item => {

                            const stockSql = `
                                SELECT *
                                FROM product_excess_stock
                                WHERE
                                    (
                                        Product_id = ?
                                        OR
                                        (
                                            Product_id IS NULL
                                            AND Product_Name = ?
                                        )
                                    )
                                FOR UPDATE
                            `;

                            connection.query(
                                stockSql,
                                [
                                    item.Product_id,
                                    item.Product_Name
                                ],
                                (err, stockResult) => {
                                    if (err) {
                                        return rollback(
                                            connection,
                                            res,
                                            err
                                        );
                                    }
                                    let available = 0;
                                    if (stockResult.length) {
                                        available =
                                            Number(
                                                stockResult[0]
                                                    .Available_Quantity
                                            );
                                    }
                                    const ordered =
                                        Number(
                                            item.Ordered_Quantity
                                        );
                                    const usedExtra =
                                        Math.min(
                                            ordered,
                                            available
                                        );
                                    const remainingToProduce =
                                        Math.max(
                                            ordered - usedExtra,
                                            0
                                        );
                                    processItems.push({
                                        item,
                                        available,
                                        usedExtra,
                                        remainingToProduce,
                                        stock: stockResult.length ? stockResult[0] : null
                                    });

                                    completed++;

                                    if (
                                        completed ===
                                        items.length
                                    ) {

                                        createChallan(
                                            order,
                                            processItems
                                        );
                                    }
                                }
                            );
                        });

                    }
                );
            }
        );

        // ==================================================
        // CREATE CHALLAN
        // ==================================================

        function createChallan(
            order,
            processItems
        ) {

            const today = new Date();

            const datePart =
                today.getFullYear().toString() +
                String(today.getMonth() + 1)
                    .padStart(2, "0");

            const codeSql = `
                SELECT Challan_Code
                FROM inletchallan
                WHERE Challan_Code LIKE 'CH_${datePart}_%'
                ORDER BY Challan_id DESC
                LIMIT 1
                FOR UPDATE
            `;

            connection.query(
                codeSql,
                (err, result) => {

                    if (err) {
                        return rollback(
                            connection,
                            res,
                            err
                        );
                    }

                    let NewCode =
                        `CH_${datePart}_01`;

                    if (result.length) {

                        const last =
                            parseInt(
                                result[0]
                                    .Challan_Code
                                    .split("_")[2]
                            );

                        const next =
                            String(last + 1)
                                .padStart(2, "0");

                        NewCode =
                            `CH_${datePart}_${next}`;
                    }
                    // -----------------------------------------
                    // INSERT CHALLAN
                    // -----------------------------------------

                    const challanSql = `
                        INSERT INTO inletchallan
                        (
                            Challan_Code,
                            Sales_Order_Number,

                            Customer_Name,
                            Company_Name,
                            Company_Address,
                            GST_No,
                            Delivery_Address,

                            Sub_Total,
                            Total_Amount,
                            Discount_Amount,
                            CGST_amount,
                            SGST_amount,
                            Grand_Total,

                            Mode_of_Transport,
                            Transporter_Name,
                            Vehicle_Number,
                            Remark,

                            Work_Status,
                            Delivery_Status,
                            Challan_Status,

                            Added_Date,
                            Updated_Date
                        )
                        VALUES
                        (
                            ?,?,?,?,?,?,
                            ?,?,?,?,?,?,?,
                            ?,?,?,?,?,?,
                            NOW(),
                            NOW()
                        )
                    `;

                    const challanValues = [

                        NewCode,
                        order.Sales_Order_Number,

                        order.Customer_Name,
                        order.Company_Name,
                        order.Company_Address,
                        order.GST_No,
                        order.Delivery_Address,

                        order.Sub_Total,
                        order.Total_Amount,
                        order.Discount_Amount,
                        order.CGST_amount,
                        order.SGST_amount,
                        order.Grand_Total,

                        "",
                        "",
                        "",
                        order.Remark || "",

                        "In Queue",
                        "Not Delivered",
                        "Open"
                    ];

                    connection.query(
                        challanSql,
                        challanValues,
                        (err, challanResult) => {

                            if (err) {
                                return rollback(
                                    connection,
                                    res,
                                    err
                                );
                            }

                            const Challan_id =
                                challanResult.insertId;

                            // -----------------------------------------
                            // INSERT PRODUCTS
                            // -----------------------------------------

                            const productSql = `
                                INSERT INTO inletproducts
                                (
                                    Challan_id,
                                    SalesOrderItem_id,
                                    Product_id,

                                    Product_Name,
                                    HSN_Code,

                                    Product_Quantity,

                                    Ordered_Quantity,
                                    Produced_Quantity,
                                    Damaged_Quantity,
                                    Faulty_Quantity,
                                    Good_Quantity,
                                    Extra_Quantity,

                                    Rate,
                                    SubTotal
                                )
                                VALUES ?
                            `;

                            const productValues =
                                processItems.map(x => {

                                    const item = x.item;

                                    return [

                                        Challan_id,

                                        item.SalesOrderItem_id,

                                        item.Product_id ||
                                        null,

                                        item.Product_Name,
                                        item.HSN_Code,

                                        item.Ordered_Quantity,

                                        item.Ordered_Quantity,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,

                                        item.Rate,

                                        item.SubTotal
                                    ];
                                });

                            connection.query(
                                productSql,
                                [productValues],
                                (err, productResult) => {

                                    if (err) {
                                        return rollback(
                                            connection,
                                            res,
                                            err
                                        );
                                    }

                                    // -----------------------------------------
                                    // CONSUME EXISTING EXTRA
                                    // -----------------------------------------

                                    consumeExtraStock(
                                        processItems,
                                        order.Sales_Order_Number,
                                        Challan_id,
                                        NewCode
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }

        // ==================================================
        // CONSUME EXTRA STOCK
        // ==================================================

        function consumeExtraStock(
            processItems,
            Sales_Order_Number,
            Challan_id,
            Challan_Code
        ) {

            let completed = 0;

            processItems.forEach(x => {

                if (x.usedExtra <= 0) {

                    completed++;

                    if (
                        completed ===
                        processItems.length
                    ) {
                        updateOrder();
                    }

                    return;
                }

                const newQuantity =
                    x.available -
                    x.usedExtra;

                const stock = x.stock;

                const updateSql = `
                    UPDATE product_excess_stock
                    SET Available_Quantity = ?
                    WHERE ExcessStock_id = ?
                `;

                connection.query(
                    updateSql,
                    [
                        newQuantity,
                        stock.ExcessStock_id
                    ],
                    err => {

                        if (err) {
                            return rollback(
                                connection,
                                res,
                                err
                            );
                        }

                        const historySql = `
                            INSERT INTO
                            product_excess_stock_history
                            (
                                Product_id,
                                Product_Name,
                                Sales_Order_Number,
                                Transaction_Type,
                                Quantity,
                                Reference_InletProduct_id,
                                Remark
                            )
                            VALUES (?, ?, ?, 'EXCESS_USED', ?, NULL, ?)
                        `;

                        connection.query(
                            historySql,
                            [
                                x.item.Product_id ||
                                null,

                                x.item.Product_Name,

                                Sales_Order_Number,

                                x.usedExtra,

                                `Used for Sales Order ${Sales_Order_Number}`
                            ],
                            err => {

                                if (err) {
                                    return rollback(
                                        connection,
                                        res,
                                        err
                                    );
                                }

                                completed++;

                                if (
                                    completed ===
                                    processItems.length
                                ) {
                                    updateOrder();
                                }
                            }
                        );
                    }
                );
            });
        }

        // ==================================================
        // UPDATE SALES ORDER
        // ==================================================

        function updateOrder() {

            const updateSql = `
                UPDATE salesorder
                SET
                    Sales_Order_Status = 'Confirm',
                    Updated_Date = NOW()
                WHERE SalesOrder_id = ?
            `;

            connection.query(
                updateSql,
                [SalesOrder_id],
                err => {

                    if (err) {
                        return rollback(
                            connection,
                            res,
                            err
                        );
                    }

                    connection.commit(err => {

                        if (err) {
                            return rollback(
                                connection,
                                res,
                                err
                            );
                        }

                        res.json({

                            success: true,

                            message:
                                "Sales Order Confirmed and Inlet Challan Created",

                            SalesOrder_id,

                            Sales_Order_Number:
                                processItemsOrderNumber(),

                            Challan_Code:
                                getChallanCode()
                        });
                    });
                }
            );
        }

        let confirmedOrderNumber = null;
        let createdChallanCode = null;

        function processItemsOrderNumber() {
            return confirmedOrderNumber;
        }

        function getChallanCode() {
            return createdChallanCode;
        }

        function rollback(
            connection,
            res,
            error,
            status = 500
        ) {

            connection.rollback(() => {

                console.error(error);

                res.status(status).json({
                    success: false,
                    message:
                        error.message ||
                        "Operation failed",
                    error
                });
            });
        }
    });
});

function box(doc, x, y, w, h) {
    doc.rect(x, y, w, h).stroke();
}

function cell(doc, text, x, y, w, h, size = 9, align = "left") {
    box(doc, x, y, w, h);
    doc.fontSize(size)
        .text(text || "", x + 5, y + 8, { width: w - 10, align });
}

app.get('/PrintSalesOrder/:SalesOrder_id', (req, res) => {
    const SalesOrder_id = req.params.SalesOrder_id;

    const challanquery = `SELECT saleorder.*, Sproduct.*
    FROM salesorder saleorder
    JOIN salesorderitems Sproduct 
    ON saleorder.SalesOrder_id = Sproduct.SalesOrder_id
    WHERE saleorder.SalesOrder_id=?`;


    connection.query(challanquery, [SalesOrder_id], (err, data) => {

        if (err) return res.status(500).send(err);
        if (!data.length) return res.send("No data found");

        const q = data[0];

        const doc = new PDFDocument({
            size: "A4",
            margin: 20,
            bufferPages: true
        });

        res.setHeader("Content-Type", "application/pdf");

        res.setHeader(
            "Content-Disposition",
            `inline; filename=Challan_${q.Sales_Order_Number}.pdf`
        );

        doc.pipe(res);

        let y = 215;
        const rowHeight = 30;

        function drawHeader() {

            box(doc, 20, 20, 555, 90);

            doc.fontSize(8).text("SalesOrder", 50, 22);

            doc.fontSize(18).text("Riya Enterprises", 200, 30);

            doc.fontSize(9).text(
                "Gala No.38, Pawana Industrial Complex, MIDC Bhosari Pune-411026",
                150, 55
            );

            doc.text(
                "Phone: 9999999999 Email: manufacture@gmail.com",
                170, 75
            );

            doc.text(
                "GSTIN: 27AQPBO184J1Z5 PAN: AAICP0247K",
                160,
                95
            );

            box(doc, 20, 115, 555, 90);

            doc.fontSize(9);

            doc.text(`Name : ${q.Customer_Name}`, 30, 125);

            doc.text(`Company Name : ${q.Company_Name}`, 30, 145);

            doc.text(`Address : ${q.Company_Address}`, 30, 165);

            doc.text(`Delivery Address : ${q.Delivery_Address}`, 30, 185);

            doc.text(`Sales Order Date : ${new Date(q.Added_Date).toLocaleDateString("en-IN")} `, 430, 125);

            doc.text(
                `SalesOrder Code  : ${q.Sales_Order_Number}`,
                430,
                150
            );

            doc.text(
                `GST No : ${q.GST_No}`, 430, 175
            );

        }

        const cols = [
            { t: "Sr No", w: 40 },
            { t: "Product Name", w: 150 },
            { t: "HSN Code", w: 90 },
            { t: "Product Quantity", w: 110 },
            { t: "Rate", w: 80 },
            { t: "Total", w: 85 }
        ];

        function drawTableHeader() {

            let x = 20;

            cols.forEach(c => {
                cell(doc, c.t, x, y, c.w, rowHeight, 9, "center");
                x += c.w;
            });
        }

        drawHeader();

        drawTableHeader();

        y += rowHeight;

        let pageSubtotal = 0;

        const maxY = 720;

        data.forEach((item, i) => {

            if (y + rowHeight > maxY) {

                doc.text(`Subtotal : Rs ${pageSubtotal}`, 420, y + 10);

                doc.addPage();

                drawHeader();

                y = 215;

                drawTableHeader();

                y += rowHeight;

                pageSubtotal = 0;
            }

            let x = 20;

            cell(doc, i + 1, x, y, 40, rowHeight); x += 40;

            cell(doc, item.Product_Name, x, y, 150, rowHeight); x += 150;

            cell(doc, item.HSN_Code, x, y, 90, rowHeight); x += 90;

            cell(doc, item.Ordered_Quantity, x, y, 110, rowHeight); x += 110;

            cell(doc, item.Rate, x, y, 80, rowHeight); x += 80;

            cell(doc, item.SubTotal, x, y, 85, rowHeight);

            pageSubtotal += Number(item.SubTotal);

            y += rowHeight;

        });

        doc.text(`Page Subtotal : Rs ${pageSubtotal}`, 420, y + 10);
        // move down a little after table
        y += 30;

        // check if enough space exists
        if (y + 220 > doc.page.height - 50) {
            doc.addPage();
            drawHeader();
            y = 215;
        }

        box(doc, 20, y, 555, 130);

        doc.fontSize(9);

        doc.text(`Sub Total : Rs ${q.Sub_Total}`, 420, y + 10);
        doc.text(`Discount Amount : Rs ${q.Discount_Amount}`, 420, y + 30);
        doc.text(`Total Amount : Rs ${q.Total_Amount}`, 420, y + 50);
        doc.text(`CGST Amount : Rs ${q.CGST_amount}`, 420, y + 70);
        doc.text(`SGST Amount : Rs ${q.SGST_amount}`, 420, y + 90);

        doc.fontSize(11)
            .text(`Grand Total : Rs ${q.Grand_Total}`, 420, y + 110);

        /* ===== PROCESS & REMARK ===== */

        box(doc, 20, y + 130, 555, 70);

        doc.fontSize(9);

        doc.text(`Remark  : ${q.Remark}`, 30, y + 140);

        /* ===== TRANSPORT + SIGNATURE ===== */
        box(doc, 20, y + 200, 350, 80);
        box(doc, 370, y + 200, 205, 80);

        doc.text("Receiver's Name & Signature", 250, y + 265);

        doc.text("Authorised Signatory", 400, y + 265);

        const range = doc.bufferedPageRange();

        for (let i = 0; i < range.count; i++) {

            doc.switchToPage(i);

            doc.fontSize(8).text(
                "This is a system-generated Sales Order.",
                0,
                doc.page.height - 55,
                { align: "center" }
            );

            doc.text(
                `Page ${i + 1} of ${range.count}`,
                0,
                doc.page.height - 40,
                { align: "center" }
            );
        }
        doc.end();
    });
});

app.post('/DeleteSalesOrder/:SalesOrder_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const { Password } = req.body;

    if (!token) {
        return res.status(401).send({
            success: false,
            message: "Unauthorized"
        });
    }

    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                success: false,
                message: "Unauthorized"
            });
        }

        if (decoded.Role !== "Admin") {
            return res.status(403).send({
                success: false,
                message: "Only Admin can delete SalesOrder"
            });
        }

        connection.query(
            "SELECT * FROM admin WHERE Admin_id=?",
            [decoded.Admin_id],
            (err, adminData) => {

                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: err.sqlMessage
                    });
                }

                if (adminData.length == 0) {
                    return res.status(404).send({
                        success: false,
                        message: "Admin not found"
                    });
                }

                if (adminData[0].Password !== Password) {
                    return res.status(401).send({
                        success: false,
                        message: "Incorrect Admin Password"
                    });
                }

                const SalesOrder_id = req.params.SalesOrder_id;

                connection.beginTransaction(err => {

                    if (err) {
                        return res.status(500).send(err);
                    }

                    // Delete Products
                    connection.query(
                        "DELETE FROM salesorderitems WHERE SalesOrder_id=?",
                        [SalesOrder_id],
                        (err) => {

                            if (err) {
                                return connection.rollback(() => {
                                    res.status(500).send({
                                        success: false,
                                        message: err.sqlMessage
                                    });
                                });
                            }

                            // Delete Challan
                            connection.query(
                                "DELETE FROM salesorder WHERE SalesOrder_id=?",
                                [SalesOrder_id],
                                (err) => {

                                    if (err) {
                                        return connection.rollback(() => {
                                            res.status(500).send({
                                                success: false,
                                                message: err.sqlMessage
                                            });
                                        });
                                    }

                                    connection.commit(err => {

                                        if (err) {
                                            return connection.rollback(() => {
                                                res.status(500).send({
                                                    success: false,
                                                    message: err.sqlMessage
                                                });
                                            });
                                        }

                                        res.send({
                                            success: true,
                                            message: "SalesOrder Deleted Successfully"
                                        });

                                    });

                                });
                        });
                });
            });
    });
});

app.post('/DeletesalesorderbyDelationReason/:SalesOrder_id', (req, res) => {
    const token = req.headers['x-access-token'];
    const { Password, Deletion_Reason } = req.body;
    const SalesOrder_id = req.params.SalesOrder_id;
    // -----------------------------------
    // 1. Validate Token
    // -----------------------------------
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    // -----------------------------------
    // 2. Validate Deletion Reason
    // -----------------------------------
    if (!Deletion_Reason || Deletion_Reason.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Deletion reason is required'
        });
    }
    if (Deletion_Reason.trim().length < 5) {
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid deletion reason'
        });
    }
    // -----------------------------------
    // 3. Verify JWT
    // ----------------------------------
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        // -----------------------------------
        // 4. Check Admin Role
        // -----------------------------------
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can delete Challan'
            });
        }
        // -----------------------------------
        // 5. Get Admin
        // -----------------------------------
        connection.query(
            'SELECT * FROM admin WHERE Admin_id = ?',
            [decoded.Admin_id],
            (err, adminData) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.sqlMessage
                    });
                }
                if (!adminData.length) {
                    return res.status(404).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }
                // -----------------------------------
                // 6. Check Password
                // -----------------------------------
                if (adminData[0].Password !== Password) {
                    return res.status(401).json({
                        success: false,
                        message: 'Incorrect Admin Password'
                    });
                }
                const adminName =
                    adminData[0].Name ||
                    adminData[0].Admin_Name ||
                    adminData[0].Username ||
                    'Admin';
                // -----------------------------------
                // 7. Start Transaction
                // -----------------------------------
                connection.beginTransaction((err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }
                    // -----------------------------------
                    // 8. Get Challan Data
                    // -----------------------------------
                    connection.query(
                        `
                        SELECT *
                        FROM salesorder
                        WHERE SalesOrder_id = ?
                        `,
                        [SalesOrder_id],
                        (err, SalesOrder_Data) => {
                            if (err) {
                                return rollbackDelete(
                                    res,
                                    err
                                );
                            }

                            if (!SalesOrder_Data.length) {
                                return rollbackDelete(
                                    res,
                                    {
                                        sqlMessage: 'Salesorder not found'
                                    }
                                );
                            }
                            // -----------------------------------
                            // 9. Get Product Data
                            // -----------------------------------
                            connection.query(
                                `SELECT * FROM salesorderitems WHERE SalesOrder_id = ?`,
                                [SalesOrder_id],
                                (err, productData) => {
                                    if (err) {
                                        return rollbackDelete(
                                            res,
                                            err
                                        );
                                    }
                                    // -----------------------------------
                                    // 10. Insert Deletion History
                                    // -----------------------------------

                                    const Sales_Order_Number =
                                        SalesOrder_Data[0].Sales_Order_Number ||
                                        SalesOrder_Data[0].Sales_Order_Number ||
                                        null;


                                    connection.query(
                                        `
                                        INSERT INTO salesorder_deletion_history
                                        (
                                            SalesOrder_id,
                                            Sales_Order_Number,
                                            Deleted_By_Admin_id,
                                            Deleted_By_Admin_Name,
                                            Deletion_Reason,
                                            Deleted_Date,
                                            SalesOrder_Data,
                                            SalesOrderProduct_Data
                                        )
                                        VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)
                                        `,
                                        [
                                            SalesOrder_id,
                                            Sales_Order_Number,
                                            decoded.Admin_id,
                                            adminName,
                                            Deletion_Reason.trim(),
                                            JSON.stringify(SalesOrder_Data[0]),
                                            JSON.stringify(productData)
                                        ],

                                        (err) => {
                                            if (err) {
                                                return rollbackDelete(
                                                    res,
                                                    err
                                                );
                                            }
                                            // -----------------------------------
                                            // 11. Delete Operations
                                            // -----------------------------------


                                            connection.query(
                                                `
                                                        DELETE FROM salesorderitems
                                                        WHERE SalesOrder_id = ?
                                                        `,
                                                [SalesOrder_id],
                                                (err) => {
                                                    if (err) {
                                                        return rollbackDelete(
                                                            res,
                                                            err
                                                        );
                                                    }
                                                    // -----------------------------------
                                                    // 13. Delete Challan
                                                    // -----------------------------------
                                                    connection.query(
                                                        `DELETE
                                                                FROM salesorder
                                                                WHERE SalesOrder_id = ?
                                                                `,
                                                        [SalesOrder_id],
                                                        (err) => {
                                                            if (err) {
                                                                return rollbackDelete(
                                                                    res,
                                                                    err
                                                                );
                                                            }
                                                            // -----------------------------------
                                                            // 14. Commit Transaction
                                                            // -----------------------------------
                                                            connection.commit(
                                                                (err) => {
                                                                    if (err) {
                                                                        return rollbackDelete(
                                                                            res,
                                                                            err
                                                                        );
                                                                    }
                                                                    // -----------------------------------
                                                                    // SUCCESS
                                                                    // -----------------------------------
                                                                    res.json({
                                                                        success: true,
                                                                        message:
                                                                            'SalesOrder Deleted Successfully'
                                                                    });
                                                                });
                                                        });
                                                });
                                        });
                                });
                        });
                });
            });
    });
});

app.get('/GetSalesOrderDeletionHistory', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    jwt.verify(token, secrect, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (decoded.Role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admin can view deletion history'
            });
        }
        connection.query(
            ` SELECT *
            FROM salesorder_deletion_history
            ORDER BY Deleted_Date DESC
            `,
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message: err.sqlMessage

                    });

                }


                return res.json({
                    success: true,
                    data: result
                });

            }
        );

    });
});

app.get('/GetSalesorderDeletionHistoryById/:SalesorderDeleted_id',
    (req, res) => {

        const token = req.headers['x-access-token'];

        const SalesorderDeleted_id =
            req.params.SalesorderDeleted_id;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        jwt.verify(token, secrect, (err, decoded) => {

            if (err) {

                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            if (decoded.Role !== 'Admin') {

                return res.status(403).json({
                    success: false,
                    message:
                        'Only Admin can view deletion history'
                });
            }
            connection.query(
                `
                SELECT *
                FROM salesorder_deletion_history
                WHERE SalesorderDeleted_id = ?
                `,
                [SalesorderDeleted_id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }
                    if (!result.length) {
                        return res.status(404).json({
                            success: false,
                            message: 'Deletion history not found'
                        });
                    }
                    const history = result[0];
                    // Convert JSON strings back to objects
                    try {
                        history.SalesOrder_Data =
                            JSON.parse(history.SalesOrder_Data);
                    } catch (e) {
                        history.SalesOrder_Data = [];
                    }
                    try {
                        history.SalesOrderProduct_Data =
                            JSON.parse(history.SalesOrderProduct_Data);
                    } catch (e) {
                        history.SalesOrderProduct_Data = [];
                    }
                    return res.json({
                        success: true,
                        data: history
                    });
                });
        });
    }
);

app.get('/GetCustomerDeletionHistoryById/:CustomerDeletion_id',
    (req, res) => {
        const token = req.headers['x-access-token'];
        const CustomerDeletion_id = req.params.CustomerDeletion_id;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        jwt.verify(token, secrect, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }
            if (decoded.Role !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message:
                        'Only Admin can view deletion history'
                });
            }
            connection.query(
                `SELECT *
                FROM customer_deletion_history
                WHERE CustomerDeletion_id = ?
                `,
                [CustomerDeletion_id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }
                    if (!result.length) {
                        return res.status(404).json({
                            success: false,
                            message: 'Deletion history not found'
                        });
                    }
                    const history = result[0];
                    // Convert JSON strings back to objects
                    try {
                        history.Customer_Data =
                            JSON.parse(history.Customer_Data);
                    } catch (e) {
                        history.Customer_Data = [];
                    }
                    return res.json({
                        success: true,
                        data: history
                    });
                });
        });
    }
);

app.get('/GetVendorDeletionHistoryById/:VendorDeletion_id',
    (req, res) => {
        const token = req.headers['x-access-token'];
        const VendorDeletion_id  = req.params.VendorDeletion_id ;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        jwt.verify(token, secrect, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }
            if (decoded.Role !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message:
                        'Only Admin can view deletion history'
                });
            }
            connection.query(
                `SELECT *
                FROM vendor_deletion_history
                WHERE VendorDeletion_id  = ?
                `,
                [VendorDeletion_id ],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }
                    if (!result.length) {
                        return res.status(404).json({
                            success: false,
                            message: 'Deletion history not found'
                        });
                    }
                    const history = result[0];
                    // Convert JSON strings back to objects
                    try {
                        history.Vendor_Data =
                            JSON.parse(history.Vendor_Data);
                    } catch (e) {
                        history.Vendor_Data = [];
                    }
                    return res.json({
                        success: true,
                        data: history
                    });
                });
        });
    }
);

app.get('/GetAdminDeletionHistoryById/:AdminDeletion_id',
    (req, res) => {
        const token = req.headers['x-access-token'];
        const AdminDeletion_id  = req.params.AdminDeletion_id ;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        jwt.verify(token, secrect, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }
            if (decoded.Role !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message:
                        'Only Admin can view deletion history'
                });
            }
            connection.query(
                `SELECT *
                FROM admin_deletion_history
                WHERE AdminDeletion_id  = ?
                `,
                [AdminDeletion_id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.sqlMessage
                        });
                    }
                    if (!result.length) {
                        return res.status(404).json({
                            success: false,
                            message: 'Deletion history not found'
                        });
                    }
                    const history = result[0];
                    // Convert JSON strings back to objects
                    try {
                        history.Admin_Data =
                            JSON.parse(history.Admin_Data);
                    } catch (e) {
                        history.Admin_Data = [];
                    }
                    return res.json({
                        success: true,
                        data: history
                    });
                });
        });
    }
);

app.get('/LimitedSalesOrder', (req, res) => {
    const newquery = `SELECT * FROM salesorder ORDER BY SalesOrder_id  DESC LIMIT 3;`;

    connection.query(newquery, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.sqlMessage });
        }
        if (!rows.length) {
            return res.json({ success: true, data: [] });
        }
        const result = {};
        rows.forEach(row => {

            if (!result[row.SalesOrder_id]) {
                result[row.SalesOrder_id] = {
                    SalesOrder_id: row.SalesOrder_id,
                    Sales_Order_Number: row.Sales_Order_Number,
                    Challan_Code: row.Challan_Code,
                    Customer_Name: row.Customer_Name,
                    Company_Name: row.Company_Name,
                    Company_Address: row.Company_Address,
                    Client_Address: row.Client_Address,
                    GST_No: row.GST_No,
                    Delivery_Address: row.Delivery_Address,
                    Sub_Total: row.Sub_Total,
                    Total_Amount: row.Total_Amount,
                    Discount_Amount: row.Discount_Amount,
                    CGST_amount: row.CGST_amount,
                    SGST_amount: row.SGST_amount,
                    Grand_Total: row.Grand_Total,
                    Remark: row.Remark,
                    Sales_Order_Status: row.Sales_Order_Status,
                    Added_Date: row.Added_Date,
                    Updated_Date: row.Updated_Date,
                    items: []
                };
            }
            result[row.SalesOrder_id].items.push({
                SalesOrderItem_id: row.SalesOrderItem_id,
                Product_Name: row.Product_Name,
                HSN_Code: row.HSN_Code,
                Ordered_Quantity: row.Ordered_Quantity,
                Rate: row.Rate,
                SubTotal: row.SubTotal,
            });

        });

        // ✅ SORT AFTER GROUPING
        const finalData = Object.values(result).sort(
            (a, b) => new Date(b.Added_Date) - new Date(a.Added_Date)
        );

        res.json({
            success: true,
            data: finalData
        });
    });

});

app.post("/CreateInletChallanFromSalesOrder/:SalesOrder_id", async (req, res) => {
    const SalesOrder_id = Number(req.params.SalesOrder_id);

    const {
        Mode_of_Transport = null,
        Transporter_Name = null,
        Vehicle_Number = null,
        Remark = null
    } = req.body;

    if (!Number.isInteger(SalesOrder_id) || SalesOrder_id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid SalesOrder_id."
        });
    }

    const conn = connection;

    try {
        // 1. START TRANSACTION
        await beginTransactionAsync(conn);

        // 2. GET AND LOCK SALES ORDER
        const orderRows = await queryAsync(
            conn,
            `SELECT *
                 FROM salesorder
                 WHERE SalesOrder_id = ?
                 FOR UPDATE`,
            [SalesOrder_id]
        );

        if (!orderRows.length) {
            throw new Error("Sales Order not found.");
        }

        const order = orderRows[0];

        if (order.Sales_Order_Status !== "Confirm") {
            throw new Error(
                "Sales Order must be Confirmed first."
            );
        }

        // 3. CHECK WHETHER A CHALLAN ALREADY EXISTS
        const existingRows = await queryAsync(
            conn,
            `SELECT Challan_id, Challan_Code
                 FROM inletchallan
                 WHERE Sales_Order_Number = ?
                 LIMIT 1
                 FOR UPDATE`,
            [order.Sales_Order_Number]
        );

        if (existingRows.length) {
            const error = new Error(
                "Inlet Challan already created for this Sales Order."
            );

            error.statusCode = 409;
            error.Challan_Code = existingRows[0].Challan_Code;

            throw error;
        }

        // 4. GET SALES ORDER ITEMS
        const items = await queryAsync(
            conn,
            `SELECT *
                 FROM salesorderitems
                 WHERE SalesOrder_id = ?
                 FOR UPDATE`,
            [SalesOrder_id]
        );

        if (!items.length) {
            throw new Error(
                "Sales Order has no products."
            );
        }

        // 5. VALIDATE ITEMS
        for (const item of items) {
            const productName = String(
                item.Product_Name || ""
            ).trim();

            const ordered = Number(
                item.Ordered_Quantity
            );

            const rate = Number(item.Rate);

            if (
                !productName ||
                !Number.isSafeInteger(ordered) ||
                ordered <= 0 ||
                !Number.isFinite(rate) ||
                rate < 0
            ) {
                throw new Error(
                    `Invalid product, quantity or rate for ${productName || "product"
                    }.`
                );
            }
        }

        // 6. GENERATE CHALLAN CODE
        const today = new Date();

        const datePart =
            today.getFullYear().toString() +
            String(today.getMonth() + 1).padStart(2, "0");

        const lastCodeRows = await queryAsync(
            conn,
            `SELECT Challan_Code
                 FROM inletchallan
                 WHERE Challan_Code LIKE ?
                 ORDER BY Challan_id DESC
                 LIMIT 1
                 FOR UPDATE`,
            [`CH_${datePart}_%`]
        );

        let nextNumber = 1;

        if (lastCodeRows.length) {
            const lastNumber = Number(
                lastCodeRows[0].Challan_Code.split("_")[2]
            );

            if (!Number.isInteger(lastNumber)) {
                throw new Error(
                    "Could not generate Challan Code."
                );
            }

            nextNumber = lastNumber + 1;
        }

        const Challan_Code =
            `CH_${datePart}_${String(nextNumber).padStart(2, "0")}`;

        // 7. CALCULATE CHALLAN TOTALS FROM SALES ORDER ITEMS
        const Sub_Total = items.reduce(
            (sum, item) =>
                sum +
                Number(item.Ordered_Quantity) *
                Number(item.Rate),
            0
        );

        const Discount_Amount = Number(
            order.Discount_Amount ?? 0
        );

        if (
            !Number.isFinite(Discount_Amount) ||
            Discount_Amount < 0 ||
            Discount_Amount > Sub_Total
        ) {
            throw new Error(
                "Invalid discount amount in Sales Order."
            );
        }

        const Total_Amount = Sub_Total - Discount_Amount;
        const CGST_amount = Total_Amount * 0.09;
        const SGST_amount = Total_Amount * 0.09;
        const Grand_Total =
            Total_Amount + CGST_amount + SGST_amount;

        // 8. INSERT INLET CHALLAN HEADER
        const challanResult = await queryAsync(
            conn,
            `INSERT INTO inletchallan (
                    Challan_Code,
                    Sales_Order_Number,
                    Customer_Name,
                    Company_Name,
                    Company_Address,
                    GST_No,
                    Delivery_Address,
                    Sub_Total,
                    Discount_Amount,
                    Total_Amount,
                    CGST_amount,
                    SGST_amount,
                    Grand_Total,
                    Mode_of_Transport,
                    Transporter_Name,
                    Vehicle_Number,
                    Remark,
                    Work_Status,
                    Delivery_Status,
                    Challan_Status,
                    Added_Date,
                    Updated_Date
                )
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
                )`,
            [
                Challan_Code,
                order.Sales_Order_Number,
                order.Customer_Name,
                order.Company_Name,
                order.Company_Address,
                order.GST_No,
                order.Delivery_Address,
                Sub_Total,
                Discount_Amount,
                Total_Amount,
                CGST_amount,
                SGST_amount,
                Grand_Total,
                Mode_of_Transport,
                Transporter_Name,
                Vehicle_Number,
                Remark,
                "In Queue",
                "Not Delivered",
                "Open"
            ]
        );

        const Challan_id = challanResult.insertId;

        const productValues = [];
        const stockDetails = [];

        // 9. CALCULATE AND DEDUCT STOCK FOR EACH PRODUCT
        for (const item of items) {

            const productName = String(
                item.Product_Name
            ).trim();

            const hsn = String(
                item.HSN_Code ?? ""
            ).trim();

            const ordered = Number(
                item.Ordered_Quantity
            );

            const rate = Number(item.Rate);

            const productSubtotal = ordered * rate;

            // Production starts at zero.
            const produced = 0;
            const damaged = 0;
            const faulty = 0;
            const good = 0;
            const extra = 0;

            // Create the stock row if it doesn't exist.
            // Requires a unique key on Product_Name + HSN_Code.
            await queryAsync(
                conn,
                `INSERT IGNORE INTO product_excess_stock
                     (
                         Product_Name,
                         HSN_Code,
                         Available_Quantity
                     )
                     VALUES (?, ?, 0)`,
                [productName, hsn]
            );

            // Lock the matching stock record.
            const stockRows = await queryAsync(
                conn,
                `SELECT
                         ExcessStock_id,
                         Available_Quantity
                     FROM product_excess_stock
                     WHERE Product_Name = ?
                       AND HSN_Code = ?
                     FOR UPDATE`,
                [productName, hsn]
            );

            if (!stockRows.length) {
                throw new Error(
                    `Stock record not found for ${productName}.`
                );
            }

            const stockRow = stockRows[0];

            const available = Number(
                stockRow.Available_Quantity
            );

            if (
                !Number.isSafeInteger(available) ||
                available < 0
            ) {
                throw new Error(
                    `Invalid available stock for ${productName}.`
                );
            }

            // Deduct what is available.
            const stockUsed = Math.min(
                ordered,
                available
            );

            const manufacturingRequired =
                ordered - stockUsed;

            if (stockUsed > 0) {
                const deduction = await queryAsync(
                    conn,
                    `UPDATE product_excess_stock
                         SET Available_Quantity =
                             Available_Quantity - ?,
                             Updated_Date = NOW()
                         WHERE ExcessStock_id = ?
                           AND Available_Quantity >= ?`,
                    [
                        stockUsed,
                        stockRow.ExcessStock_id,
                        stockUsed
                    ]
                );

                if (deduction.affectedRows !== 1) {
                    throw new Error(
                        `Stock deduction failed for ${productName}.`
                    );
                }
            }

            // Prepare product insert.
            productValues.push([
                Challan_id,
                item.SalesOrderItem_id,
                productName,
                hsn || null,
                ordered,                  // Product_Quantity
                ordered,                  // Ordered_Quantity
                available,                // Available_Extra_Stock
                stockUsed,                // Stock_Used
                manufacturingRequired,    // Manufacturing_Required
                produced,
                damaged,
                faulty,
                good,
                extra,
                0,                         // ExtraStock_Posted_Quantity
                rate,
                productSubtotal
            ]);

            stockDetails.push({
                SalesOrderItem_id: item.SalesOrderItem_id,
                Product_Name: productName,
                HSN_Code: hsn,
                Ordered_Quantity: ordered,
                Available_Extra_Stock: available,
                Stock_Used: stockUsed,
                Manufacturing_Required: manufacturingRequired,
                Remaining_Stock: available - stockUsed
            });
        }

        // 10. INSERT ALL INLET PRODUCTS
        await queryAsync(
            conn,
            `INSERT INTO inletproducts (
                    Challan_id,
                    SalesOrderItem_id,
                    Product_Name,
                    HSN_Code,
                    Product_Quantity,
                    Ordered_Quantity,
                    Available_Extra_Stock,
                    Stock_Used,
                    Manufacturing_Required,
                    Produced_Quantity,
                    Damaged_Quantity,
                    Faulty_Quantity,
                    Good_Quantity,
                    Extra_Quantity,
                    ExtraStock_Posted_Quantity,
                    Rate,
                    SubTotal
                )
                VALUES ?`,
            [productValues]
        );

        // 11. UPDATE SALES ORDER STATUS
        const orderUpdate = await queryAsync(
            conn,
            `UPDATE salesorder
                 SET Sales_Order_Status = 'In Production',
                     Updated_Date = NOW()
                 WHERE SalesOrder_id = ?
                   AND Sales_Order_Status = 'Confirm'`,
            [SalesOrder_id]
        );

        if (orderUpdate.affectedRows !== 1) {
            throw new Error(
                "Could not update Sales Order status."
            );
        }

        // 12. COMMIT EVERYTHING
        await commitAsync(conn);

        return res.status(201).json({
            success: true,
            message: "Inlet Challan Created Successfully.",
            Challan_id,
            Challan_Code,
            Sales_Order_Number: order.Sales_Order_Number,
            Sales_Order_Status: "In Production",
            stockDetails
        });

    } catch (error) {

        try {
            await rollbackAsync(conn);
        } catch (rollbackError) {
            console.error(
                "Transaction rollback failed:",
                rollbackError
            );
        }

        console.error(
            "CreateInletChallanFromSalesOrder error:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Failed to create Inlet Challan.",
            ...(error.Challan_Code
                ? { Challan_Code: error.Challan_Code }
                : {})
        });
    }
}
);

function addExtraStock(product, extra, callback) {
    const productName = String(
        product.Product_Name || ''
    ).trim();

    const extraQty = Number(extra) || 0;

    if (!productName) {
        return callback(
            new Error('Product_Name is required for extra stock.')
        );
    }

    if (extraQty <= 0) {
        return callback(null);
    }

    const findSql = `
        SELECT *
        FROM product_excess_stock
        WHERE LOWER(TRIM(Product_Name)) = LOWER(TRIM(?))
        LIMIT 1
    `;

    connection.query(findSql, [productName], (err, rows) => {
        if (err) {
            return callback(err);
        }

        if (rows.length > 0) {
            const updateSql = `
                UPDATE product_excess_stock
                SET Available_Quantity =
                    COALESCE(Available_Quantity, 0) + ?
                WHERE LOWER(TRIM(Product_Name)) = LOWER(TRIM(?))
            `;

            return connection.query(
                updateSql,
                [extraQty, productName],
                callback
            );
        }

        const insertSql = `
            INSERT INTO product_excess_stock
            (
                Product_id,
                Product_Name,
                Available_Quantity
            )
            VALUES (NULL, ?, ?)
        `;

        connection.query(
            insertSql,
            [productName, extraQty],
            callback
        );
    });
}

// function addExtraStock(product, extra, callback) {
//     extra = Number(extra) || 0;

//     // No extra stock to add.
//     if (extra <= 0) {
//         return callback(null);
//     }

//     const findSql = `
//         SELECT ExcessStock_id, Available_Quantity
//         FROM product_excess_stock
//         WHERE (
//             Product_id = ?
//             OR (
//                 Product_id IS NULL
//                 AND Product_Name = ?
//             )
//         )
//         LIMIT 1
//     `;

//     connection.query(
//         findSql,
//         [
//             product.Product_id || null,
//             product.Product_Name
//         ],
//         (err, result) => {
//             if (err) return callback(err);

//             if (result.length > 0) {
//                 // Product exists: increase available extra stock.
//                 const updateSql = `
//                     UPDATE product_excess_stock
//                     SET Available_Quantity = Available_Quantity + ?,
//                         Updated_Date = NOW()
//                     WHERE ExcessStock_id = ?
//                 `;

//                 return connection.query(
//                     updateSql,
//                     [extra, result[0].ExcessStock_id],
//                     callback
//                 );
//             }

//             // Product does not exist: create a stock record.
//             const insertSql = `
//                 INSERT INTO product_excess_stock (
//                     Product_id,
//                     Product_Name,
//                     HSN_Code,
//                     Available_Quantity,
//                     Updated_Date
//                 )
//                 VALUES (?, ?, ?, ?, NOW())
//             `;

//             connection.query(
//                 insertSql,
//                 [
//                     product.Product_id || null,
//                     product.Product_Name,
//                     product.HSN_Code || null,
//                     extra
//                 ],
//                 callback
//             );
//         }
//     );
// }

function addHistory(
    product,
    quantity,
    callback
) {
    const sql = `
        INSERT INTO product_excess_stock_history
        (   Product_id,
            Product_Name,
            Transaction_Type,
            Quantity,
            Reference_InletProduct_id,
            Remark)
        VALUES (?, ?, 'EXCESS_CREATED', ?, ?, ?)
    `;
    connection.query(
        sql,
        [
            product.Product_id || null,
            product.Product_Name,
            quantity,
            product.InletProduct_id,
            `Extra quantity created from Inlet Product ${product.InletProduct_id}`
        ],
        callback
    );
}

app.put("/AdjustInletProductDamage/:InletProduct_id", (req, res) => {
    const InletProduct_id = req.params.InletProduct_id;
    const {
        Additional_Damaged_Quantity = 0,
        Additional_Faulty_Quantity = 0,
        Remark = ""
    } = req.body;
    const damaged = Number(Additional_Damaged_Quantity) || 0;
    const faulty = Number(Additional_Faulty_Quantity) || 0;
    const adjustment = damaged + faulty;
    if (adjustment <= 0) {
        return res.status(400).json({
            success: false,
            message: "Enter damaged or faulty quantity"
        });
    }
    const sql = `
            SELECT *
            FROM inletproducts
            WHERE InletProduct_id = ?
            FOR UPDATE
        `;
    connection.query(sql, [InletProduct_id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error",
                error: err
            });
        }
        if (!result.length) {
            return res.status(404).json({
                success: false,
                message: "Inlet Product not found"
            });
        }
        const product = result[0];
        const oldExtra = Number(product.Extra_Quantity);
        const oldGood = Number(product.Good_Quantity);
        if (adjustment > oldExtra) {
            return res.status(400).json({
                success: false,
                message: `Only ${oldExtra} extra products are currently available`
            });
        }
        const newDamaged = Number(product.Damaged_Quantity) + damaged;
        const newFaulty = Number(product.Faulty_Quantity) + faulty;
        const newGood = oldGood - adjustment;
        const newExtra = oldExtra - adjustment;
        const updateSql = `
                    UPDATE inletproducts
                    SET
                        Damaged_Quantity = ?,
                        Faulty_Quantity = ?,
                        Good_Quantity = ?,
                        Extra_Quantity = ?
                    WHERE InletProduct_id = ?
                `;
        connection.query(
            updateSql,
            [
                newDamaged,
                newFaulty,
                newGood,
                newExtra,
                InletProduct_id
            ],
            err => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message:
                            "Product adjustment failed",
                        error: err
                    });
                }
                // --------------------------------
                // REMOVE FROM AVAILABLE STOCK
                // --------------------------------
                removeExtraStock(
                    product,
                    adjustment,
                    InletProduct_id,
                    damaged,
                    faulty,
                    Remark,
                    err => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: "Product updated but stock adjustment failed",
                                error: err
                            });
                        }
                        res.json({
                            success: true,
                            message: "Damaged/Faulty quantity adjusted successfully",
                            Damaged_Quantity: newDamaged,
                            Faulty_Quantity: newFaulty,
                            Good_Quantity: newGood,
                            Extra_Quantity: newExtra
                        });
                    });
            });
    });
});

function removeExtraStock(
    product,
    quantity,
    inletProductId,
    damaged,
    faulty,
    remark,
    callback
) {

    const sql = `
        SELECT *
        FROM product_excess_stock
        WHERE
            (
                Product_id = ?
                OR
                (
                    Product_id IS NULL
                    AND Product_Name = ?
                )
            )
        LIMIT 1
    `;

    connection.query(
        sql,
        [
            product.Product_id,
            product.Product_Name
        ],
        (err, result) => {
            if (err) {
                return callback(err);
            }
            if (!result.length) {
                return callback(
                    new Error(
                        "Excess stock record not found"
                    )
                );
            }
            const stock = result[0];
            const available = Number(stock.Available_Quantity);
            if (quantity > available) {
                return callback(
                    new Error(
                        "Insufficient excess stock"
                    )
                );
            }
            const newQty = available - quantity;
            const updateSql = `
                UPDATE product_excess_stock
                SET Available_Quantity = ?
                WHERE ExcessStock_id = ?
            `;

            connection.query(
                updateSql,
                [
                    newQty,
                    stock.ExcessStock_id
                ],
                err => {
                    if (err) {
                        return callback(err);
                    }
                    const historySql = `
                        INSERT INTO
                        product_excess_stock_history
                        (
                            Product_id,
                            Product_Name,
                            Transaction_Type,
                            Quantity,
                            Reference_InletProduct_id,
                            Remark
                        )
                        VALUES
                        (
                            ?,
                            ?,
                            'DAMAGE_ADJUSTMENT',
                            ?,
                            ?,
                            ?
                        )
                    `;
                    connection.query(
                        historySql,
                        [
                            product.Product_id ||
                            null,
                            product.Product_Name,
                            quantity,
                            inletProductId,
                            `Damaged: ${damaged}, Faulty: ${faulty}. ${remark}`
                        ],
                        callback
                    );
                }
            );
        }
    );
}

app.get('/InletChallanbySalesorderNumber/:Sales_Order_Number', (req, res) => {
    const Sales_Order_Number = req.params.Sales_Order_Number;
    console.log('Sales Order Number received:', Sales_Order_Number);
    // ------------------------------------------------
    // 1. Get Challan + Products
    // ------------------------------------------------
    const challanquery = `
        SELECT 
            challan.*,
            iproduct.*,
            iproduct.SubTotal AS Product_SubTotal
        FROM inletchallan challan
        LEFT JOIN inletproducts iproduct
            ON challan.Challan_id = iproduct.Challan_id
        WHERE challan.Sales_Order_Number = ?
        ORDER BY challan.Added_Date DESC
    `;

    connection.query(
        challanquery,
        [Sales_Order_Number],
        (err, rows) => {
            if (err) {
                console.error(
                    'Inlet Challan SQL Error:',
                    err
                );
                return res.status(500).json({
                    success: false,
                    message: err.sqlMessage
                });
            }
            console.log(
                'Inlet Challan DB Rows:',
                rows
            );
            // 2. No Challan found
            if (!rows || rows.length === 0) {
                console.log(
                    'No Inlet Challan found for:',
                    Sales_Order_Number
                );
                return res.json({
                    success: true,
                    data: []
                });
            }
            // 3. Group Challan
            const result = {};
            rows.forEach(row => {
                // Use Challan_id as grouping key
                if (!result[row.Challan_id]) {
                    result[row.Challan_id] = {
                        Challan_id: row.Challan_id,
                        Challan_Code: row.Challan_Code,
                        Sales_Order_Number: row.Sales_Order_Number,
                        Customer_Name: row.Customer_Name,
                        Company_Name: row.Company_Name,
                        Company_Address: row.Company_Address,
                        // Keep this only if your table has it
                        Client_Address: row.Client_Address,
                        GST_No: row.GST_No,
                        Delivery_Address: row.Delivery_Address,

                        Sub_Total: row.Sub_Total,
                        Total_Amount: row.Total_Amount,
                        Discount_Amount: row.Discount_Amount,
                        CGST_amount: row.CGST_amount,
                        SGST_amount: row.SGST_amount,
                        Grand_Total: row.Grand_Total,

                        Mode_of_Transport: row.Mode_of_Transport,
                        Transporter_Name: row.Transporter_Name,
                        Vehicle_Number: row.Vehicle_Number,
                        Remark: row.Remark,

                        Work_Status: row.Work_Status,
                        Delivery_Status: row.Delivery_Status,
                        Challan_Status: row.Challan_Status,

                        Added_Date: row.Added_Date,
                        Updated_Date: row.Updated_Date,
                        items: []
                    };
                }
                // 4. Add Product

                if (row.InletProduct_id) {
                    result[row.Challan_id].items.push({
                        InletProduct_id: row.InletProduct_id,
                        Product_Name: row.Product_Name,
                        HSN_Code: row.HSN_Code,
                        Product_Quantity: row.Product_Quantity,
                        Ordered_Quantity: row.Ordered_Quantity,
                        Produced_Quantity: row.Produced_Quantity,
                        Damaged_Quantity: row.Damaged_Quantity,
                        Faulty_Quantity: row.Faulty_Quantity,
                        Good_Quantity: row.Good_Quantity,
                        Extra_Quantity: row.Extra_Quantity,
                        ExtraStock_Posted_Quantity: row.ExtraStock_Posted_Quantity,
                        Rate: row.Rate,
                        SubTotal: row.SubTotal,
                    });
                }
            });
            // ------------------------------------------------
            // 5. Convert object to array
            // ------------------------------------------------
            const finalData = Object.values(result).sort(
                (a, b) => new Date(b.Added_Date) - new Date(a.Added_Date)
            );
            console.log('Final Inlet Challan Data:', finalData);
            // ------------------------------------------------
            // 6. Response
            // ------------------------------------------------
            return res.json({
                success: true,
                data: finalData
            });
        });
});

//Vendor Receipts API 

app.post("/CreateVendorChallanReceipt/:VendorChallan_id",
    async (req, res) => {
        const challanId = Number(req.params.VendorChallan_id);

        const {
            Received_Date,
            Mode_of_Transport,
            Transporter_Name,
            Vehicle_Number,
            Vendor_Note,
            Internal_Remark,
            items
        } = req.body;

        if (!Number.isInteger(challanId) || challanId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Vendor Challan ID"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product is required"
            });
        }

        const productIds = items.map(item => Number(item.VendorProduct_id));

        if (
            productIds.some(id => !Number.isInteger(id) || id <= 0) ||
            new Set(productIds).size !== productIds.length
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or duplicate product IDs"
            });
        }

        const validQuantity = value =>
            Number.isInteger(Number(value)) && Number(value) >= 0;

        for (const item of items) {
            if (
                !validQuantity(item.Received_Quantity) ||
                !validQuantity(item.Short_Quantity ?? 0) ||
                Number(item.Received_Quantity) +
                Number(item.Short_Quantity ?? 0) <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Enter a valid received or short quantity"
                });
            }

            if (
                item.operations !== undefined &&
                !Array.isArray(item.operations)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid operations list"
                });
            }

            const operationIds = (item.operations || []).map(
                op => Number(op.Operation_id)
            );

            if (
                operationIds.some(id => !Number.isInteger(id) || id <= 0) ||
                new Set(operationIds).size !== operationIds.length
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or duplicate operation IDs"
                });
            }

            for (const op of item.operations || []) {
                if (!validQuantity(op.Received_Quantity)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid operation received quantity"
                    });
                }
            }
        }

        // Requires a MySQL pool supporting getConnection().
        connection.getConnection(async (connectionError, conn) => {
            if (connectionError) {
                return res.status(500).json({
                    success: false,
                    message: "Database connection failed"
                });
            }

            const query = (sql, values = []) =>
                new Promise((resolve, reject) => {
                    conn.query(sql, values, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

            try {
                await new Promise((resolve, reject) => {
                    conn.beginTransaction(err =>
                        err ? reject(err) : resolve()
                    );
                });

                // Lock the original challan.
                const challans = await query(
                    `SELECT VendorChallan_id
           FROM vendorchallan
           WHERE VendorChallan_id = ?
           FOR UPDATE`,
                    [challanId]
                );

                if (!challans.length) {
                    throw Object.assign(
                        new Error("Vendor challan not found"),
                        { statusCode: 404 }
                    );
                }

                const dateValue = Received_Date || new Date();

                // Month-based receipt number, e.g. VR_202610_01.
                const d = new Date(dateValue);

                if (Number.isNaN(d.getTime())) {
                    throw Object.assign(
                        new Error("Invalid receipt date"),
                        { statusCode: 400 }
                    );
                }

                const datePart =
                    d.getFullYear().toString() +
                    String(d.getMonth() + 1).padStart(2, "0");

                // Serialize receipt numbering via the locked challan.
                const existingNumbers = await query(
                    `SELECT Receipt_Number
           FROM vendorchallan_receipts
           WHERE Receipt_Number LIKE ?
           ORDER BY Receipt_id DESC
           LIMIT 1`,
                    [`VR_${datePart}_%`]
                );

                let sequence = 1;

                if (existingNumbers.length) {
                    const lastNumber =
                        existingNumbers[0].Receipt_Number.split("_")[2];

                    sequence = Number(lastNumber) + 1;
                }

                const receiptNumber =
                    `VR_${datePart}_${String(sequence).padStart(2, "0")}`;

                const headerResult = await query(
                    `INSERT INTO vendorchallan_receipts
          (
            VendorChallan_id,
            Receipt_Number,
            Received_Date,
            Mode_of_Transport,
            Transporter_Name,
            Vehicle_Number,
            Vendor_Note,
            Internal_Remark,
            Receipt_Status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        challanId,
                        receiptNumber,
                        dateValue,
                        Mode_of_Transport || null,
                        Transporter_Name || null,
                        Vehicle_Number || null,
                        Vendor_Note || null,
                        Internal_Remark || null,
                        "Partial"
                    ]
                );

                const receiptId = headerResult.insertId;

                let totalReceivedThisTime = 0;
                let totalShortThisTime = 0;
                let totalPending = 0;

                for (const item of items) {
                    const vendorProductId = Number(item.VendorProduct_id);
                    const receivedQty = Number(item.Received_Quantity);
                    const shortQty = Number(item.Short_Quantity || 0);

                    // Lock product row and verify that it belongs to this challan.
                    const products = await query(
                        `SELECT VendorProduct_id, Product_Name, Product_Quantity
             FROM vendorproducts
             WHERE VendorProduct_id = ?
               AND VendorChallan_id = ?
             FOR UPDATE`,
                        [vendorProductId, challanId]
                    );

                    if (!products.length) {
                        throw Object.assign(
                            new Error(
                                `Product ${vendorProductId} does not belong to this challan`
                            ),
                            { statusCode: 400 }
                        );
                    }

                    const product = products[0];
                    const sentQty = Number(product.Product_Quantity);

                    // Include earlier receipts and short closures.
                    const previous = await query(
                        `SELECT
                COALESCE(SUM(Received_Quantity), 0) AS received,
                COALESCE(SUM(Short_Quantity), 0) AS shortQty
             FROM vendorchallan_receipt_products
             WHERE VendorProduct_id = ?`,
                        [vendorProductId]
                    );

                    const alreadyReceived = Number(previous[0].received);
                    const alreadyShort = Number(previous[0].shortQty);
                    const availableQty =
                        sentQty - alreadyReceived - alreadyShort;

                    if (receivedQty + shortQty > availableQty) {
                        throw Object.assign(
                            new Error(
                                `${product.Product_Name}: only ${availableQty} pieces remain`
                            ),
                            { statusCode: 400 }
                        );
                    }

                    const pendingQty =
                        availableQty - receivedQty - shortQty;

                    const productReceipt = await query(
                        `INSERT INTO vendorchallan_receipt_products
            (
              Receipt_id,
              VendorProduct_id,
              Sent_Quantity,
              Received_Quantity,
              Pending_Quantity,
              Short_Quantity,
              Receipt_Remark
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            receiptId,
                            vendorProductId,
                            sentQty,
                            receivedQty,
                            pendingQty,
                            shortQty,
                            item.Receipt_Remark || null
                        ]
                    );

                    const receiptProductId = productReceipt.insertId;

                    totalReceivedThisTime += receivedQty;
                    totalShortThisTime += shortQty;
                    totalPending += pendingQty;

                    for (const op of item.operations || []) {
                        const operationId = Number(op.Operation_id);
                        const opReceived = Number(op.Received_Quantity);

                        const validOperations = await query(
                            `SELECT Operation_id
               FROM vendorproduct_operations
               WHERE Operation_id = ?
                 AND VendorProduct_id = ?`,
                            [operationId, vendorProductId]
                        );

                        if (!validOperations.length) {
                            throw Object.assign(
                                new Error(
                                    `Operation ${operationId} does not belong to product ${vendorProductId}`
                                ),
                                { statusCode: 400 }
                            );
                        }

                        if (opReceived > receivedQty) {
                            throw Object.assign(
                                new Error(
                                    "Operation received quantity cannot exceed product received quantity"
                                ),
                                { statusCode: 400 }
                            );
                        }

                        const opPending = receivedQty - opReceived;

                        await query(
                            `INSERT INTO vendorchallan_receipt_operations
              (
                ReceiptProduct_id,
                Operation_id,
                Received_Quantity,
                Pending_Quantity,
                Operation_Status,
                Operation_Remark
              )
              VALUES (?, ?, ?, ?, ?, ?)`,
                            [
                                receiptProductId,
                                operationId,
                                opReceived,
                                opPending,
                                op.Operation_Status || (
                                    opPending === 0 ? "Completed" : "Pending"
                                ),
                                op.Operation_Remark || null
                            ]
                        );
                    }
                }

                // Determine whether the entire challan is still outstanding.
                const outstanding = await query(
                    `SELECT
              vp.VendorProduct_id,
              vp.Product_Quantity,
              COALESCE(SUM(rp.Received_Quantity), 0) AS received,
              COALESCE(SUM(rp.Short_Quantity), 0) AS shortQty
           FROM vendorproducts vp
           LEFT JOIN vendorchallan_receipt_products rp
             ON rp.VendorProduct_id = vp.VendorProduct_id
           WHERE vp.VendorChallan_id = ?
           GROUP BY vp.VendorProduct_id, vp.Product_Quantity`,
                    [challanId]
                );

                const allResolved = outstanding.every(row =>
                    Number(row.received) + Number(row.shortQty) >=
                    Number(row.Product_Quantity)
                );

                const anyShort = outstanding.some(row =>
                    Number(row.shortQty) > 0
                );

                const receiptStatus = allResolved
                    ? (anyShort ? "Short Closed" : "Completed")
                    : "Partial";

                await query(
                    `UPDATE vendorchallan_receipts
           SET Receipt_Status = ?
           WHERE Receipt_id = ?`,
                    [receiptStatus, receiptId]
                );

                // Optional summary fields on the original challan.
                // These columns must exist if you enable this update.
                await query(
                    `UPDATE vendorchallan
           SET Updated_Date = NOW()
           WHERE VendorChallan_id = ?`,
                    [challanId]
                );

                await new Promise((resolve, reject) => {
                    conn.commit(err => err ? reject(err) : resolve());
                });

                return res.status(201).json({
                    success: true,
                    message: "Vendor receipt saved successfully",
                    Receipt_id: receiptId,
                    Receipt_Number: receiptNumber,
                    Receipt_Status: receiptStatus,
                    Received_This_Time: totalReceivedThisTime,
                    Short_This_Time: totalShortThisTime,
                    Pending_Quantity: totalPending
                });

            } catch (err) {
                await new Promise(resolve => {
                    conn.rollback(() => resolve());
                });

                console.error("Vendor receipt error:", err);

                return res.status(err.statusCode || 500).json({
                    success: false,
                    message: err.statusCode
                        ? err.message
                        : "Failed to save vendor receipt"
                });

            } finally {
                conn.release();
            }
        });
    }
);


app.get("/GetVendorChallanPending/:VendorChallan_id",
    (req, res) => {
        const challanId = Number(req.params.VendorChallan_id);

        if (!Number.isInteger(challanId) || challanId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Vendor Challan ID"
            });
        }

        const sql = `
      SELECT
        vp.VendorProduct_id,
        vp.VendorChallan_id,
        vp.Product_Name,
        vp.HSN_Code,
        vp.Product_Quantity AS Sent_Quantity,
        vp.Rate,
        vp.SubTotal,

        COALESCE(SUM(rp.Received_Quantity), 0)
          AS Total_Received_Quantity,

        COALESCE(SUM(rp.Short_Quantity), 0)
          AS Total_Short_Quantity,

        GREATEST(
          vp.Product_Quantity
          - COALESCE(SUM(rp.Received_Quantity), 0)
          - COALESCE(SUM(rp.Short_Quantity), 0),
          0
        ) AS Pending_Quantity

      FROM vendorproducts vp

      LEFT JOIN vendorchallan_receipt_products rp
        ON rp.VendorProduct_id = vp.VendorProduct_id

      WHERE vp.VendorChallan_id = ?

      GROUP BY
        vp.VendorProduct_id,
        vp.VendorChallan_id,
        vp.Product_Name,
        vp.HSN_Code,
        vp.Product_Quantity,
        vp.Rate,
        vp.SubTotal

      ORDER BY vp.VendorProduct_id
    `;

        connection.query(sql, [challanId], (err, products) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to load pending quantities"
                });
            }

            res.json({
                success: true,
                products
            });
        });
    }
);

app.get("/GetVendorChallanReceipt/:VendorChallan_id", async (req, res) => {
    const challanId = Number(req.params.VendorChallan_id);

    if (!Number.isInteger(challanId) || challanId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid Vendor Challan ID"
        });
    }

    const query = (sql, values = []) =>
        new Promise((resolve, reject) => {
            connection.query(sql, values, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

    try {
        const receipts = await query(
            `SELECT *
         FROM vendorchallan_receipts
         WHERE VendorChallan_id = ?
         ORDER BY Receipt_id DESC`,
            [challanId]
        );

        if (!receipts.length) {
            return res.json({
                success: true,
                receipts: []
            });
        }

        const receiptIds = receipts.map(r => r.Receipt_id);

        const placeholders = receiptIds.map(() => "?").join(",");

        const products = await query(
            `SELECT
            rp.*,
            vp.Product_Name,
            vp.HSN_Code
         FROM vendorchallan_receipt_products rp
         JOIN vendorproducts vp
           ON vp.VendorProduct_id = rp.VendorProduct_id
         WHERE rp.Receipt_id IN (${placeholders})
         ORDER BY rp.ReceiptProduct_id`,
            receiptIds
        );

        const receiptProductIds = products.map(
            p => p.ReceiptProduct_id
        );

        let operations = [];

        if (receiptProductIds.length) {
            const operationPlaceholders =
                receiptProductIds.map(() => "?").join(",");

            operations = await query(
                `SELECT
              ro.*,
              vpo.Operation_Name
           FROM vendorchallan_receipt_operations ro
           JOIN vendorproduct_operations vpo
             ON vpo.Operation_id = ro.Operation_id
           WHERE ro.ReceiptProduct_id IN (${operationPlaceholders})`,
                receiptProductIds
            );
        }

        for (const product of products) {
            product.operations = operations.filter(
                op => op.ReceiptProduct_id === product.ReceiptProduct_id
            );
        }

        for (const receipt of receipts) {
            receipt.items = products.filter(
                p => p.Receipt_id === receipt.Receipt_id
            );
        }

        res.json({
            success: true,
            receipts
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Failed to load receipt history"
        });
    }
}
);


app.get("/GetVendorChallanReceipts", (req, res) => {
    const sql = `
    SELECT
      vc.VendorChallan_id,
      vc.VendorChallan_Code,
      vc.Vendor_Name,
      vc.Vendor_CompanyName,
      vc.Added_Date,

      COALESCE(SUM(vp.Product_Quantity), 0)
        AS Total_Sent_Quantity,

      COALESCE(SUM(received.Received_Qty), 0)
        AS Total_Received_Quantity,

      COALESCE(SUM(received.Short_Qty), 0)
        AS Total_Short_Quantity,

      COALESCE(SUM(vp.Product_Quantity), 0)
        - COALESCE(SUM(received.Received_Qty), 0)
        - COALESCE(SUM(received.Short_Qty), 0)
        AS Total_Pending_Quantity

    FROM vendorchallan vc

    LEFT JOIN vendorproducts vp
      ON vp.VendorChallan_id = vc.VendorChallan_id

    LEFT JOIN (
      SELECT
        VendorProduct_id,
        SUM(Received_Quantity) AS Received_Qty,
        SUM(Short_Quantity) AS Short_Qty
      FROM vendorchallan_receipt_products
      GROUP BY VendorProduct_id
    ) received
      ON received.VendorProduct_id = vp.VendorProduct_id

    GROUP BY
      vc.VendorChallan_id,
      vc.VendorChallan_Code,
      vc.Vendor_Name,
      vc.Vendor_CompanyName,
      vc.Added_Date

    ORDER BY vc.VendorChallan_id DESC
  `;

    connection.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Failed to load vendor challans"
            });
        }

        res.json({
            success: true,
            challans: result
        });
    });
});


app.get(
    "/GetVendorChallanPending/:VendorChallan_id",
    (req, res) => {
        const challanId = Number(req.params.VendorChallan_id);

        if (!Number.isInteger(challanId) || challanId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Vendor Challan ID"
            });
        }

        const sql = `
      SELECT
        vp.VendorProduct_id,
        vp.VendorChallan_id,
        vp.Product_Name,
        vp.HSN_Code,
        vp.Product_Quantity AS Sent_Quantity,
        vp.Rate,
        vp.SubTotal,

        COALESCE(SUM(rp.Received_Quantity), 0)
          AS Total_Received_Quantity,

        COALESCE(SUM(rp.Short_Quantity), 0)
          AS Total_Short_Quantity,

        GREATEST(
          vp.Product_Quantity
          - COALESCE(SUM(rp.Received_Quantity), 0)
          - COALESCE(SUM(rp.Short_Quantity), 0),
          0
        ) AS Pending_Quantity

      FROM vendorproducts vp

      LEFT JOIN vendorchallan_receipt_products rp
        ON rp.VendorProduct_id = vp.VendorProduct_id

      WHERE vp.VendorChallan_id = ?

      GROUP BY
        vp.VendorProduct_id,
        vp.VendorChallan_id,
        vp.Product_Name,
        vp.HSN_Code,
        vp.Product_Quantity,
        vp.Rate,
        vp.SubTotal

      ORDER BY vp.VendorProduct_id
    `;

        connection.query(sql, [challanId], (err, products) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to load pending quantities"
                });
            }

            res.json({
                success: true,
                products
            });
        });
    }
);

app.get("/GetVendorChallanOperations/:VendorChallan_id",
    (req, res) => {
        const challanId = Number(req.params.VendorChallan_id);

        if (!Number.isInteger(challanId) || challanId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Vendor Challan ID"
            });
        }
        const sql = `
      SELECT
        vp.VendorProduct_id,
        vp.Product_Name,
        vpo.Operation_id,
        vpo.Operation_Name,
        vpo.Rate
      FROM vendorproducts vp
      INNER JOIN vendorproduct_operations vpo
        ON vpo.VendorProduct_id = vp.VendorProduct_id
      WHERE vp.VendorChallan_id = ?
      ORDER BY vp.VendorProduct_id, vpo.Operation_id
    `;

        connection.query(sql, [challanId], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to load product operations"
                });
            }

            const grouped = {};

            for (const row of rows) {
                if (!grouped[row.VendorProduct_id]) {
                    grouped[row.VendorProduct_id] = [];
                }

                grouped[row.VendorProduct_id].push({
                    Operation_id: row.Operation_id,
                    Operation_Name: row.Operation_Name,
                    Rate: row.Rate,
                    Received_Quantity: 0,
                    Operation_Status: "Pending",
                    Operation_Remark: ""
                });
            }

            res.json({
                success: true,
                operations: grouped
            });
        });
    }
);

// Product Extra manufacutring details finds.

// app.put("/UpdateInletProductProduction/:InletProduct_id", (req, res) => {
//     const InletProduct_id = req.params.InletProduct_id;

//     const {
//         Produced_Quantity,
//         Damaged_Quantity = 0,
//         Faulty_Quantity = 0
//     } = req.body;

//     const produced = Number(Produced_Quantity) || 0;

//     const damaged = Number(Damaged_Quantity) || 0;

//     const faulty = Number(Faulty_Quantity) || 0;

//     if (produced < 0) {
//         return res.status(400).json({
//             success: false,
//             message: "Produced quantity cannot be negative"
//         });
//     }

//     if (damaged < 0 || faulty < 0) {
//         return res.status(400).json({
//             success: false,
//             message:
//                 "Damaged/Faulty quantity cannot be negative"
//         });
//     }

//     if (damaged + faulty > produced) {
//         return res.status(400).json({
//             success: false,
//             message:
//                 "Damaged + Faulty cannot be greater than Produced quantity"
//         });
//     }

//     const getSql = `
//         SELECT *
//         FROM inletproducts
//         WHERE InletProduct_id = ?
//     `;

//     connection.query(
//         getSql,
//         [InletProduct_id],
//         (err, result) => {
//             if (err) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Database error",
//                     error: err
//                 });
//             }

//             if (!result.length) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Inlet Product not found"
//                 });
//             }

//             const product = result[0];
//             const ordered = Number(product.Ordered_Quantity);
//             const good = produced - damaged - faulty;
//             const extra = Math.max(good - ordered, 0);
//             const pendingExtra = Math.max(0, extra - Number(existingProduct.ExtraStock_Posted_Quantity || 0));

//             const sql = `
//                 UPDATE inletproducts
//                 SET Produced_Quantity = ?,
//                     Damaged_Quantity = ?,
//                     Faulty_Quantity = ?,
//                     Good_Quantity = ?,
//                     Extra_Quantity = ?
//                 WHERE InletProduct_id = ?
//             `;

//             connection.query(
//                 sql,
//                 [
//                     produced,
//                     damaged,
//                     faulty,
//                     good,
//                     extra,
//                     InletProduct_id
//                 ],
//                 (err) => {
//                     if (err) {
//                         return res.status(500).json({
//                             success: false,
//                             message: "Production update failed",
//                             error: err
//                         });
//                     }
//                     if (extra <= 0) {
//                         return res.json({
//                             success: true,
//                             message: "Production updated successfully",
//                             Ordered_Quantity: ordered,
//                             Produced_Quantity: produced,
//                             Damaged_Quantity: damaged,
//                             Faulty_Quantity: faulty,
//                             Good_Quantity: good,
//                             Extra_Quantity: extra
//                         });
//                     }
//                     addExtraStock(product, pendingExtra, (stockError) => {

//                         if (stockError) {
//                             return res.status(500).json({
//                                 success: false,
//                                 message: "Extra stock update failed"
//                             });
//                         }

//                         const postedSql = `
//         UPDATE inletproducts
//         SET ExtraStock_Posted_Quantity = ?
//         WHERE InletProduct_id = ?
//     `;

//                         connection.query(
//                             postedSql,
//                             [extra, InletProduct_id],
//                             (postedError) => {

//                                 if (postedError) {
//                                     return res.status(500).json({
//                                         success: false,
//                                         message: "Stock updated but posting quantity update failed"
//                                     });
//                                 }

//                                 return res.json({
//                                     success: true,
//                                     message: "Production and extra stock updated successfully",
//                                     Ordered_Quantity: ordered,
//                                     Manufacturing_Required: manufacturingRequired,
//                                     Produced_Quantity: produced,
//                                     Good_Quantity: good,
//                                     Extra_Quantity: extra,
//                                     Added_To_Stock: pendingExtra
//                                 });
//                             }
//                         );
//                     });
//                 });
//         });
// });

app.get("/GetHSNByProductName", (req, res) => {
    const Product_Name = String(
        req.query.Product_Name || ""
    ).trim();

    if (!Product_Name) {
        return res.status(400).json({
            success: false,
            message: "Product name is required"
        });
    }

    const sql = `
        SELECT soi.HSN_Code
        FROM salesorderitems AS soi
        INNER JOIN salesorder AS so
            ON so.SalesOrder_id = soi.SalesOrder_id
        WHERE LOWER(TRIM(soi.Product_Name)) =
              LOWER(TRIM(?))
          AND soi.HSN_Code IS NOT NULL
          AND TRIM(soi.HSN_Code) <> ''
        ORDER BY so.SalesOrder_id DESC
        LIMIT 1
    `;

    connection.query(sql, [Product_Name], (err, result) => {
        if (err) {
            console.error("HSN fetch error:", err);

            return res.status(500).json({
                success: false,
                message: "Error fetching HSN code"
            });
        }

        if (result.length === 0) {
            return res.status(200).json({
                success: true,
                found: false,
                HSN_Code: ""
            });
        }

        return res.status(200).json({
            success: true,
            found: true,
            HSN_Code: result[0].HSN_Code
        });
    });
});

app.get('/Allproduct_excess_stock', (req, res) => {
    const Sqllquery = `SELECT * FROM product_excess_stock ORDER BY ExcessStock_id  DESC`;
    connection.query(Sqllquery, (err, data) => {
        if (err) {
            res.send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.send({
                success: true,
                message: data.message,
                data: data
            });
        }
    });
});

app.post('/ExtraProductByProductName', (req, res) => {
    const Product_Name = req.body.Product_Name;
    const Sqllquery = `select * from product_excess_stock where Product_Name = ? `;
    connection.query(Sqllquery, [Product_Name], (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: err.sqlMessage,
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Data by Product Name',
                data: data
            });
        }
    });
});
app.get("/GetProductExtraStock", (req, res) => {
    const Product_Name = String(req.query.Product_Name || "").trim();
    const HSN_Code = String(req.query.HSN_Code || "").trim();

    if (!Product_Name) {
        return res.status(400).json({
            success: false,
            message: "Product name is required."
        });
    }

    const sql = `
        SELECT Available_Quantity
        FROM product_excess_stock
        WHERE Product_Name = ?
          AND HSN_Code = ?
        LIMIT 1
    `;

    connection.query(
        sql,
        [Product_Name, HSN_Code],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to fetch product stock."
                });
            }

            return res.json({
                success: true,
                Available_Quantity: rows.length
                    ? Number(rows[0].Available_Quantity) || 0
                    : 0
            });
        }
    );
});
// app.get("/GetProductExtraStock", (req, res) => {
//     const Product_Name = String(
//         req.query.Product_Name || ""
//     ).trim();

//     const HSN_Code = String(
//         req.query.HSN_Code || ""
//     ).trim();

//     if (!Product_Name) {
//         return res.status(400).json({
//             success: false,
//             message: "Product name is required"
//         });
//     }

//     let sql = `
//         SELECT Available_Quantity
//         FROM product_excess_stock
//         WHERE Product_Name = ?
//     `;

//     const params = [Product_Name];

//     if (HSN_Code) {
//         sql += ` AND HSN_Code = ?`;
//         params.push(HSN_Code);
//     }

//     sql += ` LIMIT 1`;

//     connection.query(sql, params, (err, rows) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Failed to fetch extra stock"
//             });
//         }

//         return res.json({
//             success: true,
//             Available_Quantity: rows.length
//                 ? Number(rows[0].Available_Quantity) || 0
//                 : 0
//         });
//     });
// });

app.listen(3000, () => {
    console.log('Server is Running On Port 3000');
});