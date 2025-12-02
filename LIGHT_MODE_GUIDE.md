# Light/Dark Mode Style Guide

Quick reference for consistent light/dark mode styling across DomainLiq.

## Core Pattern

Always use Tailwind's `dark:` prefix for dark mode variants:

```tsx
<div className="dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900">
```

## Common Elements

### Backgrounds
```tsx
// Page backgrounds
className="dark:bg-[#050505] bg-gray-50"

// Card/Container backgrounds
className="dark:bg-white/5 bg-white"
className="dark:bg-black/20 bg-gray-100"
```

### Text Colors
```tsx
// Headings
className="dark:text-white text-gray-900"

// Subtitles/descriptions
className="dark:text-gray-400 text-gray-600"

// Body text
className="dark:text-gray-300 text-gray-700"

// Muted text
className="dark:text-gray-500 text-gray-500"
```

### Borders
```tsx
className="border dark:border-white/10 border-gray-200"
className="border dark:border-white/10 border-gray-300"
```

### Input Fields
```tsx
className="dark:bg-white/5 bg-gray-50 
           border dark:border-white/10 border-gray-300 
           dark:text-white text-gray-900 
           dark:placeholder-gray-600 placeholder-gray-400"
```

### Buttons
```tsx
// Primary (Amber)
className="bg-amber-500 dark:hover:bg-amber-400 hover:bg-amber-600"

// Secondary
className="dark:bg-white/5 bg-gray-100 
           dark:hover:bg-white/10 hover:bg-gray-200"
```

### Alert Boxes

#### Success (Green)
```tsx
className="dark:bg-green-500/10 bg-green-50 
           border dark:border-green-500/30 border-green-300"

// Text
className="dark:text-green-400 text-green-700"
```

#### Warning (Amber)
```tsx
className="dark:bg-amber-500/10 bg-amber-50 
           border dark:border-amber-500/30 border-amber-300"

// Text
className="dark:text-amber-400 text-amber-700"
```

#### Error (Red)
```tsx
className="dark:bg-red-500/10 bg-red-50 
           border dark:border-red-500/30 border-red-300"

// Text
className="dark:text-red-400 text-red-700"
```

### Lists
```tsx
className="list-disc pl-6 dark:text-gray-300 text-gray-700"
```

### Logo
```tsx
// Logo needs black background in light mode
<img src="/logo.svg" className="dark:bg-transparent bg-black rounded p-1" />
```

## Page Template

```tsx
export default function NewPage() {
    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <img src="/logo.svg" alt="DomainLiq" 
                             className="h-8 w-auto cursor-pointer dark:bg-transparent bg-black rounded p-1" />
                    </Link>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">
                    Page Title
                </h1>
                <p className="dark:text-gray-400 text-gray-600 mb-8">
                    Subtitle or description
                </p>

                {/* Content cards */}
                <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-gray-200 rounded-lg p-6">
                    <p className="dark:text-gray-300 text-gray-700">
                        Content goes here
                    </p>
                </div>
            </div>
        </div>
    );
}
```

## Checklist for New Pages

- [ ] Page background: `dark:bg-[#050505] bg-gray-50`
- [ ] All headings have light/dark variants
- [ ] All body text has light/dark variants
- [ ] Input fields have proper backgrounds and borders
- [ ] Buttons have proper hover states
- [ ] Alert boxes use proper color schemes
- [ ] Logo has black background in light mode
- [ ] Lists use `dark:text-gray-300 text-gray-700`
- [ ] Borders use `dark:border-white/10 border-gray-200`

## Testing

Always test in both modes:
1. Toggle between light and dark mode
2. Check text readability and contrast
3. Verify all interactive elements (hover states, focus states)
4. Ensure alert boxes are clearly visible
5. Check that borders are visible but subtle
