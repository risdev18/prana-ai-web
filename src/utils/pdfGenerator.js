import jsPDF from 'jspdf';

export const generateInvoicePDF = (gymData, member, paymentRecord) => {
  const doc = new jsPDF();
  
  // Try to safely handle missing values with fallbacks
  const gymName = gymData?.gymName || 'Gym Name';
  const gymAddress = gymData?.address || ''; // Adjust based on your gymData schema
  const gymPhone = gymData?.phone || '';

  const memberName = member?.memberName || 'Member';
  const memberPhone = member?.phone || 'N/A';
  
  const paymentAmount = paymentRecord?.amount || 0;
  const paymentMethod = paymentRecord?.method || 'Cash';
  const invoiceId = paymentRecord?.id || `INV-${Date.now()}`;
  const paymentDate = new Date(paymentRecord?.date || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const totalFee = member?.membershipFee ?? 0;
  // Calculate previous balance (balance before this payment was applied)
  const currentPaid = member?.amountPaid ?? 0;
  const previousBalance = totalFee - (currentPaid - paymentAmount);
  const remainingBalance = totalFee - currentPaid;

  // -- Fonts and Setup --
  doc.setFont('helvetica');
  
  // -- Header --
  doc.setFontSize(24);
  doc.setTextColor(124, 92, 255); // primary color
  doc.text(gymName.toUpperCase(), 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  if (gymAddress) doc.text(gymAddress, 14, 30);
  if (gymPhone) doc.text(`Phone: ${gymPhone}`, 14, 35);
  
  // -- INVOICE text --
  doc.setFontSize(30);
  doc.setTextColor(200, 200, 200);
  doc.text('RECEIPT', 130, 25);

  doc.setDrawColor(230, 230, 230);
  doc.line(14, 45, 196, 45); // horizontal line

  // -- Details Section --
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  
  // Left Column
  doc.text('Billed To:', 14, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(memberName, 14, 62);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Phone: ${memberPhone}`, 14, 68);

  // Right Column
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.text(`Receipt No:`, 130, 55);
  doc.text(`Date:`, 130, 62);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceId, 155, 55);
  doc.text(paymentDate, 155, 62);
  doc.setFont('helvetica', 'normal');

  doc.line(14, 75, 196, 75); // horizontal line

  // -- Table Header --
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 85, 182, 10, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 18, 91);
  doc.text('PAYMENT METHOD', 90, 91);
  doc.text('AMOUNT', 165, 91);

  // -- Table Content --
  doc.setFont('helvetica', 'normal');
  doc.text('Membership Payment', 18, 105);
  doc.text(paymentMethod, 90, 105);
  doc.text(`Rs. ${paymentAmount.toFixed(2)}`, 165, 105);

  doc.line(14, 115, 196, 115); // horizontal line

  // -- Summary Area --
  doc.setFontSize(10);
  doc.text('Previous Balance:', 130, 125);
  doc.text(`Rs. ${previousBalance.toFixed(2)}`, 165, 125);
  
  doc.text('Amount Received:', 130, 132);
  doc.setTextColor(0, 150, 0); // Green for received
  doc.text(`Rs. ${paymentAmount.toFixed(2)}`, 165, 132);
  
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('Remaining Balance:', 130, 142);
  if (remainingBalance > 0) {
    doc.setTextColor(200, 0, 0); // Red if balance remains
  }
  doc.text(`Rs. ${remainingBalance.toFixed(2)}`, 165, 142);

  // -- Footer --
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business!', 105, 270, { align: 'center' });
  doc.text('This is a computer generated receipt and does not require a physical signature.', 105, 275, { align: 'center' });

  // Save the PDF
  doc.save(`Receipt_${memberName.replace(/\s+/g, '_')}_${invoiceId}.pdf`);
};
