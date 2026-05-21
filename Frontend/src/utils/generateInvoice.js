import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const generateInvoice = (order) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MARKETPLACE', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Your one-stop online marketplace', 14, 28);
  doc.text('support@marketplace.com', pageWidth - 14, 28, { align: 'right' });

  // Invoice title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 14, 55, { align: 'right' });

  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, 63, { align: 'right' });
  doc.text(`Order ID: #${order._id?.slice(-8).toUpperCase()}`, pageWidth - 14, 70, { align: 'right' });
  doc.text(
    `Payment: ${order.paymentStatus?.toUpperCase()}`,
    pageWidth - 14, 77,
    { align: 'right' }
  );

  // Billing info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(order.buyer?.name || 'Customer', 14, 63);
  doc.text(order.buyer?.email || '', 14, 70);

  // Shipping address
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text('Ship To:', 14, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const addressLines = doc.splitTextToSize(order.shippingAddress || '', 80);
  doc.text(addressLines, 14, 93);

  // Items table
  const tableRows = order.items.map((item) => [
    item.product?.name || 'Product',
    item.quantity,
    `Rs. ${item.price}`,
    `Rs. ${item.quantity * item.price}`,
  ]);

  autoTable(doc, {
    startY: 110,
    head: [['Product', 'Qty', 'Unit Price', 'Total']],
    body: tableRows,
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 255],
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // Total section
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, finalY, pageWidth - 14, finalY);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal:', pageWidth - 60, finalY + 10);
  doc.text(`Rs. ${order.totalAmount}`, pageWidth - 14, finalY + 10, { align: 'right' });

  doc.text('Shipping:', pageWidth - 60, finalY + 18);
  doc.setTextColor(34, 197, 94);
  doc.text('FREE', pageWidth - 14, finalY + 18, { align: 'right' });

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 80, finalY + 22, pageWidth - 14, finalY + 22);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('Total:', pageWidth - 60, finalY + 31);
  doc.text(`Rs. ${order.totalAmount}`, pageWidth - 14, finalY + 31, { align: 'right' });

  // Status badge
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const statusColors = {
    delivered: [34, 197, 94],
    shipped: [168, 85, 247],
    processing: [37, 99, 235],
    pending: [234, 179, 8],
    cancelled: [239, 68, 68],
  };
  const color = statusColors[order.status] || [100, 100, 100];
  doc.setTextColor(...color);
  doc.text(`Status: ${order.status?.toUpperCase()}`, 14, finalY + 31);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for shopping with Marketplace!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('This is a computer-generated invoice.', pageWidth / 2, footerY + 6, { align: 'center' });

  // Save
  doc.save(`invoice_${order._id?.slice(-8)}.pdf`);
};

export default generateInvoice;