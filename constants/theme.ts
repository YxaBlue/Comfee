/**
 * theme.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for Comfee's color palette and shared
 * design tokens. Import `Colors` or `Theme` wherever you need
 * consistent styling across the app.
 *
 * Usage:
 *   import { Colors, Theme } from "@/constants/theme";
 *   color: Colors.text.primary
 *   backgroundColor: Theme.card
 * ─────────────────────────────────────────────────────────────
 */

// ─── Raw Palette ──────────────────────────────────────────────────────────────
// Named brown/cream tones — reference these via Colors or Theme,
// not directly in component styles.

const palette = {
  // Browns (dark → light)
  brown900: "#3B2A1A", // deepest text / headings
  brown800: "#4B2C11", // rare dark accent
  brown700: "#5A3E28", // day pill text
  brown600: "#6B4F2E", // primary interactive / active states
  brown550: "#7B582F", // submit buttons
  brown500: "#8C6D4F", // secondary text / icons
  brown450: "#9C7A56", // subtle accent
  brown400: "#A26F3B", // section labels / warm accent
  brown350: "#A97C4E", // soft accent
  brown300: "#B08354", // picker hints
  brown200: "#B09070", // placeholder / disabled text
  brown150: "#C4A882", // muted icons
  brown100: "#C8A97A", // avatar fallback icons
  brown75:  "#CBA875", // input borders
  brown50:  "#D2BA94", // dividers / subtle borders
  brown25:  "#D3A66F", // dashed borders (photo picker)

  // Creams / backgrounds (lightest → warmest)
  cream50:  "#FFFAF3", // picker shell bg
  cream100: "#FFF7ED", // card background
  cream150: "#FFF7EA", // active pill text
  cream200: "#FDF6EC", // dropdown bg
  cream300: "#FAF2E6", // avatar circle / cover placeholder
  cream400: "#FFEFD5", // tab content bg
  cream500: "#EDDEC7", // app wrapper bg
  cream600: "#E9D0A2", // dividers / tab bar bg
  cream700: "#EDE0CE", // inactive day pills
  cream800: "#E6D6BE", // secondary cards / amenity grid
  cream900: "#EAD8BC", // close button bg

  // Accent / state
  filterPill: "#F0E5D8", // unselected filter pill bg

  // Danger
  danger:      "#C0392B", // delete / error / report
  dangerLight: "#FDEDEC", // error bg tint
  dangerBorder:"#F5C6C0", // error border

  // Neutral
  black:     "#030200", // near-black divider line
  overlayDark: "rgba(0, 0, 0, 0.28)", // modal backdrop
} as const;

// ─── Semantic Color Tokens ────────────────────────────────────────────────────
// Use these in your components. They describe *purpose*, not appearance.

export const Colors = {
  // ── Text ──
  text: {
    primary:     palette.brown900,   // main body text, headings
    secondary:   palette.brown500,   // meta text, subtitles, icons
    tertiary:    palette.brown200,   // placeholders, disabled
    muted:       palette.brown400,   // section labels, warm accent labels
    inverse:     palette.cream150,   // text on dark backgrounds
    danger:      palette.danger,     // error messages
    link:        palette.brown600,   // tappable text
    dark:        palette.brown700,   // day pill text active
    deep:        palette.brown800,   // rare deep accent
  },

  // ── Backgrounds ──
  bg: {
    app:         palette.cream500,   // root app background
    screen:      palette.cream400,   // main scrollable content
    card:        palette.cream100,   // card / panel surface
    cardAlt:     palette.cream200,   // dropdown / alternate card
    input:       palette.cream100,   // text input fill
    pill:        palette.cream700,   // inactive option pill
    pillFilter:  palette.filterPill, // unselected star filter pill
    subtle:      palette.cream800,   // secondary card / grid item
    placeholder: palette.cream300,   // avatar / cover placeholder
    header:      palette.cream600,   // tab bar / header band
    section:     palette.cream900,   // close button / section accent bg
    picker:      palette.cream50,    // picker shell
    danger:      palette.dangerLight,// error/alert background tint
  },

  // ── Borders ──
  border: {
    default:     palette.cream600,   // standard dividers
    card:        palette.cream600,   // card border
    input:       palette.brown75,    // text input border
    strong:      palette.brown50,    // stronger divider
    pill:        palette.brown50,    // option pill border
    dashed:      palette.brown25,    // photo picker dashed border
    danger:      palette.dangerBorder,
    line:        palette.black,      // full-width section line
  },

  // ── Interactive / Brand ──
  interactive: {
    primary:     palette.brown600,   // buttons, active tabs, selected pills
    primaryDark: palette.brown550,   // submit / CTA buttons
    secondary:   palette.brown500,   // secondary icons, inactive tabs
    accent:      palette.brown400,   // section label color
    accentWarm:  palette.brown350,   // warm hover accent
    muted:       palette.brown300,   // picker hints
    disabled:    palette.brown200,   // disabled state
  },

  // ── Icons ──
  icon: {
    primary:     palette.brown500,   // default icon color
    active:      palette.brown600,   // active/selected icon
    muted:       palette.brown150,   // inactive / closed icons
    inverse:     palette.cream150,   // icon on dark bg
    avatar:      palette.brown100,   // avatar fallback icon
  },

  // ── Stars / Ratings ──
  star: {
    filled:      palette.brown25,    // #C8863A — star fill (kept exact)
    empty:       palette.brown50,    // empty star
  },

  // ── Danger / Destructive ──
  danger: {
    default:     palette.danger,
    light:       palette.dangerLight,
    border:      palette.dangerBorder,
  },

  // ── Overlays ──
  overlay: {
    dark:        palette.overlayDark,
  },
} as const;

// ─── Theme Shortcuts ──────────────────────────────────────────────────────────
// Flat aliases for the most commonly used values — reduces verbosity
// for the most frequent use cases.

export const Theme = {
  // Backgrounds
  appBg:        Colors.bg.app,
  screenBg:     Colors.bg.screen,
  card:         Colors.bg.card,
  headerBg:     Colors.bg.header,
  inputBg:      Colors.bg.input,

  // Text
  textPrimary:  Colors.text.primary,
  textSecondary:Colors.text.secondary,
  textMuted:    Colors.text.tertiary,
  textInverse:  Colors.text.inverse,
  textDanger:   Colors.text.danger,

  // Brand
  primary:      Colors.interactive.primary,
  primaryDark:  Colors.interactive.primaryDark,

  // Borders
  border:       Colors.border.default,
  inputBorder:  Colors.border.input,

  // Danger
  danger:       Colors.danger.default,

  // Fonts
  font: {
    regular:    "SourceSerifPro-Regular",
    bold:       "SourceSerifPro-Bold",
    semibold:   "SourceSerifPro-SemiBold",
  },
} as const;

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type AppColors = typeof Colors;
export type AppTheme = typeof Theme;