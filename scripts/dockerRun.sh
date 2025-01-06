#!/bin/bash

# Run the Docker container and pass variables as environment variables
docker run \
    -e DATABASE_URL="postgresql://orca:ujQAiG7u6!X82:G@orca-postgresql.postgres.database.azure.com/orca-test" \
    -e AZURE_STORAGE_ACCOUNT_NAME="orcasavestorage" \
    -e AZURE_STORAGE_ACCOUNT_KEY="HIDVooCwnWUM0tNwrMxcYyw0PHQ5dXmijK37X0WmwU41qKj2WIjIPpGyHLL8oGP8cpAoKFS+75RR+AStVVextA==" \
    -e APP_INSIGHTS_CONNECTION_STRING="InstrumentationKey=d486f771-1f47-4791-a94a-b123e46d416e;IngestionEndpoint=https://westus-0.in.applicationinsights.azure.com/;LiveEndpoint=https://westus.livediagnostics.monitor.azure.com/;ApplicationId=16db6343-93e8-4170-a6fa-6335bf13f2c2" \
    -e ALLOWED_ORIGINS=https://orca-staging.azurewebsites.net,http://localhost:3000,https://localhost \
    -e BASE_URL=http://localhost:3000 \
    -e PLAID_CLIENT_ID=663a4ab4540fa2001b1dc27d \
    -e PLAID_SECRET=1e235d25c110ac25ccafb1be2e6c55 \
    -e PLAID_ENV=sandbox \
    -e STRIPE_PRICE_SUBSCRIPTION_ID=price_1POw9ZH80uE6Eskxaf48Hz4F \
    -e STRIPE_SECRET_KEY=sk_test_51PMADcH80uE6EskxRid1ojw9ou61e6csZ6ipwYK4XF7nUgMMZgO6Wg9GupclEr3CX4QMnHjF7f39fIACdavLeQlb009ofFuNkp \
    -e STRIPE_PRODUCT_ID=prod_QFR1TMSZLCYJ2V \
    -e STRIPE_ENDPOINT_SECRET=we_1PsvOHH80uE6EskxEgwdwrZS \
    -e SLACK_WEBHOOK_URL=https://hooks.slack.com/services/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 \
    -e PORT=3001 \
    -e FIREBASE_PROJECT_ID=orca-420301 \
    -e FIREBASE_PRIVATE_KEY_ID=ccde463ae0ffda30a6326890a92653be11ee170e \
    -e FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLAP7XrxjguNYp\nlQSwvYEl2W7liQurlwi7pEONDY+7BFiEU6Xd4Lm8jhcVflnM2Ht3jzykhgKsLAv9\nlXUzZ8hDcNsJTfyJaTqGGF4Ns/2QlbXm+AGusuFz8+qFaRtHw735tbSMvfSCxFCf\nnxiBTdLh2fz60FmEhyZGQKq+6RIxEpYHMl6PwgEAN5vDexqjKZNBEheBXC2Ou9uD\nQ3UPjSbp89SYyErv1wSMn3BlYvHlc20x5kVP9CIhyHoj4nwPhF4hu9SsmaXfmkUx\n9oSnhpMQOBFkFtkGVvB4qJmOr8RofvfLsLJp5mFDrP/yDgU3UGAv3sCm3ANnquuk\nlBJ+Vu/RAgMBAAECggEAHveJqIKuF5eymbjA9KoP0aODwnF/rX72ZtNVt6ZmMsfk\nrdjpwDk39B6zwERcM/6hBPm9bTaBIVz9vkLmlD8kYj9MtnRmTdrWwd5lOI9oon3n\n9/IEpa7la+/9KjlAn1epevZgMqkGa81BJDxbe1wRC4FakTMnuKr6KHTUZxd8Pi5b\nDWPQMv+KBxYVf1WZghVWjxVSzN7/h3LagtEAmPsUUDiz8yO1DbRoRTv8WhqnEDrt\nXYUCQ5i2UcuTPVCP37AIesS36fFc94hZRVWB55Qy3YuzGrKc/+wWt4+620RbvwgN\nemiqey9CwF9Hk92lfjO+jY0P4EPlQqwnYvX7twKXTQKBgQD5gHSqcYt8M48ROKx6\nc/Cs3cjpF/mNqudU6hEId+GByxNVj+w+nlR2DpaRupJQI0I2BE3Do8fXDRiFcBHv\nBN8C0a5hZqGX4bxmUCISi2Z5wnlTxeaL6lb/fTkFNVfnznjV4VzdTqdpbLbSL3Es\nh5dL/sYoYP5Mryx1J2urGfe45QKBgQDQSoRHCxJubbEZIxo/UjY6DfDLkEFojFCR\nO9pBRAotvUGOKn8t4pTPBLib1J/vj+m+bE3fux2GzXoSRL/K7w6FQXbZwUXH3pRg\nhqLVF3f6LA0LDmZJ4clK1v+W1TzE5hT/Q3spSXkpaVmS4pVv0rPXlCkOPHYZwRFy\nHRIbwwiIfQKBgQCNRnxJCrQVpsgq0zFuwPmVmJuryOSIoC4O+d6dMexh5xBSkYUO\ny+49TvNZHxC8Ccry9SrnTXTZw1OQMy4kblisqvgXtNppOuvH7zXr1D05UrIKinOJ\n5C5QyqIf3d2hp1rqmIpR0bifzGwUxcJKmZhE8sVXldxIpaQBzkl7/98yNQKBgAD9\nCYmoxMqfXKLI5tv8EOPPox/kLFtJpyw5Q3zhzMaQylnZW8ck9x3QYOvkY2nonexY\naToxkh9MpFKn3t0gq0n4mI7J+wHKzZtzqBwow1n9kYZG6Ddbie//+zCFDIfGq7zW\nXiRBBAEtTc6Dor/oGRBh1JwLr2fJ4cJP3wEguM6lAoGBAOrSRdTnH6oDULa+Ljr/\nY+qdDP0tPO0R/JGvdItLLoBWs6pO0dRAZ47CB7U2vmSSLLTT5iw731gd5alETsa0\nwGvCEvocl2r2165ldrVTsDvbGZ1t664bz2qvSLNwHy8fHw4g0a06XvNiZHCIK8Jd\n5T4UJOU5K7MiOJ/BoxngZ4Jo\n-----END PRIVATE KEY-----\n" \
    -e FIREBASE_CLIENT_EMAIL="firebase-adminsdk-7mysu@orca-420301.iam.gserviceaccount.com" \
    -e FIREBASE_CLIENT_ID=103643807888142749152 \
    -e FIREBASE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-7mysu%40orca-420301.iam.gserviceaccount.com" \
    -e CLOUD_PROJECT_ID=orca-435222 \
    -e CLOUD_PRIVATE_KEY_ID=140b001d3bb630e4218167f41b1e9af5b8152d1a \
    -e CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDEe9Kep08G2rqJ\nP893AtcA9M9NhtmZzX95m4GneuNeoANJgExw1Wv5Zr36tYpDRVUhIZadEAa83yUd\nA/Q2P8WXzFHRLTn2kEiAC8P5E2fFLA61rxDiowabq/59H8nFzIfgWl+8Wu+cFbmY\nr5uKQNrAac/o28/MIcBO8XjH7+BDV7Ame34tbzFokS1wS1pOmqB1VvtQ1MuXzEJz\nZgT1AhttI3/X7e8SFazKmt533VFzk4I60u7SWHuz9kJDSa8pi59Y7panFm5D/6ON\nd0+nX1cVbMUqvo5ejKznTH/RbFNSAZ2ss6E/8nvDJAXX4ObFNr5q/EeuEHKrdpb1\nIROUVEvNAgMBAAECggEAQZCEFtcDoujoKBZ392GmNzZ52ofuIsmVCRJgMG/sYU4J\n6sP6PgipsB6dtIRRr+L55kVcCesoJGxd6RHBszyShfXzM1bhKaq51qiWa44TKZNr\nEStq+gWmldnN4RjzbqKykKX3nlXF8RK6zP2EbJz5og1tCGoZLCfzESS4xhcAgdey\nSzwP9m9n1bb+pyTy5wBxbTLb4S2/NpT0rTPKD5XzVqd6o3pAar8OLKfGg3o/jzku\nvnHkDcmFkGX+gzOmmR1s3eXQCiSVxJnnFTGhD2NOKe7y2EAwgPVuqVRff0MEA7FZ\n/8qtwv5jz37XJLl68OV4HgfHW+aBRl3ywaqWx9P+zQKBgQDihh4p8+rwDFu1xgXu\n20Zc9mS2nYe92KVvKqMiHuWC8PZSUlzZteqAZdKJiDIAb4LBOnkHI4qG94rcaBgB\n7aq/hz6Wd+lv1Q/bW4vQUllq1pFfjBtQuAJzhVJrQbxPU8Ogvv8CVOd/AdCWTvZh\nXMYWvEH225Byu76B7SzkTtVy9wKBgQDeDQQgX2ekfFsQIpFAR3Nlk5GxQBUhFM2Q\nQ9/YA/zWhSg8A61v0BabVeGdas7hCrSvokkW2bBV5bZFW56RojxqfEKnstmZ1Eep\nxRGNBC0/rv/1JTvPEsNmqiH3BPnyqOyNcDJlX/wZeLSfqd+CdyBZ6cw+rn5k2x0g\nouQtXsWCWwKBgGLlMt4WA4fxnUhqv8RcLwf++lFPzSdxIii6cKZA3uqf0Kp4Etlp\ntot/6L7qmwndpTQ/Fv+q4Ju0DwfS2khdPqKHpSeECoIsftPBz/SPP0KJksYoIPTI\noSlWF3mEJXZsl4fiWurlrnugizRUHPS80C602gewLAwrMyz+Iw85665ZAoGAOtze\ndCp2Ug85IJzZPl3yhEHLRF6Fe2CFYbHse9oKw19HHCmpZ1OVOpZYmZ8/uj5ZSZnO\noEUSzqJ3YAl6joagV2YbUVNDBdlVKfb4wRYTXKdqaLT3FtyVefitykrCa4ZGNvRA\nF8mLDcGGuDCS9IXZyJwGrbMaBGhlX0pvDGvsFbMCgYEAwlZ/5x6ZbYznP5GwD1Tr\nhBK8fNV0zvqT2s7u+QBe0tlDjGnsDODS3p06wvP179g5kjj10Ah8/FfNw2euyZyL\nuIS8SKu6BRrEZKADyilk9rGEuPhpDYQY6uzA6q1bS9EcGpq4zZj+FNUjTE6y69Rd\nx9SYU3l9cSm9Nr1oD1+WsHo=\n-----END PRIVATE KEY-----\n" \
    -e CLOUD_CLIENT_EMAIL=orca-service@orca-435222.iam.gserviceaccount.com \
    -e CLOUD_CLIENT_ID=104290452533302650928 \
    -e CLOUD_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/orca-service%40orca-435222.iam.gserviceaccount.com \
    -e APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgVjleZprghxpDPckx\nR4LudikhTNFtlZlSyKkMTSCFZpmgCgYIKoZIzj0DAQehRANCAAS0PZBjSXcbGi2M\npGLrEiwTcyV3jqnQvCX65ZKmR/xSHnqGAHODPPUqUCz11fdSRvFz3Q4AFhc36Rtt\nxVmApU3J\n-----END PRIVATE KEY-----" \
    -e APPLE_KEY_ID=LSWGP3RBCC \
    -e APPLE_ISSUER_ID=200c9e3c-fb36-4638-bb93-ae110226997c \
    -e APPLE_BUNDLE_ID=com.orcamoney.app \
    -e APPLE_APP_ID=6711361558 \
    -e APPLE_SHARED_SECRET=d8ef4af076b94bc49a52725316a71db8 \
    -e PLAY_SUBSCRIPTION_ID=main_sub \
    -e PLAY_PACKAGE_NAME="com.orcamoney.app" \
    reharly20/orca-api:latest 
