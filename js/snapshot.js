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
    function renderResults() {
        const docType = docTypeSelect.value;
        const mainContent = document.getElementById('res-extracted-content');
        const safetyContent = document.getElementById('res-safety-content');
        const timelineCard = document.getElementById('card-timeline');
        const timelineContent = document.getElementById('res-timeline');
        const nearbyContent = document.getElementById('res-nearby');
        const titleSpan = document.getElementById('res-title');
        const dietCard = document.getElementById('card-diet');
        const dietContent = document.getElementById('res-diet-content');
        const safetyCard = document.getElementById('card-safety');

        // Reset
        timelineCard.classList.add('hidden');
        timelineContent.innerHTML = '';
        if (dietCard) dietCard.classList.add('hidden');
        if (dietContent) dietContent.innerHTML = '';
        if (safetyCard) safetyCard.classList.add('hidden');
        nearbyContent.innerHTML = '';

    function renderErrorState() {
        const mainContent = document.getElementById('res-extracted-content');
        const safetyContent = document.getElementById('res-safety-content');
        const timelineCard = document.getElementById('card-timeline');
        const timelineContent = document.getElementById('res-timeline');
        const nearbyContent = document.getElementById('res-nearby');
        const titleSpan = document.getElementById('res-title');
        const dietCard = document.getElementById('card-diet');
        const dietContent = document.getElementById('res-diet-content');
        const safetyCard = document.getElementById('card-safety');

        titleSpan.innerText = 'Document Not Recognized';
        timelineCard.classList.add('hidden');
        timelineContent.innerHTML = '';
        if (dietCard) dietCard.classList.add('hidden');
        if (dietContent) dietContent.innerHTML = '';
        if (safetyCard) safetyCard.classList.remove('hidden');
        nearbyContent.innerHTML = '';

        mainContent.innerHTML = `
            <p style="color:var(--error); font-weight:600;">Error: Image is too dark or empty.</p>
            <p style="color:var(--text-dim); font-size:0.9rem; margin-top:10px;">We couldn't detect any medical information in this image. It appears to be completely black or severely underexposed. Please ensure proper lighting and try capturing again.</p>
        `;
        safetyContent.innerHTML = `
            <p><strong>Action Required:</strong> Please retake the photo with flash enabled or move to a brighter area.</p>
        `;
    }

        if (docType === 'prescription') {
            titleSpan.innerText = 'Simple Prescription Guide';
            mainContent.innerHTML = `
                <div class="info-row"><span class="info-label">Doctor Name:</span> <span class="info-value">Dr. Sarah Jenkins</span></div>
                <div class="info-row"><span class="info-label">Clinic / Hospital:</span> <span class="info-value">City Health Associates</span></div>
                <div class="info-row"><span class="info-label">Date Written:</span> <span class="info-value">Oct 24, 2026</span></div>
                <div style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                    <strong>Your Medicines:</strong>
                    <div class="info-row" style="border:none; padding-bottom:0;"><span class="info-label">1. Amoxicillin (Pill to kill germs/fever)</span> <span class="info-value highlight-value">Take 3 times a day (for 7 days)</span></div>
                    <div class="info-row" style="border:none; padding-bottom:0;"><span class="info-label">2. Ibuprofen (Pill for body pain)</span> <span class="info-value highlight-value">Take 2 times a day (only if pain)</span></div>
                    <div class="info-row" style="border:none; padding-bottom:0;"><span class="info-label">3. Pantoprazole (Pill for stomach gas)</span> <span class="info-value highlight-value">Take 1 time early morning (empty stomach)</span></div>
                </div>
            `;
            
            // Hide Safety Card explicitly as requested
            if (safetyCard) safetyCard.classList.add('hidden');
            
            if (dietCard && dietContent) {
                dietCard.classList.remove('hidden');
                dietContent.innerHTML = `
                    <div class="info-row"><span class="info-label">Stomach Pill Rule:</span> <span class="info-value">Eat this empty stomach in the morning. Wait 30 minutes before eating food.</span></div>
                    <div class="info-row"><span class="info-label">Pain Pill Rule:</span> <span class="info-value">Always eat food first before taking this pill, or it will hurt your stomach.</span></div>
                    <div class="info-row"><span class="info-label">Danger Warning:</span> <span class="info-value alert-value">Do NOT drink alcohol while taking the germ-killing pill, you will feel very sick.</span></div>
                    <div class="info-row" style="margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10px;">
                        <span class="info-label">Best Foods to Eat:</span> 
                        <span class="info-value" style="color: #a7f3d0;">
                            ✅ Eat <b>Yogurt (Curd)</b> because it puts good bugs back in your stomach while taking the germ-killer pill.<br>
                            ✅ Eat <b>Bananas, Rice, or soft foods</b> because they protect your stomach from pain pill burns.<br>
                            ✅ Drink <b>plenty of water</b>.
                        </span>
                    </div>
                `;
            }

            timelineCard.classList.remove('hidden');
            timelineContent.innerHTML = `
                <div class="timeline-item">
                    <span class="time-label">Morning (When you wake up)</span>
                    <div class="time-action">Take Stomach Gas Pill <span class="food-note">Empty Stomach</span></div>
                    <div class="time-action" style="margin-top: 5px;">Wait 30 minutes, then eat breakfast</div>
                    <div class="time-action" style="margin-top: 5px;">Take Germ Pill + Pain Pill <span class="food-note">After Eating</span></div>
                </div>
                <div class="timeline-item">
                    <span class="time-label">Afternoon (Lunch Time)</span>
                    <div class="time-action">Take Germ Pill <span class="food-note">After Eating Food</span></div>
                </div>
                <div class="timeline-item">
                    <span class="time-label">Night (Dinner Time)</span>
                    <div class="time-action">Take Germ Pill + Pain Pill <span class="food-note">After Food</span></div>
                </div>
            `;

            nearbyContent.innerHTML = getMockPharmacies();
        } 
        else if (docType === 'medicine') {
            titleSpan.innerText = 'What is this Medicine?';
            mainContent.innerHTML = `
                <div class="info-row"><span class="info-label">Name on Packet:</span> <span class="info-value highlight-value" style="font-size:1.1rem;">Crocin Advance</span></div>
                <div class="info-row"><span class="info-label">Inside the Pill:</span> <span class="info-value">Paracetamol</span></div>
                <div class="info-row"><span class="info-label">Power Level:</span> <span class="info-value">500mg</span></div>
                <div class="info-row"><span class="info-label">Type:</span> <span class="info-value">Pill / Tablet</span></div>
            `;
            
            safetyContent.innerHTML = `
                <p style="margin-bottom: 10px;"><strong>What does it do?</strong> It brings down your body heat if you have fever. It also reduces body pain or headache.</p>
                <div class="info-row" style="border:none;"><span class="info-label">Dangerous Rule:</span> <span class="info-value alert-value" style="text-align:left; font-size:0.9rem;">Eating too many of these pills can destroy your body's filter (liver). Do not drink alcohol.</span></div>
            `;

            if (safetyCard) safetyCard.classList.remove('hidden');

            nearbyContent.innerHTML = getMockPharmacies();
        }
        else if (docType === 'lab_report') {
            titleSpan.innerText = 'Simple Blood Test Results';
            mainContent.innerHTML = `
                <div style="font-size: 0.9rem; margin-bottom: 15px; color: var(--text-dim);">Full Blood Report:</div>
                <div class="info-row"><span class="info-label">Red Blood:</span> <span class="info-value">Normal <span style="font-size:0.8rem; color:var(--text-dim);">(13.5 g/dL)</span></span></div>
                <div class="info-row"><span class="info-label">White Guard Blood:</span> <span class="info-value alert-value">Too High! <span style="font-size:0.8rem; color:var(--text-dim);">(14,200)</span></span></div>
                <div class="info-row"><span class="info-label">Bleeding Fixers:</span> <span class="info-value">Normal <span style="font-size:0.8rem; color:var(--text-dim);">(250,000)</span></span></div>
                <div class="info-row"><span class="info-label">Fighter Cells:</span> <span class="info-value alert-value">Too High! <span style="font-size:0.8rem; color:var(--text-dim);">(82%)</span></span></div>
            `;
            
            safetyContent.innerHTML = `
                <p style="margin-bottom: 10px;"><strong>What does this mean?</strong> Your body has too many fighter cells (White Guard Blood). This usually means your body is fighting off an infection or germs inside you right now.</p>
                <div class="info-row" style="border:none;"><span class="info-label">Action needed:</span> <span class="info-value alert-value" style="text-align:left; font-size:0.9rem;">You MUST see a doctor and show them this paper. You probably need fever or infection medicine.</span></div>
            `;

            if (safetyCard) safetyCard.classList.remove('hidden');

            nearbyContent.innerHTML = getMockHospitals();
        }
        else {
            titleSpan.innerText = 'Document Analysis';
            mainContent.innerHTML = `
                <p>We could not confidently classify this medical document.</p>
                <p style="color:var(--text-dim); font-size:0.9rem; margin-top:10px;">The AI detected text fragments but they did not match standard prescription or lab structures. Please ensure the image is clear, well-lit, and the text is readable.</p>
            `;
            safetyContent.innerHTML = `
                <p><strong>Status:</strong> Low Confidence. Please re-take the photo or verify directly with a healthcare provider.</p>
            `;
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
