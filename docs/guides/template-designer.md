---
title: Template Designer
layout: default
parent: Guides
nav_order: 3
---

# Template Designer Guide

Learn how to use Canary's visual drag-and-drop email editor to create beautiful, responsive email templates.

## Overview

The Template Designer is a visual email builder that lets you create professional email templates without writing code. Features include:

- 19 block types for diverse content
- Drag-and-drop editing
- Live preview with sample data
- Variable support for personalization
- Multi-column layouts
- PDF template support

---

## Getting Started

### Creating a New Template

1. Navigate to **Templates** in the sidebar
2. Click **Create Template**
3. Choose between **Email Template** or **PDF Template**
4. Enter a name and optional description
5. Start designing in the visual editor

### Template Types

| Type          | Description                                           |
| ------------- | ----------------------------------------------------- |
| Email         | Standard email templates for transactional or marketing emails |
| PDF           | Templates designed for PDF generation and attachments |

---

## Block Types

Canary provides 19 block types organized into categories:

### Basic Blocks

| Block     | Description                                     |
| --------- | ----------------------------------------------- |
| Heading   | H1, H2, or H3 headings with customizable styling |
| Text      | Rich text content with HTML support             |
| Button    | Call-to-action buttons with customizable styles |
| Image     | Images with optional link and alignment         |
| Divider   | Horizontal line separator                       |
| Spacer    | Vertical spacing element                        |

### Layout Blocks

| Block            | Description                                    |
| ---------------- | ---------------------------------------------- |
| Container        | Wrapper for grouping blocks with background   |
| 2/3 Columns      | Multi-column layout for side-by-side content  |

### Content Blocks

| Block        | Description                                      |
| ------------ | ------------------------------------------------ |
| Avatar       | Circular or square profile images                |
| Quote        | Styled blockquote with author attribution        |
| List         | Bulleted or numbered lists                       |
| Table        | Data tables with headers and striped rows        |
| Code         | Syntax-highlighted code blocks                   |
| Badge        | Small labels or tags                             |
| Icon         | Decorative icons with customizable size/color   |

### Media Blocks

| Block        | Description                                      |
| ------------ | ------------------------------------------------ |
| Video        | Video thumbnail with play button link           |
| Social Icons | Social media icon links                          |

### Advanced Blocks

| Block  | Description                                          |
| ------ | ---------------------------------------------------- |
| HTML   | Custom HTML for advanced layouts                     |
| Chart  | Data visualizations (bar, line, pie, area, doughnut) |

---

## Using the Chart Block

The Chart block allows you to embed data visualizations in your emails. Charts are rendered as images for email compatibility.

### Chart Types

| Type     | Best For                            |
| -------- | ----------------------------------- |
| Bar      | Comparing categories                |
| Line     | Trends over time                    |
| Area     | Volume/quantity over time           |
| Pie      | Parts of a whole                    |
| Doughnut | Parts of a whole (with center hole) |

### Static Data

Define chart data directly in the editor:

1. Add a Chart block to your template
2. Select **Static** as the data source
3. Enter labels (e.g., "Jan", "Feb", "Mar")
4. Add datasets with values

```json
{
  "labels": ["Jan", "Feb", "Mar", "Apr"],
  "datasets": [
    { "name": "Sales", "values": [100, 150, 120, 180] },
    { "name": "Revenue", "values": [80, 120, 100, 160] }
  ]
}
```

### Dynamic Data

Use variables to inject chart data at send time:

1. Add a Chart block
2. Select **Dynamic** as the data source
3. Enter a variable name (e.g., `chartData`)
4. Pass the data when sending the email

**Template Variable:**

```
{{chartData}}
```

**API Request:**

```json
{
  "templateId": "monthly-report",
  "to": "user@example.com",
  "variables": {
    "chartData": {
      "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
      "datasets": [
        { "name": "Users", "values": [250, 320, 290, 410] }
      ]
    }
  }
}
```

### Chart Customization

| Option          | Description                            |
| --------------- | -------------------------------------- |
| Title           | Chart title displayed above            |
| Colors          | Color palette for datasets             |
| Legend          | Show/hide legend and position          |
| Grid Lines      | Show/hide background grid              |
| Axis Labels     | Labels for X and Y axes                |
| Width/Height    | Chart dimensions in pixels             |

---

## Template Variables

Use Handlebars syntax to add personalization:

### Basic Variables

```
Hello {{name}},

Thank you for your order #{{orderNumber}}.
```

