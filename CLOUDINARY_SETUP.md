# Cloudinary Setup for EthioKidsLearn

This document provides step-by-step instructions for setting up Cloudinary for image storage in the EthioKidsLearn app.

## Why Cloudinary?

We've switched from Firebase Storage to Cloudinary because:
- Cloudinary offers a generous free tier (25GB storage, 25GB bandwidth)
- Optimized image delivery and transformation capabilities
- No need to manage authentication tokens
- Better performance for image loading

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [Cloudinary's website](https://cloudinary.com/) and sign up for a free account
2. After signing up, you'll be taken to your dashboard

### 2. Get Your Cloudinary Credentials

From your Cloudinary dashboard:
1. Note your **Cloud Name**, **API Key**, and **API Secret**
2. These will be needed to configure the app

### 3. Create an Upload Preset

Upload presets allow you to preconfigure upload parameters and avoid sending your API secret from the client side.

1. In your Cloudinary dashboard, go to Settings > Upload
2. Scroll down to "Upload presets" and click "Add upload preset"
3. Give it a name (e.g., `ethio_kids_learn`)
4. Set "Signing Mode" to "Unsigned"
5. Configure any other settings (optional):
   - Folder to store uploads
   - Transformations
   - Allowed formats
6. Save the preset

### 4. Update Your App Configuration

1. Open the file `services/cloudinary.js` in your app
2. Replace the placeholders with your actual Cloudinary credentials:

```javascript
const cloudinaryConfig = {
  cloudName: 'YOUR_CLOUD_NAME', // Replace with your Cloudinary cloud name
  apiKey: 'YOUR_API_KEY',      // Replace with your Cloudinary API key
  apiSecret: 'YOUR_API_SECRET' // Replace with your Cloudinary API secret
};
```

3. Make sure your upload preset name matches what you created in Cloudinary:

```javascript
formData.append('upload_preset', 'ethio_kids_learn'); // Use your preset name
```

### 5. Test the Implementation

1. Run your app and try to upload a profile picture
2. Check your Cloudinary Media Library to confirm the image was uploaded successfully

## Security Considerations

- The current implementation uses unsigned uploads for simplicity
- For a production app, consider using signed uploads with a server-side component
- Keep your API Secret secure and never expose it in client-side code

## Advanced Usage

Cloudinary offers many advanced features you might want to use:

- **Image transformations**: Resize, crop, apply filters, etc.
- **Face detection**: Automatic cropping to focus on faces
- **Responsive images**: Deliver optimal sizes for different devices
- **Lazy loading**: Improve page load performance

For more information, refer to the [Cloudinary documentation](https://cloudinary.com/documentation). 