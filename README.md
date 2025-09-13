# Lockyn Timer Desktop App

A modern, feature-rich Pomodoro Timer desktop application built with Tauri 2.0, React, and TypeScript. Track your productivity with customizable profiles, detailed activity logging, and comprehensive analytics.

![Pomodoro Timer Screenshot](screenshot.png)

## ✨ Features

### 🕐 Core Timer Functionality

- **Classic Pomodoro Technique**: 25-minute focus sessions with 5-minute short breaks
- **Automatic Session Switching**: Smart transitions between focus and break periods
- **Visual Progress Indicator**: Animated circular progress with real-time updates
- **Session Management**: Start, pause, resume, and reset with intuitive controls

### 👤 Custom Profiles

- **Predefined Profiles**: Work (25/5/15), Reading (45/10/20), Study (30/5/15), Creative (90/15/30)
- **Custom Profile Creation**: Design your perfect timing configuration
- **Profile Management**: Edit, delete, and switch between profiles seamlessly
- **Color Themes**: Personalize each profile with unique colors

### 📊 Activity Tracking

- **Automatic Activity Logging**: Prompts after each focus session
- **Detailed Activity Input**: Description, category, productivity rating (1-5), energy level
- **Daily Activity Logs**: Filterable list view with timestamps and statistics
- **Activity Calendar**: Visual overview of your productivity patterns
- **Historical Analytics**: Weekly, monthly, and yearly statistics

### 🔔 Smart Notifications

- **Audio Alerts**: Customizable sounds for session transitions
- **Desktop Notifications**: System notifications for session completion
- **Volume Control**: Adjustable sound levels for alerts
- **Sound Testing**: Preview different notification sounds

### ⚙️ Advanced Settings

- **Auto-start Sessions**: Automatically begin next timer
- **Always on Top**: Keep window above other applications
- **Minimize to Tray**: Run in background with system tray integration
- **Export/Import**: Backup and restore your data (JSON format)
- **Data Management**: Clear old activities, reset settings

### 🎨 Professional Design

- **Dark Theme**: Modern, eye-friendly dark interface
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Layout**: Optimized for desktop use
- **Accessibility**: Keyboard shortcuts, focus management, screen reader support

## 🚀 Installation

### Download Pre-built Binaries

1. Go to [Releases](https://github.com/ElvinEga/lockyn-timer/releases)
2. Download the appropriate version for your OS:
   - **Windows**: `.msi` installer
   - **macOS**: `.dmg` disk image
   - **Linux**: `.deb` package or `.AppImage`

### Build from Source

#### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://rustup.rs/) (latest stable)
- [Tauri CLI](https://tauri.app/v2/guides/getting-started/prerequisites/)

#### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/ElvinEga/lockyn-timer.git
cd lockyn-timer

# Install dependencies
npm install

# Install Tauri CLI
npm install -g @tauri-apps/cli
```

#### Development

```bash
# Run in development mode
npm run tauri:dev
```

#### Build for Production

```bash
# Build for your current platform
npm run tauri:build

# Build for specific platforms (requires setup)
npm run tauri:build -- --target universal-apple-darwin
npm run tauri:build -- --target x86_64-pc-windows-msvc
npm run tauri:build -- --target x86_64-unknown-linux-gnu
```

## 🎯 Usage

### Getting Started

1. **Launch the App**: The timer starts with the default "Work" profile
2. **Start Focusing**: Click "START" to begin your first 25-minute focus session
3. **Take Breaks**: The app automatically prompts for breaks between sessions
4. **Log Activities**: After each focus session, record what you accomplished

### Creating Custom Profiles

1. Click the profile selector dropdown
2. Click "Create Custom Profile"
3. Set your preferred timing (focus duration, break durations)
4. Choose a color theme and save

### Viewing Analytics

1. Click the activity icon to open the activity view
2. Use the calendar to navigate different dates
3. View daily summaries and statistics
4. Export data for external analysis

### Keyboard Shortcuts

- **Space**: Start/Pause timer
- **Ctrl/Cmd + ,**: Open settings
- **Ctrl/Cmd + R**: Reset timer

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Timer/          # Timer-related components
│   ├── Settings/       # Settings components
│   └── ActivityLog/    # Activity tracking components
├── hooks/              # Custom React hooks
├── stores/             # Context providers
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component

src-tauri/
├── src/                # Rust backend code
├── icons/              # App icons
├── default_profiles.json
├── default_settings.json
└── Cargo.toml          # Rust dependencies
```

### Key Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Tauri 2.0 (Rust)
- **UI Components**: shadcn/ui
- **State Management**: React Context + useReducer
- **Storage**: Tauri filesystem API
- **Build Tool**: Vite

### Adding New Features

1. **Components**: Add React components in `src/components/`
2. **Types**: Define TypeScript interfaces in `src/types/`
3. **Backend**: Add Tauri commands in `src-tauri/src/main.rs`
4. **Styling**: Use Tailwind CSS classes or add custom styles

## 📊 Data Storage

All data is stored locally on your device:

- **Profiles**: `profiles.json` - Timer configurations
- **Activities**: `activities.json` - Session logs and activity data
- **Settings**: `settings.json` - User preferences

Location varies by OS:

- **Windows**: `%APPDATA%\com.yourname.lockyn-timer`
- **macOS**: `~/Library/Application Support/com.yourname.lockyn-timer`
- **Linux**: `~/.local/share/com.yourname.lockyn-timer`

## 🔒 Privacy & Security

- **100% Local Storage**: No data is sent to external servers
- **Offline First**: Works completely offline
- **Secure**: Uses Tauri's secure file system APIs
- **No Tracking**: No analytics or telemetry

## 🐛 Troubleshooting

### Common Issues

#### App Won't Start

- Ensure you have the latest version of Node.js and Rust installed
- Try running `npm install` again
- Check that all dependencies are properly installed

#### No Sound Notifications

- Check system volume and app permissions
- Ensure audio drivers are up to date
- Try the sound test in settings

#### Data Not Saving

- Verify app has write permissions to the data directory
- Check available disk space
- Try exporting and re-importing data

#### Build Fails

- Update Rust: `rustup update`
- Clear cache: `npm run clean`
- Check platform-specific build requirements

### Getting Help

- Check [Issues](https://github.com/ElvinEga/lockyn-timer/issues)
- Create a new issue with detailed error information
- Include your OS and app version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) for the amazing cross-platform framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Pomodoro Technique](https://francescocirillo.com/pages/pomodoro-technique) by Francesco Cirillo
- All the open-source libraries that made this possible

## 📈 Roadmap

- [ ] **Mobile App**: iOS and Android versions
- [ ] **Cloud Sync**: Optional cloud backup and sync
- [ ] **Team Features**: Shared workspaces and team analytics
- [ ] **AI Insights**: Smart productivity recommendations
- [ ] **Integrations**: Calendar, task managers, and productivity tools
- [ ] **Themes**: More customization options
- [ ] **Plugins**: Extensible plugin system

---

**Made with ❤️ for focused work and productivity**
