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
            Total_Amount,
            Discount_Amount,
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
                                            Product_Data
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
