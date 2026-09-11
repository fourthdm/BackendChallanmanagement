
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
