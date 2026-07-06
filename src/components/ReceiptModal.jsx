import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, X, Share2, Dumbbell } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceiptModal = ({ isOpen, onClose, member, gymData }) => {
  const receiptRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !member) return null;

  const gymName = gymData?.gymName || 'Your Gym Name';
  const address = gymData?.address || '';
  const phone = gymData?.phone || '';
  const email = gymData?.email || '';


  const start = new Date(member.membershipStartDate);
  const end = new Date(member.membershipEndDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.round(diffDays / 30) || 1;
  const isRenewal = member.membershipHistory && member.membershipHistory.length > 0;
  const statusColor = member.paymentStatus === 'Paid' ? '#2e7d32' : '#d32f2f';

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Receipt_${member.shortId}_${member.memberName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareReceipt = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' });
      canvas.toBlob(async (blob) => {
        if (!blob) return toast.error('Failed to generate image');
        const file = new File([blob], `Receipt_${member.shortId}.png`, { type: 'image/png' });
        
        if (navigator.share) {
          try {
            await navigator.share({
              title: `${gymName} Receipt - ${member.memberName}`,
              text: `Here is the membership receipt for ${member.memberName}.`,
              files: [file]
            });
            toast.success('Shared successfully!');
          } catch (e) {
            console.log('Share canceled or failed', e);
          }
        } else {
          toast.error('Native sharing not supported. Please download instead.');
        }
      });
    } catch (error) {
      toast.error('Failed to prepare share');
    } finally {
      setIsGenerating(false);
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
        position: 'relative', padding: '0', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Digital Receipt
          </h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px', background: '#e2e8f0', color: '#000', maxHeight: '70vh', overflow: 'auto' }}>
          
          {/* A4 container for the receipt */}
          <div ref={receiptRef} style={{ 
            background: '#ffffff', 
            width: '700px', 
            minHeight: '990px', 
            margin: '0 auto',
            flexShrink: 0,
            padding: '0', 
            position: 'relative', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}>
            
            {/* Top Slanted Background */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '350px',
              background: 'linear-gradient(135deg, #a1e8c9 0%, #6cd4e2 100%)',
              clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0 100%)',
              zIndex: 0
            }}></div>

            {/* Bottom Slanted Background */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '250px',
              background: 'linear-gradient(135deg, #6cd4e2 0%, #a1e8c9 100%)',
              clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)',
              zIndex: 0
            }}></div>

            {/* Content Container */}
            <div style={{ position: 'relative', zIndex: 1, padding: '40px 50px' }}>
              
              {/* Header Grid */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                
                {/* Left Side Header */}
                <div style={{ paddingTop: '20px', flex: 1 }}>
                  <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '1.5px', color: '#1a202c' }}>PAYMENT RECEIPT</h1>
                  <div style={{ display: 'inline-block', background: isRenewal ? '#e6fffa' : '#ebf4ff', color: isRenewal ? '#319795' : '#3182ce', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '30px' }}>
                    {isRenewal ? 'MEMBERSHIP RENEWAL' : 'NEW MEMBERSHIP'}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>DATE</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{new Date(member.createdAt).toLocaleDateString('en-GB')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>INVOICE NO</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{member.shortId}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '30px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '6px' }}>BILL TO:</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase' }}>{member.memberName}</div>
                    <div style={{ fontSize: '14px', fontWeight: '800' }}>{member.phone}</div>
                  </div>
                </div>

                {/* Right Side Header */}
                <div style={{ textAlign: 'right', width: '280px', flexShrink: 0 }}>
                  
                  {gymData?.logoUrl ? (
                    <div style={{ display: 'inline-flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                      <img src={gymData.logoUrl} alt="Gym Logo" style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    /* Fake Logo Fallback */
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '16px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', paddingRight: '20px' }}>
                          <Dumbbell size={36} color="#e67e22" />
                          <Dumbbell size={42} color="#d35400" />
                       </div>
                       <div style={{ 
                          background: '#e67e22', color: '#fff', padding: '4px 16px', 
                          fontWeight: '800', fontSize: '18px', letterSpacing: '2px',
                          marginTop: '5px'
                       }}>
                          FITNESS
                       </div>
                    </div>
                  )}
                  
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900' }}>{gymName.toUpperCase()}</h2>
                  
                  <div style={{ fontSize: '13px', fontWeight: '800', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {address}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '800', marginTop: '4px' }}>
                    {phone}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '800', marginTop: '4px', textTransform: 'uppercase', wordBreak: 'break-all' }}>
                    {email}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div style={{ marginTop: '20px', marginBottom: '40px', background: '#f7fafc', padding: '24px', borderRadius: '12px', borderLeft: `6px solid ${statusColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#4a5568' }}>PAYMENT STATUS:</div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: statusColor, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     {member.paymentStatus === 'Paid' ? 'PAID ✓' : 'PENDING'}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#4a5568' }}>MEMBERSHIP VALIDITY:</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#2d3748' }}>
                    {new Date(member.membershipStartDate).toLocaleDateString('en-GB')} <span style={{ color: '#a0aec0', margin: '0 8px' }}>TO</span> {new Date(member.membershipEndDate).toLocaleDateString('en-GB')}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div style={{ width: '100%', marginBottom: '20px' }}>
                <div style={{ display: 'flex', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '20px' }}>
                  <div style={{ width: '10%', fontSize: '14px', fontWeight: '800', color: '#2e7d32' }}>S.NO</div>
                  <div style={{ width: '40%', fontSize: '14px', fontWeight: '800', color: '#2e7d32' }}>DESCRIPTION</div>
                  <div style={{ width: '25%', fontSize: '14px', fontWeight: '800', color: '#2e7d32' }}>TIME PERIOD</div>
                  <div style={{ width: '25%', fontSize: '14px', fontWeight: '800', color: '#2e7d32', textAlign: 'right' }}>AMOUNT</div>
                </div>

                <div style={{ display: 'flex', marginBottom: '16px' }}>
                  <div style={{ width: '10%', fontSize: '14px', fontWeight: '700' }}>1</div>
                  <div style={{ width: '40%', fontSize: '14px', fontWeight: '700', paddingRight: '10px' }}>{isRenewal ? 'GYM MEMBERSHIP RENEWAL' : 'GYM MEMBERSHIP'}</div>
                  <div style={{ width: '25%', fontSize: '14px', fontWeight: '700' }}>{months} MONTH{months > 1 ? 'S' : ''}</div>
                  <div style={{ width: '25%', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>{Number(member.membershipFee).toFixed(2)}</div>
                </div>
                
                {member.membershipFee - member.amountPaid > 0 && (
                   <div style={{ display: 'flex', marginBottom: '16px' }}>
                      <div style={{ width: '10%', fontSize: '14px', fontWeight: '700' }}>2</div>
                      <div style={{ width: '40%', fontSize: '14px', fontWeight: '700', paddingRight: '10px' }}>BALANCE DUE</div>
                      <div style={{ width: '25%', fontSize: '14px', fontWeight: '700' }}>-</div>
                      <div style={{ width: '25%', fontSize: '14px', fontWeight: '700', textAlign: 'right', color: 'red' }}>-{Number(member.membershipFee - member.amountPaid).toFixed(2)}</div>
                   </div>
                )}
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '50px' }}>
                <div style={{ width: '50%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ flex: 1, textAlign: 'right', fontSize: '14px', fontWeight: '800', paddingRight: '16px' }}>SUBTOTAL (Tax inclusive)</div>
                    <div style={{ width: '140px', border: '1px solid #ccc', padding: '6px 8px', textAlign: 'right', fontSize: '13px', fontWeight: '700' }}>
                      {Number(member.amountPaid).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1, textAlign: 'right', fontSize: '18px', fontWeight: '800', paddingRight: '16px' }}>Total</div>
                    <div style={{ width: '140px', border: '1px solid #ccc', borderTop: 'none', padding: '6px 8px', textAlign: 'right', fontSize: '16px', fontWeight: '800' }}>
                      Rs {Number(member.amountPaid).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes & Signature */}
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>NOTE:</div>
                  <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', fontWeight: '800', lineHeight: '1.8' }}>
                    <li>Carry your own shoes and towel.</li>
                    <li>Gym wear is compulsory (Tracks, Shorts, T shirts)</li>
                    <li>Amount once paid will not be refunded.</li>
                    <li>No exchanges of the package to others</li>
                    <li>Package can be upgraded within 5 days from the invoice date.</li>
                  </ol>
                </div>
                
                {/* Authorised Signature Block */}
                <div style={{ textAlign: 'center', width: '200px' }}>
                  {gymData?.signatureUrl ? (
                    <img src={gymData.signatureUrl} alt="Signature" style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain', marginBottom: '8px' }} />
                  ) : (
                    <div style={{ height: '70px', marginBottom: '8px' }}></div>
                  )}
                  <div style={{ borderTop: '2px solid #000', paddingTop: '8px', fontSize: '14px', fontWeight: '800' }}>
                    Authorised Signatory
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
          <button 
            onClick={downloadReceipt} 
            disabled={isGenerating}
            className="btn btn-primary flex-1" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Download size={18} /> {isGenerating ? 'Generating...' : 'Download Image'}
          </button>
          {navigator.share && (
            <button 
              onClick={shareReceipt}
              disabled={isGenerating}
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 20px' }}
            >
              <Share2 size={18} /> Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
