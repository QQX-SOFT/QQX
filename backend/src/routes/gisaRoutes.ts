import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/validate', async (req: Request, res: Response) => {
    const { gisaNumber, name } = req.body;

    if (!gisaNumber || !name) {
        return res.status(400).json({ error: 'GISA number and name are required' });
    }

    const soapEnvelope = `
    <GewerbeRequest>
       <GISAZahl>${gisaNumber}</GISAZahl>
       <Name>${name}</Name>
    </GewerbeRequest>
    `;

    try {
        const response = await axios.post(
            'https://www.gisa.gv.at/gisa-svc-public/GisaPublicV1.svc/xml/Gewerbe',
            soapEnvelope,
            {
                headers: {
                    'Content-Type': 'application/xml',
                }
            }
        );

        const xml = response.data;

        const extractTag = (xmlStr: string, tag: string) => {
            const match = xmlStr.match(new RegExp(`<[^>]*${tag}[^>]*>([^<]*)<\/[^>]*${tag}>`));
            return match ? match[1] : null;
        };

        const statusCode = extractTag(xml, 'Code');
        const statusDescription = extractTag(xml, 'Beschreibung');

        if (statusCode !== '0') {
            return res.json({ 
                valid: false, 
                message: statusDescription || 'Invalid GISA number or name match failed'
            });
        }

        const firstName = extractTag(xml, 'Vorname') || '';
        const lastName = extractTag(xml, 'Familienname') || '';
        const companyName = extractTag(xml, 'Firmenname') || '';
        const gisaZahl = extractTag(xml, 'GISAZahl') || gisaNumber;
        const wortlaut = extractTag(xml, 'Wortlaut') || '';

        res.json({
            valid: true,
            gisaNumber: gisaZahl,
            name: companyName ? companyName : `${firstName} ${lastName}`.trim(),
            description: wortlaut,
            details: {
                firstName,
                lastName,
                companyName
            }
        });

    } catch (error: any) {
        console.error('GISA Validation Error:', error.message);
        res.status(500).json({ error: 'Failed to validate GISA via Public API' });
    }
});

export default router;
