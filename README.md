# LupusInTab 🐺

A modern, web-based implementation of the classic "Lupus in Tabula" (Werewolf) game built with Vue 3 and TypeScript.

![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)

## 🎮 Game Overview

LupusInTab is a social deduction game where players take on different roles and try to achieve their team's win condition. The game features:

- **25+ Unique Roles** with distinct abilities and strategies
- **Multiple Teams** including Villagers, Wolves, Aliens, and more
- **Real-time Multiplayer** - play with friends in the same room
- **Modern UI** with responsive design and dark theme
- **Extensible Architecture** - easy to add new roles and features

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/LupusInTab.git
   cd LupusInTab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🌐 App Availability

LupusInTab is available on multiple platforms:

### 🌍 Web App
- **Universal Access**: Play on any device with a modern web browser
- **No Installation Required**: Just visit [https://lupus-in-tabula.vercel.app/](https://lupus-in-tabula.vercel.app/)
- **Cross-Platform**: Works on desktop, tablet, and mobile devices
- **Always Updated**: Get the latest features automatically

### 📱 Android App
- **Native Experience**: Optimized for Android devices
- **Offline Play**: Full functionality without internet connection
- **Google Play Store**: Download from [Play Store](https://play.google.com/store/apps/details?id=com.lupus.master&hl=it)
- **Easy Installation**: One-tap install from the Play Store

## 🎯 How to Play

### Basic Game Flow

1. **Setup**: Choose roles and configure game settings
2. **Reveal**: Players discover their roles and see allies
3. **Night Phase**: Roles with night abilities act in order
4. **Day Phase**: Players discuss and vote to lynch someone
5. **Repeat**: Continue until a team wins

### Win Conditions

- **Villagers**: Eliminate all wolves and other threats
- **Wolves**: Equal or outnumber the villagers
- **Aliens**: Achieve their specific win conditions
- **Other Teams**: Various unique win conditions

## 🛠️ Development

### Project Structure

```
src/
├── components/          # Vue components
│   ├── game/           # Game-specific components
│   ├── roles/          # Role-specific components
│   └── ui/             # Reusable UI components
├── composables/        # Vue composables for state management
├── core/               # Core game engine
├── roles/              # Role definitions
├── stores/             # Pinia stores
├── types.ts            # TypeScript type definitions
└── utils/              # Utility functions
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript type checking
```

## 🎭 Adding New Roles

LupusInTab is designed to be easily extensible. Adding new roles is straightforward:

1. **Create Role Definition** - Define the role's properties and behavior
2. **Create UI Components** - Build the prompt and resolve components
3. **Add to Game** - Register the role in the game system
4. **Test** - Ensure the role works correctly

For detailed instructions, see [ROLE_CREATION_GUIDE.md](./docs/ROLE_CREATION_GUIDE.md).

### Quick Example

```typescript
export const myRole: RoleDef = {
  id: 'myRole',
  name: 'My Role',
  team: 'villaggio',
  description: 'Does something useful',
  longDescription: `My Role does something useful.

COME FUNZIONA:
• Does this thing
• Does that thing`,
  actsAtNight: 'alive',
  effectType: 'optional',
  numberOfUsage: 1,
  
  resolve(gameState: any, action: any) {
    // Your role logic here
    return { type: 'myRole_action', data: action.data };
  },
  
  getPromptComponent: componentFactory('MyRole', "prompt"),
  getResolveDetailsComponent: componentFactory('MyRole', "details")
};
```

## 🤝 Contributing

We welcome contributions! Whether you want to:

- 🐛 Fix bugs
- ✨ Add new roles
- 🎨 Improve the UI
- 📚 Update documentation
- ⚡ Optimize performance

Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📚 Documentation

- [Contributing Guide](./docs/CONTRIBUTING.md) - How to contribute to the project
- [Role Creation Guide](./docs/ROLE_CREATION_GUIDE.md) - Detailed guide for creating new roles
- [API Reference](./docs/ROLE_CREATION_GUIDE.md#game-api-reference) - Complete API documentation

## 🎨 Features

### Game Features

- **25+ Unique Roles** with distinct abilities
- **Multiple Teams** and win conditions
- **Role Groupings** for complex interactions
- **Night and Day Phases** with different mechanics
- **Investigation System** for gathering information
- **Protection System** for saving players
- **Custom Win Conditions** for special roles

### Technical Features

- **Vue 3 Composition API** for modern reactive programming
- **TypeScript** for type safety and better development experience
- **Pinia** for state management
- **Vite** for fast development and building
- **Comprehensive Testing** with Vitest
- **ESLint** for code quality
- **Responsive Design** for all screen sizes

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests** for individual functions and components
- **Integration Tests** for role interactions
- **Behavioral Tests** for complete game scenarios
- **Component Tests** for UI components

Run tests with:
```bash
npm run test
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the classic "Lupus in Tabula" game
- Built with modern web technologies
- Community contributions and feedback

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/LupusInTab/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/LupusInTab/discussions)
- **Documentation**: Check the guides in this repository

## 🚀 Roadmap

- [x] Mobile app version (Android available on Play Store)
- [ ] iOS app version
- [ ] Online multiplayer support
- [ ] Role editor interface
- [ ] Tournament mode
- [ ] Statistics and analytics
- [ ] Custom game modes

---

**Happy gaming!** 🎮✨

*Made with ❤️ by the LupusInTab community*