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

    // Format data for Excel
    const excelData = members.map(m => ({
      'Member ID': m.shortId || '',
      'Name': m.memberName || '',
      'Phone': m.phone || '',
      'Gender': m.gender || '',
      'Age': m.age || '',
      'Goal': m.goal || '',
      'Status': m.paymentStatus || '',
      'Fee': m.membershipFee || 0,
      'Paid': m.amountPaid || 0,
      'Start Date': m.membershipStartDate || '',
      'End Date': m.membershipEndDate || '',
      'Added On': m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    
    const safeGymName = (gymName || 'Gym').replace(/\s+/g, '_');
    const fileName = `${safeGymName}_AutoBackup_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
    return true;
  } catch (err) {
    console.error('Auto Export Error:', err);
    return false;
  }
};
