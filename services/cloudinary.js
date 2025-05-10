// Cloudinary service without external dependencies
// Uses direct REST API for uploads

// Your Cloudinary configuration
const cloudinaryConfig = {
  cloudName: 'dljxfr5iy', // Your Cloudinary cloud name
  apiKey: '633587685512233', // Your Cloudinary API key
  apiSecret: '' // Keep this empty for client-side code for security
};

// Function to upload image to Cloudinary
export const uploadToCloudinary = async (uri) => {
  try {
    // First convert URI to base64
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
      reader.onerror = (error) => reject(error);
    });
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', base64);
    formData.append('upload_preset', 'ethiokidslearn'); // Updated to match your preset name
    formData.append('cloud_name', cloudinaryConfig.cloudName);
    
    // Upload to Cloudinary
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    const uploadResult = await uploadResponse.json();
    
    if (uploadResponse.ok) {
      return {
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    } else {
      console.error('Cloudinary upload failed:', uploadResult);
      return { success: false, error: uploadResult };
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return { success: false, error };
  }
};

// Function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    // For security reasons, you should use a server-side function to delete
    // This is a simplified example, consider using a backend service for this
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = generateSignature(`public_id=${publicId}&timestamp=${timestamp}${cloudinaryConfig.apiSecret}`);
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp);
    formData.append('api_key', cloudinaryConfig.apiKey);
    formData.append('signature', signature);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return { success: false, error };
  }
};

// Helper function to generate signature for Cloudinary API
const generateSignature = (stringToSign) => {
  // In a real app, this should be done server-side
  // For a complete implementation, use a backend service
  // This is just a placeholder for the concept
  console.warn('Signature generation should be implemented server-side');
  return 'signature_placeholder';
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  config: cloudinaryConfig
}; 