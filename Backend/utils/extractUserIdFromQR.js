import fs from 'fs';
import { createWorker } from 'tesseract.js';
import QRCode from 'qrcode-reader';
// import Jimp from 'jimp';

/**
 * Extracts the user ID (email ID) from a QR code in the document.
 * @param {string} filePath - Path to the PDF file.
 * @returns {Promise<string>} - Extracted email ID from the QR code.
 */
const extractUserIdFromQR = async (filePath) => {
  try {
    // // Step 1: Convert PDF to image (first page only)
    // const pdfToImage = require('pdf-to-image');
    // const imagePath = await pdfToImage.convert(filePath, { singlePage: true });

    // // Step 2: Load the image using Jimp
    // const image = await Jimp.read(imagePath);

    // // Step 3: Initialize QRCode reader
    // const qr = new QRCode();

    // return new Promise((resolve, reject) => {
    //   qr.callback = (err, value) => {
    //     if (err) {
    //       reject('Failed to read QR code');
    //     } else {
    //       // Step 4: Extract email ID from QR code data
    //       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //       const email = value.result.match(emailRegex)?.[0];
    //       if (email) {
    //         resolve(email);
    //       } else {
    //         reject('No valid email found in QR code');
    //       }
    //     }
    //   };

    //   // Step 5: Decode QR code
    //   qr.decode(image.bitmap);
    // });
    console.log('Extracting user ID from QR code...');
  } catch (error) {
    console.error('Error extracting user ID from QR:', error);
    throw new Error('Failed to extract user ID from QR code');
  }
};

export default extractUserIdFromQR;