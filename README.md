# 🌾 Agriculture Losses – Farm Damage Estimator

**Agriculture Losses** — це повноцінний веб-застосунок для фіксації матеріальних збитків сільськогосподарських господарств, завданих внаслідок надзвичайних ситуацій або збройної агресії. Зручна форма збору даних, прогноз грошових потоків і генерація офіційних PDF-документів.

🌐 **Live site**: [agriculture-losses.vercel.app](https://agriculture-losses-5cqdq9li6-eugenekravchuks-projects.vercel.app)

---

## 🌟 Features

- 📝 Збір інформації про втрати:
  - Техніка, тварини, території, будівлі
- 📈 Прогнозування грошових потоків на базі часових рядів (ARIMA)
- 📊 Інтерактивні графіки доходів та прогнозів
- 📄 Генерація PDF-документів на основі введених даних
- 💬 Мультимовний інтерфейс (українська, англійська)
- 🚀 Швидкий, адаптивний дизайн (Next.js + Tailwind CSS)

---

## 🧩 Tech Stack

### Frontend

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [React Query](https://tanstack.com/query/latest)

### Backend

- [FastAPI](https://fastapi.tiangolo.com/)
- [Uvicorn](https://www.uvicorn.org/)
- [Pydantic](https://docs.pydantic.dev/)
- [statsmodels (ARIMA)](https://www.statsmodels.org/)
- [FPDF2](https://pyfpdf.github.io/fpdf2/)
- PostgreSQL (планується для повної версії)

---

## 🛠️ Installation

### Clone the repo

```bash
git clone https://github.com/eugenekravchuk/agriculture-losses.git
cd agriculture-losses
```

### 📦 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 🐍 Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 🧪 API Documentation

FastAPI automatically generates Swagger and Redoc:

- 🔗 Swagger UI: `https://your-backend-domain/api/docs`
- 🔗 Redoc: `https://your-backend-domain/api/redoc`

---

## 📂 Folder Structure

```bash
agriculture-losses/
├── backend/            # FastAPI backend
│   ├── main.py         # Main application
│   ├── models.py       # Pydantic data models
│   ├── services/       # Time series forecast, PDF generation
├── frontend/           # Next.js frontend
│   ├── app/            # Next.js 14 app directory
│   ├── components/     # Reusable UI components (tables, charts)
│   └── styles/         # Tailwind and custom styles
```

---

## 👥 Team

- [Yuliana Hrynda](https://github.com/YulianaHrynda)
- [Eugene Kravchuk](https://github.com/eugenekravchuk)
- [Roman Pavlosiuk](https://github.com/gllekkoff)
- [Oleksandra Ostafiichuk](https://github.com/OleksandraOO)

---

## 🌐 Live Demo

Try it here:  
🔗 **[https://agriculture-losses.vercel.app](https://agriculture-losses.vercel.app)**

Backend deployed on [Render](https://render.com/](https://agriculture-losses-1llp.onrender.com/)).
