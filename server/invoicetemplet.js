const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Invoice generation endpoint
app.post('/generate-invoice', (req, res) => {
    const invoiceData = req.body;
    
    // Create a PDF document
    const doc = new PDFDocument();
    const fileName = `invoice_${Date.now()}.pdf`;
    const filePath = `./invoices/${fileName}`;
    
    // Ensure invoices directory exists
    if (!fs.existsSync('./invoices')) {
        fs.mkdirSync('./invoices');
    }
    
    // Pipe the PDF to a file and response
    doc.pipe(fs.createWriteStream(filePath));
    doc.pipe(res);
    
    // Add invoice content
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Invoice info
    doc.fontSize(12)
       .text(`Invoice Number: ${invoiceData.invoiceNumber}`, { align: 'left' })
       .text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, { align: 'left' })
       .text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, { align: 'left' });
    
    doc.moveDown();
    
    // From/To sections
    doc.text(`From: ${invoiceData.from.name}`, { continued: true })
       .text(`To: ${invoiceData.to.name}`, { align: 'right' });
    
    doc.text(invoiceData.from.address, { continued: true })
       .text(invoiceData.to.address, { align: 'right' });
    
    doc.moveDown();
    
    // Items table
    const tableTop = doc.y;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const priceX = 400;
    const amountX = 450;
    
    // Table header
    doc.font('Helvetica-Bold')
       .text('Item', itemCodeX, tableTop)
       .text('Description', descriptionX, tableTop)
       .text('Qty', quantityX, tableTop)
       .text('Price', priceX, tableTop)
       .text('Amount', amountX, tableTop);
    
    // Table rows
    let y = tableTop + 25;
    invoiceData.items.forEach(item => {
        doc.font('Helvetica')
           .text(item.itemCode || '', itemCodeX, y)
           .text(item.description, descriptionX, y)
           .text(item.quantity.toString(), quantityX, y)
           .text(`$${item.price.toFixed(2)}`, priceX, y)
           .text(`$${(item.quantity * item.price).toFixed(2)}`, amountX, y);
        y += 20;
    });
    
    // Total
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * (invoiceData.taxRate || 0);
    const total = subtotal + tax;
    
    doc.moveTo(50, y + 20).lineTo(550, y + 20).stroke();
    
    doc.font('Helvetica-Bold')
       .text('Subtotal:', priceX, y + 30)
       .text(`$${subtotal.toFixed(2)}`, amountX, y + 30);
    
    doc.text(`Tax (${(invoiceData.taxRate * 100).toFixed(2)}%):`, priceX, y + 50)
       .text(`$${tax.toFixed(2)}`, amountX, y + 50);
    
    doc.text('Total:', priceX, y + 70)
       .text(`$${total.toFixed(2)}`, amountX, y + 70);
    
    // Finalize the PDF
    doc.end();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});