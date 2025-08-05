import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const typography = {
    baseFont: {
        fontFamily: 'Sora, sans-serif',
    },
}

const GlobalTheme = createTheme({
    palette: {
        mode: 'light',

        general: {
            bodyTxt: '#0E1D42',
            grayDark: '#dfdfdf',
            grayLight: '#F3F6F5',
            grayLighter: '#f5f5f5',
            grayLightest: '#D9D9D9'
        },

        primary: {
            main: '#d99f59',
            light: '#f9d8af',
            dark: '#eb8000',
        },

        secondary: {
            main: '#0e1d42',
            dark: '#282828',
            darker: '#0E68A9',
            light: '#979797',
            lighter: '#F3F3F3',
            lightest: '#B6B6B6',
        },

        error: {
            main: '#EC1C24'
        },

        warning: {
            main: '#FFC700',
            light: '#FFF7F0'
        },

        contrastThreshold: 3,

        shape: {
            borderRadius: 2
        }
    },

    typography: {
        ...typography.baseFont,

        h1: {
            fontFamily: 'inherit',
            fontSize: '3rem',
        },
        h2: {
            fontFamily: 'inherit',
            fontSize: '2.25rem'
        },
        h3: {
            fontSize: '1.5rem'
        },
        h4: {
            fontSize: '1.125rem'
        },
        h5: {
            fontSize: '1.375rem'
        },
        subtitle1: {
            fontSize: '.875rem',

            '@media (min-width: 1200px)': {
                fontSize: '1rem'
            }
        },

        subtitle2: {
            fontSize: '.75rem',
            '@media (min-width: 1200px)': {
                fontSize: '.875rem'
            }
        },

        xLarge: {
            fontSize: '2.5rem',

            '@media (min-width: 1200px)': {
                fontSize: '6rem',
            }
        }

    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 50,
                    padding: '10px 20px 8px 20px',
                }
            }
        },

        MuiTable: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: '#F3F6F5',
                    boxShadow: '0 0 1px 0 rgba(0, 0, 0, 0.9)',
                }
            }
        }

    }
})

// Apply responsive font sizes
const ResponsiveGlobalTheme = responsiveFontSizes(GlobalTheme);

export { GlobalTheme, ResponsiveGlobalTheme };