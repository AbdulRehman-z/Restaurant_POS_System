import React from 'react';

const BillReceipt = React.forwardRef(({ cart, customer, totals, invoiceId, paymentMethod }, ref) => {
    return (
        <div ref={ref} style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace', fontSize: '12px', padding: '10mm', backgroundColor: 'white', color: 'black' }}>
            <style>
                {`
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                        }
                    }
                `}
            </style>

            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h1 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>HABIBI Fast Food</h1>
                <p style={{ margin: '2px 0', fontSize: '10px' }}>Sadar Food Street</p>
                <p style={{ margin: '2px 0', fontSize: '10px' }}>Phone: 0300-1234567</p>
            </div>

            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', marginBottom: '10px', fontSize: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Inv #:</span>
                    <span style={{ fontWeight: 'bold' }}>{invoiceId || '---'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Date:</span>
                    <span>{new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Customer:</span>
                    <span>{customer.name || 'Walk-in Customer'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Table:</span>
                    <span>{customer.table || '0'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Method:</span>
                    <span>{paymentMethod || 'Cash'}</span>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '10px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                        <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                        <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '4px 0' }}>Price</th>
                        <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px dashed #ccc' }}>
                            <td style={{ padding: '4px 0' }}>{item.name}</td>
                            <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.qty}</td>
                            <td style={{ textAlign: 'right', padding: '4px 0' }}>{item.price}</td>
                            <td style={{ textAlign: 'right', padding: '4px 0' }}>{item.price * item.qty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ borderTop: '2px solid #000', paddingTop: '8px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                    <span>Total:</span>
                    <span>{totals.total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                    <span>Received:</span>
                    <span>{totals.received}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '8px' }}>
                    <span>Change:</span>
                    <span>{totals.change >= 0 ? totals.change.toFixed(2) : '0.00'}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '15px' }}>
                <p style={{ margin: '2px 0' }}>Thank you for dining with us!</p>
                <p style={{ margin: '2px 0', color: '#666' }}>Software by Codeclub</p>
            </div>
        </div>
    );
});

export default BillReceipt;