import axios from 'axios';

async function testLogin(url: string, email: string, password: string, subdomain: string) {
  console.log(`\n===========================================`);
  console.log(`Testing Login for ${email} at ${url}`);
  console.log(`Subdomain header: x-tenant-subdomain = ${subdomain}`);
  
  try {
    const response = await axios.post(
      `${url}/api/auth/login`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': subdomain
        }
      }
    );
    console.log(`STATUS: SUCCESS (${response.status})`);
    console.log('RESPONSE:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.log(`STATUS: FAILED (${error.response.status})`);
      console.log('ERROR RESPONSE DATA:');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`STATUS: FAILED (No Response - Network/CORS Error)`);
      console.log(error.message);
    }
  }
}

async function runTests() {
  // Test 1: Fastroute Admin
  await testLogin(
    'https://fastroute.qqxsoft.com',
    'volkanmeral@msn.com',
    'Turkei.1453',
    'fastroute'
  );

  // Test 2: BMB Logistic Admin
  await testLogin(
    'https://bmb.qqxsoft.com',
    'office@bmblogistic.at',
    'QQXSoft2026#',
    'bmb'
  );
}

runTests();
