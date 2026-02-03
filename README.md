# Murder Mystery Board

An interactive murder mystery cork board with red wire connections. Create suspects, add testimonials, connect people, and build a timeline of events.

## Features

- **Cork Board Interface**: Realistic cork board background with pins
- **Draggable Person Cards**: Add suspects, witnesses, victims, and other people involved
- **Red Wire Connections**: Connect people with red wires (like a detective board)
- **Testimonials**: Add and manage testimonials for each person
- **Timeline**: Create a chronological timeline of events
- **Local Storage**: All data is automatically saved to your browser

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically http://localhost:5173)

## Usage

### Adding People
1. Click "Add Person" in the sidebar
2. Enter their name, role (Suspect, Witness, Victim, etc.), description, and choose a color
3. Click "Add" to place them on the board

### Editing People
1. Click on a person card on the board to select them
2. Edit their information in the sidebar
3. Add testimonials by typing and clicking "Add Testimonial"

### Connecting People
1. Select a person card
2. Click "+ Add Connection" in the sidebar
3. Choose another person to connect to
4. Optionally add a label (e.g., "Saw together", "Alibi", etc.)
5. A red wire will connect the two people on the board

### Creating Timeline Events
1. Switch to the "Timeline" tab in the sidebar
2. Enter a time and description
3. Click "Add Event"
4. Events are automatically sorted chronologically

### Moving Cards
- Click and drag any person card to reposition it on the board
- Cards stay within the board boundaries

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.




