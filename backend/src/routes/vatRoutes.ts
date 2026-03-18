import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/validate', async (req: Request, res: Response) => {
    const { vatNumber } = req.body;

    if (!vatNumber) {
        return res.status(400).json({ error: 'VAT number is required' });
    }

    const cleanVat = vatNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (cleanVat.length < 5) {
        return res.status(400).json({ error: 'Invalid VAT number format' });
    }

    const countryCode = cleanVat.substring(0, 2);
    const actualVat = cleanVat.substring(2);

    const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
       <soapenv:Header/>
       <soapenv:Body>
          <urn:checkVat>
             <urn:countryCode>${countryCode}</urn:countryCode>
             <urn:vatNumber>${actualVat}</urn:vatNumber>
          </urn:checkVat>
       </soapenv:Body>
    </soapenv:Envelope>
    `;

    try {
        const response = await axios.post(
            'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
            soapEnvelope,
            {
                headers: {
                    'Content-Type': 'text/xml',
                }
            }
        );

        const xml = response.data;

        const extractTag = (xmlStr: string, tag: string) => {
            const match = xmlStr.match(new RegExp(`<[^>]*${tag}[^>]*>([^<]*)<\/[^>]*${tag}>`));
            return match ? match[1] : null;
        };

        const isValidStr = extractTag(xml, 'valid');
        const companyName = extractTag(xml, 'name') || 'N/A';
        const address = extractTag(xml, 'address') || 'N/A';

        const isValid = isValidStr === 'true';

        if (!isValid) {
            return res.json({ 
                valid: false, 
                message: 'Invalid VAT number or unknown by VIES service' 
            });
        }

        res.json({
            valid: true,
            countryCode,
            vatNumber: actualVat,
            name: companyName.replace(/[\n\r]+/g, ' ').trim(),
            address: address.replace(/[\n\r]+/g, ' ').trim()
        });

    } catch (error: any) {
        console.error('VIES Validation Error:', error.message);
        res.status(500).json({ error: 'Failed to validate VAT via VIES' });
    }
});

export default router;
