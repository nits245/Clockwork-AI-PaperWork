import AWS from 'aws-sdk';

// Initialize S3 and Rekognition clients
const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

export const handler = async (event) => {
  try {
    // Ensure event.body is defined and parse it safely
    const body = event.body ? JSON.parse(event.body) : {};
    const { uniqueID, s3BucketName, s3ObjectKey } = body;

    if (!uniqueID || !s3BucketName || !s3ObjectKey) {
      throw new Error('Missing required parameters (uniqueID, s3BucketName, or s3ObjectKey)');
    }

    console.log(`Processing image with ID: ${uniqueID}, from bucket: ${s3BucketName}, object key: ${s3ObjectKey}`);

    // Retrieve image from S3 using the unique ID and object key
    const s3Params = {
      Bucket: s3BucketName,
      Key: s3ObjectKey,
    };

    const s3Object = await s3.getObject(s3Params).promise();
    const imageBuffer = s3Object.Body; // Get the image data as a binary buffer

    // Log image details for debugging
    console.log('Retrieved image from S3. Image size:', imageBuffer.length);

    // Set up Rekognition parameters for text detection
    const rekognitionParams = {
      Image: {
        Bytes: imageBuffer, // Pass the image buffer directly to Rekognition
      },
    };

    // Call Rekognition to detect text in the image
    const rekognitionResponse = await rekognition.detectText(rekognitionParams).promise();
    console.log('Rekognition response:', JSON.stringify(rekognitionResponse, null, 2));

    // Extract detected text from the Rekognition response
    const detectedTextArray = rekognitionResponse.TextDetections.map(item => item.DetectedText);

    // Define a list of unwanted words to filter out
    const unwantedWords = [
      'Swinburne', 'University', 'Technology', 'Student', 'Expires', 'Swin', 'Bur', 'Ne',
      'SWIN', 'SWINBURNE', 'BUR', 'UNIVERSITY', 'OF', 'TECHNOLOGY', 'Ye', 'NE'
    ];

    // Filter out unwanted words from detected text
    const filteredTextArray = detectedTextArray.filter(text => 
      !unwantedWords.some(unwanted => text.toLowerCase().includes(unwanted.toLowerCase()))
    );

    // Join filtered text into a single string
    const detectedText = filteredTextArray.join(' ');
    console.log('Filtered detected text:', detectedText);

    // Define patterns to extract the required information
    const nameRegex = /\b([A-Z][a-zA-Z]+)\s+([A-Z][a-zA-Z]+)\b/; // Matches "Firstname Lastname"
    const idRegex = /\b(\d{6,10})\b/; // Assuming the ID is a 6-10 digit number
    const expiryDateRegex = /\b([A-Za-z]{3})\s+(\d{4})\b/; // Matches patterns like "Dec 2024"

    // Extract the matched results using regular expressions
    const nameMatch = detectedText.match(nameRegex);
    const idMatch = detectedText.match(idRegex);
    const expiryDateMatch = detectedText.match(expiryDateRegex);

    // Extract first and last name if matched
    const firstName = nameMatch ? nameMatch[1] : null;
    const lastName = nameMatch ? nameMatch[2] : null;
    const id = idMatch ? idMatch[0] : null;
    const expiryDate = expiryDateMatch ? `${expiryDateMatch[1]} ${expiryDateMatch[2]}` : null;

    console.log('Extracted Data:', { firstName, lastName, id, expiryDate });

    // Return the response with extracted data and unique ID
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  // Enable CORS if necessary
      },
      body: JSON.stringify({
        message: 'Image processed successfully',
        firstName: firstName || 'N/A',
        lastName: lastName || 'N/A',
        id: id || 'N/A',
        expiryDate: expiryDate || 'N/A',
        uniqueID: uniqueID, // Include the unique ID in the response
      }),
    };
  } catch (err) {
    console.error('Error processing image:', err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  // Enable CORS if necessary
      },
      body: JSON.stringify({ message: 'Failed to process image', error: err.message }),
    };
  }
};
