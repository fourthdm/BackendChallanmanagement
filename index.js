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

app.post('/DeleteAdmin/:Admin_id', (req, res) => {
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

        connection.query(
            "SELECT * FROM admin WHERE Admin_id=?",
            [decoded.Admin_id],
            (err, data) => {

                if (err)
                    return res.status(500).send(err);

                if (data.length == 0) {
                    return res.send({
                        success: false,
                        message: "Admin not found"
                    });
                }

                if (data[0].Password != Password) {
                    return res.send({
                        success: false,
                        message: "Incorrect Password Not Authorized person."
                    });
                }
                connection.query(
                    "DELETE FROM admin WHERE Admin_id=?",
                    [req.params.Admin_id],
                    (err, result) => {

                        if (err)
                            return res.status(500).send(err);

                        res.send({
                            success: true,
                            message: "Admin Deleted Successfully"
                        });

                    });

            });

    });

});

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

app.post('/Deletecustomer/:Customer_id', (req, res) => {
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
                    "DELETE FROM customer WHERE Customer_id = ?",
                    [req.params.Customer_id],
                    (err, result) => {

                        if (err) {
                            return res.status(500).send({
                                success: false,
                                message: err.sqlMessage
                            });
                        }

                        return res.send({
                            success: true,
                            message: "Customer Deleted Successfully"
                        });

                    });

            });

    });

});

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
app.post("/AddInletchallan", (req, res) => {
    const {
        Customer_Name,
        Company_Name,
        Company_Address,
        GST_No,
        Delivery_Address,

        Mode_of_Transport,
        Transporter_Name,
        Vehicle_Number,
        Remark,
        Work_Status,
        Delivery_Status,
        Challan_Status,
        Discount_Amount = 0,
        items
    } = req.body;

    if (!items || !items.length) {
        return res.status(400).json({ message: "Products Required" });
    }

    // const datePart = Challan_Code.split("_")[0];
    const today = new Date();

    const datePart =
        today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, "0") +
        String(today.getDate()).padStart(2, "0");

    const qNoSql = `
                    SELECT Challan_Code 
                    FROM inletchallan 
                    WHERE Challan_Code LIKE 'CH_${datePart}_%' 
                    ORDER BY Challan_id DESC
                    LIMIT 1
                    `;
    connection.query(qNoSql, (err, result) => {
        if (err) return res.status(500).send(err);
        let NewCode = `CH_${datePart}_01`;
        if (result.length) {
            const last = parseInt(result[0].Challan_Code.split("_")[2]);
            const next = String(last + 1).padStart(2, "0");
            NewCode = `CH_${datePart}_${next}`;
        }
        console.log("New Challan :", NewCode);
        let SubTotal = 0;
        items.forEach(i => {
            SubTotal += i.Rate * i.Product_Quantity;
        });
        const Total_Amount = SubTotal - Discount_Amount;
        const CGST_amount = Total_Amount * 0.09;
        const SGST_amount = Total_Amount * 0.09;
        const Grand_Total =
            Total_Amount + CGST_amount + SGST_amount;
        const InletSql = `
      INSERT INTO inletchallan
      (Challan_Code, Customer_Name, Company_Name, Company_Address, GST_No, Delivery_Address,
        Sub_Total, Total_Amount, Discount_Amount, CGST_amount, SGST_amount, Grand_Total,
       Mode_of_Transport,Transporter_Name,  Vehicle_Number, Remark, Work_Status, Delivery_Status, Challan_Status, Added_Date,Updated_Date)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
    `;
        const inletValues = [
            NewCode,
            Customer_Name,
            Company_Name,
            Company_Address,
            GST_No,
            Delivery_Address,
            SubTotal,
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
        ];

        connection.query(InletSql, inletValues, (err, qResult) => {
            if (err) return res.status(500).send(err);
            const Challan_id = qResult.insertId;
            const itemSql = `INSERT INTO inletproducts
        (Challan_id, Product_Name, HSN_Code,
         Product_Quantity, Rate, SubTotal)
        VALUES ?`;
            const itemValues = items.map(i => [
                Challan_id,
                i.Product_Name,
                i.HSN_Code,
                i.Product_Quantity,
                i.Rate,
                i.Rate * i.Product_Quantity
            ]);
            connection.query(itemSql, [itemValues], err => {
                if (err) return res.status(500).send(err);
                res.json({
                    success: true,
                    message: "Inlet Challan with multiple products Added",
                    Challan_Code: NewCode
                });
            });
        });
    });
});

