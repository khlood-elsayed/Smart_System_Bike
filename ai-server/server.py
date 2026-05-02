# import os
# import cv2
# import pytesseract
# import re
# from flask import Flask, request, jsonify
# from deepface import DeepFace
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)

# current_dir = os.path.dirname(os.path.abspath(__file__))
# pytesseract.pytesseract.tesseract_cmd = os.path.join(current_dir, 'tesseract.exe')

# if not os.path.exists('uploads'):
#     os.makedirs('uploads')

# # ✅ تحويل الأرقام العربية لإنجليزي
# def convert_arabic_to_english_numbers(text):
#     arabic_numbers = '٠١٢٣٤٥٦٧٨٩'
#     english_numbers = '0123456789'
#     translation_table = str.maketrans(arabic_numbers, english_numbers)
#     return text.translate(translation_table)

# def extract_nid(image_path):
#     try:
#         img = cv2.imread(image_path)
        
#         # --- التعديل الجديد: قص منطقة الرقم القومي ---
#         h, w = img.shape[:2]
#         # قص الجزء السفلي حيث يتواجد الرقم
#         roi = img[int(h*0.75):h, int(w*0.1):int(w*0.8)]
        
#         gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
#         gray = cv2.bilateralFilter(gray, 11, 17, 17)
        
#         thresh = cv2.adaptiveThreshold(
#             gray, 255,
#             cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
#             cv2.THRESH_BINARY,
#             11, 2
#         )
        
#         scale = 2
#         thresh = cv2.resize(thresh, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

#         # ✅ استخدام whitelist للأرقام فقط لتقليل الخطأ
#         custom_config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789'
        
#         text = pytesseract.image_to_string(thresh, config=custom_config)

#         print(f"DEBUG - Raw OCR Text: {text.strip()}")

#         # ✅ تحويل الأرقام العربية لإنجليزي
#         text = convert_arabic_to_english_numbers(text)

#         print(f"DEBUG - Converted Text: {text}")

#         # البحث عن 14 رقم
#         match = re.search(r'\d{14}', text.replace(" ", ""))
#         found_nid = match.group(0) if match else None

#         print(f"DEBUG - Extracted NID: {found_nid}")

#         return found_nid

#     except Exception as e:
#         print(f"OCR Error: {e}")
#         return None

# def has_face(img_path):
#     try:
#         faces = DeepFace.extract_faces(
#             img_path,
#             detector_backend='retinaface',
#             enforce_detection=False
#         )

#         if faces and len(faces) > 0:
#             confidence = faces[0].get('confidence', 0)
#             print(f"DEBUG - Face detected with confidence: {confidence}")
#             return confidence > 0.3

#         return False

#     except Exception as e:
#         print(f"Face Detection Error: {e}")
#         return False

# @app.route('/verify', methods=['POST'])
# def verify():
#     print("--- Received Request ---")
#     print("Files found:", list(request.files.keys()))

#     id_front = request.files.get('idFront')
#     id_back = request.files.get('idBack')
#     face_scan = request.files.get('faceScan')
#     selfie_file = request.files.get('selfie')
#     user_provided_nid = request.form.get('nid')

#     if not all([id_front, face_scan, selfie_file, user_provided_nid]):
#         return jsonify({"match": False, "reason": "Missing files or NID"}), 400

#     id_path = os.path.join('uploads', 'temp_id.jpg')
#     id_back_path = os.path.join('uploads', 'temp_id_back.jpg')
#     face_path = os.path.join('uploads', 'temp_face.jpg')
#     selfie_path = os.path.join('uploads', 'temp_selfie.jpg')

#     id_front.save(id_path)

#     if id_back:
#         id_back.save(id_back_path)

#     face_scan.save(face_path)
#     selfie_file.save(selfie_path)

#     # 1️⃣ تحقق الرقم القومي
#     extracted_nid = extract_nid(id_path)

#     if extracted_nid is not None and str(extracted_nid) != str(user_provided_nid):
#         return jsonify({
#             "match": False,
#             "reason": f"ID mismatch! Expected {user_provided_nid}, found {extracted_nid}"
#         })

#     # 2️⃣ & 3️⃣ التأكد من وجود وجه
#     if not has_face(face_path) or not has_face(selfie_path):
#         return jsonify({
#             "match": False,
#             "reason": "No face detected in scan or selfie"
#         })

#     # 4️⃣ مقارنة الوجه
#     try:
#         result = DeepFace.verify(
#             img1_path=selfie_path,
#             img2_path=id_path,
#             detector_backend='retinaface',
#             model_name='VGG-Face',
#             enforce_detection=False
#         )

#         match = result["verified"]
#         distance = result.get("distance", 0)

#         print(f"DEBUG - Match: {match}, Distance: {distance}")

#         if match or distance < 0.4:
#             return jsonify({
#                 "match": True,
#                 "reason": "Face verified against ID"
#             })

#         return jsonify({
#             "match": False,
#             "reason": "Face does not match the person in the ID"
#         })

#     except Exception as e:
#         print(f"Verification Error: {e}")
#         return jsonify({
#             "match": False,
#             "reason": str(e)
#         })

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)
import os
import cv2
import numpy as np
import tensorflow as tf
try:
    import keras
except ImportError:
    keras = None

from flask import Flask, request, jsonify
from deepface import DeepFace
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# =========================
# 📁 Upload folder
# =========================
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =========================
# 🤖 Load AI Model Safely
# =========================
id_classifier = None
load_errors = []

