from bing_image_downloader import downloader

# كلمات بحث لصور عشوائية عشان الموديل يتعلم الفرق
queries = ["mobile phone", "office desk", "human face", "laptop", "empty room"]

for q in queries:
    downloader.download(
        q, 
        limit=40, # هيحمل 40 صورة لكل نوع
        output_dir='my_dataset/not_id', 
        adult_filter_off=True
    )

print("✅ خلصت تحميل صور الـ Not ID!")