### Nested Objects

```
Your order total: {{order.total}}
Shipping to: {{order.address.city}}
```

### Conditionals

```handlebars
{{#if isPremium}}
Thank you for being a premium member!
{{/if}}
```

### Loops

```handlebars
{{#each items}}
- {{this.name}}: {{this.price}}
{{/each}}
```

### Testing Variables

Use the **Sample Data** panel to test your template with real data:

1. Click the **Variables** tab in the inspector
2. Enter JSON sample data
3. Toggle **Show Variables** to see rendered output

```json
{
  "name": "John Doe",
  "orderNumber": "ORD-12345",
  "items": [
    { "name": "Widget", "price": "$10.00" },
    { "name": "Gadget", "price": "$25.00" }
  ]
}
```

---

## Email Styles (Global Settings)

Configure global styles that apply to the entire email:

| Setting         | Description                              |
| --------------- | ---------------------------------------- |
| Backdrop Color  | Background color behind the email        |
| Canvas Color    | Main email body background               |
| Text Color      | Default text color                       |
| Font Family     | Global font (9 options available)        |

### Available Fonts

- Modern Sans (Inter)
- Book Sans (Open Sans)
- Organic Sans (Quicksand)
- Geometric Sans (Poppins)
- Heavy Sans (Oswald)
- Rounded Sans (Nunito)
- Modern Serif (Merriweather)
- Book Serif (Lora)
- Monospace (Roboto Mono)

---

## Block Styling

Each block can be individually styled:

### Padding

Control spacing around block content:
- Top, Bottom, Left, Right padding
- Values in pixels

### Background

Set block-level background colors.

### Text Alignment

Left, center, or right alignment for text blocks.

### Block-Specific Styles

Each block type has additional styling options:

**Button:**
- Button color
- Text color
- Style (rectangle, rounded, pill)
- Size (x-small to large)
- Full width toggle

**Image:**
- Content alignment
- Link URL
- Alt text

**Divider:**
- Line color
- Line height

---

## Preset Templates

Speed up template creation with preset sections:

| Preset      | Description                          |
| ----------- | ------------------------------------ |
| Header      | Logo + navigation                    |
| Hero        | Large image + heading + CTA          |
| CTA         | Highlighted call-to-action section   |
| Social      | Social media links                   |
| Footer      | Standard email footer                |
| Testimonial | Customer quote section               |

To use a preset:
1. Click the **Presets** tab in the block menu
2. Click on a preset to add it to your template
3. Customize the content as needed

---

## Preview and Testing

### Live Preview

The right panel shows a live preview of your email. Toggle between:
- **Desktop** view
- **Mobile** view (responsive preview)

### Sample Data Preview

1. Add sample data in the Variables panel
2. Click **Show Variables** to see personalized preview
3. Verify all variables render correctly

### Send Test Email

1. Click **Test Send** button
2. Enter a recipient email address
3. Optionally modify test variables
4. Click **Send Test**

The test email will be sent with `[TEST]` prefix in the subject.

---

## Version Control

Templates support versioning for change tracking:

### Creating Versions

Click **Create Version** to snapshot the current template state. Optionally name the version (e.g., "Before redesign").

### Restoring Versions

1. Click the version history dropdown
2. Select a previous version
3. Click **Restore** to revert to that version

---

## Best Practices

### Email Design

1. **Keep it simple** - Fewer blocks load faster and render better
2. **Use web-safe colors** - Stick to standard colors for consistency
3. **Optimize images** - Use compressed images with absolute URLs
4. **Test across clients** - Preview in multiple email clients
5. **Mobile-first** - Design for mobile, then adjust for desktop

### Variables

1. **Provide defaults** - Handle missing variables gracefully
2. **Test thoroughly** - Use sample data to verify all paths
3. **Document variables** - List required variables in template description

### PDF Templates

1. **Use fixed widths** - 600-800px works well for print
2. **Avoid interactive elements** - Links won't work in PDFs
3. **Consider page breaks** - Long content may span multiple pages
4. **Test rendering** - Preview PDF output before production use

---

## Keyboard Shortcuts

| Shortcut | Action                     |
| -------- | -------------------------- |
| `Ctrl+S` | Save template              |
| `Ctrl+Z` | Undo                       |
| `Ctrl+Y` | Redo                       |
| `Delete` | Delete selected block      |
| `↑/↓`    | Navigate between blocks    |
