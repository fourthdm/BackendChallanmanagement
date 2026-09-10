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
                            message: 'Vendor Deleted Successfully'
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
      ` SELECT
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

app.get('/GetVendorDeletionHistoryById/:VendorDeletion_id',
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
