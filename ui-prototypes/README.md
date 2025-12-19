# UI Prototypes - Requirement & Effort Tracker MVP

This directory contains HTML mock screen prototypes for the Requirement & Effort Tracker application. These prototypes are based on the UI requirements document and demonstrate all screens, states, and interactions defined in the requirements.

## 📋 Overview

The prototypes use modern UI design principles including:
- **Card-based UI** with clean, organized layouts
- **Gradient backgrounds** for visual appeal
- **Responsive design** that works on desktop and mobile
- **Interactive elements** with JavaScript functionality
- **Consistent styling** across all screens

## 🎨 Design Features

- Modern color palette with purple/blue gradients
- Smooth animations and transitions
- Clean typography using system fonts
- Glassmorphism effects (frosted glass appearance)
- Proper spacing and visual hierarchy
- Accessible color contrast

## 📁 Prototype Files

### Core Screens

1. **01-first-time-setup.html**
   - Initial setup screen for new users
   - Project name input with validation
   - Skip functionality with default project name
   - Demonstrates onboarding flow

2. **02-main-application.html**
   - **✨ Fully Interactive Main Application**
   - Complete working prototype with all features:
     - Add requirements with validation
     - Edit requirements inline
     - Delete requirements with confirmation
     - Toggle requirement status (active/inactive)
     - Edit project name
     - Toggle effort column visibility
     - Clear all data functionality
     - Real-time total effort calculation
     - Local storage persistence
   - **This is the primary prototype for user testing and demonstrations**

### State Variations (For Design Reference)

3. **03-state-project-name-edit.html**
   - Shows project name in edit mode
   - Demonstrates inline editing pattern
   - Save and cancel actions

4. **04-state-requirement-edit.html**
   - Shows a requirement row in edit mode
   - Inline editing with expanded controls
   - Save and cancel actions

5. **05-state-delete-confirmation.html**
   - Shows delete confirmation modal dialog
   - Demonstrates destructive action pattern
   - Warning message and action buttons

6. **06-state-clear-all-confirmation.html**
   - Shows clear all data confirmation modal
   - Stronger warning for permanent data loss
   - Visual warning indicators

7. **07-state-empty-and-inactive.html**
   - Shows two states in one file:
     - Empty state (no requirements)
     - Requirements with inactive items (visual distinction)
   - Demonstrates zero state and status visualization

8. **index.html**
   - Navigation hub linking to all prototypes
   - Quick access to any screen or state
   - Overview of available prototypes

## 🚀 How to Use

### Opening Prototypes

1. **Direct Browser Access:**
   - Open any HTML file directly in a web browser
   - Works offline - no server required
   - All dependencies are inline (no external files needed)

2. **Navigation Hub:**
   - Start with `index.html` for organized access
   - Navigate between prototypes using the index page

### Interactive Features

The main application (`02-main-application.html`) includes:

- **Add Requirements:**
  - Fill in description and effort
  - Press Enter or click "Add Requirement"
  - Validation errors display inline

- **Edit Requirements:**
  - Click "Edit" button on any requirement
  - Modify description or effort
  - Save or cancel changes

- **Toggle Status:**
  - Click checkbox to activate/deactivate
  - Total effort updates automatically
  - Visual styling changes for inactive items

- **Delete Requirements:**
  - Click "Delete" button
  - Confirm in modal dialog
  - Requirement removed permanently

- **Edit Project Name:**
  - Click on project name at top
  - Edit inline and save
  - Cancel to revert changes

- **Toggle Effort Visibility:**
  - Use toggle switch in requirements header
  - Column hides/shows instantly
  - Preference saved to local storage

- **Clear All Data:**
  - Click "Clear All Data" button
  - Confirm destructive action
  - Returns to first-time setup

### Testing on Mobile

1. Open prototypes on mobile browser
2. Responsive design automatically adjusts
3. Touch-friendly controls
4. Optimized layouts for small screens

### Keyboard Shortcuts

- **Enter:** Submit forms, save edits
- **Escape:** Cancel edits, close modals
- **Tab:** Navigate between fields

## 📐 Design Specifications

### Colors

**Primary Gradient:**
- Start: `#667eea` (Purple-Blue)
- End: `#764ba2` (Purple)

**Backgrounds:**
- Cards: `rgba(255, 255, 255, 0.95)` with backdrop blur
- Inactive rows: 50% opacity

**Text:**
- Primary: `#2d3748` (Dark Gray)
- Secondary: `#718096` (Medium Gray)
- Labels: `#4a5568` (Dark Gray)

