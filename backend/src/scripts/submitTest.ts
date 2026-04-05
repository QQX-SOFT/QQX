import axios from 'axios';

async function submitTest() {
    const data = {
        firstName: "Nihat",
        lastName: "Meral",
        email: "nihat.meral@example.com",
        phone: "+43 660 1234567",
        birthday: "1990-05-15",
        placeOfBirth: "Istanbul",
        nationality: "Türkei",
        religion: "Islam",
        maritalStatus: "Ledig",
        employmentType: "ECHTER_DIENSTNEHMER",
        street: "Teststraße 123",
        zip: "1010",
        city: "Wien",
        ssn: "1234 150590",
        taxId: "ATU12345678",
        iban: "AT12 3456 7890 1234 5678",
        bic: "TESTBICXX",
        hasWorkPermit: true,
        acceptedTerms: true,
        idCardUrl: "https://pub-23734d04c5fa41a5a9ba7bc1eed77768.r2.dev/uploads/test-id.pdf",
        licenseUrl: "https://pub-23734d04c5fa41a5a9ba7bc1eed77768.r2.dev/uploads/test-license.pdf"
    };

    try {
        console.log("Submitting test application for Nihat Meral...");
        const response = await axios.post('https://qqx-sgxb.vercel.app/api/applications', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("Success! Response:", response.data);
    } catch (error: any) {
        console.error("Error submitting test application:", error.response?.data || error.message);
    }
}

submitTest();
