'use client';

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useMemo, useState } from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { downloadInvoicePDF, ListingData } from "./utilities/invoiceGenerator";
import CircularProgress from '@mui/material/CircularProgress';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  p: 4,
};

export default function ClientHome() {
  const [isDownloadOptionModalOpen, setIsDownloadOptionModalOpen] = useState<boolean>(false);
  const [isEmailTextBoxModalOpen, setIsEmailTextBoxModalOpen] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const [productId, setProductId] = useState("");
  const [data, setData] = useState<ListingData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false)
  const [productLinkValue, setProductLinkValue] = useState('');

  const handleProductLinkFieldChange = (event: any) => {
    setProductLinkValue(event.target.value);
  };

  const parsedId = useMemo(() => {
    const urlValue = productLinkValue.split("/").at(-1)
    const idElements = urlValue?.split('-')
    if (!idElements || idElements.length < 5) {
      return undefined
    }
    return idElements.slice(-5).join('-')
  }, [productLinkValue])

  const [emailValue, setEmailValue] = useState("");
  const handleEmailFieldChange = (event: any) => {
    setEmailValue(event.target.value);
  };

  const handleSendInvoice = async () => {
    if (!emailValue) {
      return;
    }

    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingData: data,
          recipientEmail: emailValue,
          message: undefined
        })
      });

      const emailSentData = await response.json();

      if (emailSentData.success) {
        setEmailSent(true);
        setTimeout(() => {
          setIsDownloadOptionModalOpen(false);
          setIsEmailTextBoxModalOpen(false);
          setEmailSent(false);
          setEmailValue("");
        }, 2000);
      } else {
        console.log({ type: 'error', text: emailSentData.error || 'Failed to send invoice' });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await fetch(`https://garage-backend.onrender.com/listings/${productId}`)
      const newData = await response.json()
      setData(newData);
      setIsLoading(false)
    };

    if (productId) {
      fetchData();
    }
  }, [productId])

  const handleGetInvoiceClick = () => {
    if (!parsedId) {
      return
    }
    setIsDownloadOptionModalOpen(true);
    setProductId(parsedId);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-12 text-white">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">📄</span>
            <h1 className="text-4xl font-bold">Invoice Generator</h1>
          </div>
          <p className="text-orange-100 text-lg">
            Generate professional PDF invoices for Garage listings
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 py-10">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              How to use
            </h2>
            <p className="text-gray-600 mb-2">
              Enter a product listing URL from shopgarage.com to generate an invoice.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-500 mb-1 font-medium">Example URL:</p>
              <code className="text-xs text-orange-600 break-all">
                https://www.shopgarage.com/listing/2024-Toyne-Gladiator-Pumper-c01a1e0f-53c5-4316-b79e-395172875a02
              </code>
            </div>
          </div>

          <div className="space-y-6">
            <TextField
              fullWidth
              label="Product Listing URL"
              value={productLinkValue}
              onChange={handleProductLinkFieldChange}
              placeholder="Paste the Garage listing URL here..."
              variant="outlined"
              InputProps={{
                style: {
                  color: 'black',
                  fontSize: '16px'
                }
              }}
              InputLabelProps={{
                style: { color: '#FF6B35' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                    borderWidth: '2px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#FF6B35'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF6B35',
                    borderWidth: '2px'
                  },
                },
              }}
            />

            <Button
              variant="contained"
              disabled={!parsedId || isLoading}
              onClick={handleGetInvoiceClick}
              fullWidth
              size="large"
              sx={{
                backgroundColor: '#FF6B35',
                color: 'white',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                textTransform: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                '&:hover': {
                  backgroundColor: '#E55A28',
                  boxShadow: '0 6px 16px rgba(255, 107, 53, 0.4)',
                },
                '&:disabled': {
                  backgroundColor: '#d1d5db',
                  color: '#9ca3af',
                }
              }}
            >
              {isLoading ? 'Loading...' : 'Generate Invoice'}
            </Button>
          </div>
        </div>

        {/* Download Options Modal */}
        <Modal
          open={isDownloadOptionModalOpen}
          onClose={() => setIsDownloadOptionModalOpen(false)}
          aria-labelledby="download-modal-title"
        >
          <Box sx={modalStyle}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Get Your Invoice
            </h2>
            {data ? (
              <div className="space-y-4">
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => downloadInvoicePDF(data)}
                  sx={{
                    backgroundColor: '#FF6B35',
                    color: 'white',
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textTransform: 'none',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#E55A28',
                    }
                  }}
                >
                  Download PDF
                </Button>

                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-gray-400 text-sm font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => setIsEmailTextBoxModalOpen(true)}
                  sx={{
                    borderColor: '#FF6B35',
                    color: '#FF6B35',
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textTransform: 'none',
                    borderRadius: '8px',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: '#E55A28',
                      backgroundColor: 'rgba(255, 107, 53, 0.04)',
                      borderWidth: '2px',
                    }
                  }}
                >
                  Email PDF
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <CircularProgress sx={{ color: '#FF6B35' }} />
                <p className="text-gray-600 mt-4">Loading invoice data...</p>
              </div>
            )}
          </Box>
        </Modal>

        {/* Email Entry Modal */}
        <Modal
          open={isEmailTextBoxModalOpen}
          onClose={() => {
            setIsDownloadOptionModalOpen(false)
            setIsEmailTextBoxModalOpen(false)
            setEmailValue("")
          }}
          aria-labelledby="email-modal-title"
        >
          <Box sx={modalStyle}>
            {emailSent ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-7xl mb-2">✓</div>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">Email Sent!</h2>
                <p className="text-gray-600 mt-2 text-center">
                  The invoice has been sent to {emailValue}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Email Invoice
                </h2>
                {data ? (
                  <div className="space-y-6">
                    <TextField
                      fullWidth
                      label="Recipient Email Address"
                      type="email"
                      value={emailValue}
                      onChange={handleEmailFieldChange}
                      placeholder="name@example.com"
                      variant="outlined"
                      InputProps={{
                        style: {
                          color: 'black',
                          fontSize: '16px'
                        }
                      }}
                      InputLabelProps={{
                        style: { color: '#FF6B35' }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#e5e7eb',
                            borderWidth: '2px'
                          },
                          '&:hover fieldset': {
                            borderColor: '#FF6B35'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FF6B35',
                            borderWidth: '2px'
                          },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={!emailValue}
                      onClick={handleSendInvoice}
                      sx={{
                        backgroundColor: '#FF6B35',
                        color: 'white',
                        padding: '14px',
                        fontSize: '16px',
                        fontWeight: '600',
                        textTransform: 'none',
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: '#E55A28',
                        },
                        '&:disabled': {
                          backgroundColor: '#d1d5db',
                          color: '#9ca3af',
                        }
                      }}
                    >
                      Send Email
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CircularProgress sx={{ color: '#FF6B35' }} />
                    <p className="text-gray-600 mt-4">Loading invoice data...</p>
                  </div>
                )}
              </>
            )}
          </Box>
        </Modal>
      </div>
    </div>
  );
}