import dns from 'dns';

const hostname = 'ep-super-mud-a1hk71gn-pooler.ap-southeast-1.aws.neon.tech';

console.log(`Attempting to resolve: ${hostname}`);

dns.lookup(hostname, (err, address, family) => {
    if (err) {
        console.error('DNS Lookup failed:', err);
    } else {
        console.log(`Resolved ${hostname} to ${address} (IPv${family})`);
    }
});
