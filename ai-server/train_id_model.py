import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt

# الحصول على مسار المجلد الحالي للسكريبت
script_dir = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(script_dir, 'my_dataset')

# 1. إعداد محرك قراءة الصور مع تقسيم البيانات (80% تدريب - 20% تحقق)
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

# تجهيز بيانات التدريب
train_generator = datagen.flow_from_directory(
    dataset_path,
    target_size=(224, 224),
    batch_size=32,
    class_mode='binary',
    subset='training'
)

# تجهيز بيانات التحقق
validation_generator = datagen.flow_from_directory(
    dataset_path,
    target_size=(224, 224),
    batch_size=32,
    class_mode='binary',
    subset='validation'
)

# 2. بناء الموديل (FIX مهم)
model = models.Sequential()

# 🔥 مهم: استخدمي Input layer بشكل صحيح (مش Input() منفصل)
model.add(layers.Input(shape=(224, 224, 3)))

model.add(layers.Conv2D(32, (3, 3), activation='relu'))
model.add(layers.MaxPooling2D(2, 2))

model.add(layers.Conv2D(64, (3, 3), activation='relu'))
model.add(layers.MaxPooling2D(2, 2))

model.add(layers.Conv2D(128, (3, 3), activation='relu'))
model.add(layers.MaxPooling2D(2, 2))

model.add(layers.Flatten())
model.add(layers.Dense(128, activation='relu'))
model.add(layers.Dropout(0.5))
model.add(layers.Dense(1, activation='sigmoid'))

# compile
model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

# 3. التدريب
print("🚀 يبدأ التدريب الآن...")
history = model.fit(
    train_generator,
    epochs=10,
    validation_data=validation_generator
)

# 4. حفظ الموديل
model.save('id_model_v2.keras')

print("✅ تم حفظ الموديل بنجاح!")