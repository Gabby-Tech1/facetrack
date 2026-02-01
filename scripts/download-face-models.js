#!/usr/bin/env node
/**
 * Script to download face-api.js models
 * Run: node scripts/download-face-models.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODELS_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');

// Models needed for face detection and landmarks (Option A - detection only)
const MODELS = [
    // SSD MobileNet v1 - for face detection
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2',
    // Face landmarks 68 - for face landmark detection
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    // Tiny face detector - lighter alternative
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
];

function downloadFile(filename) {
    return new Promise((resolve, reject) => {
        const url = `${MODELS_URL}/${filename}`;
        const filePath = path.join(MODELS_DIR, filename);

        console.log(`Downloading: ${filename}`);

        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                https.get(response.headers.location, (res) => {
                    res.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log(`  ✓ Downloaded: ${filename}`);
                        resolve();
                    });
                }).on('error', reject);
            } else if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`  ✓ Downloaded: ${filename}`);
                    resolve();
                });
            } else {
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function main() {
    // Create models directory
    if (!fs.existsSync(MODELS_DIR)) {
        fs.mkdirSync(MODELS_DIR, { recursive: true });
        console.log(`Created directory: ${MODELS_DIR}`);
    }

    console.log('\nDownloading face-api.js models...\n');

    for (const model of MODELS) {
        try {
            await downloadFile(model);
        } catch (error) {
            console.error(`  ✗ Failed: ${model} - ${error.message}`);
        }
    }

    console.log('\nDone! Models saved to:', MODELS_DIR);
}

main().catch(console.error);
