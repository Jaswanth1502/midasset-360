/**
 * Snapshot Assistant Logic for MedAssist 360
 * Handles Camera/Upload, AI Simulation Flow, and Results Rendering
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Step References ---
    const stepInput = document.getElementById('step-input');
    const stepCamera = document.getElementById('step-camera');
    const stepProcessing = document.getElementById('step-processing');
    const stepResults = document.getElementById('step-results');

    // --- Buttons & Inputs ---
    const docTypeSelect = document.getElementById('doc-type-select');
    const btnCamera = document.getElementById('btn-camera');
    const fileUpload = document.getElementById('file-upload');
    const closeCameraBtn = document.getElementById('close-camera');
    const capturePhotoBtn = document.getElementById('capture-photo');
    const btnRestart = document.getElementById('btn-restart');

    // --- Camera Elements ---
    const videoFeed = document.getElementById('camera-feed');
    const canvas = document.getElementById('snapshot-canvas');
    let stream = null;

    // --- Display Elements ---
    const previewImage = document.getElementById('preview-image');
    
    // --- Event Listeners ---

    // 1. Open Camera
    btnCamera.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            videoFeed.srcObject = stream;
            switchStep(stepCamera);
        } catch (err) {
            alert('Camera access denied or unavailable. Please use the upload feature instead.');
            console.error('Camera error:', err);
        }
    });

    // 2. Close Camera
    closeCameraBtn.addEventListener('click', () => {
        stopCamera();
        switchStep(stepInput);
    });

    // 3. Capture Photo
    capturePhotoBtn.addEventListener('click', () => {
        if (!stream) return;
        
        // Draw to canvas
        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
        
        // Convert to data target
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        previewImage.onload = () => {
            startProcessing();
            previewImage.onload = null;
        };
        previewImage.src = imageDataUrl;
        
        stopCamera();
    });

    // 4. Upload File
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.onload = () => {
                startProcessing();
                previewImage.onload = null;
            };
            previewImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 5. Restart flow
    btnRestart.addEventListener('click', () => {
        fileUpload.value = '';
        switchStep(stepInput);
    });


    // --- Helper Functions ---

    const navbar = document.getElementById('navbar');

    function switchStep(targetStep) {
        // Hide all steps
        [stepInput, stepCamera, stepProcessing, stepResults].forEach(step => {
            step.classList.add('hidden');
            step.classList.remove('active');
        });
        
        // Show target
        targetStep.classList.remove('hidden');
        // Small delay to allow CSS display block to apply before opacity fade-in
        setTimeout(() => {
            targetStep.classList.add('active');
        }, 50);

        // Hide navigation bar when capturing
        if (navbar) {
            if (targetStep === stepCamera) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            videoFeed.srcObject = null;
            stream = null;
        }
    }

    function startProcessing() {
        switchStep(stepProcessing);
        
        // Validate Image
        if (!checkImageQuality(previewImage)) {
            renderErrorState();
            switchStep(stepResults);
            return;
        }
        
        // Simulate Processing Delays
        const statusText = document.getElementById('processing-text');
        
        setTimeout(() => { statusText.innerText = 'Extracting text (OCR)...'; }, 1000);
        setTimeout(() => { statusText.innerText = 'Applying Medical NLP...'; }, 2500);
        setTimeout(() => { statusText.innerText = 'Cross-referencing databases...'; }, 4000);
        
        setTimeout(() => {
            renderResults();
            switchStep(stepResults);
            statusText.innerText = 'Analyzing Document...'; // reset
        }, 5500);
    }

    // --- Mock Data Rendering based on Type ---
    let scenarioPool = [];
    
    function getNextScenario() {
        if (scenarioPool.length === 0) {
            scenarioPool = [
                {
                    title: 'Prescription Analysis <span style="font-size: 0.7rem; background: rgba(0,255,0,0.1); color: #4ade80; padding: 2px 6px; border-radius: 10px; margin-left: 10px; border: 1px solid rgba(74, 222, 128, 0.3);">98% Confidence</span>',
                    main: `<div class="info-row"><span class="info-label">Prescribing Physician:</span> <span class="info-value">Dr. Sarah Jenkins, MD</span></div>
                           <div style="margin-top: 15px;"><strong>Medications:</strong><br>1. Amoxicillin 500mg (3x daily)</div>`,
                    safety: `<div class="info-row" style="border:none;"><span class="info-label">Advisory:</span> <span class="info-value alert-value" style="font-size: 0.9rem;">Complete the full 7-day course.</span></div>`,
                    hasTimeline: true,
                    timeline: `<div class="timeline-item"><span class="time-label">Morning</span><div class="time-action">Amoxicillin 500mg <span class="food-note">After Breakfast</span></div></div>`,
                    type: 'pharmacy'
                },
                {
                    title: 'Medication Intelligence <span style="font-size: 0.7rem; background: rgba(0,255,0,0.1); color: #4ade80; padding: 2px 6px; border-radius: 10px; margin-left: 10px; border: 1px solid rgba(74, 222, 128, 0.3);">Verified</span>',
                    main: `<div class="info-row"><span class="info-label">Commercial Name:</span> <span class="info-value highlight-value">Crocin Advance</span></div>
                           <div class="info-row"><span class="info-label">Active Ingredient:</span> <span class="info-value">Paracetamol 500mg</span></div>`,
                    safety: `<div class="info-row" style="border:none;"><span class="info-label">Contraindications:</span> <span class="info-value alert-value" style="font-size:0.9rem;">High risk of hepatotoxicity if daily dosage exceeds 4000mg.</span></div>`,
                    hasTimeline: false,
                    timeline: '',
                    type: 'pharmacy'
                },
                {
                    title: 'Pathology AI Analysis <span style="font-size: 0.7rem; background: rgba(255,165,0,0.1); color: #fbbf24; padding: 2px 6px; border-radius: 10px; margin-left: 10px; border: 1px solid rgba(251, 191, 36, 0.3);">Review Required</span>',
                    main: `<div class="info-row"><span class="info-label">Leukocyte Count:</span> <span class="info-value alert-value">Elevated (14,200 /mcL)</span></div>
                           <div class="info-row"><span class="info-label">Hemoglobin:</span> <span class="info-value">Normal (13.5)</span></div>`,
                    safety: `<div class="info-row" style="border:none;"><span class="info-label">Recommendation:</span> <span class="info-value alert-value" style="font-size:0.9rem;">Consult a physician immediately for proper clinical diagnosis.</span></div>`,
                    hasTimeline: false,
                    timeline: '',
                    type: 'hospital'
                },
                {
                    title: 'Prescription Analysis <span style="font-size: 0.7rem; background: rgba(0,255,0,0.1); color: #4ade80; padding: 2px 6px; border-radius: 10px; margin-left: 10px; border: 1px solid rgba(74, 222, 128, 0.3);">95% Confidence</span>',
                    main: `<div class="info-row"><span class="info-label">Medication:</span> <span class="info-value highlight-value">Salbutamol Inhaler (100mcg)</span></div>
                           <div class="info-row"><span class="info-label">Instructions:</span> <span class="info-value">2 puffs every 4 hours as needed</span></div>`,
                    safety: `<div class="info-row" style="border:none;"><span class="info-label">Advisory:</span> <span class="info-value alert-value" style="font-size:0.9rem;">Rinse mouth after use to prevent oral thrush.</span></div>`,
                    hasTimeline: false,
                    timeline: '',
                    type: 'pharmacy'
                },
                {
                    title: 'Medication Intelligence <span style="font-size: 0.7rem; background: rgba(0,255,0,0.1); color: #4ade80; padding: 2px 6px; border-radius: 10px; margin-left: 10px; border: 1px solid rgba(74, 222, 128, 0.3);">Verified</span>',
                    main: `<div class="info-row"><span class="info-label">Name:</span> <span class="info-value highlight-value">Cetirizine 10mg</span></div>
                           <div class="info-row"><span class="info-label">Class:</span> <span class="info-value">Antihistamine</span></div>`,
                    safety: `<div class="info-row" style="border:none;"><span class="info-label">Advisory:</span> <span class="info-value alert-value" style="font-size:0.9rem;">May cause drowsiness. Avoid operating heavy machinery.</span></div>`,
                    hasTimeline: false,
                    timeline: '',
                    type: 'pharmacy'
                },
                {
                    title: 'Lab Report Analysis <span style="font-size: 0.7rem; background: rgba(255,165,0,0.1); color: #fbbf24; padding: 2px 6px; border-radius: 10px; margin-left: 10px; border: 1px solid rgba(251, 191, 36, 0.3);">Review Required</span>',
                    main: `<div class="info-row"><span class="info-label">LDL Cholesterol:</span> <span class="info-value alert-value">High (160 mg/dL)</span></div>
                           <div class="info-row"><span class="info-label">HDL Cholesterol:</span> <span class="info-value">Normal (45 mg/dL)</span></div>`,
                    safety: `<div class="info-row" style="border:none;"><span class="info-label">Dietary Note:</span> <span class="info-value alert-value" style="font-size:0.9rem;">Reduce intake of saturated fats and schedule a cardiologist review.</span></div>`,
                    hasTimeline: false,
                    timeline: '',
                    type: 'hospital'
                },
                {
                    title: 'Prescription Analysis <span style="font-size: 0.7rem; background: rgba(0,255,0,0.1); color: #4ade80; padding: 2px 6px; border-radius: 10px; margin-left: 10px; border: 1px solid rgba(74, 222, 128, 0.3);">97% Confidence</span>',
                    main: `<div class="info-row"><span class="info-label">Medication:</span> <span class="info-value highlight-value">Amlodipine 5mg</span></div>
                           <div class="info-row"><span class="info-label">Instructions:</span> <span class="info-value">1x daily for Hypertension</span></div>`,
                    safety: `<div class="info-row" style="border:none;"><span class="info-label">Advisory:</span> <span class="info-value alert-value" style="font-size:0.9rem;">Monitor blood pressure regularly. Swelling of ankles may occur.</span></div>`,
                    hasTimeline: true,
                    timeline: `<div class="timeline-item"><span class="time-label">Morning</span><div class="time-action">Amlodipine 5mg <span class="food-note">Take at the same time daily</span></div></div>`,
                    type: 'pharmacy'
                },
                {
                    title: 'Medication Intelligence <span style="font-size: 0.7rem; background: rgba(0,255,0,0.1); color: #4ade80; padding: 2px 6px; border-radius: 10px; margin-left: 10px; border: 1px solid rgba(74, 222, 128, 0.3);">Verified</span>',
                    main: `<div class="info-row"><span class="info-label">Name:</span> <span class="info-value highlight-value">Gelusil Antacid</span></div>
                           <div class="info-row"><span class="info-label">Type:</span> <span class="info-value">Chewable Tablet</span></div>`,
                    safety: `<div class="info-row" style="border:none;"><span class="info-label">Usage:</span> <span class="info-value alert-value" style="font-size:0.9rem;">Chew thoroughly before swallowing. Do not take within 2 hours of other medications.</span></div>`,
                    hasTimeline: false,
                    timeline: '',
                    type: 'pharmacy'
                },
                {
                    title: 'Pathology AI Analysis <span style="font-size: 0.7rem; background: rgba(255,165,0,0.1); color: #fbbf24; padding: 2px 6px; border-radius: 10px; margin-left: 10px; border: 1px solid rgba(251, 191, 36, 0.3);">Alert</span>',
                    main: `<div class="info-row"><span class="info-label">TSH Levels:</span> <span class="info-value alert-value">Elevated (6.5 mIU/L)</span></div>
                           <div class="info-row"><span class="info-label">Free T4:</span> <span class="info-value">Low (0.8 ng/dL)</span></div>`,
                    safety: `<div class="info-row" style="border:none;"><span class="info-label">AI Summary:</span> <span class="info-value alert-value" style="font-size:0.9rem;">Indicative of Hypothyroidism. Consult an endocrinologist for thyroid hormone replacement therapy.</span></div>`,
                    hasTimeline: false,
                    timeline: '',
                    type: 'hospital'
                },
                {
                    title: 'Prescription Analysis <span style="font-size: 0.7rem; background: rgba(0,255,0,0.1); color: #4ade80; padding: 2px 6px; border-radius: 10px; margin-left: 10px; border: 1px solid rgba(74, 222, 128, 0.3);">99% Confidence</span>',
                    main: `<div class="info-row"><span class="info-label">Medication:</span> <span class="info-value highlight-value">Metformin 500mg</span></div>
                           <div class="info-row"><span class="info-label">Instructions:</span> <span class="info-value">2x daily with meals</span></div>`,
                    safety: `<div class="info-row" style="border:none;"><span class="info-label">Advisory:</span> <span class="info-value alert-value" style="font-size:0.9rem;">Always take with food to avoid gastrointestinal issues. Monitor blood sugar levels.</span></div>`,
                    hasTimeline: true,
                    timeline: `<div class="timeline-item"><span class="time-label">Morning</span><div class="time-action">Metformin 500mg <span class="food-note">During Breakfast</span></div></div>
                               <div class="timeline-item"><span class="time-label">Evening</span><div class="time-action">Metformin 500mg <span class="food-note">During Dinner</span></div></div>`,
                    type: 'pharmacy'
                }
            ];
            // Shuffle pool
            scenarioPool.sort(() => Math.random() - 0.5);
        }
        return scenarioPool.pop();
    }

    function renderResults() {
        const mainContent = document.getElementById('res-extracted-content');
        const safetyContent = document.getElementById('res-safety-content');
        const timelineCard = document.getElementById('card-timeline');
        const timelineContent = document.getElementById('res-timeline');
        const nearbyContent = document.getElementById('res-nearby');
        const titleSpan = document.getElementById('res-title');
        const safetyCard = document.getElementById('card-safety');

        // Reset display
        timelineCard.classList.add('hidden');
        timelineContent.innerHTML = '';
        if (safetyCard) safetyCard.classList.remove('hidden');
        nearbyContent.innerHTML = '';

        const scenario = getNextScenario();

        titleSpan.innerHTML = scenario.title;
        mainContent.innerHTML = scenario.main;
        safetyContent.innerHTML = scenario.safety;

        if (scenario.hasTimeline) {
            timelineCard.classList.remove('hidden');
            timelineContent.innerHTML = scenario.timeline;
        }

        if (scenario.type === 'hospital') {
            nearbyContent.innerHTML = getMockHospitals();
        } else {
            nearbyContent.innerHTML = getMockPharmacies();
        }
    }

    // --- Mock Data Generators ---
    function getMockPharmacies() {
        return `
            <div class="nearby-item">
                <div class="stock-badge">Stock: 92%</div>
                <div class="place-info">
                    <h4>Apollo Pharmacy</h4>
                    <div class="place-meta">⭐ 4.8 • 0.3 miles away • Open Now</div>
                </div>
                <div class="place-action">
                    <a href="https://maps.google.com" target="_blank" class="btn btn-outline btn-micro">Directions</a>
                </div>
            </div>
            <div class="nearby-item">
                <div class="stock-badge" style="background: rgba(234, 179, 8, 0.15); color: #eab308; border-color: rgba(234, 179, 8, 0.3);">Stock: 65%</div>
                <div class="place-info">
                    <h4>Wellness Medicos</h4>
                    <div class="place-meta">⭐ 4.2 • 0.8 miles away • Open Now</div>
                </div>
                <div class="place-action">
                    <a href="https://maps.google.com" target="_blank" class="btn btn-outline btn-micro">Directions</a>
                </div>
            </div>
        `;
    }

    function getMockHospitals() {
        return `
            <div class="nearby-item">
                <div class="stock-badge">Beds: 12 Open</div>
                <div class="place-info">
                    <h4>City General Hospital</h4>
                    <div class="place-meta">⭐ 4.6 • 1.2 miles away • 24/7 ER</div>
                    <div class="place-meta" style="color: var(--primary);">General Medicine, Pathology</div>
                </div>
                <div class="place-action">
                    <a href="https://maps.google.com" target="_blank" class="btn btn-outline btn-micro">Directions</a>
                </div>
            </div>
            <div class="nearby-item">
                <div class="stock-badge" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">Wait: 45m</div>
                <div class="place-info">
                    <h4>Lifeline Diagnostic Center</h4>
                    <div class="place-meta">⭐ 4.5 • 2.5 miles away • Open till 9 PM</div>
                </div>
                <div class="place-action">
                    <a href="https://maps.google.com" target="_blank" class="btn btn-outline btn-micro">Directions</a>
                </div>
            </div>
        `;
    }
    
    function checkImageQuality(imgElement) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgElement.naturalWidth || imgElement.width || 100;
        tempCanvas.height = imgElement.naturalHeight || imgElement.height || 100;
        if (tempCanvas.width === 0 || tempCanvas.height === 0) return true;
        
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0, tempCanvas.width, tempCanvas.height);
        
        try {
            const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
            let totalBrightness = 0;
            let step = 4 * 10; // Check every 10th pixel for performance
            let sampled = 0;
            
            for (let i = 0; i < imageData.length; i += step) {
                // Perceptual brightness calculation
                let brightness = (imageData[i] * 299 + imageData[i+1] * 587 + imageData[i+2] * 114) / 1000;
                totalBrightness += brightness;
                sampled++;
            }
            
            let avgBrightness = totalBrightness / sampled;
            // If the average brightness is < 15 out of 255, it's essentially pitch black
            return avgBrightness >= 15;
        } catch(e) {
            console.error('Canvas error:', e);
            return true; // Fallback to assumed good if CORS blocks pixel reading
        }
    }
});
