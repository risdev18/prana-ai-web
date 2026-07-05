import * as XLSX from 'xlsx';
import { getMembersByGymId } from '../services/firestoreService';
import toast from 'react-hot-toast';

export const downloadGymBackupExcel = async (gymId, gymName) => {
  try {
    const members = await getMembersByGymId(gymId);
    if (!members || members.length === 0) {
      console.warn('No members found to export.');
      return false; // Nothing to export
    }

    // Format data for Excel — all dates as readable text, phone as text to preserve leading zeros
    const excelData = members.map(m => ({
      'Member ID': m.shortId || '',
      'Name': m.memberName || '',
      'Phone': String(m.phone || ''),
      'Gender': m.gender || '',
      'Age': m.age || '',
      'Goal': m.goal || '',
      'Status': m.paymentStatus || '',
      'Fee': m.membershipFee || 0,
      'Paid': m.amountPaid || 0,
      'Due': (m.membershipFee || 0) - (m.amountPaid || 0),
      'Start Date': m.membershipStartDate || '',
      'End Date': m.membershipEndDate || '',
      'Added On': m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-size all columns so NO data is ever cut off
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(
        key.length + 2,
        ...excelData.map(row => String(row[key] || '').length)
      ) + 3  // +3 extra padding for readability
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    
    const safeGymName = (gymName || 'Gym').replace(/\s+/g, '_');
    const fileName = `${safeGymName}_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
    
    // Also sync to Google Sheets silently
    syncToGoogleSheets(excelData).catch(e => console.warn('Google Sheets Sync Failed:', e));
    
    return true;
  } catch (err) {
    console.error('Auto Export Error:', err);
    return false;
  }
};

export const exportCurrentViewToExcel = (dataArray, fileName) => {
  if (!dataArray || dataArray.length === 0) {
    toast.error('No data to export in the current view.');
    return false;
  }
  
  try {
    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    
    // Auto-size all columns so NO data is cut off
    const colWidths = Object.keys(dataArray[0] || {}).map(key => ({
      wch: Math.max(
        key.length + 2,
        ...dataArray.map(row => String(row[key] || '').length)
      ) + 3
    }));
    worksheet['!cols'] = colWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
    
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Export downloaded successfully!');
    return true;
  } catch (err) {
    console.error('Export View Error:', err);
    toast.error('Failed to export data.');
    return false;
  }
};

export const syncToGoogleSheets = async (excelData) => {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbysn28CFH1wkMS64HECpoKS55J-gLnHABxN6b3WLH41zNmhNT7FYlXL2nxuHeuccfemBA/exec';
  
  try {
    // Send data to Google Apps Script Web App
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Essential for calling Google Scripts from browser without CORS errors
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(excelData)
    });
    console.log('Successfully synced to Google Sheets (no-cors mode)');
    return true;
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error);
    return false;
  }
};
