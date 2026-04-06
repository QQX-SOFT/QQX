const axios = require('axios');

const API_URL = 'http://localhost:3001/api/applications'; // Assuming dev mode local or I can use public URL

async function submitTestApplication() {
    const testData = {
        firstName: "Max",
        lastName: "Mustermann",
        email: "max.mustermann@example.com",
        phone: "+43 660 0000000",
        birthday: "1990-05-15",
        placeOfBirth: "Wien",
        nationality: "Österreich",
        religion: "konfessionslos",
        maritalStatus: "ledig",
        employmentType: "ECHTER_DIENSTNEHMER",
        street: "Mariahilfer Straße 1",
        zip: "1060",
        city: "Wien",
        ssn: "1234150590",
        taxId: "ATU12345678",
        gisaNumber: "GISA-123456",
        iban: "AT123456789012345678",
        bic: "ABCDEFGH",
        hasWorkPermit: true,
        acceptedTerms: true,
        // New compensation fields
        employmentModel: "STUNDENBASIS",
        hourlyWage: 14.50,
        orderFee: 1.20,
        kmMoney: 0.42,
        visaExpiry: "2030-01-01",
        jobTitle: "Fahrradkurier (Test)",
        joinDate: "2026-05-01",
        workLocation: "Wien (West)"
    };

    try {
        console.log("Sende Test-Bewerbung...");
        const response = await axios.post(API_URL, testData);
        console.log("Erfolgreich! Bewerbungs-ID:", response.data.id);
    } catch (error) {
        console.error("Fehler beim Senden:", error.response?.data || error.message);
    }
}

submitTestApplication();
