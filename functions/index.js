const { onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// ===== دالة تحميل الصور - تخزين في Firestore =====
exports.uploadIdImage = onRequest({ cors: true }, async (req, res) => {
    try {
        const { base64Image, userId, type } = req.body;

        if (!base64Image || !userId || !type) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // حفظ الصورة في Firestore (Base64)
        const docRef = db.collection('users').doc(userId).collection('uploads').doc(type);
        await docRef.set({
            imageData: base64Image,
            uploadedAt: new Date().toISOString(),
            type: type
        });

        res.json({ success: true, downloadURL: `firestore://${userId}/${type}` });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ===== دالة التحقق من الصور =====
exports.verifyIdentity = onRequest({ cors: true }, async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(204).send('');

    try {
        const { action, base64Image, userId, type, selfieUrl, idFrontUrl, userEnteredId } = req.body;

        // إذا كانت action = upload، أرفع الصورة
        if (action === 'upload') {
            if (!base64Image || !userId || !type) {
                return res.status(400).json({ error: "Missing upload fields" });
            }

            const docRef = db.collection('users').doc(userId).collection('uploads').doc(type);
            await docRef.set({
                imageData: base64Image,
                uploadedAt: new Date().toISOString(),
                type: type
            });

            return res.json({ success: true, downloadURL: `firestore://${userId}/${type}` });
        }

        // إذا كانت verify، تحقق من الصور
        if (!selfieUrl || !idFrontUrl) {
            return res.status(400).json({ error: "Missing selfie or ID URL" });
        }

        // إذا كانت الصور من Firestore، احصل عليها
        let selfieBase64 = selfieUrl;
        let idFrontBase64 = idFrontUrl;

        if (selfieUrl.startsWith('firestore://')) {
            const parts = selfieUrl.replace('firestore://', '').split('/');
            const userPath = parts[0];
            const selfieType = parts[1];
            const doc = await db.collection('users').doc(userPath).collection('uploads').doc(selfieType).get();
            selfieBase64 = doc.data()?.imageData;
        }

        if (idFrontUrl.startsWith('firestore://')) {
            const parts = idFrontUrl.replace('firestore://', '').split('/');
            const userPath = parts[0];
            const idType = parts[1];
            const doc = await db.collection('users').doc(userPath).collection('uploads').doc(idType).get();
            idFrontBase64 = doc.data()?.imageData;
        }

        // التحقق عبر Luxand
        const response = await axios.post("https://api.luxand.cloud/v2/verify", {
            photo: selfieBase64,
            id_photo: idFrontBase64,
        }, {
            headers: { "token": "9cd6a68af0e8490dabab8deaac180d22" },
        });

        res.json({ result: response.data.result });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message || "فشل التحقق من الصور" });
    }
});