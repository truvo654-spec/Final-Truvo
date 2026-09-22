/**
 * MarketSyde Design System - Theme Tokens
 * Generated directly from Figma Variable Export (Light & Dark Modes)
 */

export const figmaTokens = {
  primitive: {
    prime: {
      0: '#FFFFFF',
      5: '#FEFDFF',
      10: '#FBFBFF',
      15: '#FAFAFF',
      20: '#F7F5FF',
      25: '#F8F7FF',
      50: '#F0F3F7',
      55: '#F0EFFF',
      100: '#ECEEFA',
      200: '#CCC6FB',
      300: '#ABA1F8',
      400: '#8A7AF6',
      500: '#5945F1', // Primary brand purple
      600: '#492CED',
      700: '#3410D5',
      800: '#230EBF',
      900: '#230674',
      950: '#170345',
      1000: '#090119',
    },
    secon: {
      0: '#FFFFFF',
      50: '#FEFEF5',
      100: '#FCFEEB',
      200: '#F0FCB1',
      300: '#E6FA76',
      400: '#DCF73B',
      500: '#CAEB0E', // Secondary volt-lime
      600: '#A9C40B',
      700: '#879E07',
      800: '#667705',
      900: '#323B01',
      950: '#222702',
      1000: '#101401',
    },
    tert: {
      0: '#FFFFFF',
      50: '#FFEAF9',
      100: '#FFD6F3',
      200: '#FE9AE1',
      300: '#FD5DCE',
      400: '#FD35C2',
      500: '#FD02B0', // Tertiary magenta hot-pink
      600: '#DE039D',
      700: '#B60180',
      800: '#8D0164',
      900: '#650047',
      950: '#3D002B',
      1000: '#14000F',
    },
    neut: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A1A1A1',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0A0A0A',
      1000: '#000000',
    },
    silver: {
      0: '#FFFFFF',
      100: '#F1F5F9',
      200: '#E2E8F0', // Brand silver
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
      1000: '#000000',
    },
    stat: {
      success: '#16A34A',
      warning: '#D97706',
      destructive: '#E03434',
      info: '#0284C7',
    },
    opac: {
      prime200_10: 'rgba(204, 198, 251, 0.1)',
      prime200_20: 'rgba(204, 198, 251, 0.2)',
      prime200_30: 'rgba(204, 198, 251, 0.3)',
      prime500_10: 'rgba(89, 69, 241, 0.1)',
      prime500_20: 'rgba(89, 69, 241, 0.2)',
      prime500_30: 'rgba(89, 69, 241, 0.3)',
      prime500_50: 'rgba(89, 69, 241, 0.5)',
      secon500_10: '#FAFDE7',
      secon500_20: 'rgba(202, 235, 14, 0.2)',
      tert500_10: 'rgba(253, 2, 176, 0.1)',
      tert500_20: 'rgba(253, 2, 176, 0.2)',
      tert500_black80: '#330023',
    },
  },
  semantic: {
    light: {
      surface: {
        app: '#FBFBFF', // prime.10
        card: '#FFFFFF', // prime.0
        subtle: '#ECEEFA', // prime.100
        hover: '#F7F5FF', // prime.20
        tint: '#F0F3F7', // prime.50
        brand: '#5945F1', // prime.500
        secondary: '#CAEB0E', // secon.500
        tertiary: '#FD02B0', // tert.500
      },
      border: {
        default: '#CCC6FB', // prime.200
        card: '#ECEEFA', // prime.100
        subtle: '#E2E8F0', // silver.200
        brand: '#5945F1',
        secondary: '#CAEB0E',
        tertiary: '#FD02B0',
      },
      text: {
        primary: '#171717', // neut.900
        secondary: '#737373', // neut.500
        muted: '#A1A1A1', // neut.400
        brand: '#5945F1',
        brandSecondary: '#879E07',
        brandTertiary: '#FD02B0',
      },
    },
    dark: {
      surface: {
        app: '#090119', // prime.1000
        card: '#170345', // prime.950
        subtle: '#230674', // prime.900
        hover: '#2E0AA3', // prime.800
        tint: '#170345',
        brand: '#5945F1',
        secondary: '#CAEB0E',
        tertiary: '#FD02B0',
      },
      border: {
        default: '#3410D5', // prime.700
        card: '#230674', // prime.900
        subtle: '#1E293B',
        brand: '#5945F1',
        secondary: '#CAEB0E',
        tertiary: '#FD02B0',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#CCC6FB', // prime.200
        muted: '#8A7AF6', // prime.400
        brand: '#ABA1F8', // prime.300
        brandSecondary: '#DCF73B',
        brandTertiary: '#FD5DCE',
      },
    },
  },
} as const;

export type ThemeTokens = typeof figmaTokens;
