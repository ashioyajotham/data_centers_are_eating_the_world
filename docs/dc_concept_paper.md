# Data Centers Are Eating The World 🌍

## A Living Map of Digital Infrastructure

**An open-source, automated mapping project that makes the invisible infrastructure powering our digital lives visible—starting with Kenya, expanding globally.**

---

## 🎯 The Problem

We live in a world increasingly dependent on cloud computing, AI, and digital services. Yet the physical infrastructure behind this digital revolution—massive data centers consuming gigawatts of power—remains largely invisible to the public.

**Key Questions We're Answering:**
- Where exactly are data centers located in Kenya? In Africa? In the world?
- Who owns them? (Local vs. foreign operators)
- How much power do they consume?
- How fast is this infrastructure growing?
- What's the environmental and economic impact?

As AI drives an unprecedented boom in data center construction, we need transparent, accessible data about this critical infrastructure.

---

## 💡 The Vision

**"Data Centers Are Eating The World"** is an interactive, real-time mapping platform that:

✅ **Makes Infrastructure Visible** - Interactive maps showing every data center, its capacity, ownership, and connections

✅ **Tracks Growth Over Time** - Timeline showing how digital infrastructure expanded from 2010 to today

✅ **Reveals Impact** - Visualize power consumption, water usage, and economic investment

✅ **Enables Discovery** - Let researchers, journalists, policymakers, and citizens explore the data

✅ **Stays Current** - Automated scrapers pull data daily from multiple sources

---

## 🌍 Geographic Scope

### **Phase 1: Kenya** (Launch - Q2 2025)
- ~17 existing and planned data centers
- Focus on Nairobi as East Africa's tech hub
- Track the Microsoft-G42 $1B investment
- Map submarine cable connections
- Document foreign vs. local ownership

### **Phase 2: East Africa** (Q3 2025)
- Expand to Uganda, Tanzania, Rwanda, Ethiopia
- Regional connectivity analysis

### **Phase 3: Africa** (Q4 2025)
- Full continental coverage
- Compare North vs. Sub-Saharan development

### **Phase 4: Global** (2026)
- Connect the world's data infrastructure
- Compare emerging vs. developed markets

---

## 🔬 Our Approach: Hybrid Automation + Verification

### **Automated Data Collection**
We scrape and aggregate data from multiple public sources:

