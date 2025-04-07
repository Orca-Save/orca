import { ThemeConfig } from 'antd';

const shadow = '0 4px 5px rgba(0, 0, 0, 0.25)';

export const defaultButton = {
  defaultBg: '#cfcfcf',
  defaultHoverColor: 'black',
  defaultShadow: shadow,
  defaultBorderColor: 'rgb(207, 207, 207)',
  defaultHoverBorderColor: 'rgb(207, 207, 207)',
  primaryShadow: shadow,
};

export const antdDefaultButton = {
  defaultBg: '#FFFFFF',
  defaultHoverColor: '#4096FF',
  defaultShadow: shadow,
  defaultBorderColor: '#D9D9D9',
  defaultHoverBorderColor: '#4096FF',
  primaryShadow: shadow,
};

export const impulseButtonTheme = {
  ...antdDefaultButton,
  colorPrimary: 'rgba(154,0,207, 0.2)',
  colorPrimaryHover: 'rgba(154,0,207, 0.6)',
  defaultHoverBorderColor: '#9A00CF',
  defaultHoverColor: '#9A00CF',
  primaryColor: '#9A00CF',
};

export const impulseDefaultButtonTheme = {
  ...antdDefaultButton,
  defaultBg: 'rgba(154,0,207, 0.2)',
  colorPrimaryHover: 'rgba(154,0,207, 0.6)',
  defaultHoverBorderColor: '#9A00CF',
  defaultHoverColor: '#9A00CF',
  defaultShadow: '0 4px 5px rgba(0, 0, 0, 0.25)',
  colorText: '#9A00CF',
};

export const greenThemeColors = {
  ...defaultButton,
  colorPrimary: `#9EFF00`,
  colorPrimaryBg: '#f9ffe6',
  colorPrimaryBgHover: '#e8ffa3',
  colorPrimaryBorder: '#d9ff7a',
  colorPrimaryBorderHover: '#c8ff52',
  colorPrimaryHover: '#b4ff29',
  colorPrimaryActive: '#7ed900',
  colorPrimaryTextHover: '#b4ff29',
  colorPrimaryText: '#9eff00',
  colorPrimaryTextActive: '#7ed900',
};
export const defaultCardThemeConfig = {
  colorBorderSecondary: '#CFCFCF',
  colorBgContainer: '#EEEDED',
};
export const lightGreenThemeColor = '#F0FFD8';
export const greenThemeColor = '#34A853';
export const greenCardThemeConfig: ThemeConfig['components'] = {
  Card: {
    // colorBorderSecondary: '#CFCFCF',
    colorBgContainer: '#F0FFD8',
    colorBorderSecondary: 'transparent',
  },
  Typography: {
    colorText: greenThemeColor,
  },
};
export const mainThemeConfig: ThemeConfig = {
  token: {
    colorSuccess: greenThemeColor,
  },

  components: {
    Button: defaultButton,
    Card: defaultCardThemeConfig,
    Layout: {
      colorBgLayout: 'white',
    },
    Form: {
      fontSize: 16,
    },
  },
};
