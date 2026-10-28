const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

(async () => {
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'ZA' },
    { shortName: 'ST', value: 'Gauteng' },
    { name: 'localityName', value: 'Johannesburg' },
    { name: 'organizationName', value: 'INSY7314' },
    { shortName: 'OU', value: 'Development' }
  ];

  const pems = await selfsigned.generate(attrs, {
    keySize: 4096,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      { name: 'basicConstraints', cA: true },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' }
        ]
      }
    ]
  });

  fs.writeFileSync(path.join(__dirname, 'private-key.pem'), pems.private, 'utf8');
  fs.writeFileSync(path.join(__dirname, 'ssl-certificate.pem'), pems.cert, 'utf8');

  console.log('✅ Certificates generated');
})();