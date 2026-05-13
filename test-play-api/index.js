const { google } = require('googleapis');
const path = require('path');

// 1. PLACE YOUR SERVICE ACCOUNT JSON FILE IN THIS DIRECTORY
// AND RENAME IT TO 'service-account.json'
const KEY_PATH = path.join(__dirname, 'service-account.json');

// 2. THIS IS YOUR APP'S PACKAGE NAME
const PACKAGE_NAME = 'com.hosteze.app';

async function testPlayDeveloperAPI() {
    console.log('Testing Google Play Developer API Permissions...');
    console.log('Package:', PACKAGE_NAME);
    console.log('Using Key:', KEY_PATH);
    
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });

        const authClient = await auth.getClient();
        const androidpublisher = google.androidpublisher({
            version: 'v3',
            auth: authClient,
        });

        console.log('✅ Successfully authenticated with Service Account.');
        console.log(`Attempting to fetch in-app products for ${PACKAGE_NAME}...`);

        // Try to list subscriptions using the new monetization API.
        const res = await androidpublisher.monetization.subscriptions.list({
            packageName: PACKAGE_NAME,
        });

        console.log('\n✅ SUCCESS! The Service Account has the correct permissions.');
        console.log('Found the following products/subscriptions (or empty if none created yet):');
        console.log(res.data.subscriptions ? res.data.subscriptions.map(p => p.productId) : 'No products found, but API call succeeded.');
        
        console.log('\nIf RevenueCat is still throwing an error, it is likely because:');
        console.log('1. It is within the 36-hour propagation window for Google API changes.');
        console.log('2. The package name in RevenueCat does not match.');

    } catch (error) {
        console.error('\n❌ FAILED: The Service Account does not have the correct permissions, or the API is not enabled.');
        console.error('\nError Details:');
        console.error(error.message);
        
        if (error.message.includes('ENOENT: no such file or directory')) {
             console.log('\n👉 ACTION REQUIRED: Make sure you downloaded your service account key and named it "service-account.json" inside the test-play-api folder.');
        } else if (error.message.includes('Google Play Android Developer API has not been used')) {
            console.log('\n👉 ACTION REQUIRED: You need to enable the "Google Play Android Developer API" in Google Cloud Console.');
        } else if (error.message.includes('The project id used to call the Google Play Developer API has not been linked')) {
            console.log('\n👉 ACTION REQUIRED: You need to link your Google Cloud project to your Google Play Console under Setup > API Access.');
        }
    }
}

testPlayDeveloperAPI();
