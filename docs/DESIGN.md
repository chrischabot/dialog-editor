# ElevenLabs Design System

This document provides a comprehensive guide to the ElevenLabs design system as implemented in this project. Follow these guidelines to create pages that match the ElevenLabs visual style exactly.

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Colors](#colors)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Border Radius](#border-radius)
6. [Shadows](#shadows)
7. [Animations](#animations)
8. [Layout Utilities](#layout-utilities)
9. [Components](#components)

---

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Primitives**: Radix UI
- **Icons**: Lucide React
- **Toast Notifications**: Sonner
- **Drawer/Sheet**: Vaul
- **Utilities**: clsx, tailwind-merge, class-variance-authority (CVA)

---

## Colors

### Semantic Colors

The design system uses semantic color tokens that automatically adapt to light/dark themes.

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `background` | `hsl(0 0% 100%)` - White | `hsl(240 3% 6%)` - Near black | Page backgrounds, card backgrounds |
| `foreground` | `hsl(240 3% 6%)` - Near black | `hsl(0 0% 100%)` - White | Primary text, icons, primary buttons |

```tsx
// Usage in Tailwind
<div className="bg-background text-foreground" />
```

### Gray Alpha Scale (Transparency-based)

The gray-alpha scale uses transparency to create overlays that work on any background. In light mode, it uses the `darken` scale; in dark mode, it uses the `lighten` scale.

| Token | Light Mode Value | Usage |
|-------|------------------|-------|
| `gray-alpha-50` | `rgba(0, 0, 0, 0.02)` | Subtle hover states |
| `gray-alpha-100` | `rgba(0, 0, 23, 0.043)` | Hover backgrounds, secondary badges |
| `gray-alpha-150` | `rgba(0, 0, 29, 0.075)` | Default borders |
| `gray-alpha-200` | `rgba(0, 0, 29, 0.102)` | Input/button borders |
| `gray-alpha-300` | `rgba(0, 0, 25, 0.161)` | Hover borders, scrollbar thumb |
| `gray-alpha-400` | `rgba(0, 0, 23, 0.349)` | Scrollbar hover |
| `gray-alpha-500` | `rgba(0, 0, 17, 0.529)` | Subtle text (`.text-subtle`) |
| `gray-alpha-600` | `rgba(0, 0, 14, 0.643)` | Secondary text |
| `gray-alpha-700` | `rgba(0, 0, 10, 0.714)` | - |
| `gray-alpha-800` | `rgba(0, 0, 4, 0.804)` | - |
| `gray-alpha-900` | `rgba(0, 0, 2, 0.859)` | - |
| `gray-alpha-950` | `rgba(0, 0, 1, 0.89)` | Near-black overlays |

```tsx
// Usage in Tailwind
<div className="border border-gray-alpha-200 hover:border-gray-alpha-300" />
<div className="bg-gray-alpha-100" /> // Subtle background
<p className="text-subtle" /> // Uses gray-alpha-500
```

### Solid Gray Scale

For cases where you need solid colors instead of transparency:

| Token | Value | Usage |
|-------|-------|-------|
| `gray-50` | `hsl(210 20% 98%)` | Lightest backgrounds |
| `gray-100` | `hsl(220 14% 96%)` | Disabled backgrounds |
| `gray-200` | `hsl(220 13% 91%)` | Borders |
| `gray-300` | `hsl(216 12% 84%)` | Scrollbar thumb |
| `gray-400` | `hsl(218 11% 65%)` | Placeholder text, disabled text |
| `gray-500` | `hsl(220 9% 46%)` | Secondary text |
| `gray-600` | `hsl(215 14% 34%)` | - |
| `gray-700` | `hsl(217 19% 27%)` | - |
| `gray-800` | `hsl(215 28% 17%)` | Dark hover (light mode buttons) |
| `gray-900` | `hsl(221 39% 11%)` | - |
| `gray-950` | `hsl(224 71% 4%)` | - |

### Semantic Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `error` | `#dd4949` | Error states, destructive actions |
| `success` | `hsl(142 71% 45%)` | Success states |
| `warning` | `hsl(38 92% 50%)` | Warning states |
| `info` | `hsl(217 91% 60%)` | Informational states |

### Color Scales (Red, Blue, Green, Yellow)

Full 50-950 scales are available for each color:

```tsx
// Examples
<div className="bg-red-500 text-white" />   // Destructive
<div className="bg-green-500 text-white" /> // Success
<div className="bg-blue-500 text-white" />  // Info
<div className="bg-yellow-500 text-white" /> // Warning
```

---

## Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `font-sans` | Inter, system-ui fallbacks | Default body text |
| `font-waldenburg` | Waldenburg, Inter fallback | Brand headings (special use) |

```tsx
<p className="font-sans">Body text</p>
<h1 className="font-waldenburg text-2xl font-bold">Brand Heading</h1>
```

### Font Sizes

ElevenLabs primarily uses `text-sm` (14px) for most UI text:

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Badges, shortcuts, captions |
| `text-sm` | 14px | **Primary UI text**, labels, buttons |
| `text-base` | 16px | Large buttons, some headings |
| `text-lg` | 18px | Dialog titles |
| `text-xl` | 20px | Section headings |
| `text-2xl` | 24px | Page titles |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text, descriptions |
| `font-medium` | 500 | **Most common** - labels, buttons, list items |
| `font-semibold` | 600 | Dialog titles, card titles |
| `font-bold` | 700 | Brand headings |

### Common Typography Patterns

```tsx
// Label
<label className="text-sm text-foreground font-medium">Label</label>

// Description/Helper text
<p className="text-sm text-subtle font-normal">Description text</p>
// OR
<p className="text-sm text-gray-500">Description text</p>

// Dialog title
<h2 className="text-lg font-semibold text-foreground">Dialog Title</h2>

// Card title
<h3 className="text-sm font-medium text-foreground">Card Title</h3>

// Subtle/secondary text
<span className="text-sm text-gray-400">Placeholder</span>
```

---

## Spacing

ElevenLabs uses a consistent spacing scale based on Tailwind's defaults:

### Common Spacing Values

| Class | Value | Common Usage |
|-------|-------|--------------|
| `gap-0.5` | 2px | Tight stacking (label + description) |
| `gap-1` | 4px | Form field groups |
| `gap-1.5` | 6px | Card header gaps, inline elements |
| `gap-2` | 8px | **Most common** - button content, menu items |
| `gap-3` | 12px | Section spacing |
| `gap-4` | 16px | Card padding, major sections |
| `gap-6` | 24px | Large section spacing |
| `gap-8` | 32px | Page-level spacing |

### Padding Patterns

| Pattern | Classes | Usage |
|---------|---------|-------|
| Button padding | `px-3 py-2` or `px-4 py-2` | Standard buttons |
| Input padding | `px-3 py-2` | Form inputs |
| Card padding | `p-4` | Card content |
| Menu item padding | `px-2 py-1.5` | Dropdown items |
| Dialog padding | `p-6` | Modal content |
| Compact padding | `px-1.5 py-2` | Stacked list items |

### Margin Patterns

```tsx
// Negative margin for overlapping borders (stacked lists)
<button className="-mb-px" />

// Section spacing
<div className="mb-1">Label section</div>
<div className="mt-2">Content after tabs</div>
```

---

## Border Radius

ElevenLabs uses rounded corners extensively. The most common value is `rounded-[10px]` (0.625rem).

| Class | Value | Usage |
|-------|-------|-------|
| `rounded` | 4px | Small elements |
| `rounded-md` | 6px | Checkboxes |
| `rounded-lg` | 8px | **Common** - cards, dropdowns, menu items |
| `rounded-[10px]` | 10px | **Most common** - buttons, inputs, stacked list items |
| `rounded-xl` | 12px | Dialogs, larger cards |
| `rounded-2xl` | 16px | Drawers, large containers, textareas |
| `rounded-full` | 9999px | Badges, avatars, switches, pills |

### Usage Examples

```tsx
// Buttons
<button className="rounded-[10px]">Standard Button</button>
<button className="rounded-lg">Small Button</button>

// Inputs
<input className="rounded-[10px]" />

// Cards
<div className="rounded-lg">Card</div>

// Badges
<span className="rounded-full">Badge</span>

// Dialogs
<div className="rounded-xl">Dialog</div>

// Drawers
<div className="rounded-t-2xl">Drawer</div>
```

---

## Shadows

ElevenLabs uses subtle shadows:

| Pattern | Usage |
|---------|-------|
| `shadow-sm` | Active tab, small elevation |
| `shadow-md` | Tooltips |
| `shadow-lg` | Dropdowns, popovers, dialogs, switch thumb |
| `ring-1 ring-inset ring-gray-alpha-200` | Card borders (instead of border) |

```tsx
// Card with ring border (preferred pattern)
<div className="rounded-lg bg-background ring-1 ring-inset ring-gray-alpha-200">
  Card content
</div>

// Dropdown shadow
<div className="shadow-lg border border-gray-alpha-200 rounded-lg">
  Dropdown content
</div>
```

---

## Animations

### Built-in Animation Classes

The design system includes animations for Radix UI components:

```tsx
// Fade in/out
"data-[state=open]:animate-in data-[state=closed]:animate-out"
"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"

// Zoom in/out
"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"

// Slide in from direction
"data-[side=bottom]:slide-in-from-top-2"
"data-[side=left]:slide-in-from-right-2"
"data-[side=right]:slide-in-from-left-2"
"data-[side=top]:slide-in-from-bottom-2"
```

### Transition Durations

| Class | Duration | Usage |
|-------|----------|-------|
| `duration-75` | 75ms | Button hover states |
| `duration-150` | 150ms | **Most common** - inputs, buttons, switches |
| `duration-200` | 200ms | Dialogs, larger animations |

```tsx
<button className="transition-colors duration-150 hover:bg-gray-alpha-100">
  Hover me
</button>
```

---

## Layout Utilities

### Stack (Vertical Flex)

```tsx
<div className="stack">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// With gap
<div className="stack gap-2">...</div>
```

### HStack (Horizontal Flex with Center)

```tsx
<div className="hstack">
  <span>Left</span>
  <span>Right</span>
</div>

// hstack includes align-items: center
```

### Center

```tsx
<div className="center">
  <span>Centered content</span>
</div>
```

### Focus Ring

```tsx
<button className="focus-ring">
  Focusable element
</button>

// Creates: box-shadow: 0 0 0 2px background, 0 0 0 4px foreground
```

### No Scrollbar

```tsx
<div className="overflow-auto no-scrollbar">
  Scrollable without visible scrollbar
</div>
```

---

## Components

### Button

Primary interactive element with multiple variants and sizes.

**Import:**
```tsx
import { Button } from "@/components/ui/button";
```

**Variants:**
| Variant | Description | Usage |
|---------|-------------|-------|
| `default` | Solid foreground background | Primary actions |
| `secondary` | Bordered, transparent background | Secondary actions |
| `ghost` | No border, transparent | Tertiary actions, icon buttons |
| `destructive` | Red background | Delete, dangerous actions |
| `link` | Underlined text | Inline links |

**Sizes:**
| Size | Height | Usage |
|------|--------|-------|
| `default` | 36px (h-9) | Standard buttons |
| `sm` | 32px (h-8) | Compact buttons |
| `lg` | 40px (h-10) | Prominent actions |
| `xl` | 48px (h-12) | Hero CTAs |
| `icon` | 36x36px | Icon-only buttons |
| `icon-sm` | 32x32px | Small icon buttons |
| `icon-lg` | 40x40px | Large icon buttons |

**Examples:**
```tsx
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Settings /></Button>
<Button loading>Loading...</Button>
```

---

### Input

Single-line text input.

**Import:**
```tsx
import { Input } from "@/components/ui/input";
```

**Usage:**
```tsx
<Input placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input disabled placeholder="Disabled" />
```

**Styling Notes:**
- Height: 36px (h-9)
- Border radius: 10px (rounded-[10px])
- Border: gray-alpha-200, hover: gray-alpha-300
- Focus: 2px ring with foreground color

---

### Textarea

Multi-line text input.

**Import:**
```tsx
import { Textarea } from "@/components/ui/textarea";
```

**Usage:**
```tsx
<Textarea placeholder="Enter description..." />
<Textarea rows={5} />
```

**Styling Notes:**
- Min height: 80px
- Border radius: 16px (rounded-2xl)
- Padding: px-5 py-4
- Focus: border and ring change to foreground

---

### Label

Form field label.

**Import:**
```tsx
import { Label } from "@/components/ui/label";
```

**Variants:**
| Variant | Style |
|---------|-------|
| `default` | `text-foreground font-medium` |
| `subtle` | `text-subtle font-normal` |

**Usage:**
```tsx
<Label>Username</Label>
<Label variant="subtle">Optional description</Label>

// With form field
<div className="stack gap-1">
  <Label>Email</Label>
  <Input type="email" />
</div>
```

---

### Card

Container for grouped content.

**Import:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
```

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Styling Notes:**
- Uses `ring-1 ring-inset ring-gray-alpha-200` for border (not `border`)
- Border radius: 8px (rounded-lg)

---

### Dialog

Modal dialog for important interactions.

**Import:**
```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
```

**Usage:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description text goes here.
      </DialogDescription>
    </DialogHeader>
    <div>Main content</div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="secondary">Cancel</Button>
      </DialogClose>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Styling Notes:**
- Max width: 32rem (max-w-lg)
- Border radius: 12px (rounded-xl)
- Overlay: black/50 with backdrop blur

---

### Drawer

Bottom sheet for mobile-friendly modals.

**Import:**
```tsx
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
```

**Usage:**
```tsx
<Drawer>
  <DrawerTrigger asChild>
    <Button>Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>Description</DrawerDescription>
    </DrawerHeader>
    <div className="p-4">Content</div>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild>
        <Button variant="secondary">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

**Styling Notes:**
- Border radius: 16px top (rounded-t-2xl)
- Handle: 100px wide, gray-alpha-200 pill

---

### Select

Dropdown selection component.

**Import:**
```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
```

**Usage:**
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Group Label</SelectLabel>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

---

### DropdownMenu

Context menu or action menu.

**Import:**
```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
```

**Usage:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      Edit
      <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Tabs

Tabbed content navigation.

**Import:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
```

**Usage:**
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

**Styling Notes:**
- TabsList: gray-alpha-100 background, rounded-lg
- Active tab: white background with shadow

---

### Switch

Toggle switch for boolean values.

**Import:**
```tsx
import { Switch } from "@/components/ui/switch";
```

**Usage:**
```tsx
<Switch />
<Switch defaultChecked />
<Switch disabled />

// With label
<label className="flex items-center gap-2">
  <Switch />
  <span className="text-sm">Enable feature</span>
</label>
```

**Styling Notes:**
- Size: 36x20px (w-9 h-5)
- Thumb: 16x16px
- Off: gray-alpha-300 background
- On: foreground background

---

### Checkbox

Checkable input for multiple selections.

**Import:**
```tsx
import { Checkbox } from "@/components/ui/checkbox";
```

**Usage:**
```tsx
<Checkbox />
<Checkbox defaultChecked />

// With label
<label className="flex items-center gap-2">
  <Checkbox id="terms" />
  <span className="text-sm">Accept terms</span>
</label>
```

---

### Badge

Status indicator or tag.

**Import:**
```tsx
import { Badge } from "@/components/ui/badge";
```

**Variants:**
| Variant | Style |
|---------|-------|
| `default` | Foreground bg, background text |
| `secondary` | gray-alpha-100 bg, foreground text |
| `outline` | Transparent bg, gray-alpha-200 border |
| `destructive` | red-500 bg |
| `success` | green-500 bg |
| `warning` | yellow-500 bg |

**Usage:**
```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="success">Success</Badge>
```

---

### Tooltip

Hover information popup.

**Import:**
```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
```

**Usage:**
```tsx
// TooltipProvider must wrap your app (usually in layout)
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <HelpCircle />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      Helpful information
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Styling Notes:**
- Background: foreground color
- Text: background color (inverted)
- Border radius: 8px (rounded-lg)

---

### Popover

Floating content panel.

**Import:**
```tsx
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
```

**Usage:**
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="secondary">Open</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="stack gap-4">
      <h4 className="text-sm font-medium">Popover Title</h4>
      <p className="text-sm text-gray-500">Content here</p>
    </div>
  </PopoverContent>
</Popover>
```

---

### Slider

Range input slider.

**Import:**
```tsx
import { Slider } from "@/components/ui/slider";
```

**Usage:**
```tsx
<Slider defaultValue={[50]} max={100} step={1} />
<Slider defaultValue={[25, 75]} max={100} /> // Range
```

**Styling Notes:**
- Track: 6px height, gray-alpha-200
- Range: foreground color
- Thumb: 16px, white with shadow

---

### ScrollArea

Custom scrollable container.

**Import:**
```tsx
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
```

**Usage:**
```tsx
<ScrollArea className="h-72">
  <div className="p-4">
    {/* Long content */}
  </div>
</ScrollArea>

// Horizontal scroll
<ScrollArea className="w-96">
  <div className="flex gap-4">
    {/* Wide content */}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>
```

---

### Separator

Visual divider.

**Import:**
```tsx
import { Separator } from "@/components/ui/separator";
```

**Usage:**
```tsx
<Separator /> // Horizontal
<Separator orientation="vertical" className="h-6" />
```

---

### StackedList

Bordered list of selectable items (ElevenLabs pattern).

**Import:**
```tsx
import { StackedList, StackedListItem, StackedListAddButton } from "@/components/ui/stacked-list";
```

**Usage:**
```tsx
<StackedList>
  <StackedListItem
    icon={<Avatar />}
    badge={<Badge variant="secondary">Primary</Badge>}
  >
    Eric
  </StackedListItem>
  <StackedListItem muted>
    Sarah
  </StackedListItem>
  <StackedListAddButton icon={<CirclePlus />}>
    Add voice
  </StackedListAddButton>
</StackedList>
```

**Styling Notes:**
- Items overlap with `-mb-px`
- First item: rounded-t-[10px]
- Last item: rounded-b-[10px]
- Chevron right indicator by default

---

### Carousel

Horizontal scrolling container.

**Import:**
```tsx
import { Carousel, CarouselItem } from "@/components/ui/carousel";
```

**Usage:**
```tsx
<Carousel>
  <CarouselItem className="w-64">Card 1</CarouselItem>
  <CarouselItem className="w-64">Card 2</CarouselItem>
  <CarouselItem className="w-64">Card 3</CarouselItem>
</Carousel>
```

**Styling Notes:**
- Uses snap-x snap-mandatory
- Navigation arrows appear on hover
- Uses no-scrollbar utility

---

### Toaster (Sonner)

Toast notifications.

**Import:**
```tsx
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
```

**Setup (in layout):**
```tsx
<Toaster />
```

**Usage:**
```tsx
toast("Event has been created");
toast.success("Successfully saved!");
toast.error("Something went wrong");
toast.loading("Loading...");
```

---

## Common Patterns

### Form Field Group

```tsx
<div className="stack gap-1">
  <div className="stack gap-0.5 mb-1">
    <Label>Field Label</Label>
    <p className="text-sm text-subtle font-normal">Helper text</p>
  </div>
  <Input placeholder="Enter value..." />
</div>
```

### Action Bar

```tsx
<div className="flex items-center justify-end gap-2 p-3 bg-gray-50 border-t rounded-b-2xl">
  <Button variant="secondary">Cancel</Button>
  <Button>Save</Button>
</div>
```

### Page Header

```tsx
<div className="flex items-center justify-between h-10 mb-6">
  <h1 className="font-waldenburg text-2xl font-bold">Page Title</h1>
  <div className="flex items-center gap-2">
    <Button variant="secondary">Secondary</Button>
    <Button>Primary</Button>
  </div>
</div>
```

### Settings Section

```tsx
<div className="stack gap-6">
  <div className="stack gap-1">
    <div className="flex gap-2 mb-1">
      <div className="grow stack justify-center gap-0.5">
        <Label>Setting Name</Label>
        <p className="text-sm text-subtle font-normal">Description</p>
      </div>
      <div className="shrink-0">
        <Button variant="secondary" size="icon-sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
    <StackedList>
      <StackedListItem>Item 1</StackedListItem>
      <StackedListItem>Item 2</StackedListItem>
    </StackedList>
  </div>
</div>
```

---

## Theme Switching

The design system supports light and dark themes via the `data-theme` attribute on the HTML element.

**Using the ThemeProvider:**

```tsx
import { useTheme } from "@/components/theme-provider";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
```

---

## Best Practices

1. **Use semantic colors** (`foreground`, `background`, `gray-alpha-*`) instead of hardcoded colors for theme compatibility.

2. **Prefer `text-sm font-medium`** for most UI text - this is the ElevenLabs standard.

3. **Use `rounded-[10px]`** for buttons and inputs, `rounded-lg` for cards and dropdowns.

4. **Use `gray-alpha-200`** for borders, `gray-alpha-300` for hover states.

5. **Use `duration-150`** for most transitions.

6. **Use the `stack` utility** for vertical layouts instead of manual flex setup.

7. **Use `ring-1 ring-inset ring-gray-alpha-200`** for card borders instead of `border`.

8. **Group form fields** with `stack gap-1` and use `stack gap-0.5 mb-1` for label + description.

9. **Use `gap-2`** as the default spacing between inline elements.

10. **Always include `focus-ring`** class on interactive elements for accessibility.
