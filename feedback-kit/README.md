// Feedback Widget Kit - For Build Agent installation

# Feedback Widget Kit

## Installation

```bash
# Copy components to your project
cp -r /path/to/feedback-kit/components/* app/components/
```

## Files Included

```
feedback-kit/
├── components/
│   ├── FeedbackWidget.tsx    # Main widget component
│   └── ui/                    # Required UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── textarea.tsx
├── app/
│   └── api/
│       └── projects/
│           └── [id]/
│               └── feedback/
│                   └── route.ts   # API endpoint
└── lib/
    └── agents/
        └── feedback-agent.ts      # Feedback Agent
```

## Usage

### 1. Add to any page

```tsx
// app/layout.tsx or any page
import { FeedbackWidget } from '@/components/FeedbackWidget';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <FeedbackWidget projectId="your-project-id" />
    </>
  );
}
```

### 2. Customize

```tsx
<FeedbackWidget
  projectId="your-project-id"
  position="bottom-left"  // or 'bottom-right'
  showLabel={false}
  onSubmit={(analysis) => console.log(analysis)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `projectId` | string | required | Project ID for storage |
| `position` | 'bottom-right' \| 'bottom-left' | 'bottom-right' | Widget position |
| `showLabel` | boolean | true | Show help text |
| `onSubmit` | function | undefined | Callback after submit |

## What It Does

1. **Shows** a floating button (💬)
2. **Opens** modal on click
3. **Collects** sentiment + optional comment
4. **Sends** to Feedback Agent API
5. **Shows** thank you confirmation
6. **Agent** analyzes and stores feedback

## API Response

```json
{
  "success": true,
  "output": {
    "sentiment": "positive",
    "score": 8,
    "highlights": ["Great UX", "Fast loading"],
    "concerns": ["Missing dark mode"],
    "suggestions": [
      {
        "item": "Add dark mode",
        "priority": "medium",
        "effort": "low",
        "reasoning": "Frequently requested"
      }
    ],
    "themes": [
      { "name": "UI/UX", "count": 5, "sentiment": "positive" }
    ]
  }
}
```

## Build Agent Integration

When user asks for feedback widget:

```
1. Copy feedback-kit/ to project
2. Add FeedbackWidget to layout
3. Test the widget loads
4. Submit test feedback
5. Verify in dashboard
```

## Next Steps

- [ ] Add emoji reactions (😂 🔥 😍)
- [ ] Add screenshot capture
- [ ] Add email field for follow-up
- [ ] Add NPS scoring (1-10)
