# Contributing to Data Centers Are Eating The World

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🎯 Ways to Contribute

### 1. Data Contributions
- Submit new data center information
- Verify existing entries
- Update capacity/status changes
- Share local knowledge about facilities

### 2. Code Contributions
- Improve web scrapers
- Enhance deduplication algorithms
- Build new visualization features
- Optimize performance
- Fix bugs
- Write tests

### 3. Design Contributions
- UI/UX improvements
- Data visualization concepts
- Mobile experience enhancements
- Accessibility improvements

### 4. Documentation
- Improve README and docs
- Write tutorials
- Create examples
- Translate content

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+ with PostGIS
- Git

### Setup Development Environment

1. **Fork and clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/data_centers_mapping.git
cd data_centers_mapping
```

2. **Install dependencies**
```bash
# Install Node dependencies
npm run install:all

# Install Python dependencies
cd scraper
pip install -r requirements.txt
```

3. **Set up database**
```bash
# Create database
createdb datacenter_map
psql datacenter_map -c "CREATE EXTENSION postgis;"

# Run migrations
npm run db:setup
npm run db:seed
```

4. **Configure environment**

Create `.env` files in `backend/` and `frontend/`:

**backend/.env**
```env
DATABASE_URL=postgresql://localhost:5432/datacenter_map
PORT=3001
NODE_ENV=development
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3001
VITE_MAPBOX_TOKEN=your_token_here
```

5. **Run the application**
```bash
# Start both frontend and backend
npm run dev
```

## 📝 Development Workflow

### Branch Naming
- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`
- Scraper: `scraper/source-name`

### Commit Messages
Follow conventional commits:
- `feat: add new scraper for X`
- `fix: resolve geocoding error`
- `docs: update README`
- `style: format code`
- `refactor: improve deduplication logic`
- `test: add tests for Y`

### Pull Request Process

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature
```

2. **Make your changes**
- Write clean, readable code
- Follow existing code style
- Add comments where needed
- Update documentation

3. **Test your changes**
```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build

# Scrapers
cd scraper && python main.py
```

4. **Commit and push**
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature
```

5. **Create Pull Request**
- Provide clear description
- Reference related issues
- Include screenshots for UI changes
- Wait for review

## 🧪 Testing Guidelines

### Frontend Testing
- Test on multiple browsers
- Verify mobile responsiveness
- Check accessibility

### Backend Testing
- Test API endpoints
- Verify database operations
- Check error handling

### Scraper Testing
- Verify data extraction
- Test deduplication
- Validate geocoding

## 📋 Code Style

### TypeScript/JavaScript
- Use TypeScript strict mode
- Follow ESLint rules
- Use functional components in React
- Prefer async/await over promises

### Python
- Follow PEP 8
- Use type hints
- Document functions with docstrings
- Handle errors gracefully

### Database
- Use parameterized queries
- Create indexes for performance
- Document schema changes

## 🐛 Bug Reports

When reporting bugs, include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## 💡 Feature Requests

When requesting features:
- Describe the use case
- Explain the benefit
- Suggest implementation if possible
- Consider existing alternatives

## 📊 Adding New Data Sources

To add a new scraper:

1. Create scraper in `scraper/scrapers/`
```python
from .base_scraper import BaseScraper

class NewSourceScraper(BaseScraper):
    def __init__(self):
        super().__init__("Source Name")
    
    def scrape(self):
        # Implementation
        pass
```

2. Add to `scraper/main.py`
```python
from scrapers.newsource_scraper import NewSourceScraper

scrapers = [
    # ... existing scrapers
    NewSourceScraper(),
]
```

3. Test thoroughly
4. Document the source

## 🌍 Geographic Expansion

When adding new regions:

1. Update scrapers to cover new areas
2. Add country/region filters
3. Update documentation
4. Test with local data
5. Verify geocoding accuracy

## ⚖️ License

By contributing, you agree that your contributions will be licensed under:
- **Code**: MIT License
- **Data**: CC BY 4.0

## 🤝 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

## 💬 Communication

- **GitHub Issues**: Bug reports and features
- **Pull Requests**: Code contributions
- **Discussions**: General questions and ideas

## 🙏 Recognition

Contributors will be:
- Listed in README
- Credited in release notes
- Mentioned in project documentation

Thank you for contributing to making digital infrastructure transparent! 🌍

