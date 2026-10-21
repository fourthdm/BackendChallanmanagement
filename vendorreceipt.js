
app.post(
  "/CreateVendorChallanReceipt/:VendorChallan_id",
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


app.get(
  "/GetVendorChallanReceipt/:VendorChallan_id",
  async (req, res) => {
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
