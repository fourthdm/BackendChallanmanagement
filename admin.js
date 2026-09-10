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
