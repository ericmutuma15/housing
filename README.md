# Housing Dashboards - Data Analysis, GIS & Inventory

A full-stack web application for housing data analysis, geographic information system (GIS) visualization, and inventory management. This prototype provides comprehensive dashboards for analyzing housing-related data with interactive maps and detailed inventory tracking.

## Overview

Housing Dashboards is designed to provide insights into housing data through three main modules:

- **Analysis**: Data-driven dashboards with visualizations and KPIs
- **GIS**: Geographic mapping and spatial analysis
- **Inventory**: Housing inventory tracking and management

## Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **TypeScript** 5.2.2 - Type-safe JavaScript
- **Vite** 4.3.9 - Fast build tool and dev server
- **React Router** 6.14.1 - Client-side routing
- **Tailwind CSS** 3.4.7 - Utility-first CSS framework
- **Axios** 1.4.0 - HTTP client for API requests
- **Plotly.js** 2.24.0 - Data visualization library
- **Leaflet** 1.9.4 - Interactive mapping library
- **React-Leaflet** 4.2.1 - React wrapper for Leaflet
- **jsPDF** 2.5.1 - PDF generation
- **html2canvas** 1.4.1 - Screenshot utility

### Backend
- **FastAPI** 0.95.2 - Modern Python web framework
- **Uvicorn** 0.22.0 - ASGI server
- **SQLAlchemy** 2.0.20 - ORM for database operations
- **Pydantic** 1.10.12 - Data validation
- **Passlib** 1.7.4 - Password hashing
- **Python-Jose** 3.3.0 - JWT authentication
- **Faker** 18.9.0 - Data generation for seeding
- **Python-dotenv** 1.0.0 - Environment variable management

## Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd housing
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
```

#### Initialize Database

```bash
python -m app.seed
```

This will create the database and populate it with sample data.

#### Run the Backend Server

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Install TypeScript Definitions (if needed)

```bash
npm install --save-dev @types/react @types/react-dom
```

#### Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Project Structure

```
housing/
├── backend/
│   ├── app/
│   │   ├── auth.py          # Authentication logic
│   │   ├── crud.py          # Database CRUD operations
│   │   ├── database.py      # Database configuration
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── seed.py          # Database seeding script
│   │   └── cleanup.py       # Cleanup utilities
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api.ts           # API client
│   │   ├── App.tsx          # Main component
│   │   ├── main.tsx         # Application entry point
│   │   ├── pages/           # Page components
│   │   │   ├── Analysis.tsx # Analysis dashboard
│   │   │   ├── GIS.tsx      # GIS/mapping page
│   │   │   └── Inventory.tsx # Inventory page
│   │   ├── components/      # Reusable components
│   │   ├── assets/          # Static assets
│   │   └── index.css        # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── README.md
└── package.json
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Data Endpoints
- `GET /api/kpis` - Fetch KPI data
- `GET /api/housing-data` - Fetch housing inventory
- `GET /api/spatial-data` - Fetch geographic data

See the FastAPI documentation at `http://localhost:8000/docs` for the complete API reference.

## Features

- 🔐 **Secure Authentication** - User login and registration with JWT tokens
- 📊 **Data Analysis Dashboard** - Interactive visualizations using Plotly
- 🗺️ **Geographic Mapping** - Interactive maps with Leaflet
- 📦 **Inventory Management** - Track and manage housing inventory
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- 📄 **Export to PDF** - Generate reports with jsPDF

## Development

### Backend Development

- Run tests: `pytest` (if configured)
- API hot-reload is enabled with `--reload` flag
- Check API docs at http://localhost:8000/docs

### Frontend Development

- Hot module replacement (HMR) enabled with Vite
- TypeScript strict mode for type safety
- Tailwind CSS for rapid UI development

## Building for Production

### Backend

```bash
cd backend
# Set environment variables for production
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

The built files will be in the `dist/` directory.

## Troubleshooting

### Issue: TypeScript errors for React

**Solution**: Install type definitions:
```bash
npm install --save-dev @types/react @types/react-dom
```

### Issue: CORS errors

**Solution**: Backend CORS is configured to allow all origins. If issues persist, check that both servers are running.

### Issue: Database errors

**Solution**: 
- Ensure the database file exists or reinitialize with `python -m app.seed`
- Check database URL in `.env`

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

AHP ICT Project

## Support

For issues or questions, please contact the development team.
