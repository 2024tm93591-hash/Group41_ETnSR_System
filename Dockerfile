# ============================================
# 1️⃣ Use an official lightweight Python image
# ============================================
FROM python:3.13-slim

# ============================================
# 2️⃣ Set working directory inside the container
# ============================================
WORKDIR /app

# ============================================
# 3️⃣ Copy dependency file and install packages
# ============================================
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ============================================
# 4️⃣ Copy the entire application code
# ============================================
COPY . .

# ============================================
# 5️⃣ Set environment variables for Flask
# ============================================
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

# ============================================
# 6️⃣ Expose the Flask port
# ============================================
EXPOSE 5000

# ============================================
# 7️⃣ Command to run the Flask app
# ============================================
CMD ["python", "app.py"]
