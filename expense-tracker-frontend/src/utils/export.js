// Export utilities for CSV and PDF generation
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Export expenses to CSV
export const exportToCSV = (expenses, filename = 'expenses.csv') => {
  try {
    // Define CSV headers
    const headers = ['Date', 'Name', 'Category', 'Amount', 'Description'];
    
    // Convert expenses to CSV format
    const csvContent = [
      headers.join(','), // Header row
      ...expenses.map(expense => [
        new Date(expense.createdAt).toLocaleDateString(),
        expense.expenseName,
        expense.expenseCategory,
        expense.expenseAmount,
        expense.expenseDescription || 'N/A'
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

// Export expenses to PDF
export const exportToPDF = async (expenses, filename = 'expenses.pdf') => {
  try {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Expense Report', 20, 20);
    
    // Add date
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    
    // Calculate totals
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.expenseAmount, 0);
    pdf.text(`Total Expenses: $${totalAmount.toFixed(2)}`, 20, 45);
    
    // Add table headers
    let yPosition = 65;
    pdf.setFontSize(10);
    pdf.text('Date', 20, yPosition);
    pdf.text('Name', 50, yPosition);
    pdf.text('Category', 100, yPosition);
    pdf.text('Amount', 140, yPosition);
    pdf.text('Description', 170, yPosition);
    
    // Add line under headers
    pdf.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    
    // Add expense data
    expenses.forEach((expense, index) => {
      if (yPosition > 270) { // Start new page if needed
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(new Date(expense.createdAt).toLocaleDateString(), 20, yPosition);
      pdf.text(expense.expenseName.substring(0, 15), 50, yPosition);
      pdf.text(expense.expenseCategory.substring(0, 15), 100, yPosition);
      pdf.text(`$${expense.expenseAmount.toFixed(2)}`, 140, yPosition);
      pdf.text((expense.expenseDescription || 'N/A').substring(0, 20), 170, yPosition);
      
      yPosition += 8;
    });
    
    // Save PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

// Export chart as image (for analytics)
export const exportChartAsImage = async (chartElementId, filename = 'chart.png') => {
  try {
    const chartElement = document.getElementById(chartElementId);
    if (!chartElement) {
      throw new Error('Chart element not found');
    }
    
    const canvas = await html2canvas(chartElement);
    const link = document.createElement('a');
    
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting chart:', error);
    return false;
  }
};