app.put('/UpdateaChallan/:Challan_id', (req, res) => {
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

        const Challan_id = req.params.Challan_id;

        const {

            Customer_Name,
            Company_Name,
            Company_Address,
            GST_No,
            Delivery_Address,

            Mode_of_Transport,
            Transporter_Name,
            Vehicle_Number,
            Remark,
            Work_Status,
            Delivery_Status,
            Challan_Status,

            Discount_Amount = 0,

            items

        } = req.body;

        if (!items || items.length == 0) {

            return res.status(400).send({

                success: false,

                message: "Products Required"

            });

        }

        //-------------------------
        // Calculate Amount
        //-------------------------

        let SubTotal = 0;

        items.forEach(i => {
            SubTotal += Number(i.Product_Quantity) * Number(i.Rate);
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
        UPDATE inletchallan
        SET

        Customer_Name=?,
        Company_Name=?,
        Company_Address=?,
        GST_No=?,
        Delivery_Address=?,

        Sub_Total=?,
        Total_Amount=?,
        Discount_Amount=?,
        CGST_amount=?,
        SGST_amount=?,
        Grand_Total=?,

        Mode_of_Transport=?,
        Transporter_Name=?,
        Vehicle_Number=?,
        Remark=?,

        Work_Status=?,
        Delivery_Status=?,
        Challan_Status=?,

        Updated_Date=NOW()

        WHERE Challan_id=?
        `;

        const HeaderValues = [

            Customer_Name,
            Company_Name,
            Company_Address,
            GST_No,
            Delivery_Address,

            SubTotal,
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

            Challan_id
        ];

        connection.query(UpdateSql, HeaderValues, (err) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: err.sqlMessage
                });
            }
            connection.query(
                "SELECT InletProduct_id FROM inletproducts WHERE Challan_id=?",
                [Challan_id],
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

                        if (i >= items.length) {

                            const deleteIds = oldProducts
                                .map(x => x.InletProduct_id)
                                .filter(id => !existingIds.includes(id));

                            if (deleteIds.length == 0) {

                                return res.send({
                                    success: true,
                                    message: "Challan Updated Successfully"
                                });

                            }

                            connection.query(
                                "DELETE FROM inletproducts WHERE InletProduct_id IN (?)",
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
                                        message: "Challan Updated Successfully"
                                    });

                                });

                            return;

                        }

                        const p = items[i];

                        const subtotal =
                            Number(p.Product_Quantity) * Number(p.Rate);

                        if (p.InletProduct_id && p.InletProduct_id > 0) {

                            existingIds.push(p.InletProduct_id);

                            connection.query(
                                `UPDATE inletproducts
                     SET
                     Product_Name=?,
                     HSN_Code=?,
                     Product_Quantity=?,
                     Rate=?,
                     SubTotal=?
                     WHERE InletProduct_id=?`,
                                [
                                    p.Product_Name,
                                    p.HSN_Code,
                                    p.Product_Quantity,
                                    p.Rate,
                                    subtotal,
                                    p.InletProduct_id
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
                                `INSERT INTO inletproducts
                    (
                        Challan_id,
                        Product_Name,
                        HSN_Code,
                        Product_Quantity,
                        Rate,
                        SubTotal
                    )
                    VALUES (?,?,?,?,?,?)`,
                                [
                                    Challan_id,
                                    p.Product_Name,
                                    p.HSN_Code,
                                    p.Product_Quantity,
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

            doc.text(`Challan Date : ${new Date(q.Added_Date).toLocaleDateString("en-IN")} `, 430, 125);

            doc.text(
                `Challan Code  : ${q.Challan_Code}`,
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
        String(today.getMonth() + 1).padStart(2, "0") +
        String(today.getDate()).padStart(2, "0");

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
            `
                SELECT *
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

                        message:
                            'Deletion history not found'

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

app.get(
    '/GetVendorDeletionHistoryById/:VendorDeletion_id',
    (req, res) => {

        const token = req.headers['x-access-token'];

        const VendorDeletion_id =
            req.params.VendorDeletion_id;


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

app.listen(3000, () => {
    console.log('Server is Running On Port 3000');
});