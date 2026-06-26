import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { addMembersBatch } from '../services/firestoreService';
import { v4 as uuidv4 } from 'uuid';

const ImportMembersModal = ({ isOpen, onClose, gymId }) => {
  const [step, setStep] = useState(1);
  const [previewData, setPreviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const resetState = () => {
    setStep(1);
    setPreviewData([]);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parseExcelDate = (excelDate) => {
    if (!excelDate) return null;
    if (typeof excelDate === 'number') {
      // Excel dates are number of days since 1900-01-01
      const date = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    const parsed = new Date(excelDate);
    return isNaN(parsed) ? null : parsed.toISOString().split('T')[0];
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rawData.length < 2) {
          toast.error("File appears to be empty or has no data rows.");
          return;
        }

        const headers = rawData[0].map(h => String(h).toLowerCase().trim());
        const rows = rawData.slice(1);

        // Map column indices
        const mapColumn = (keywords) => {
          return headers.findIndex(h => keywords.some(k => h.includes(k)));
        };

        const nameIdx = mapColumn(['name', 'member', 'client']);
        const phoneIdx = mapColumn(['phone', 'mobile', 'contact', 'number']);
        const startIdx = mapColumn(['start', 'join', 'date']);
        const endIdx = mapColumn(['end', 'due', 'expire', 'validity']);
        const amountIdx = mapColumn(['amount', 'fee', 'price', 'paid', 'total']);
        const paidIdx = mapColumn(['paid', 'received']);

        const mappedData = rows.map((row, idx) => {
          if (!row || row.length === 0) return null;
          
          const rawStart = startIdx >= 0 ? row[startIdx] : null;
          const rawEnd = endIdx >= 0 ? row[endIdx] : null;

          return {
            _index: idx + 1,
            memberName: nameIdx >= 0 && row[nameIdx] ? String(row[nameIdx]) : '',
            phone: phoneIdx >= 0 && row[phoneIdx] ? String(row[phoneIdx]).replace(/\D/g, '') : '',
            membershipStartDate: parseExcelDate(rawStart) || new Date().toISOString().split('T')[0],
            membershipEndDate: parseExcelDate(rawEnd) || '',
            membershipFee: amountIdx >= 0 && !isNaN(row[amountIdx]) ? Number(row[amountIdx]) : 0,
            amountPaid: paidIdx >= 0 && !isNaN(row[paidIdx]) ? Number(row[paidIdx]) : (amountIdx >= 0 && !isNaN(row[amountIdx]) ? Number(row[amountIdx]) : 0),
          };
        }).filter(item => item && item.memberName); // Only keep rows with at least a name

        if (mappedData.length === 0) {
          toast.error("No valid member names found. Check your column headers.");
          return;
        }

        setPreviewData(mappedData);
        setStep(2);
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    setIsProcessing(true);
    try {
      const now = new Date().toISOString();
      const membersToImport = previewData.map(data => {
        const memberId = uuidv4();
        const shortId = `K-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          memberId,
          shortId,
          memberName: data.memberName,
          phone: data.phone,
          membershipStartDate: data.membershipStartDate,
          membershipEndDate: data.membershipEndDate,
          membershipFee: data.membershipFee,
          amountPaid: data.amountPaid,
          createdAt: now,
          status: 'Active',
          goal: 'General Fitness',
          bmi: null
        };
      });

      await addMembersBatch(gymId, membersToImport);
      toast.success(`Successfully imported ${membersToImport.length} members!`);
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to import members.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card animate-fade-up" style={{ 
        width: '100%', maxWidth: '800px', background: 'var(--bg-card)', 
        position: 'relative', padding: '0', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bulk Import Members
          </h3>
          <button onClick={handleClose} className="btn btn-ghost" style={{ padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {step === 1 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 20px',
                background: 'rgba(124, 92, 255, 0.1)', border: '1px dashed var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Upload size={32} color="var(--primary-light)" />
              </div>
              <h2 style={{ marginBottom: '8px' }}>Upload Excel File</h2>
              <p style={{ color: 'var(--text-3)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                We support .xlsx and .csv files. Ensure your file has a header row. We will automatically try to map columns like Name, Phone, and Due Date.
              </p>
              
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
              <button 
                className="btn btn-primary" 
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '0 30px', height: '44px' }}
              >
                Select File
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-light)' }}>
                <CheckCircle size={20} />
                <h4 style={{ margin: 0, color: '#fff' }}>Preview Mapped Data</h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '16px' }}>
                We found {previewData.length} valid rows. Missing data is highlighted in red and will be saved as blank.
              </p>

              <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Start Date</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Due Date</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Total Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px' }}>{row._index}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{row.memberName}</td>
                        <td style={{ padding: '12px', color: row.phone ? 'inherit' : 'var(--error)' }}>{row.phone || 'Missing'}</td>
                        <td style={{ padding: '12px' }}>{row.membershipStartDate}</td>
                        <td style={{ padding: '12px', color: row.membershipEndDate ? 'inherit' : 'var(--error)' }}>{row.membershipEndDate || 'Missing'}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{row.membershipFee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 10 && (
                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-3)' }}>
                  Showing first 10 rows...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)} disabled={isProcessing}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleImport} disabled={isProcessing}>
              {isProcessing ? 'Importing...' : `Import ${previewData.length} Members`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportMembersModal;
