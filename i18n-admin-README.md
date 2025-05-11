# Internationalization (i18n) for EthioKidsLearn Admin Panel

This documentation covers the implementation of the translation system for the EthioKidsLearn Admin Panel.

## Overview

The Admin Panel has been fully internationalized to support three languages:
- English (default)
- Amharic (አማርኛ)
- Afaan Oromo

All static text in the admin screens has been replaced with translation keys that load content dynamically from JSON files.

## Files Structure

The translation system consists of the following components:

### 1. Translation Files

Located in the `translations` directory:
- `en.json` - English translations
- `am.json` - Amharic translations
- `or.json` - Afaan Oromo translations

Each file follows the same JSON structure with nested keys, organized by feature sections.

Example structure:
```json
{
  "admin": {
    "dashboard": "Admin Dashboard",
    "adminTitle": "Administrator",
    "adminSubtitle": "Manage your educational platform",
    "contentTypes": {
      "document": "Document",
      "video": "Video"
    }
  }
}
```

### 2. Language Context

The application uses a React Context API to manage language state:
- `context/LanguageContext.js` - Provides language selection functionality and translation lookup

### 3. Language Selector Component

A reusable language selector component for the Admin Panel:
- `components/AdminLanguageSelector.js` - Provides a UI for switching languages

## How to Use

### 1. Import the Language Context

In each component that needs translation, import the `useLanguage` hook:

```javascript
import { useLanguage } from '../../context/LanguageContext';

function YourComponent() {
  const { translate } = useLanguage();
  
  // Now you can use the translate function
  return <Text>{translate('admin.dashboard')}</Text>;
}
```

### 2. Add the Language Selector

The `AdminLanguageSelector` component can be added to any screen to allow users to switch languages:

```javascript
import AdminLanguageSelector from '../../components/AdminLanguageSelector';

// Then in your JSX
<View>
  <AdminLanguageSelector />
</View>
```

### 3. Adding New Translations

To add new text that needs translation:

1. Add the key to all three translation files (`en.json`, `am.json`, `or.json`)
2. Use a logical nesting hierarchy (e.g., `admin.mySection.myText`)
3. Use the `translate` function to reference the key in your components

## Examples

### Basic Text Translation
```jsx
<Text>{translate('admin.dashboard')}</Text>
```

### Translation with Dynamic Content
```jsx
<Text>
  {pending.length} {pending.length === 1 ? translate('admin.item') : translate('admin.items')}
</Text>
```

### Form Field Labels & Placeholders
```jsx
<Text>{translate('admin.fullName')}</Text>
<TextInput
  placeholder={translate('admin.enterFullName')}
  // ...other props
/>
```

### Alert Messages
```jsx
Alert.alert(
  translate('admin.teacherAccountCreated'),
  translate('admin.accountCreatedSuccessfully')
);
```

## Language Selection Persistence

The selected language is persisted using `AsyncStorage` and automatically loaded when the application starts. This ensures the user's language preference is maintained across sessions.

## RTL Support

The translation system handles Right-to-Left (RTL) languages automatically. Amharic is configured as RTL in the LanguageContext.

## Adding More Languages

To add a new language:

1. Create a new translation file (e.g., `ti.json` for Tigrinya)
2. Add the language definition to the `LANGUAGES` object in `LanguageContext.js`
3. Set the appropriate RTL flag for the language

## Troubleshooting

### Missing Translations
If a translation key is missing, the system will return the key itself as fallback text and print a warning to the console.

### Language Not Loading
If the language isn't changing when selected, check:
1. AsyncStorage permissions
2. Verify the language code matches the keys in the `LANGUAGES` object
3. Check for errors in the console 