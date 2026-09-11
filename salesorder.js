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
        String(today.getMonth() + 1).padStart(2, "0") +
        String(today.getDate()).padStart(2, "0");

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

        const Discount =
            Number(Discount_Amount) || 0;

        const Total_Amount =
            Sub_Total - Discount;

        const CGST_amount =
            Total_Amount * 0.09;

        const SGST_amount =
            Total_Amount * 0.09;

        const Grand_Total =
            Total_Amount +
            CGST_amount +
            SGST_amount;

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

                const SalesOrder_id =
                    result.insertId;

                const itemSql = `
                    INSERT INTO salesorderitems
                    (
                        SalesOrder_id,
                        Product_id,
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

                        item.Product_id || null,

                        item.Product_Name,
                        item.HSN_Code,

                        Number(
                            item.Ordered_Quantity
                        ) || 0,

                        Number(item.Rate) || 0,

                        (
                            Number(
                                item.Ordered_Quantity
                            ) || 0
                        ) *
                        (
                            Number(item.Rate) || 0
                        )
                    ]);

                connection.query(
                    itemSql,
                    [itemValues],
                    err => {

                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message:
                                    "Sales Order products failed",
                                error: err
                            });
                        }

                        res.json({
                            success: true,
                            message:
                                "Sales Order Created Successfully",

                            SalesOrder_id,
                            Sales_Order_Number
                        });
                    }
                );
            }
        );
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
        const finalData = Object.values(result).sort(
            (a, b) => new Date(b.Added_Date) - new Date(a.Added_Date)
        );

        res.json({
            success: true,
            data: finalData
        });

    });

});

app.get('/SalesOrderbyId/:SalesOrder_id', (req, res) => {
    const SalesOrder_id = req.params.SalesOrder_id;
    const Salesorderquery = `SELECT saleorder.*, saleproduct.*
    FROM salesorder saleorder
    JOIN salesorderitems saleproduct 
    ON saleorder.SalesOrder_id = saleproduct.SalesOrder_id
    WHERE saleorder.SalesOrder_id=?`;

    connection.query(Salesorderquery, [SalesOrder_id], (err, rows) => {
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


// app.post("/AddSalesOrder", (req, res) => {
//     const {
//         Customer_Name,
//         Company_Name,
//         Company_Address,
//         GST_No,
//         Delivery_Address,
//         Discount_Amount = 0,
//         Remark,
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
//         String(today.getMonth() + 1).padStart(2, "0")

//     const numberSql = `
//         SELECT Sales_Order_Number
//         FROM salesorder
//         WHERE Sales_Order_Number LIKE 'SO_${datePart}_%'
//         ORDER BY SalesOrder_id DESC
//         LIMIT 1
//     `;

//     connection.query(numberSql, (err, result) => {

//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Error generating Sales Order Number",
//                 error: err
//             });
//         }

//         let Sales_Order_Number = `SO_${datePart}_01`;

//         if (result.length > 0) {

//             const lastNumber =
//                 parseInt(
//                     result[0].Sales_Order_Number.split("_")[2]
//                 );

//             const nextNumber =
//                 String(lastNumber + 1).padStart(2, "0");

//             Sales_Order_Number =
//                 `SO_${datePart}_${nextNumber}`;
//         }

//         let Sub_Total = 0;

//         items.forEach(item => {

//             const qty =
//                 Number(item.Ordered_Quantity) || 0;

//             const rate =
//                 Number(item.Rate) || 0;

//             Sub_Total += qty * rate;
//         });

//         const Discount =
//             Number(Discount_Amount) || 0;

//         const Total_Amount =
//             Sub_Total - Discount;

//         const CGST_amount =
//             Total_Amount * 0.09;

//         const SGST_amount =
//             Total_Amount * 0.09;

//         const Grand_Total =
//             Total_Amount +
//             CGST_amount +
//             SGST_amount;

//         const sql = `
//             INSERT INTO salesorder
//             (
//                 Sales_Order_Number,
//                 Customer_Name,
//                 Company_Name,
//                 Company_Address,
//                 GST_No,
//                 Delivery_Address,

//                 Sub_Total,
//                 Discount_Amount,
//                 Total_Amount,

//                 CGST_amount,
//                 SGST_amount,
//                 Grand_Total,

//                 Remark,
//                 Sales_Order_Status,

//                 Added_Date,
//                 Updated_Date
//             )
//             VALUES
//             (
//                 ?,?,?,?,?,?,
//                 ?,?,?,?,?,?,
//                 ?,
//                 'Draft',
//                 NOW(),
//                 NOW()
//             )
//         `;

//         const values = [

//             Sales_Order_Number,

//             Customer_Name,
//             Company_Name,
//             Company_Address,
//             GST_No,
//             Delivery_Address,

//             Sub_Total,
//             Discount,
//             Total_Amount,

//             CGST_amount,
//             SGST_amount,
//             Grand_Total,

//             Remark || ""
//         ];

//         connection.query(sql, values, (err, result) => {

//             if (err) {

//                 console.error(err);

//                 return res.status(500).json({
//                     success: false,
//                     message: "Sales Order creation failed",
//                     error: err
//                 });
//             }

//             const SalesOrder_id =
//                 result.insertId;

//             const itemSql = `
//                 INSERT INTO salesorderitems
//                 (
//                     SalesOrder_id,
//                     Product_id,
//                     Product_Name,
//                     HSN_Code,
//                     Ordered_Quantity,
//                     Rate,
//                     SubTotal
//                 )
//                 VALUES ?
//             `;

//             const itemValues = items.map(item => [

//                 SalesOrder_id,

//                 item.Product_id || null,

//                 item.Product_Name,
//                 item.HSN_Code,

//                 Number(item.Ordered_Quantity) || 0,

//                 Number(item.Rate) || 0,

//                 (Number(item.Ordered_Quantity) || 0) *
//                 (Number(item.Rate) || 0)
//             ]);

//             connection.query(
//                 itemSql,
//                 [itemValues],
//                 err => {

//                     if (err) {

//                         return res.status(500).json({
//                             success: false,
//                             message: "Sales Order products creation failed",
//                             error: err
//                         });
//                     }

//                     res.json({
//                         success: true,
//                         message: "Sales Order Created Successfully",
//                         SalesOrder_id,
//                         Sales_Order_Number
//                     });
//                 }
//             );
//         });
//     });
// });
