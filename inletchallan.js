
// Inlet challan API
app.post("/AddInletchallan", (req, res) => {
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
        String(today.getMonth() + 1).padStart(2, "0")
    // const datePart =
    //     today.getFullYear().toString() +
    //     String(today.getMonth() + 1).padStart(2, "0") +
    //     String(today.getDate()).padStart(2, "0");

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


app.get('/InletChallanbySalesorderNumber/:Sales_Order_Number', (req, res) => {
    const Sales_Order_Number = req.params.Sales_Order_Number;
    // const challanquery = `select * from inletchallan where Challan_id = ?`;
    const challanquery = `SELECT challan.*, iproduct.*
    FROM inletchallan challan
    JOIN inletproducts iproduct 
    ON challan.Challan_id = iproduct.Challan_id
    WHERE challan.Sales_Order_Number=?`;

    connection.query(challanquery, [Sales_Order_Number], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.sqlMessage });
        }
        if (!rows.length) {
            return res.json({ success: true, data: [] });
        }
        const result = {};
        rows.forEach(row => {

            if (!result[row.Sales_Order_Number]) {
                result[row.Sales_Order_Number] = {
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