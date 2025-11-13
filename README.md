
# Client Information App

## Overview

The **Client Information App** is a simple Node.js application that displays client-specific information such as IP address, browser details, and geolocation data. This application is designed for educational purposes, allowing students to learn how to work with Node.js, fetch client information, and deploy to Google Cloud.

### Features

- Displays client's IP address, browser information, and operating system.
- Fetches geolocation data (city, region, country, latitude, and longitude) based on the IP address.
- Styled with Bootstrap for a simple and clean user interface.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 22 or higher required)
- **npm** (comes with Node.js)
- **Google Cloud SDK** (for deploying to Google App Engine)

### Installing Google Cloud SDK

If you don't have Google Cloud SDK installed, follow these steps:

#### macOS Installation

1. **Using Homebrew (Recommended):**
   ```bash
   brew install --cask google-cloud-sdk
   ```

2. **Or download the installer:**
   - Visit [Google Cloud SDK Installation](https://cloud.google.com/sdk/docs/install)
   - Download the macOS installer
   - Run the installer and follow the prompts

3. **Initialize gcloud:**
   After installation, initialize gcloud:
   ```bash
   gcloud init
   ```
   This will prompt you to:
   - Log in to your Google account
   - Select or create a Google Cloud project
   - Set your default region/zone

4. **Verify installation:**
   ```bash
   gcloud --version
   ```

#### Linux Installation

```bash
# Add the Cloud SDK distribution URI as a package source
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Import the Google Cloud Platform public key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Update and install
sudo apt-get update && sudo apt-get install google-cloud-sdk
```

#### Windows Installation

1. Download the installer from [Google Cloud SDK Installation](https://cloud.google.com/sdk/docs/install)
2. Run the installer and follow the prompts
3. Open a new command prompt and verify: `gcloud --version`

## Getting Started

### 1. Clone the Repository

To clone this repository to your local machine, run:

```bash
git clone <repository-url>
cd client-info-app
```

Replace `<repository-url>` with the actual URL of the repository.

### 2. Install Dependencies

Navigate to the project directory and install the required Node.js packages:

```bash
npm install
```

This command installs the necessary dependencies listed in the `package.json` file, including **Express**, **request-ip**, **axios**, **helmet** (security headers), and **express-rate-limit** (API protection).

### 3. Run the Application Locally

To start the application on your local machine, use the following command:

```bash
node app.js
```

By default, the app will run on `http://localhost:3000`. Open this URL in your browser to see the client information displayed.

### 4. Deploying to Google App Engine

You can deploy this application to Google Cloud using Google App Engine. Follow these steps:

#### Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing project.
3. Make sure **App Engine** and **Cloud Build** APIs are enabled.
4. Initialize App Engine in your project (this creates the App Engine default service account):
   - Using the command line:
     ```bash
     gcloud app create --region=us-central
     ```
   - Or via the Cloud Console: Navigate to **App Engine** and follow the prompts to create an application.
   - **Note:** The App Engine default service account (`PROJECT_ID@appspot.gserviceaccount.com`) is automatically created when you initialize App Engine. If you haven't initialized App Engine yet, this service account won't exist.
5. Grant App Engine Deployer role to the App Engine default service account:
   - In the Google Cloud Console, navigate to **IAM & Admin** > **IAM**.
   - Find the **App Engine default service account** (it will have the format `PROJECT_ID@appspot.gserviceaccount.com`).
   - Click the pencil icon to edit permissions.
   - Add the **App Engine Deployer** role.
   - **Note:** If you don't see this service account, make sure you've completed step 4 to initialize App Engine first. 

#### Step 2: Create `app.yaml` for Google App Engine

In the root directory of your project, create a file named `app.yaml` with the following content:

```yaml
runtime: nodejs22
instance_class: F1
env: standard
```

This configuration file specifies the runtime environment and instance class for the app on Google App Engine.

#### Step 3: Deploy the Application

1. Authenticate your Google Cloud CLI:

   ```bash
   gcloud auth login
   ```

2. Set the project ID (replace `your-project-id` with your actual Google Cloud Project ID):

   ```bash
   gcloud config set project your-project-id
   ```

3. Deploy the application:

   ```bash
   gcloud app deploy
   ```

4. Confirm the deployment if prompted. Once completed, Google will provide a URL for your deployed application.

#### Step 4: Access the Deployed Application

After successful deployment, visit the provided URL to see your app running on Google App Engine. The application should now display the IP, browser information, and geolocation data for each visitor.

## Additional Notes

### IP Address and Location Data
- The app may display "localhost" as the IP address when running locally. Real IP data is displayed when the app is hosted on a server.
- Location information will show "N/A" if it's unable to fetch data based on the IP address.

### Geolocation API Limits
This application uses the **ipapi.co** free service for geolocation data. Be aware of the following limits:
- **1,000 requests per day** without an API key
- **30,000 requests per month** total
- If these limits are exceeded, location data will display as "N/A"
- For production use or higher limits, consider signing up for a free API key at [ipapi.co](https://ipapi.co/)

### Security Features
This application includes several security best practices:
- **Helmet.js**: Adds security headers to protect against common vulnerabilities (XSS, clickjacking, MIME sniffing, etc.)
- **Rate Limiting**: The `/api/client-info` endpoint is limited to 100 requests per IP address every 15 minutes to prevent abuse
- **Graceful Shutdown**: The app properly handles SIGTERM signals for clean shutdowns in cloud environments

### Health Check Endpoint
The application includes a health check endpoint at `/_health` that returns:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```
This endpoint can be used by Google Cloud Platform for monitoring and health checks.

## Cleanup Instructions

After completing the deployment exercise, it's essential to clean up the resources to avoid unnecessary charges on your Google Cloud account. Follow these steps to remove the resources:

1. **Delete the App Engine Application**: 
   - Open the [Google Cloud Console](https://console.cloud.google.com/).
   - Go to **App Engine > Settings**.
   - Click **Disable Application**. This will stop all running services and delete the App Engine instance.

2. **Delete the Google Cloud Project**: 
   - If the project was created specifically for this exercise and is no longer needed, you can delete the entire project, which will remove all resources associated with it.
   - Go to **IAM & Admin > Manage Resources** in the Cloud Console.
   - Select the project used for this exercise.
   - Click **Delete** and confirm the action.

This cleanup will ensure that no unnecessary charges are incurred and that your Google Cloud credits are preserved for future projects.

## Troubleshooting

### Issue: Location shows "N/A" for all visitors
**Possible causes:**
1. The ipapi.co free tier limit (1,000 requests/day or 30,000/month) has been exceeded
2. The geolocation API is temporarily unavailable
3. The IP address cannot be geolocated (e.g., private networks, VPNs)

**Solution:** Wait for the daily/monthly limit to reset, or sign up for a free API key at ipapi.co.

### Issue: "Too many requests" error
**Cause:** The rate limiter has detected more than 100 requests from your IP in 15 minutes.

**Solution:** Wait 15 minutes before trying again, or test from a different IP address.

### Issue: App won't start locally
**Cause:** Node.js version is too old.

**Solution:** Upgrade to Node.js 22 or higher: `nvm install 22` or download from [nodejs.org](https://nodejs.org/).

## License

This project is licensed under the MIT License. Feel free to use it for educational purposes.
