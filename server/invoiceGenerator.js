const fs = require("fs");
const PDFDocument = require("pdfkit");

function createInvoice(invoice, path) {
    let doc = new PDFDocument({ size: "A4", margin: 50 });

    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    doc.pipe(fs.createWriteStream(path));
    doc.end();
}

function generateHeader(doc) {
    doc
        .fillColor("#444444")
        .fontSize(20)
        .text("Your Company Name", 50, 57)
        .fontSize(10)
        .text("123 Company Address", 200, 50, { align: "right" })
        .text("City, State, ZIP", 200, 65, { align: "right" })
        .text("Phone: (123) 456-7890", 200, 80, { align: "right" })
        .moveDown();
}

function generateCustomerInformation(doc, invoice) {
    doc
        .fillColor("#444444")
        .fontSize(20)
        .text("Invoice", 50, 160);

    generateHr(doc, 185);

    const customerInformationTop = 200;

    doc
        .fontSize(10)
        .text("Invoice Number:", 50, customerInformationTop)
        .font("Helvetica-Bold")
        .text(invoice.invoice_nr, 150, customerInformationTop)
        .font("Helvetica")
        .text("Invoice Date:", 50, customerInformationTop + 15)
        .text(formatDate(new Date(invoice.date)), 150, customerInformationTop + 15)
        .text("Due Date:", 50, customerInformationTop + 30)
        .text(formatDate(new Date(invoice.dueDate)), 150, customerInformationTop + 30)
        .font("Helvetica-Bold")
        .text(invoice.shipping.name, 300, customerInformationTop)
        .font("Helvetica")
        .text(invoice.shipping.address, 300, customerInformationTop + 15)
        .text(
            `${invoice.shipping.city}, ${invoice.shipping.state}, ${invoice.shipping.country}`,
            300,
            customerInformationTop + 30
        )
        .moveDown();

    generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 330;

    doc.font("Helvetica-Bold");
    generateTableRow(
        doc,
        invoiceTableTop,
        "Item",
        "Description",
        "Unit Price",
        "Quantity",
        "Line Total"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    for (i = 0; i < invoice.items.length; i++) {
        const item = invoice.items[i];
        const position = invoiceTableTop + (i + 1) * 30;
        generateTableRow(
            doc,
            position,
            item.item,
            item.description,
            formatCurrency(item.price),
            item.quantity,
            formatCurrency(item.amount)
        );

        generateHr(doc, position + 20);
    }

    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
        doc,
        subtotalPosition,
        "",
        "",
        "Subtotal",
        "",
        formatCurrency(invoice.subtotal)
    );

    const taxPosition = subtotalPosition + 20;
    generateTableRow(
        doc,
        taxPosition,
        "",
        "",
        "Tax",
        "",
        formatCurrency(invoice.tax)
    );

    const totalPosition = taxPosition + 20;
    doc.font("Helvetica-Bold");
    generateTableRow(
        doc,
        totalPosition,
        "",
        "",
        "Total",
        "",
        formatCurrency(invoice.subtotal + invoice.tax)
    );
    doc.font("Helvetica");
}

function generateFooter(doc) {
    doc
        .fontSize(10)
        .text(
            "Thank you for your business. Payment is due within 30 days.",
            50,
            780,
            { align: "center", width: 500 }
        );
}

function generateTableRow(doc, y, item, description, unitPrice, quantity, lineTotal) {
    doc
        .fontSize(10)
        .text(item, 50, y, { width: 90 })
        .text(description, 150, y, { width: 150 })
        .text(unitPrice, 300, y, { width: 90, align: "right" })
        .text(quantity, 390, y, { width: 60, align: "right" })
        .text(lineTotal, 450, y, { width: 90, align: "right" });
}

function generateHr(doc, y) {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

function formatCurrency(amount) {
    return "$" + amount.toFixed(2);
}

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${year}/${month}/${day}`;
}

module.exports = {
    createInvoice
};