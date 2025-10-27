const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Import the invoice generation functions
const { createInvoice } = require('./invoiceGenerator');

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, 'invoices');
if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir);
}

app.post('/generate-invoice', (req, res) => {
    const invoiceData = req.body;
    
    // Transform the data to match the expected format
    const invoice = {
        invoice_nr: invoiceData.invoiceNumber,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
        shipping: {
            name: invoiceData.to.name,
            address: invoiceData.to.address,
            city: invoiceData.to.city || '',
            state: invoiceData.to.state || '',
            country: invoiceData.to.country || '',
        },
        items: invoiceData.items.map(item => ({
            item: item.itemCode || `Item-${Math.random().toString(36).substr(2, 5)}`,
            description: item.description,
            quantity: item.quantity,
            amount: item.quantity * item.price,
            price: item.price
        })),
        subtotal: invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        paid: invoiceData.paid || 0,
        tax: invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) * (invoiceData.taxRate || 0)
    };

    const fileName = `invoice_${invoiceData.invoiceNumber || Date.now()}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    // Generate the invoice
    createInvoice(invoice, filePath);

    // Stream the file back to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Clean up after streaming (optional)
    fileStream.on('end', () => {
        // You might want to keep the file for records
        // Or delete it after sending: fs.unlinkSync(filePath);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});