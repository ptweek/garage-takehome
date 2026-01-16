'use client';

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useMemo, useState } from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { downloadInvoicePDF, ListingData } from "./utilities/invoiceGenerator";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function ClientHome() {
  const [isDownloadOptionModalOpen, setIsDownloadOptionModalOpen] = useState<boolean>(false);
  const [isEmailTextBoxModalOpen, setIsEmailTextBoxModalOpen] = useState<boolean>(false);

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
    <div className="flex flex-1 flex-col items-center justify-center">
      <TextField
        label="Product Link"
        value={productLinkValue}
        onChange={handleProductLinkFieldChange}
        InputProps={{
          style: { color: 'white' }
        }}
        InputLabelProps={{
          style: { color: 'white' }
        }}
        sx={{
          '& .MuiOutlinedInput-root fieldset': { borderColor: 'white' },
          '& .MuiOutlinedInput-root:hover fieldset': { borderColor: 'white' },
          '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: 'white' },
        }}
      />
      <Button variant="outlined" color="inherit" disabled={!parsedId} onClick={handleGetInvoiceClick}>Get Invoice PDF</Button>
      <Modal
        open={isDownloadOptionModalOpen}
        onClose={() => setIsDownloadOptionModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className='flex flex-col items-center justify-center'>
          {data ? (
            <>
              <Button variant="outlined" color="primary" onClick={() => downloadInvoicePDF(data)}>
                Download Invoice PDF
              </Button>
              <div className="text-black">or</div>
              <Button variant="outlined" color="primary" onClick={() => setIsEmailTextBoxModalOpen(true)}>
                Email Invoice PDF
              </Button>
            </>
          ) : (
            <div className="text-black">Loading...</div>
          )}
        </Box>
      </Modal>

      {/* Email Entry Modal */}
      <Modal
        open={isEmailTextBoxModalOpen}
        onClose={() => {
          setIsDownloadOptionModalOpen(false)
          setIsEmailTextBoxModalOpen(false)
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className='flex flex-col items-center justify-center'>
          {data ? (
            <><TextField
              label="Enter email address"
              value={emailValue}
              onChange={handleEmailFieldChange}
            />
              <Button variant="outlined" color="primary" onClick={() => {
                handleSendInvoice();
                setIsDownloadOptionModalOpen(false);
                setIsEmailTextBoxModalOpen(false);
              }}>
                Send email
              </Button></>) : (
            <div className="text-black">Loading...</div>
          )}
        </Box>
      </Modal>
    </div >
  );
}
