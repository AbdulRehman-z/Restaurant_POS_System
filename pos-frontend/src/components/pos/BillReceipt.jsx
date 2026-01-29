import React from 'react';

const BillReceipt = React.forwardRef(({ cart, customer, totals, invoiceId, paymentMethod }, ref) => {
    return (
        <div ref={ref} style={{
            width: '80mm',
            margin: '0 auto',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '40px',  // Increased base font
            padding: '5mm',
            backgroundColor: 'white',
            color: 'black',
            lineHeight: '1.4'
        }}>
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
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                `}
            </style>

            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>
                    Fry Date Cafe
                </h1>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>Sadar Food Street</p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>Tel: 0300-1234567</p>
            </div>

            {/* DIVIDER */}
            <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>

            {/* ORDER INFO */}
            <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold' }}>Invoice #:</span>
                    <span style={{ fontWeight: 'bold' }}>{invoiceId || '---'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Customer:</span>
                    <span>{customer.name || 'Walk-in'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Table:</span>
                    <span>{customer.table || '0'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Payment:</span>
                    <span>{paymentMethod || 'Cash'}</span>
                </div>
            </div>

            {/* DIVIDER */}
            <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>

            {/* ITEMS TABLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '14px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #000' }}>
                        <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 'bold' }}>Item</th>
                        <th style={{ textAlign: 'center', padding: '6px 0', fontWeight: 'bold' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 'bold' }}>Price</th>
                        <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 'bold' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px dashed #999' }}>
                            <td style={{ padding: '8px 0', maxWidth: '100px', wordWrap: 'break-word' }}>{item.name}</td>
                            <td style={{ textAlign: 'center', padding: '8px 0' }}>{item.qty}</td>
                            <td style={{ textAlign: 'right', padding: '8px 0' }}>{item.price}</td>
                            <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 'bold' }}>{item.price * item.qty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* DIVIDER */}
            <div style={{ borderTop: '2px solid #000', margin: '8px 0' }}></div>

            {/* TOTALS */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                    <span>TOTAL:</span>
                    <span>PKR {totals.total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span>Received:</span>
                    <span>PKR {totals.received}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span>Change:</span>
                    <span>PKR {totals.change >= 0 ? totals.change.toFixed(2) : '0.00'}</span>
                </div>
            </div>

            {/* DIVIDER */}
            <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>

            {/* FOOTER */}
            <div style={{ textAlign: 'center', fontSize: '14px', marginTop: '12px' }}>
                <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Thank you for dining!</p>
                <p style={{ margin: '4px 0' }}>Please visit again</p>
                <p style={{ margin: '8px 0', fontSize: '12px', color: '#666' }}>Software by Codeclub</p>
            </div>
        </div>
    );
});

export default BillReceipt;