# How to get https certificate via letsencrypt

Install certbot (prerequisites: git, python, pip):

    git clone https://github.com/certbot/certbot.git && cd certbot
    sudo python setup.py install

If there are some errors about old versions of package, upgrade them via pip:

    pip install <package name>

Then run command to get certificate:
    certbot certonly -d *.alice.magellan2018.ru --manual --logs-dir certbot --config-dir certbot --work-dir certbot --agree-tos --no-bootstrap --manual-public-ip-logging-ok --preferred-challenges dns-01 --server https://acme-v02.api.letsencrypt.org/directory

Update DNS TXT record as requested.
If there are no errors and key files are generated, run

    kubectl create secret tls tls-secret --key=privkey.pem --cert=fullchain.pem

to create TLS secret.