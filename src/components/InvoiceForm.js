import React, { useState } from 'react';
import axios from 'axios';

const InvoiceForm = () => {
    const [invoice, setInvoice] = useState({
        invoiceNumber: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        from: {
            name: '',
            address: '',
            email: '',
            phone: ''
        },
        to: {
            name: '',
            address: '',
            email: '',
            phone: ''
        },
        items: [
            { itemCode: '', description: '', quantity: 1, price: 0 }
        ],
        taxRate: 0.1,
        notes: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInvoice(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedInputChange = (section, e) => {
        const { name, value } = e.target;
        setInvoice(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value
            }
        }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...invoice.items];
        newItems[index] = {
            ...newItems[index],
            [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
        };
        setInvoice(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, { itemCode: '', description: '', quantity: 1, price: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (invoice.items.length > 1) {
            const newItems = [...invoice.items];
            newItems.splice(index, 1);
            setInvoice(prev => ({ ...prev, items: newItems }));
        }
    };

    const calculateTotal = () => {
        const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const tax = subtotal * invoice.taxRate;
        return subtotal + tax;
    };

    const generatePdf = async () => {
        try {
            const response = await axios.post('http://localhost:5000/generate-invoice', invoice, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${invoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate invoice. Please try again.');
        }
    };

    return (
        <div className="invoice-form">
            <h1>Invoice Generator</h1>
            
            <div className="form-section">
                <h2>Invoice Details</h2>
                <div className="form-row">
                    <div className="form-group">
                        <label>Invoice Number</label>
                        <input
                            type="text"
                            name="invoiceNumber"
                            value={invoice.invoiceNumber}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={invoice.date}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={invoice.dueDate}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h2>From</h2>
                <div className="form-row">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={invoice.from.name}
                            onChange={(e) => handleNestedInputChange('from', e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={invoice.from.address}
                            onChange={(e) => handleNestedInputChange('from', e)}
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={invoice.from.email}
                            onChange={(e) => handleNestedInputChange('from', e)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={invoice.from.phone}
                            onChange={(e) => handleNestedInputChange('from', e)}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h2>To</h2>
                <div className="form-row">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={invoice.to.name}
                            onChange={(e) => handleNestedInputChange('to', e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={invoice.to.address}
                            onChange={(e) => handleNestedInputChange('to', e)}
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={invoice.to.email}
                            onChange={(e) => handleNestedInputChange('to', e)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={invoice.to.phone}
                            onChange={(e) => handleNestedInputChange('to', e)}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h2>Items</h2>
                <table className="items-table">
                    <thead>
                        <tr>
                            <th>Item Code</th>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="text"
                                        name="itemCode"
                                        value={item.itemCode}
                                        onChange={(e) => handleItemChange(index, e)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="description"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        step="0.01"
                                        value={item.price}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    />
                                </td>
                                <td>${(item.quantity * item.price).toFixed(2)}</td>
                                <td>
                                    <button 
                                        type="button" 
                                        onClick={() => removeItem(index)}
                                        disabled={invoice.items.length <= 1}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" onClick={addItem}>Add Item</button>
            </div>

            <div className="form-section">
                <div className="form-row">
                    <div className="form-group">
                        <label>Tax Rate (%)</label>
                        <input
                            type="number"
                            name="taxRate"
                            min="0"
                            max="100"
                            step="0.1"
                            value={invoice.taxRate * 100}
                            onChange={(e) => handleInputChange({
                                target: {
                                    name: 'taxRate',
                                    value: parseFloat(e.target.value) / 100 || 0
                                }
                            })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={invoice.notes}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h2>Total: ${calculateTotal().toFixed(2)}</h2>
                <button type="button" onClick={generatePdf}>Generate PDF Invoice</button>
            </div>
        </div>
    );
};

export default InvoiceForm;