# تأكدي أن هذا الاسم يطابق اسم الملف الناتج من سكريبت التدريب الأخير
MODEL_PATH = "id_model_v2.keras" 

for loader_name, loader in [
    ('keras.models.load_model', getattr(keras.models, 'load_model', None) if keras else None),
    ('tf.keras.models.load_model', tf.keras.models.load_model)
]:
    if loader is None:
        continue

    try:
        id_classifier = loader(MODEL_PATH, compile=False)
        print(f"✅ Egyptian ID Classifier Loaded Successfully with {loader_name}!")
        break
    except Exception as e:
        load_errors.append(f"{loader_name}: {str(e)}")

if id_classifier is None:
    print("❌ Error loading AI model:")
    for err in load_errors:
        print(err)

# =========================
# 🧠 AI ID Detection
# =========================
def is_egyptian_id_ai(image_path):
    try:
        if id_classifier is None:
            print("⚠️ Model not loaded")
            return False

        img = cv2.imread(image_path)
        if img is None:
            print("⚠️ Image not found or invalid")
            return False

        img = cv2.resize(img, (224, 224))
        img = img / 255.0
        img = np.expand_dims(img, axis=0)

        # الحصول على التوقع من الموديل
        prediction = float(id_classifier.predict(img, verbose=0)[0][0])
        print(f"DEBUG - AI ID RAW OUTPUT: {prediction}")

        # =========================
        # 🔥 FIXED LOGIC (UPDATED)
        # =========================
        # بناءً على التجربة الأخيرة، الموديل يعطي 1.0 للبطاقة
        # لذا نعتبرها بطاقة صحيحة إذا كانت القيمة أكبر من 0.5
        is_id = prediction > 0.5 

        print(f"DEBUG - IS_EGYPTIAN_ID: {is_id}")
        return is_id

    except Exception as e:
        print(f"AI Prediction Error: {e}")
        return False


# =========================
# 👤 Face Detection
# =========================
def has_face(img_path):
    try:
        faces = DeepFace.extract_faces(
            img_path,
            detector_backend='retinaface',
            enforce_detection=False
        )

        if faces and len(faces) > 0:
            confidence = faces[0].get('confidence', 0)
            print(f"DEBUG - Face detected confidence: {confidence}")
            return confidence > 0.3

        return False

    except Exception as e:
        print(f"Face Detection Error: {e}")
        return False


# =========================
# 🚀 Verify Endpoint
# =========================
@app.route('/verify', methods=['POST'])
def verify():
    print("--- New Verification Request Received ---")

    id_front = request.files.get('idFront')
    id_back = request.files.get('idBack')
    face_scan = request.files.get('faceScan')
    selfie_file = request.files.get('selfie')

    if not all([id_front, face_scan, selfie_file]):
        return jsonify({
            "match": False,
            "reason": "Missing required image files"
        }), 400

    # مسارات حفظ الصور المؤقتة
    paths = {
        "front": os.path.join(UPLOAD_FOLDER, 'temp_id.jpg'),
        "back": os.path.join(UPLOAD_FOLDER, 'temp_id_back.jpg'),
        "scan": os.path.join(UPLOAD_FOLDER, 'temp_face.jpg'),
        "selfie": os.path.join(UPLOAD_FOLDER, 'temp_selfie.jpg')
    }

    id_front.save(paths["front"])
    if id_back:
        id_back.save(paths["back"])
    face_scan.save(paths["scan"])
    selfie_file.save(paths["selfie"])

    # الخطوة 1: التحقق من أن الصورة المرفوعة هي بطاقة هوية مصرية
    if not is_egyptian_id_ai(paths["front"]):
        return jsonify({
            "match": False,
            "reason": "Front image is not a valid Egyptian ID card"
        })

    # التحقق من الظهر إذا تم رفعه
    if id_back and not is_egyptian_id_ai(paths["back"]):
        return jsonify({
            "match": False,
            "reason": "Back image is not a valid Egyptian ID card"
        })

    # الخطوة 2: التأكد من وجود وجه بشري واضح في الصور الحية
    if not has_face(paths["scan"]) or not has_face(paths["selfie"]):
        return jsonify({
            "match": False,
            "reason": "No clear face detected in camera scans"
        })

    # الخطوة 3: مطابقة وجه السيلفي مع الوجه الموجود في البطاقة
    try:
        result = DeepFace.verify(
            img1_path=paths["selfie"],
            img2_path=paths["front"],
            detector_backend='retinaface',
            model_name='VGG-Face',
            enforce_detection=False
        )

        match = result.get("verified", False)
        distance = float(result.get("distance", 1))

        print(f"DEBUG - Match: {match}, Distance: {distance}")

        # منطق التحقق النهائي بناءً على النتيجة والمسافة (Distance)
        if match or distance < 0.4:
            return jsonify({
                "match": True,
                "reason": "Identity verified successfully"
            })

        return jsonify({
            "match": False,
            "reason": "Face does not match the photo on the ID card"
        })

    except Exception as e:
        print(f"Verification Error: {e}")
        return jsonify({
            "match": False,
            "reason": "AI Processing Error"
        }), 500


# =========================
# 🟢 Run Server
# =========================
if __name__ == '__main__':
    # تشغيل السيرفر على بورت 5000
    app.run(debug=True, port=5000)