**Accent Colors:**
- Success/Primary: Purple gradient
- Danger/Delete: `#e53e3e` (Red)
- Borders: `#e2e8f0` (Light Gray)

### Typography

- Font Family: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, etc.)
- Heading sizes: 32px (main), 24px (modal), 20px (section)
- Body text: 16px
- Small text: 14px, 13px

### Spacing

- Card padding: 30-40px (desktop), 20px (mobile)
- Element gaps: 12px (standard), 20px (sections)
- Border radius: 20px (cards), 12px (inputs), 8px (buttons)

### Shadows

- Cards: `0 10px 40px rgba(0, 0, 0, 0.2)`
- Buttons: `0 4px 15px rgba(102, 126, 234, 0.4)`
- Modals: `0 20px 60px rgba(0, 0, 0, 0.3)`

## 🎯 Usage for Design Team

### For Creating High-Fidelity Mockups:

1. **Reference Layouts:**
   - Use prototypes as structural reference
   - Observe component placement and hierarchy
   - Note spacing and proportions

2. **Component Patterns:**
   - Study interactive patterns (inline editing, modals, toggles)
   - Review form validation feedback
   - Observe state transitions

3. **Responsive Behavior:**
   - Test prototypes at different screen sizes
   - Note breakpoints and layout changes
   - Observe mobile optimizations

4. **Visual Enhancements:**
   - Current design is a starting point
   - Feel free to refine colors, typography, spacing
   - Maintain functional requirements while improving aesthetics

### What You Can Change:

- Color schemes and gradients
- Typography choices and sizing
- Spacing, padding, margins
- Component styling and visual effects
- Icons and illustrations
- Animations and transitions

### What to Maintain:

- All functional requirements from UI requirements doc
- Screen structure and navigation flow
- Input fields and validation rules
- Interactive patterns (edit, delete, confirm)
- Responsive layout principles
- Accessibility considerations

## 🔍 Quality Assurance

### Validation Testing:

Test these scenarios in `02-main-application.html`:

1. **Add Requirement Validation:**
   - Empty description → Error message
   - Description > 500 chars → Error message
   - Empty effort → Error message
   - Negative effort → Error message
   - Effort > 1000 → Error message

2. **Total Effort Calculation:**
   - Add active requirements → Total increases
   - Toggle requirement inactive → Total decreases
   - Toggle back to active → Total increases
   - Delete active requirement → Total decreases

3. **Data Persistence:**
   - Add requirements and refresh page → Data persists
   - Toggle visibility and refresh → Preference persists
   - Edit project name and refresh → Name persists

4. **Interaction Flows:**
   - Edit → Cancel → Data unchanged
   - Edit → Save with invalid data → Error shown
   - Delete → Cancel → Requirement preserved
   - Clear All → Cancel → Data preserved

## 📱 Browser Compatibility

Tested and working in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 💡 Tips for Designers

1. **Start with the Main Application:**
   - `02-main-application.html` is the most complete
   - Test all interactions to understand behavior
   - Use as reference for designing other states

2. **Review State Variations:**
   - Static state prototypes (03-07) show specific UI states
   - Useful for documenting each screen variation
   - Reference for edge cases and special states

3. **Check Responsive Behavior:**
   - Resize browser window to see responsive changes
   - Test on actual mobile devices
   - Note breakpoints and layout adjustments

4. **Understand Validation:**
   - Try triggering validation errors
   - Observe error message placement and styling
   - Note when errors appear and disappear

5. **Study Interaction Patterns:**
   - Inline editing pattern (project name, requirements)
   - Modal confirmation pattern (delete, clear all)
   - Toggle pattern (status, visibility)
   - Form submission pattern (add requirement)

## 📞 Questions or Issues?

If you have questions about:
- **Functionality:** Refer to `/docs/ui-requirement.md`
- **Technical Requirements:** Refer to `/docs/requirement.md`
- **Design Decisions:** Document assumptions and present options
- **Implementation Details:** These are prototypes; actual implementation may vary

## 🎨 Next Steps

1. **Review all prototypes** to understand functionality
2. **Test interactive prototype** (`02-main-application.html`)
3. **Create high-fidelity mockups** based on requirements
4. **Refine visual design** while maintaining functionality
5. **Document design decisions** and component patterns
6. **Prepare assets** for development team

---

**Version:** 1.0
**Date:** 2025-12-19
**Status:** Ready for design team review
