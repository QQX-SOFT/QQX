const http = require('http');

const data = JSON.stringify({
    firstName: "Max",
    lastName: "Mustermann TEST-STAMMDATEN",
    email: "max.design@qqxsoft.com",
    phone: "+436601234567",
    birthday: "1992-10-10",
    placeOfBirth: "Wien",
    nationality: "AUT",
    religion: "Röm.-Kath.",
    maritalStatus: "Ledig",
    employmentType: "ECHTER_DIENSTNEHMER",
    street: "Mariahilfer Straße 1",
    zip: "1060",
    city: "Wien",
    ssn: "1234101092",
    taxId: "ATU12345678",
    gisaNumber: "GISA-123456",
    iban: "AT123456789012345678",
    bic: "ABCDEFGH",
    hasWorkPermit: true,
    acceptedTerms: true,
    employmentModel: "STUNDENBASIS",
    hourlyWage: 14.50,
    orderFee: 1.20,
    kmMoney: 0.42,
    visaExpiry: "2030-01-01",
    jobTitle: "Fahrradkurier (Testfall)",
    joinDate: "2026-05-01",
    workLocation: "Wien West"
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/applications',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'x-tenant-subdomain': 'fastroute'
    }
};

const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let responseBody = '';
    res.on('data', chunk => {
        responseBody += chunk;
    });
    res.on('end', () => {
        console.log(`BODY: ${responseBody}`);
    });
});

req.on('error', e => {
    console.error(`PROB: ${e.message}`);
});

req.write(data);
req.end();
