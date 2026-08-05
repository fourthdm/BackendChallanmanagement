
app.post("/ChallanServer/NEWAddvendorchallan", (req, res) => {
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
                            });
                    }
                });
        });
});


app.put('/ChallanServer/UpdateVendorChallan/:VendorChallan_id', (req, res) => {
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

    vendoritems.forEach(item => {
        Sub_Total += Number(item.Product_Quantity || 0) * Number(item.Rate || 0);
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
                            'DELETE FROM vendorproduct_operations WHERE VendorProduct_id = ?',
                            [VendorProduct_id],
                            err => {
                                if (err) return rollback(res, err);

                                if (!operations.length) {
                                    index++;
                                    return saveNextProduct();
                                }

                                const values = operations.map(op => [
                                    VendorProduct_id,
                                    op.Operation_Name,
                                    op.Rate
                                ]);

                                connection.query(
                                    `
                    INSERT INTO vendorproduct_operations
                    (VendorProduct_id, Operation_Name, Rate)
                    VALUES ?
                  `,
                                    [values],
                                    err => {
                                        if (err) return rollback(res, err);

                                        index++;
                                        saveNextProduct();
                                    }
                                );
                            }
                        );
                    }

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

app.get('/ChallanServer/VendorchallanbyChallanid/:VendorChallan_id', (req, res) => {
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

app.post('/ChallanServer/DeleteVendorChallan/:VendorChallan_id', (req, res) => {
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
            `
              DELETE vo
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

app.get('/ChallanServer/PrintVendorchallan/:VendorChallan_id', (req, res) => {
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
      { t: 'Operations', w: 125 },
      { t: 'Qty', w: 65 },
      { t: 'Rate', w: 65 },
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

      cell(doc, item.Product_Quantity, x, y, 65, rowHeight);
      x += 65;

      cell(doc, item.Product_Rate, x, y, 65, rowHeight);
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
