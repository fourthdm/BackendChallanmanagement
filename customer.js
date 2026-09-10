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
// Customer API End

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