**Primary Sources:**
- [DataCenterMap.com](https://www.datacentermap.com/kenya/) - 18 Kenya facilities listed
- [Datacenters.com](https://www.datacenters.com/locations/kenya) - 7 facilities with detailed specs
- [SemiAnalysis](https://semianalysis.com) - Dylan Patel's deep-dive analysis and satellite tracking
- Company announcements (Microsoft, Google, Africa Data Centres, iXAfrica, Safaricom)
- News APIs for real-time announcements
- OpenStreetMap for geocoding

**Scraping Schedule:**
- Weekly: Directory sites
- Daily: News and SemiAnalysis RSS
- Monthly: Company websites
- Real-time: Major announcements

### **Data Processing Pipeline**
1. **Deduplication** - Merge data from multiple sources using fuzzy matching
2. **Geocoding** - Convert addresses to precise coordinates
3. **Validation** - Check against schema, flag inconsistencies
4. **Enrichment** - Add context: power grid connections, submarine cables, population density

### **Human Verification Layer**
- New entries flagged for manual review
- Admin dashboard for approve/reject/edit
- Community contribution system
- Source citation for every data point

---

## 🛠️ Technical Architecture

### **Frontend**
- **React + TypeScript** - Type-safe, modern UI
- **Mapbox GL JS** - Beautiful, performant interactive maps
- **D3.js** - Data visualizations and charts
- **Tailwind CSS** - Clean, responsive design

### **Data Pipeline**
- **Python** - Web scraping (BeautifulSoup, Selenium)
- **FuzzyWuzzy** - Intelligent deduplication
- **Geopy** - Geocoding and coordinate validation
- **node-cron** - Automated scheduling

### **Backend/API**
- **Node.js/Express** - RESTful API
- **PostgreSQL + PostGIS** - Geospatial database
- **Caching layer** - Fast data delivery

### **Data Format**
- **GeoJSON** - Industry standard for geospatial data
- **JSON Schema** - Validated data structure
- **Open Data** - Downloadable, API-accessible

---

## 📊 Key Features

### **MVP (Kenya Launch)**
- ✅ Interactive map with data center locations
- ✅ Filter by: status, capacity, ownership type, operator
- ✅ Detail panel for each facility (specs, sources, history)
- ✅ Basic statistics dashboard
- ✅ Mobile-responsive design
- ✅ Export data (JSON, CSV, GeoJSON)

### **V1.1 - Enhanced Visualization**
- 🔄 Timeline slider (show growth 2010-2025)
- 🔄 Layer system (power grid, fiber routes, submarine cables)
- 🔄 Comparison tools (Kenya vs. neighbors)
- 🔄 Impact calculator ("This data center uses power for X homes")
- 🔄 Share specific views with custom URLs

### **V2.0 - Community Platform**
- 🔮 Story mode (guided tours explaining infrastructure)
- 🔮 Crowdsourced submissions
- 🔮 Public API for developers
- 🔮 Embed widgets for journalism
- 🔮 Alert system for new announcements

---

## 🎨 Design Philosophy

**Inspired by:**
- [Business Insider's US Data Center Map](https://www.businessinsider.com/data-center-locations-us-map-ai-boom-2025-9) - Found 1,240 facilities, exposed AI boom's physical footprint
- [Visual Capitalist's Global Data Center Capacity](https://www.visualcapitalist.com/) - Beautiful data storytelling
- [Microsoft Azure Global Infrastructure](https://azure.microsoft.com/en-us/explore/global-infrastructure) - Interactive 3D globe
- [Submarine Cable Map](https://www.submarinecablemap.com/) - Network visualization

**Our Unique Angles:**
- **Emerging Markets Focus** - Kenya/Africa rarely mapped in depth
- **Ownership Transparency** - Track foreign vs. local control
- **Automated Updates** - Always current, not outdated reports
- **Open Source** - Data and code freely available
- **Storytelling** - Not just dots on a map, but narratives

---

## 📈 Use Cases

### **For Journalists**
- Investigate foreign investment in local infrastructure
- Track environmental impact stories
- Visualize digital divide
- Export maps for articles

### **For Policymakers**
- Understand infrastructure gaps
- Plan connectivity investments
- Monitor foreign ownership
- Energy grid planning

### **For Researchers**
- Study digital infrastructure growth
- Compare regional development
- Economic impact analysis
- Environmental footprint research

### **For Citizens**
- Understand where their data lives
- See infrastructure in their area
- Learn about digital economy
- Hold operators accountable

### **For Developers**
- API access for apps
- Open data for research
- Contribute improvements
- Build derivatives

---

## 🌟 Why This Matters

### **The AI Data Center Boom**
- Business Insider found **1,240 US data centers** at end of 2024
- Northern Virginia alone has **329 facilities**
- **$1B+ investments** announced for Kenya (Microsoft-G42)
- Global capacity racing to meet AI demand

### **Kenya's Digital Opportunity**
- Positioned as East Africa's tech hub
- Multiple submarine cables landing
- Government push for digital economy
- But: Who controls the infrastructure?

### **Global Context**
- Data sovereignty concerns rising
- Environmental impact of power-hungry facilities
- Economic opportunity in hosting
- Digital colonialism debates

**We believe infrastructure this critical should be transparently mapped and publicly understood.**

---

## 🤝 How to Contribute

We welcome contributions at all levels:

### **Data Contributors**
- Submit new data center information
- Verify existing entries
- Update capacity/status changes
- Share local knowledge

### **Developers**
- Improve scrapers (new sources)
- Enhance deduplication algorithms
- Build visualization features
- Optimize performance
- Write documentation

### **Designers**
- UI/UX improvements
- Data visualization concepts
- Mobile experience
- Accessibility enhancements

### **Researchers**
- Validate methodologies
- Suggest data layers
- Write case studies
- Academic partnerships

### **Journalists**
- Use platform for stories
- Provide feedback on features
- Share new announcements
- Co-develop story tools

---

## 📚 Key Resources

### **Project Links**
- **GitHub Repository**: https://github.com/ashioyajotham/data_centers_mapping
- **Live Demo**: Coming Soon (Deploy with Vercel)
- **API Documentation**: See `docs/API.md`
- **Twitter/X**: @ashioyajotham

### **Data Sources**
- [DataCenterMap - Kenya](https://www.datacentermap.com/kenya/)
- [Datacenters.com - Kenya](https://www.datacenters.com/locations/kenya)
- [SemiAnalysis by Dylan Patel](https://semianalysis.com)
- [Submarine Cable Map](https://www.submarinecablemap.com/)
- Kenya Data Center Market Reports

### **Inspiration & Related Work**
- [Business Insider - US Data Center Map (2025)](https://www.businessinsider.com/data-center-locations-us-map-ai-boom-2025-9)
- [Visual Capitalist - Data Center Capacity](https://www.visualcapitalist.com/mapped-the-unequal-distribution-of-global-data-center-capacity/)
- [Microsoft Azure Global Infrastructure](https://azure.microsoft.com/en-us/explore/global-infrastructure)
- [The Uptime Institute - Global Data Center Survey](https://uptimeinstitute.com/)

### **Context Reading**
- Microsoft-G42 $1B Kenya Investment (2024)
- Kenya's 2024-2032 data center market projections ($509M → $733M)
- Dylan Patel's "AI Datacenter Energy Dilemma" series
- Africa Data Centres expansion reports

---

## 🚀 Roadmap

### **Q2 2025 - Kenya Launch**
- Complete Kenya data collection (17+ facilities)
- MVP web platform live
- Basic API available
- Engage first contributors

### **Q3 2025 - Regional Expansion**
- Add East African countries
- Enhanced visualization features
- Community contribution system
- First partnerships (media, research)

### **Q4 2025 - Continental Coverage**
- Pan-Africa data
- Advanced analytics
- Story mode features
- Developer ecosystem

### **2026 - Global Platform**
- Major markets coverage
- Full API suite
- Mobile apps
- Institutional partnerships

---

## 💬 Get Involved

**We're actively seeking:**
- Co-founders and core contributors
- Data partners in Kenya/Africa
- Media partnerships for launch
- Academic collaborators
- Funding for hosting/operations

**Contact:**
- Email: victorashioya@gmail.com
- Twitter/X: @ashioyajotham
- GitHub: https://github.com/ashioyajotham/data_centers_mapping
- LinkedIn: https://linkedin.com/in/ashioyajotham

---

## 📜 License & Philosophy

**Open Source, Open Data**
- Code: MIT License
- Data: CC BY 4.0 (attribution required)
- Goal: Public good, not profit
- Principle: Infrastructure transparency

**We believe:**
- Digital infrastructure is too important to remain invisible
- Data about data centers should be openly accessible
- Emerging markets deserve the same transparency as developed ones
- Community-driven projects can compete with commercial offerings

---

## 🙏 Acknowledgments

Inspired by the pioneering work of:
- Dylan Patel and the SemiAnalysis team
- Business Insider's investigative data journalism
- The open source mapping community
- African tech ecosystem builders

**Created by:**
- **Victor Jotham Ashioya** - Project Creator & Lead Developer

**Special thanks to contributors** (list will grow!):
- [Open for contributors - join us!]

---

**Built with ❤️ to make digital infrastructure visible**

*Last updated: October 2025*
*Version: 0.1 - Concept Phase*

---

## 📞 Questions?

**Why Kenya first?**
Growing tech hub, manageable scope, significant foreign investment, underreported in global media.

**Why not use existing databases?**
Commercial databases cost $2,000+, aren't real-time, don't focus on emerging markets, aren't open/accessible.

**How do you ensure accuracy?**
Multi-source aggregation, automated deduplication, human verification layer, public source citations, community corrections.

**Can I use this data for my project?**
Yes! Open data (CC BY 4.0). Just attribute the project.

**How can I help right now?**
Star the GitHub repo, share this concept, contribute Kenya data you know, join our community discussions.

---

*"The future is already here, it's just unevenly distributed. Let's map it."*